import * as Icons from "lucide-preact";

export interface RoomData {
  id: string;
  title: string;
  description: string;
  theme_color: string;
  tags: string[];
  created_at: string;
}

interface RoomCardProps {
  room: RoomData;
  onClick?: () => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  // Format date to a readable string like "Dec 24, 2024"
  const dateObj = new Date(room.created_at);
  const dateString = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between h-56 p-6 rounded-3xl bg-[var(--muse-surface)] border border-[var(--muse-border)] overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl"
      style={{
        boxShadow: `0 10px 30px -10px ${room.theme_color}20`,
      }}
    >
      {/* Dynamic Background Glow */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: room.theme_color }}
      />

      {/* Subtle border top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            `linear-gradient(to right, transparent, ${room.theme_color}, transparent)`,
        }}
      />

      <div>
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--muse-bg)] border border-[var(--muse-border)]"
            style={{ color: room.theme_color }}
          >
            <Icons.LayoutGrid size={20} />
          </div>
          <button className="text-[var(--muse-muted)] hover:text-[var(--muse-text)] opacity-0 group-hover:opacity-100 transition-opacity">
            <Icons.MoreHorizontal size={20} />
          </button>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-[var(--muse-text)] mb-2 line-clamp-1">
          {room.title}
        </h3>
        <p className="text-sm text-[var(--muse-muted)] line-clamp-2 leading-relaxed">
          {room.description || "No description provided."}
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--muse-border)]/50">
        <div className="flex gap-2">
          {room.tags &&
            room.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-[var(--muse-bg)] border border-[var(--muse-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--muse-muted)]"
              >
                {tag}
              </span>
            ))}
          {room.tags && room.tags.length > 2 && (
            <span className="px-2.5 py-1 rounded-md bg-[var(--muse-bg)] border border-[var(--muse-border)] text-[10px] font-bold text-[var(--muse-muted)]">
              +{room.tags.length - 2}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium text-[var(--muse-muted)] uppercase tracking-widest">
          {dateString}
        </span>
      </div>
    </div>
  );
}
