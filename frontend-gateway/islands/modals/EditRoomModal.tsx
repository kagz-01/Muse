import { useEffect, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  deleteRoom,
  type Room,
  type RoomCategory,
  type RoomSize,
  type RoomTheme,
  updateRoom,
} from "../../signals/rooms.ts";

interface Props {
  room: Room;
  onClose: () => void;
  onDeleted?: () => void;
}

const paletteColors: { name: RoomTheme; hex: string; label: string }[] = [
  { name: "indigo", hex: "#6366f1", label: "Indigo" },
  { name: "emerald", hex: "#10b981", label: "Emerald" },
  { name: "rose", hex: "#f43f5e", label: "Rose" },
  { name: "amber", hex: "#f59e0b", label: "Amber" },
  { name: "cyan", hex: "#06b6d4", label: "Cyan" },
  { name: "slate", hex: "#64748b", label: "Slate" },
];

// Helper to convert hex back to approx HSL for the UI
const hexToHSL = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export default function EditRoomModal({ room, onClose, onDeleted }: Props) {
  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description || "");
  const [emoji, setEmoji] = useState(room.emoji || "🏛️");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [category, setCategory] = useState<RoomCategory>(
    room.category || "workspace",
  );
  const [size, setSize] = useState<RoomSize>(room.size || "medium");
  const [tags, setTags] = useState<string[]>(room.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    room.notificationsEnabled ?? true,
  );
  const [themeColor, setThemeColor] = useState<RoomTheme>(
    room.themeColor || "indigo",
  );
  const [coverImage, setCoverImage] = useState(room.coverImage || "");
  const [isPublic, setIsPublic] = useState(room.isPublic);
  const [error, setError] = useState("");

  const [useCustomColor, setUseCustomColor] = useState(!!room.customThemeHex);
  const initialHSL = room.customThemeHex
    ? hexToHSL(room.customThemeHex)
    : { h: 270, s: 100, l: 60 };
  const [customHue, setCustomHue] = useState(initialHSL.h);
  const [customSaturation, setCustomSaturation] = useState(initialHSL.s);
  const [customLightness, setCustomLightness] = useState(initialHSL.l);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const hslToHex = (h: number, s: number, l: number): string => {
    const sNorm = s / 100;
    const lNorm = l / 100;
    const a = sNorm * Math.min(lNorm, 1 - lNorm);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const currentColor = useCustomColor
    ? hslToHex(customHue, customSaturation, customLightness)
    : paletteColors.find((c) => c.name === themeColor)?.hex || "#6366f1";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleImagePick = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("Room name cannot be empty.");
      return;
    }
    updateRoom(room.id, {
      name: name.trim(),
      description: description.trim(),
      emoji: emoji || "🏛️",
      category,
      size,
      tags,
      notificationsEnabled,
      themeColor,
      customThemeHex: useCustomColor ? currentColor : undefined,
      coverImage,
      isPublic,
      isVault: !isPublic,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteRoom(room.id);
    onDeleted?.();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#111318] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: currentColor }}
        />

        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Edit Room
              </h2>
              <p className="text-sm text-gray-400 mt-1 font-serif italic">
                Refine your expressive collection space.
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <Icons.X size={18} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Cover Image
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-36 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 transition-all cursor-pointer overflow-hidden group"
            >
              {coverImage
                ? (
                  <img
                    src={coverImage}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt=""
                  />
                )
                : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                    <Icons.ImagePlus size={24} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Upload Cover Photo
                    </span>
                  </div>
                )}
              {coverImage && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">
                    Change Image
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              className="hidden"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Room Name *
            </label>
            <input
              ref={nameRef}
              value={name}
              onInput={(e) => {
                setName((e.target as HTMLInputElement).value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base font-medium tracking-tight"
            />
            {error && (
              <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onInput={(e) =>
                setDescription((e.target as HTMLTextAreaElement).value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm font-serif italic leading-relaxed resize-none"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Room Icon
            </label>
            <div className="relative">
              <input
                value={emoji}
                onInput={(e) => setEmoji((e.target as HTMLInputElement).value)}
                placeholder="🏛️ Pick an emoji (optional)"
                maxLength={8}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base font-medium text-center"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                😊
              </button>

              {showEmojiPicker && (
                <div className="absolute left-0 mt-3 w-full max-h-80 bg-[#111] border border-white/10 rounded-2xl p-4 z-50 shadow-3xl overflow-y-auto">
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      "😀",
                      "😁",
                      "😂",
                      "🤣",
                      "😃",
                      "😄",
                      "😅",
                      "😆",
                      "😉",
                      "😊",
                      "😋",
                      "😌",
                      "😍",
                      "🥰",
                      "😘",
                      "😗",
                      "😚",
                      "😙",
                      "🥲",
                      "😜",
                      "😝",
                      "😛",
                      "🤑",
                      "🤗",
                      "🎨",
                      "📔",
                      "🏛️",
                      "⚡",
                      "✨",
                      "🔥",
                      "🌿",
                      "🌧️",
                      "🎯",
                      "📷",
                      "💡",
                      "🔒",
                    ].map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          setEmoji(e);
                          setShowEmojiPicker(false);
                        }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all text-lg hover:scale-125 hover:bg-canvas-primary/20"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    (e.target as HTMLSelectElement).value as RoomCategory,
                  )}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all text-sm"
              >
                <option value="workspace">🏢 Workspace</option>
                <option value="journal">📔 Journal</option>
                <option value="archive">🗂️ Archive</option>
                <option value="brainstorm">⚡ Brainstorm</option>
                <option value="inspiration">✨ Inspiration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Size
              </label>
              <select
                value={size}
                onChange={(e) =>
                  setSize((e.target as HTMLSelectElement).value as RoomSize)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3 flex-wrap">
              {tags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-canvas-primary/20 text-canvas-primary text-xs font-bold uppercase tracking-widest hover:bg-canvas-primary/30 transition-all cursor-pointer"
                  type="button"
                >
                  {tag} <Icons.X size={12} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onInput={(e) =>
                  setTagInput((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    setTags([...tags, tagInput.trim()]);
                    setTagInput("");
                  }
                }}
                placeholder="Add tag (press Enter)"
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm"
              />
              <button
                onClick={() => {
                  if (tagInput.trim()) {
                    setTags([...tags, tagInput.trim()]);
                    setTagInput("");
                  }
                }}
                type="button"
                className="px-4 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/15 transition-all text-sm font-bold"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) =>
                  setNotificationsEnabled(
                    (e.target as HTMLInputElement).checked,
                  )}
                className="w-5 h-5 rounded-lg accent-canvas-primary"
              />
              <div>
                <p className="text-sm font-bold text-white">Notifications</p>
                <p className="text-xs text-gray-400 font-serif italic">
                  Get alerts when this room gets new activity
                </p>
              </div>
            </label>
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Room Theme
              </label>
              <div className="inline-flex rounded-full bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setUseCustomColor(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                    !useCustomColor
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomColor(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                    useCustomColor
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Customize
                </button>
              </div>
            </div>

            {!useCustomColor
              ? (
                <div className="flex gap-3 flex-wrap">
                  {paletteColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        setThemeColor(color.name);
                        setUseCustomColor(false);
                      }}
                      title={color.label}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                        themeColor === color.name && !useCustomColor
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#111318] scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {themeColor === color.name && !useCustomColor && (
                        <Icons.Check
                          size={16}
                          strokeWidth={3}
                          className="text-white drop-shadow"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )
              : (
                <div className="space-y-5 bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-full h-8 rounded-lg overflow-hidden mb-3 border border-white/10 shadow-lg relative cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, 
                      hsl(0, ${customSaturation}%, ${customLightness}%), hsl(30, ${customSaturation}%, ${customLightness}%), hsl(60, ${customSaturation}%, ${customLightness}%),
                      hsl(90, ${customSaturation}%, ${customLightness}%), hsl(120, ${customSaturation}%, ${customLightness}%), hsl(150, ${customSaturation}%, ${customLightness}%),
                      hsl(180, ${customSaturation}%, ${customLightness}%), hsl(210, ${customSaturation}%, ${customLightness}%), hsl(240, ${customSaturation}%, ${customLightness}%),
                      hsl(270, ${customSaturation}%, ${customLightness}%), hsl(300, ${customSaturation}%, ${customLightness}%), hsl(330, ${customSaturation}%, ${customLightness}%), hsl(360, ${customSaturation}%, ${customLightness}%)
                    )`,
                      }}
                    >
                      <div
                        className="absolute top-0 w-1.5 h-full bg-white rounded-full shadow-lg pointer-events-none border border-black/30"
                        style={{
                          left: `calc(${(customHue / 360) * 100}% - 3px)`,
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={customHue}
                      onInput={(e) =>
                        setCustomHue(
                          Number((e.target as HTMLInputElement).value),
                        )}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-3">
                      Slide to choose hue
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Saturation
                      </label>
                      <span className="text-[10px] font-bold text-canvas-primary">
                        {customSaturation}%
                      </span>
                    </div>
                    <div
                      className="w-full h-3 rounded-lg mb-1 border border-white/10"
                      style={{
                        background: `linear-gradient(to right, hsl(${customHue}, 0%, ${customLightness}%), hsl(${customHue}, 100%, ${customLightness}%))`,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customSaturation}
                      onInput={(e) =>
                        setCustomSaturation(
                          Number((e.target as HTMLInputElement).value),
                        )}
                      className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Lightness
                      </label>
                      <span className="text-[10px] font-bold text-canvas-primary">
                        {customLightness}%
                      </span>
                    </div>
                    <div
                      className="w-full h-3 rounded-lg mb-1 border border-white/10"
                      style={{
                        background: `linear-gradient(to right, hsl(${customHue}, ${customSaturation}%, 0%), hsl(${customHue}, ${customSaturation}%, 50%), hsl(${customHue}, ${customSaturation}%, 100%))`,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customLightness}
                      onInput={(e) =>
                        setCustomLightness(
                          Number((e.target as HTMLInputElement).value),
                        )}
                      className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-xl border border-white/20 shadow-lg"
                      style={{ backgroundColor: currentColor }}
                    />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Preview
                      </p>
                      <p className="text-sm font-mono text-gray-300 mt-1">
                        {currentColor}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Room Mode
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setIsPublic(false)}
                className={`w-full p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  !isPublic
                    ? "border-white/30 bg-white/10 shadow-xl"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <Icons.Lock
                    size={16}
                    className={!isPublic ? "text-white" : "text-gray-500"}
                  />
                  <div>
                    <p className="text-sm font-bold text-white">
                      Private — Vault Mode
                    </p>
                    <p className="text-xs text-gray-400 font-serif italic">
                      Only you can access this room
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setIsPublic(true)}
                className={`w-full p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  isPublic
                    ? "border-canvas-primary/40 bg-canvas-primary/15 shadow-xl"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <Icons.Globe
                    size={16}
                    className={isPublic
                      ? "text-canvas-primary"
                      : "text-gray-500"}
                  />
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isPublic ? "text-canvas-primary" : "text-white"
                      }`}
                    >
                      Community — Shared Mode
                    </p>
                    <p className="text-xs text-gray-400 font-serif italic">
                      Collaborate & share with others
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-4 rounded-2xl border border-white/10 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="flex-[2] py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 text-white"
              style={{
                backgroundColor: currentColor,
                boxShadow: `0 0 30px ${currentColor}55`,
              }}
            >
              Save Changes <Icons.Check size={16} />
            </button>
          </div>

          {!confirmDelete
            ? (
              <button
                onClick={() => setConfirmDelete(true)}
                type="button"
                className="w-full py-3 rounded-2xl border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Icons.Trash2 size={14} /> Delete Room
              </button>
            )
            : (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-bold mb-3">
                  <Icons.AlertTriangle size={16} />{" "}
                  This action cannot be undone.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    type="button"
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    type="button"
                    className="flex-[2] py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all cursor-pointer"
                  >
                    Yes, Delete Room
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
