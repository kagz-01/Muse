import { useEffect, useRef, useState } from "preact/hooks";
import {
  ArrowRight,
  Check,
  Globe,
  Image as ImageIcon,
  Lock,
  X,
} from "lucide-preact";
import { addRoom, type RoomTheme, type RoomCategory, type RoomSize } from "../../signals/rooms.ts";

interface Props {
  onClose: () => void;
}

const paletteColors: { name: RoomTheme; hex: string; label: string }[] = [
  { name: "indigo", hex: "#6366f1", label: "Indigo" },
  { name: "emerald", hex: "#10b981", label: "Emerald" },
  { name: "rose", hex: "#f43f5e", label: "Rose" },
  { name: "amber", hex: "#f59e0b", label: "Amber" },
  { name: "cyan", hex: "#06b6d4", label: "Cyan" },
  { name: "slate", hex: "#64748b", label: "Slate" },
];

export default function CreateRoomModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState<RoomCategory>("workspace");
  const [size, setSize] = useState<RoomSize>("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themeColor, setThemeColor] = useState<RoomTheme>("indigo");
  const [coverImage, setCoverImage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [customHue, setCustomHue] = useState(270); // indigo hue
  const [customSaturation, setCustomSaturation] = useState(100);
  const [customLightness, setCustomLightness] = useState(60);

  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const colorCanvasRef = useRef<HTMLCanvasElement>(null);

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    const a = (s * Math.min(l, 100 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const currentColor = useCustomColor
    ? hslToHex(customHue, customSaturation, customLightness)
    : paletteColors.find((c) => c.name === themeColor)?.hex || "#6366f1";

  useEffect(() => {
    nameRef.current?.focus();
  }, []);
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

  const selectedPalette = useCustomColor
    ? { name: "custom", hex: currentColor, label: "Custom Color" }
    : paletteColors.find((c) => c.name === themeColor)!;

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Give your room a name.");
      return;
    }

    try {
      const newRoomId = addRoom({
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
      });
      onClose();
      globalThis.location.href = `/rooms/${newRoomId}`;
    } catch (_err) {
      setError("Failed to establish room identity.");
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#111318] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Ambient glow */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: currentColor }}
        />

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Create a Room
              </h2>
              <p className="text-sm text-gray-400 mt-1 font-serif italic">
                Define your expressive collection space.
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cover Image Picker */}
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
                  />
                )
                : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                    <ImageIcon size={24} />
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

          {/* Room Name */}
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
                if (e.key === "Enter") handleCreate();
              }}
              placeholder="e.g. Music & Ambience"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base font-medium tracking-tight"
            />
            {error && (
              <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onInput={(e) =>
                setDescription((e.target as HTMLTextAreaElement).value)}
              placeholder="What does this room hold? What energy does it carry?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm font-serif italic leading-relaxed resize-none"
            />
          </div>

          {/* Room Emoji */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Room Icon
            </label>
            <input
              value={emoji}
              onInput={(e) => setEmoji((e.target as HTMLInputElement).value)}
              placeholder="🏛️ Pick an emoji (optional)"
              maxLength={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base font-medium text-center"
            />
          </div>

          {/* Category & Size */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory((e.target as HTMLSelectElement).value as RoomCategory)}
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
                onChange={(e) => setSize((e.target as HTMLSelectElement).value as RoomSize)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Tags */}
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
                  {tag} <X size={12} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onInput={(e) => setTagInput((e.target as HTMLInputElement).value)}
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

          {/* Notifications */}
          <div className="mb-8">
            <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled((e.target as HTMLInputElement).checked)}
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

          {/* Theme Palette */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Room Theme
              </label>
              <button
                onClick={() => setUseCustomColor(!useCustomColor)}
                className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary hover:text-canvas-primary/80 transition-colors cursor-pointer"
                type="button"
              >
                {useCustomColor ? "← Use Preset" : "Custom →"}
              </button>
            </div>

            {!useCustomColor ? (
              <div className="flex gap-3 flex-wrap">
                {paletteColors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setThemeColor(color.name)}
                    title={color.label}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                      themeColor === color.name && !useCustomColor
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#111318] scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {themeColor === color.name && !useCustomColor && (
                      <Check
                        size={16}
                        strokeWidth={3}
                        className="text-white drop-shadow"
                      />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-5 bg-white/5 rounded-2xl p-5 border border-white/10">
                {/* Hue Circle */}
                <div className="flex flex-col items-center">
                  <svg
                    width="180"
                    height="180"
                    viewBox="0 0 180 180"
                    className="cursor-pointer"
                    onClick={(e) => {
                      const svg = e.currentTarget;
                      const rect = svg.getBoundingClientRect();
                      const cx = rect.width / 2;
                      const cy = rect.height / 2;
                      const x = e.clientX - rect.left - cx;
                      const y = e.clientY - rect.top - cy;
                      const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
                      setCustomHue((angle + 360) % 360);
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="hueGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="hsl(0, 100%, 60%)" />
                        <stop offset="16.67%" stopColor="hsl(60, 100%, 60%)" />
                        <stop offset="33.33%" stopColor="hsl(120, 100%, 60%)" />
                        <stop offset="50%" stopColor="hsl(180, 100%, 60%)" />
                        <stop offset="66.67%" stopColor="hsl(240, 100%, 60%)" />
                        <stop offset="83.33%" stopColor="hsl(300, 100%, 60%)" />
                        <stop offset="100%" stopColor="hsl(360, 100%, 60%)" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="90"
                      cy="90"
                      r="75"
                      fill="url(#hueGradient)"
                      opacity="0.8"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                    {/* Indicator */}
                    <circle
                      cx={90 + 65 * Math.cos((customHue - 90) * (Math.PI / 180))}
                      cy={90 + 65 * Math.sin((customHue - 90) * (Math.PI / 180))}
                      r="6"
                      fill="white"
                      stroke="black"
                      strokeWidth="2"
                    />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-3">
                    Click to choose hue
                  </p>
                </div>

                {/* Saturation Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Saturation
                    </label>
                    <span className="text-[10px] font-bold text-canvas-primary">
                      {customSaturation}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customSaturation}
                    onChange={(e) =>
                      setCustomSaturation(Number((e.target as HTMLInputElement).value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                  />
                </div>

                {/* Lightness Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Lightness
                    </label>
                    <span className="text-[10px] font-bold text-canvas-primary">
                      {customLightness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customLightness}
                    onChange={(e) =>
                      setCustomLightness(Number((e.target as HTMLInputElement).value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                  />
                </div>

                {/* Color Preview */}
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
          {/* Visibility Toggle */}
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
                  <Lock size={16} className={!isPublic ? "text-white" : "text-gray-500"} />
                  <div>
                    <p className="text-sm font-bold text-white">Private — Solo Mode</p>
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
                  <Globe size={16} className={isPublic ? "text-canvas-primary" : "text-gray-500"} />
                  <div>
                    <p className={`text-sm font-bold ${isPublic ? "text-canvas-primary" : "text-white"}`}>
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-4 rounded-2xl border border-white/10 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              type="button"
              className="flex-[2] py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 text-white"
              style={{
                backgroundColor: currentColor,
                boxShadow: `0 0 30px ${currentColor}55`,
              }}
            >
              Create Room <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
