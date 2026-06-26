import { useEffect, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import EmojiInput from "../../components/ui/EmojiInput.tsx";
import { useDraft } from "../../hooks/useDraft.ts";
import {
  addRoom,
  MOOD_OPTIONS,
  type RoomCategory,
  type RoomMood,
  type RoomSize,
  type RoomTheme,
} from "../../signals/rooms.ts";

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
  const { draft, hasDraft, updateDraft, clearDraft } = useDraft<{
    name: string;
    description: string;
    emoji: string;
    category: string;
    size: string;
    mood: string;
    tags: string[];
    themeColor: string;
    isPublic: boolean;
    isVault: boolean;
  }>("muse_room_draft");

  const [showResumeBanner, setShowResumeBanner] = useState(hasDraft);
  const [isVault, setIsVault] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState<RoomCategory>("workspace");
  const [size, setSize] = useState<RoomSize>("medium");
  const [mood, setMood] = useState<RoomMood>("focus");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themeColor, setThemeColor] = useState<RoomTheme>("indigo");
  const [coverImage, setCoverImage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [customHue, setCustomHue] = useState(270);
  const [customSaturation, setCustomSaturation] = useState(100);
  const [customLightness, setCustomLightness] = useState(60);

  // Helper: apply a saved draft into local state
  const applyDraft = () => {
    if (!draft) return;
    if (draft.name) setName(draft.name);
    if (draft.description) setDescription(draft.description);
    if (draft.emoji) setEmoji(draft.emoji);
    if (draft.category) setCategory(draft.category as RoomCategory);
    if (draft.size) setSize(draft.size as RoomSize);
    if (draft.mood) setMood(draft.mood as RoomMood);
    if (draft.tags?.length) setTags(draft.tags);
    if (draft.themeColor) setThemeColor(draft.themeColor as RoomTheme);
    if (typeof draft.isPublic === "boolean") setIsPublic(draft.isPublic);
    if (typeof draft.isVault === "boolean") setIsVault(draft.isVault);
    setShowResumeBanner(false);
  };

  const fileRef = useRef<HTMLInputElement | null>(null);
  const _colorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    const sNorm = s / 100;
    const lNorm = l / 100;
    const a = sNorm * Math.min(lNorm, 1 - lNorm);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16)
        .padStart(2, "0");
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

  const _selectedPalette = useCustomColor
    ? { name: "custom", hex: currentColor, label: "Custom Color" }
    : paletteColors.find((c) => c.name === themeColor)!;

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Give your room a name.");
      return;
    }

    try {
      const newRoomId = await addRoom({
        name: name.trim(),
        description: description.trim(),
        emoji: emoji || "🏛️",
        category,
        size,
        mood,
        tags,
        notificationsEnabled,
        themeColor,
        customThemeHex: useCustomColor ? currentColor : undefined,
        coverImage,
        isPublic,
        isVault,
      });
      clearDraft(); // ✅ wipe draft on success
      onClose();
      globalThis.location.href = `/rooms/${newRoomId}`;
    } catch (_err) {
      setError("Failed to establish room identity.");
    }
  };

  // Auto-save draft on every meaningful change
  useEffect(() => {
    if (name || description || emoji || tags.length) {
      updateDraft({
        name,
        description,
        emoji,
        category,
        size,
        mood,
        tags,
        themeColor,
        isPublic,
        isVault,
      });
    }
  }, [
    name,
    description,
    emoji,
    category,
    size,
    mood,
    tags,
    themeColor,
    isPublic,
    isVault,
  ]);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#111318] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Ambient glow */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: currentColor }}
        />

        <div className="relative z-10 p-8">
          {/* Resume Draft Banner */}
          {showResumeBanner && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-in slide-in-from-top-2 duration-300">
              <Icons.FileText size={18} className="text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                  Unsaved Draft Found
                </p>
                <p className="text-xs text-amber-400/80 font-serif italic mt-0.5 truncate">
                  {draft?.name
                    ? `"${draft.name}"`
                    : "A room you started is waiting"}
                </p>
              </div>
              <button
                type="button"
                onClick={applyDraft}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/30 transition-all shrink-0"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={() => {
                  clearDraft();
                  setShowResumeBanner(false);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-amber-500/60 hover:text-amber-400 transition-colors shrink-0"
              >
                <Icons.X size={14} />
              </button>
            </div>
          )}
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
              <Icons.X size={18} />
            </button>
          </div>

          {/* Cover Image Picker */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Cover Image
              </label>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Local or Web URL
              </span>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="relative w-full h-36 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 transition-all cursor-pointer overflow-hidden group bg-white/[0.02]"
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
                      <Icons.UploadCloud size={24} />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Upload Local Image
                      </span>
                    </div>
                  )}
                {coverImage && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <Icons.UploadCloud size={14} /> Upload New
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

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Icons.Link2 size={14} />
                </div>
                <input
                  type="url"
                  placeholder="Or paste an image URL from the web..."
                  value={coverImage && coverImage.startsWith("http")
                    ? coverImage
                    : ""}
                  onChange={(e) =>
                    setCoverImage((e.target as HTMLInputElement).value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-canvas-primary/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Room Name */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Room Name *
            </label>
            <EmojiInput
              value={name}
              onInput={(v) => {
                setName(v);
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
            <EmojiInput
              value={description}
              onInput={setDescription}
              placeholder="What does this room hold? What energy does it carry?"
              multiline
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-sm font-serif italic leading-relaxed resize-none"
            />
          </div>

          {/* Room Emoji */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Room Icon
            </label>
            <EmojiInput
              value={emoji}
              onInput={setEmoji}
              placeholder="🏛️ Pick an emoji (optional)"
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
                onChange={(e) =>
                  setCategory(
                    (e.target as HTMLSelectElement).value as RoomCategory,
                  )}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all text-sm cursor-pointer"
              >
                <option value="workspace">🏢 Workspace</option>
                <option value="journal">📔 Journal</option>
                <option value="archive">🗂️ Archive</option>
                <option value="brainstorm">⚡ Brainstorm</option>
                <option value="inspiration">✨ Inspiration</option>
              </select>
              <p className="text-[10px] text-gray-500 mt-1.5">
                Classifies the room's purpose and default behavior.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Size
              </label>
              <select
                value={size}
                onChange={(e) =>
                  setSize((e.target as HTMLSelectElement).value as RoomSize)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all text-sm cursor-pointer"
              >
                <option value="small">Small — Dense Grid</option>
                <option value="medium">Medium — Carousel</option>
                <option value="large">Large — Gallery</option>
              </select>
              <p className="text-[10px] text-gray-500 mt-1.5">
                Controls how artifacts are displayed inside the room.
              </p>
            </div>
          </div>

          {/* Mood Grid */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Room Mood
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`group/mood relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer hover:scale-[1.03] ${
                    mood === m.id
                      ? "border-white/30 bg-white/10 shadow-lg shadow-white/5"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                  }`}
                >
                  <span className="text-lg block mb-1">{m.emoji}</span>
                  <span
                    className={`text-[11px] font-bold block ${
                      mood === m.id ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {m.label}
                  </span>
                  <span className="text-[9px] text-gray-500 leading-tight block mt-0.5">
                    {m.description}
                  </span>
                </button>
              ))}
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
                  {tag} <Icons.X size={12} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <EmojiInput
                value={tagInput}
                onInput={setTagInput}
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

          {/* Theme Palette */}
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
                  {/* Hue Selector Strip */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-full h-8 rounded-lg overflow-hidden mb-3 border border-white/10 shadow-lg"
                      style={{
                        background: `linear-gradient(to right, 
                      hsl(0, 100%, 60%),
                      hsl(30, 100%, 60%),
                      hsl(60, 100%, 60%),
                      hsl(90, 100%, 60%),
                      hsl(120, 100%, 60%),
                      hsl(150, 100%, 60%),
                      hsl(180, 100%, 60%),
                      hsl(210, 100%, 60%),
                      hsl(240, 100%, 60%),
                      hsl(270, 100%, 60%),
                      hsl(300, 100%, 60%),
                      hsl(330, 100%, 60%),
                      hsl(360, 100%, 60%)
                    )`,
                      }}
                    >
                      <div
                        className="w-1 h-full bg-white border-l-2 border-r-2 border-white shadow-lg pointer-events-none"
                        style={{
                          left: `${(customHue / 360) * 100}%`,
                          position: "relative",
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={customHue}
                      onChange={(e) =>
                        setCustomHue(
                          Number((e.target as HTMLInputElement).value),
                        )}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-3">
                      Slide to choose hue
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
                        setCustomSaturation(
                          Number((e.target as HTMLInputElement).value),
                        )}
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
                        setCustomLightness(
                          Number((e.target as HTMLInputElement).value),
                        )}
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
          <div className="mb-8 p-1 bg-white/5 rounded-2xl flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsPublic(false);
                setIsVault(false);
              }}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !isPublic && !isVault
                  ? "bg-white/10 text-white shadow-xl"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icons.Lock size={16} />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest">
                  Private — Solo Mode
                </span>
                <span className="block text-[9px] text-gray-400 font-normal">
                  Only you can access this room
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPublic(false);
                setIsVault(true);
              }}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isVault
                  ? "bg-amber-500/20 text-amber-400 shadow-xl shadow-amber-500/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icons.Shield size={16} />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest">
                  Vault — Protected Mode
                </span>
                <span className="block text-[9px] text-gray-400 font-normal">
                  Hidden behind the master vault
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPublic(true);
                setIsVault(false);
              }}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isPublic
                  ? "bg-indigo-500/20 text-indigo-400 shadow-xl shadow-indigo-500/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icons.Globe size={16} />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest">
                  Community Hub
                </span>
                <span className="block text-[9px] text-indigo-400/60 font-normal">
                  Visible to others
                </span>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                clearDraft();
                onClose();
              }}
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
              Create Room <Icons.ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
