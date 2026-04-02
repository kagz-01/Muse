import { useEffect, useRef, useState } from "preact/hooks";
import {
  User,
  Palette,
  Bell,
  Shield,
  Database,
  CheckCircle,
  Camera,
  Calendar,
  Monitor,
  Moon,
  Sun,
  Type,
  Smartphone,
  MessageCircle,
  Heart,
  UserPlus,
  Award,
  Newspaper,
  Zap,
  Mail,
  MapPin,
  Eye,
  Key,
  Globe,
  Link2,
  Plus,
  Trash2,
  Download,
  RotateCcw,
} from "lucide-preact";
import {
  userSignal,
  soloModeSignal,
  updateProfile,
  addLink,
  removeLink,
  logout,
  togglePublicSetting,
  updatePrivacySecurity,
  toggleSoloMode,
  type User as UserModel,
} from "../signals/user.ts";
import { resetRooms } from "../signals/rooms.ts";
import { resetItems } from "../signals/items.ts";
import { resetThreads } from "../signals/threads.ts";
import { resetJournalEntries } from "../signals/journal.ts";

type SettingsTab = "profile" | "appearance" | "notifications" | "privacy" | "data";

type SaveStatus = "idle" | "saving" | "saved";

type AppearanceSettings = {
  theme: "dark" | "light" | "system";
  accentColor: "cyan" | "blue" | "purple" | "pink" | "green" | "yellow" | "red" | "white";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  animations: boolean;
  reduceMotion: boolean;
};

type NotificationSettings = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notifyOnReply: boolean;
  notifyOnLike: boolean;
  notifyOnFollow: boolean;
  notifyOnAchievement: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
};

type DataSettings = {
  exportFormat: "json" | "csv";
  lastExport: string | null;
};

const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "dark",
  accentColor: "cyan",
  fontSize: "medium",
  compactMode: false,
  animations: true,
  reduceMotion: false,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  notifyOnReply: true,
  notifyOnLike: true,
  notifyOnFollow: true,
  notifyOnAchievement: true,
  weeklyDigest: true,
  productUpdates: false,
};

const NOTIFICATION_OPTIONS: Array<{
  key: keyof NotificationSettings;
  label: string;
  icon: typeof MessageCircle;
  description: string;
}> = [
  { key: "notifyOnReply", label: "New replies to my threads", icon: MessageCircle, description: "Get notified when someone responds to your threads." },
  { key: "notifyOnLike", label: "Likes on my content", icon: Heart, description: "See when people appreciate your work." },
  { key: "notifyOnFollow", label: "New followers", icon: UserPlus, description: "Stay informed when someone starts following you." },
  { key: "notifyOnAchievement", label: "Achievement unlocks", icon: Award, description: "Celebrate progress when you hit milestones." },
  { key: "weeklyDigest", label: "Weekly digest", icon: Newspaper, description: "Receive a weekly summary of activity." },
  { key: "productUpdates", label: "Product updates", icon: Zap, description: "Hear about new features and releases." },
];

const DEFAULT_DATA_SETTINGS: DataSettings = {
  exportFormat: "json",
  lastExport: null,
};

const ACCENT_OPTIONS: Array<{ value: AppearanceSettings["accentColor"]; className: string }> = [
  { value: "cyan", className: "bg-cyan-400" },
  { value: "blue", className: "bg-blue-400" },
  { value: "purple", className: "bg-purple-400" },
  { value: "pink", className: "bg-pink-400" },
  { value: "green", className: "bg-green-400" },
  { value: "yellow", className: "bg-yellow-400" },
  { value: "red", className: "bg-red-400" },
  { value: "white", className: "bg-white" },
];

const THEME_OPTIONS: Array<{ value: AppearanceSettings["theme"]; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const FONT_SIZE_OPTIONS: Array<{ value: AppearanceSettings["fontSize"]; label: string; size: number }> = [
  { value: "small", label: "Small", size: 14 },
  { value: "medium", label: "Medium", size: 16 },
  { value: "large", label: "Large", size: 18 },
];

const STORAGE_KEY = "muse-fresh-settings";

export default function Settings() {
  const user = userSignal.value;
  const soloMode = soloModeSignal.value;

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [dataSettings, setDataSettings] = useState<DataSettings>(DEFAULT_DATA_SETTINGS);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const hasInitialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (!raw) {
        hasInitialized.current = true;
        return;
      }
      const parsed = JSON.parse(raw) as {
        appearance?: AppearanceSettings;
        notifications?: NotificationSettings;
        dataSettings?: DataSettings;
      };

      if (parsed.appearance) setAppearance({ ...DEFAULT_APPEARANCE, ...parsed.appearance });
      if (parsed.notifications) setNotifications({ ...DEFAULT_NOTIFICATIONS, ...parsed.notifications });
      if (parsed.dataSettings) setDataSettings({ ...DEFAULT_DATA_SETTINGS, ...parsed.dataSettings });
    } catch {
      // Ignore malformed local settings and use defaults.
    } finally {
      hasInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized.current || !user) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (hideSavedTimer.current) clearTimeout(hideSavedTimer.current);

    setSaveStatus("saving");

    saveTimer.current = setTimeout(() => {
      try {
        globalThis.localStorage?.setItem(
          STORAGE_KEY,
          JSON.stringify({ appearance, notifications, dataSettings }),
        );
      } catch {
        // Best effort persistence.
      }

      setSaveStatus("saved");
      hideSavedTimer.current = setTimeout(() => setSaveStatus("idle"), 1800);
    }, 450);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (hideSavedTimer.current) clearTimeout(hideSavedTimer.current);
    };
  }, [
    user,
    appearance,
    notifications,
    dataSettings,
    soloMode,
    user?.name,
    user?.username,
    user?.email,
    user?.bio,
    user?.location,
    user?.gender,
    user?.pronouns,
    user?.birthDate,
    user?.occupation,
    user?.timezone,
    user?.website,
    user?.avatarUrl,
    user?.links,
    user?.privacySecurity.accountVisibility,
    user?.privacySecurity.showEmailInProfile,
    user?.privacySecurity.allowSearchIndexing,
    user?.privacySecurity.twoFactorEnabled,
    user?.publicSettings.showProfile,
    user?.publicSettings.showLocation,
    user?.publicSettings.showRooms,
    user?.publicSettings.showThreads,
    user?.publicSettings.showInsights,
  ]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <a href="/auth" className="text-white underline">Please login</a>
      </div>
    );
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "data", label: "Data", icon: Database },
  ];

  const handleProfileUpdate = (updates: Partial<UserModel>) => {
    updateProfile(updates);
  };

  const handleAvatarUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const exportData = () => {
    const payload = {
      profile: {
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        gender: user.gender,
        pronouns: user.pronouns,
        birthDate: user.birthDate,
        occupation: user.occupation,
        timezone: user.timezone,
        website: user.website,
        links: user.links,
      },
      publicSettings: user.publicSettings,
      privacySecurity: user.privacySecurity,
      appearance,
      notifications,
      exportedAt: new Date().toISOString(),
    };

    const serialized = dataSettings.exportFormat === "csv"
      ? [
        "key,value",
        `name,${JSON.stringify(user.name)}`,
        `username,${JSON.stringify(user.username)}`,
        `email,${JSON.stringify(user.email)}`,
        `location,${JSON.stringify(user.location || "")}`,
        `gender,${JSON.stringify(user.gender || "")}`,
        `pronouns,${JSON.stringify(user.pronouns || "")}`,
        `birthDate,${JSON.stringify(user.birthDate || "")}`,
        `occupation,${JSON.stringify(user.occupation || "")}`,
        `timezone,${JSON.stringify(user.timezone || "")}`,
        `website,${JSON.stringify(user.website || "")}`,
        `socialLinks,${user.links.length}`,
        `theme,${appearance.theme}`,
        `accentColor,${appearance.accentColor}`,
      ].join("\n")
      : JSON.stringify(payload, null, 2);

    const mimeType = dataSettings.exportFormat === "csv" ? "text/csv" : "application/json";
    const ext = dataSettings.exportFormat === "csv" ? "csv" : "json";

    const blob = new Blob([serialized], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `muse-settings-${new Date().toISOString().split("T")[0]}.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);

    setDataSettings((current) => ({ ...current, lastExport: new Date().toISOString() }));
  };

  const getApproxDataSize = () => {
    const snapshot = JSON.stringify({
      profile: user,
      appearance,
      notifications,
      privacy: user.privacySecurity,
      data: dataSettings,
    });
    const bytes = new TextEncoder().encode(snapshot).length;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearAllData = () => {
    const shouldDelete = globalThis.confirm?.("Delete all local Muse data? This removes profile preferences, rooms, threads, items, and journal entries from this browser.") ?? false;
    if (!shouldDelete) return;

    globalThis.localStorage?.removeItem(STORAGE_KEY);

    resetRooms();
    resetItems();
    resetThreads();
    resetJournalEntries();
    logout();
    soloModeSignal.value = false;

    setAppearance(DEFAULT_APPEARANCE);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setDataSettings({ ...DEFAULT_DATA_SETTINGS, lastExport: null });

    // Re-enable login flow after wipe.
    globalThis.location.href = "/auth";
  };

  const resetLocalPreferences = () => {
    const shouldReset = globalThis.confirm?.("Reset appearance, notifications, and privacy preferences?") ?? false;
    if (!shouldReset) return;

    setAppearance(DEFAULT_APPEARANCE);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setDataSettings(DEFAULT_DATA_SETTINGS);
    updatePrivacySecurity({
      accountVisibility: "public",
      showEmailInProfile: false,
      allowSearchIndexing: true,
      twoFactorEnabled: false,
    });
  };

  const handleAddSocialLink = (event: Event) => {
    event.preventDefault();
    const title = newLinkTitle.trim();
    const urlInput = newLinkUrl.trim();
    if (!title || !urlInput) return;

    const normalizedUrl = /^https?:\/\//i.test(urlInput) ? urlInput : `https://${urlInput}`;
    addLink({ title, url: normalizedUrl });
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  return (
    <div className="min-h-screen bg-canvas-bg-dark px-6 md:px-10 py-8 max-w-6xl mx-auto pb-24 md:pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-gray-400 mt-1 font-serif italic">Manage your account and platform preferences.</p>
        </div>

        {saveStatus === "saving" && (
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle size={16} />
            <span className="text-sm">Saved</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-white/10 mb-7 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {activeTab === "profile" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Profile Information</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl text-white">{user.name.charAt(0)}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1 bg-white rounded-full text-black opacity-0 group-hover:opacity-100 transition"
                  >
                    <Camera size={10} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Profile Picture</p>
                  <p className="text-[10px] text-gray-500">Click camera to upload</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onInput={(event) => handleProfileUpdate({ name: (event.target as HTMLInputElement).value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Username</label>
                  <input
                    type="text"
                    value={user.username}
                    onInput={(event) => handleProfileUpdate({ username: (event.target as HTMLInputElement).value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Mail size={12} /> Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onInput={(event) => handleProfileUpdate({ email: (event.target as HTMLInputElement).value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> Location</label>
                  <input
                    type="text"
                    value={user.location || ""}
                    onInput={(event) => handleProfileUpdate({ location: (event.target as HTMLInputElement).value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 block mb-1">Bio</label>
                  <textarea
                    value={user.bio || ""}
                    onInput={(event) => handleProfileUpdate({ bio: (event.target as HTMLTextAreaElement).value })}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Gender</label>
                  <input
                    type="text"
                    value={user.gender || ""}
                    onInput={(event) => handleProfileUpdate({ gender: (event.target as HTMLInputElement).value })}
                    placeholder="e.g. Woman, Man, Non-binary"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Pronouns</label>
                  <input
                    type="text"
                    value={user.pronouns || ""}
                    onInput={(event) => handleProfileUpdate({ pronouns: (event.target as HTMLInputElement).value })}
                    placeholder="e.g. she/her, he/him, they/them"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Calendar size={12} /> Birth Date</label>
                  <input
                    type="date"
                    value={user.birthDate || ""}
                    onInput={(event) => handleProfileUpdate({ birthDate: (event.target as HTMLInputElement).value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Occupation</label>
                  <input
                    type="text"
                    value={user.occupation || ""}
                    onInput={(event) => handleProfileUpdate({ occupation: (event.target as HTMLInputElement).value })}
                    placeholder="e.g. Product Designer"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Timezone</label>
                  <input
                    type="text"
                    value={user.timezone || ""}
                    onInput={(event) => handleProfileUpdate({ timezone: (event.target as HTMLInputElement).value })}
                    placeholder="e.g. Africa/Nairobi"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Globe size={12} /> Website</label>
                  <input
                    type="url"
                    value={user.website || ""}
                    onInput={(event) => handleProfileUpdate({ website: (event.target as HTMLInputElement).value })}
                    placeholder="https://your-site.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white">Social Handles & Links</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Add Instagram, X, LinkedIn, GitHub, portfolio, or any public profile.</p>
                </div>

                {user.links.length > 0 && (
                  <div className="space-y-2">
                    {user.links.map((link) => (
                      <div key={link.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/30 border border-white/10">
                        <a href={link.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 hover:opacity-90 transition">
                          <p className="text-sm text-white truncate">{link.title}</p>
                          <p className="text-[11px] text-gray-500 truncate">{link.url}</p>
                        </a>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-rose-300 hover:border-rose-300/40 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddSocialLink} className="grid md:grid-cols-[1fr_1.4fr_auto] gap-2">
                  <input
                    type="text"
                    value={newLinkTitle}
                    onInput={(event) => setNewLinkTitle((event.target as HTMLInputElement).value)}
                    placeholder="Platform"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                  <div className="relative">
                    <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={newLinkUrl}
                      onInput={(event) => setNewLinkUrl((event.target as HTMLInputElement).value)}
                      placeholder="profile URL"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={12} /> Add
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {activeTab === "appearance" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Appearance</h3>

            <div>
              <label className="text-xs text-gray-400 block mb-2">Theme</label>
              <div className="flex gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const Icon = theme.icon;
                  return (
                  <button
                    type="button"
                    key={theme.value}
                    onClick={() => setAppearance((current) => ({ ...current, theme: theme.value }))}
                    className={`px-3 py-1.5 text-xs rounded-lg transition ${
                      appearance.theme === theme.value ? "bg-white text-black" : "bg-white/10 text-white"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5"><Icon size={12} /> {theme.label}</span>
                  </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">Accent</label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_OPTIONS.map((accent) => (
                  <button
                    type="button"
                    key={accent.value}
                    onClick={() => setAppearance((current) => {
                      const nextAppearance: AppearanceSettings = { ...current, accentColor: accent.value };
                      return nextAppearance;
                    })}
                    className={`w-8 h-8 rounded-full ${accent.className} ${
                      appearance.accentColor === accent.value ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
                    }`}
                  >
                    <span className="sr-only">{accent.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">Font Size</label>
              <div className="flex gap-2">
                {FONT_SIZE_OPTIONS.map((fontOption) => (
                  <button
                    key={fontOption.value}
                    type="button"
                    onClick={() => setAppearance((current) => ({ ...current, fontSize: fontOption.value }))}
                    className={`flex-1 p-2 rounded-xl text-sm flex items-center justify-center gap-2 ${
                      appearance.fontSize === fontOption.value ? "bg-white text-black" : "bg-white/10 text-white"
                    }`}
                  >
                    <Type size={fontOption.size} /> {fontOption.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {[
                { key: "compactMode", label: "Compact Mode" },
                { key: "animations", label: "Animations" },
                { key: "reduceMotion", label: "Reduce Motion" },
              ].map((toggle) => {
                const key = toggle.key as keyof Pick<AppearanceSettings, "compactMode" | "animations" | "reduceMotion">;
                const enabled = appearance[key];
                return (
                  <div key={toggle.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-sm text-gray-300">{toggle.label}</span>
                    <button
                      type="button"
                      onClick={() => setAppearance((current) => ({ ...current, [key]: !current[key] }))}
                      className={`w-10 h-5 rounded-full transition ${enabled ? "bg-white" : "bg-white/20"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-black transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "notifications" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Notifications</h3>
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { key: "emailNotifications", label: "Email Notifications", icon: Mail },
                  { key: "pushNotifications", label: "Push Notifications", icon: Smartphone },
                  { key: "inAppNotifications", label: "In-App Notifications", icon: Bell },
                ].map((toggle) => {
                  const key = toggle.key as keyof Pick<NotificationSettings, "emailNotifications" | "pushNotifications" | "inAppNotifications">;
                  const Icon = toggle.icon;
                  const enabled = notifications[key];
                  return (
                    <div key={toggle.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-300">{toggle.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications((current) => ({ ...current, [key]: !current[key] }))}
                        className={`w-10 h-5 rounded-full transition ${enabled ? "bg-white" : "bg-white/20"}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-black transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Notify me about</p>
                {NOTIFICATION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const enabled = notifications[option.key];
                  return (
                    <div key={option.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-300">{option.label}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{option.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications((current) => ({ ...current, [option.key]: !current[option.key] }))}
                        className={`w-10 h-5 rounded-full transition ${enabled ? "bg-white" : "bg-white/20"}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-black transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === "privacy" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Privacy & Security</h3>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm text-gray-300 flex items-center gap-2"><Globe size={14} className="text-gray-400" /> Account Visibility</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {user.privacySecurity.accountVisibility === "public"
                    ? "Anyone can see your profile and content"
                    : "Only approved followers can see your content"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updatePrivacySecurity({
                  accountVisibility: user.privacySecurity.accountVisibility === "public" ? "private" : "public",
                })}
                className={`px-3 py-1 text-xs rounded-lg transition ${
                  user.privacySecurity.accountVisibility === "public" ? "bg-white text-black" : "bg-white/10 text-white"
                }`}
              >
                {user.privacySecurity.accountVisibility === "public" ? "Public" : "Private"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-gray-300 flex items-center gap-2"><Mail size={14} className="text-gray-400" /> Show email on profile</span>
              <button
                type="button"
                onClick={() => updatePrivacySecurity({ showEmailInProfile: !user.privacySecurity.showEmailInProfile })}
                className={`w-10 h-5 rounded-full transition ${user.privacySecurity.showEmailInProfile ? "bg-white" : "bg-white/20"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-black transition-transform ${user.privacySecurity.showEmailInProfile ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-gray-300 flex items-center gap-2"><Eye size={14} className="text-gray-400" /> Allow search indexing</span>
              <button
                type="button"
                onClick={() => updatePrivacySecurity({ allowSearchIndexing: !user.privacySecurity.allowSearchIndexing })}
                className={`w-10 h-5 rounded-full transition ${user.privacySecurity.allowSearchIndexing ? "bg-white" : "bg-white/20"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-black transition-transform ${user.privacySecurity.allowSearchIndexing ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm text-gray-300 flex items-center gap-2"><Key size={14} className="text-gray-400" /> Two-Factor Authentication</p>
                <p className="text-[10px] text-gray-500">Add an extra layer of security</p>
              </div>
              <button
                type="button"
                onClick={() => updatePrivacySecurity({ twoFactorEnabled: !user.privacySecurity.twoFactorEnabled })}
                className={`px-3 py-1 text-xs rounded-lg transition ${
                  user.privacySecurity.twoFactorEnabled ? "bg-emerald-600 text-white" : "bg-white/10 text-white"
                }`}
              >
                {user.privacySecurity.twoFactorEnabled ? "Enabled" : "Enable"}
              </button>
            </div>

            <div className="pt-1 border-t border-white/10 space-y-3">
              {([
                { key: "showProfile", label: "Show profile" },
                { key: "showLocation", label: "Show location" },
                { key: "showRooms", label: "Show rooms" },
                { key: "showThreads", label: "Show threads" },
                { key: "showInsights", label: "Show insights" },
              ] as const).map((setting) => {
                const enabled = user.publicSettings[setting.key];
                return (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-sm text-gray-300">{setting.label}</span>
                    <button
                      type="button"
                      onClick={() => togglePublicSetting(setting.key)}
                      className={`w-10 h-5 rounded-full transition ${enabled ? "bg-white" : "bg-white/20"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-black transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                );
              })}

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-300">Solo Mode</span>
                <button
                  type="button"
                  onClick={toggleSoloMode}
                  className={`w-10 h-5 rounded-full transition ${soloMode ? "bg-white" : "bg-white/20"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black transition-transform ${soloMode ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "data" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Data Management</h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-sm text-gray-300">Total data stored</span>
              <span className="text-sm text-white font-medium">{getApproxDataSize()}</span>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">Export Format</label>
              <div className="flex gap-2">
                {(["json", "csv"] as const).map((format) => (
                  <button
                    type="button"
                    key={format}
                    onClick={() => setDataSettings((current) => ({ ...current, exportFormat: format }))}
                    className={`px-3 py-1.5 text-xs rounded-lg transition uppercase ${
                      dataSettings.exportFormat === format ? "bg-white text-black" : "bg-white/10 text-white"
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={exportData}
                className="flex items-center justify-center gap-2 py-3 text-sm bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition"
              >
                <Download size={14} /> Export Data
              </button>

              <button
                type="button"
                onClick={resetLocalPreferences}
                className="flex items-center justify-center gap-2 py-3 text-sm bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition"
              >
                <RotateCcw size={14} /> Reset Preferences
              </button>
            </div>

            <div className="border-t border-red-500/20 pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 size={14} className="text-red-400" />
                <span className="text-xs text-red-400 font-medium uppercase tracking-widest">Danger Zone</span>
              </div>
              <button
                type="button"
                onClick={clearAllData}
                className="w-full py-3 border border-red-500/40 rounded-xl text-red-300 hover:bg-red-500/10 transition"
              >
                Delete All Data
              </button>
              <p className="text-[10px] text-gray-500 text-center">
                This removes local settings and sends you back to sign in. It does not affect server-side backups.
              </p>
            </div>

            <p className="text-[11px] text-gray-500">
              Last export: {dataSettings.lastExport ? new Date(dataSettings.lastExport).toLocaleString() : "Never"}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
