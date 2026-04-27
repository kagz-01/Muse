import { useMemo, useState } from "preact/hooks";
import { Settings, LogOut, Trophy, Activity, Sparkles } from "lucide-preact";
import { userSignal, logout } from "../../signals/user.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import { itemsSignal } from "../../signals/items.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { journalSignal, getJournalStreak, getJournalTitle } from "../../signals/journal.ts";
import { activeThemesSignal } from "../../signals/connections.ts";

type ProfileTab = "overview" | "achievements" | "activity";

type ProfileActivity = {
  id: string;
  title: string;
  detail: string;
  timestamp: number;
};

export default function ProfilePage() {
  const user = userSignal.value;
  const rooms = roomsSignal.value;
  const items = itemsSignal.value;
  const threads = threadsSignal.value;
  const journals = journalSignal.value;
  const themes = activeThemesSignal.value;

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const recentActivity = useMemo<ProfileActivity[]>(() => {
    const fromItems: ProfileActivity[] = items.map((item) => ({
      id: `item-${item.id}`,
      title: `Added artifact: ${item.title}`,
      detail: item.isPublic ? "Public artifact" : "Private artifact",
      timestamp: item.createdAt,
    }));

    const fromThreads: ProfileActivity[] = threads.map((thread) => ({
      id: `thread-${thread.id}`,
      title: `Updated thread: ${thread.title}`,
      detail: thread.isPublic ? "Public thread" : "Private thread",
      timestamp: thread.updatedAt,
    }));

    const fromJournals: ProfileActivity[] = journals.map((entry) => ({
      id: `journal-${entry.id}`,
      title: `Journaled: ${getJournalTitle(entry)}`,
      detail: `${entry.wordCount} words`,
      timestamp: entry.updatedAt,
    }));

    return [...fromItems, ...fromThreads, ...fromJournals]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 12);
  }, [items, threads, journals]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <a href="/auth" className="text-white underline">Please login</a>
      </div>
    );
  }

  const journalStreak = getJournalStreak();
  const publicItems = items.filter((item) => item.isPublic).length;

  const stats = [
    { label: "Rooms", value: rooms.length },
    { label: "Artifacts", value: items.length },
    { label: "Threads", value: threads.length },
    { label: "Journal Entries", value: journals.length },
  ];

  const achievements = [
    { id: "a1", title: "First Room", desc: "Created at least one room", unlocked: rooms.length >= 1 },
    { id: "a2", title: "Pattern Builder", desc: "Built three thematic threads", unlocked: threads.length >= 3 },
    { id: "a3", title: "Reflective Flow", desc: "Maintained a 3+ day journal streak", unlocked: journalStreak >= 3 },
    { id: "a4", title: "Public Curator", desc: "Shared five public artifacts", unlocked: publicItems >= 5 },
  ];

  const handleLogout = () => {
    logout();
    globalThis.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-canvas-bg-dark px-6 md:px-10 py-8 max-w-6xl mx-auto pb-24 md:pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
        <div className="flex gap-2">
          <a
            href="/settings"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <Settings size={18} className="text-gray-400" />
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 transition"
          >
            <LogOut size={18} className="text-rose-400" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center text-2xl text-white border border-white/10">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">{user.name}</p>
            <p className="text-sm text-gray-400">{user.username}</p>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl font-serif italic">{user.bio || "No bio yet."}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {user.location && <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-gray-300">{user.location}</span>}
              {user.occupation && <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-gray-300">{user.occupation}</span>}
              {user.pronouns && <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-gray-300">{user.pronouns}</span>}
              {user.gender && <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-gray-300">{user.gender}</span>}
            </div>
          </div>
        </div>
        {user.links.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2">
            {user.links.slice(0, 6).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] px-2 py-1 rounded-full bg-black/30 border border-white/10 text-gray-300 hover:text-white transition"
              >
                {link.title}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 border-b border-white/10 mb-6 overflow-x-auto">
        {[
          { id: "overview" as const, label: "Overview" },
          { id: "achievements" as const, label: "Achievements" },
          { id: "activity" as const, label: "Activity" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-canvas-primary" /> Creative Signature
              </h3>
              <div className="flex flex-wrap gap-2">
                {themes.slice(0, 8).map((theme) => (
                  <span key={theme} className="px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 border border-white/10 text-gray-300">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <Activity size={14} className="text-canvas-primary" /> Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <p className="text-sm text-white font-medium">{activity.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{activity.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-5 rounded-2xl border ${achievement.unlocked ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/[0.03] border-white/10"}`}
            >
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy size={14} className={achievement.unlocked ? "text-emerald-400" : "text-gray-500"} />
                {achievement.title}
              </p>
              <p className="text-[11px] text-gray-500 mt-2">{achievement.desc}</p>
              <p className={`text-[10px] mt-3 font-bold uppercase tracking-widest ${achievement.unlocked ? "text-emerald-400" : "text-gray-600"}`}>
                {achievement.unlocked ? "Unlocked" : "Locked"}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-sm font-semibold text-white">{activity.title}</p>
              <p className="text-[11px] text-gray-500 mt-1">{activity.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
