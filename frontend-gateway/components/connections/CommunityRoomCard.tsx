import * as Icons from "lucide-preact";

export interface CommunityRoom {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  coverImage: string;
}

interface Props {
  room: CommunityRoom;
}

export default function CommunityRoomCard({ room }: Props) {
  return (
    <div className="group relative h-[420px] rounded-[3rem] overflow-hidden bg-[#0d0d0d] border border-white/5 shadow-2xl transition-all duration-700 hover:border-indigo-500/40 hover:-translate-y-2">
      <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
        <img
          src={room.coverImage}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
          alt={room.name}
        />
        <div className="absolute inset-0 room-image-overlay" />
      </div>

      <div className="relative h-full z-10 p-10 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-xl group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-500">
            <Icons.Globe size={28} />
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 flex items-center gap-2">
            <Icons.Users size={16} className="text-indigo-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">
              {room.memberCount} Members
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-4">
            <Icons.Aperture size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Public Realm
            </span>
          </div>
          <h3 className="text-4xl font-bold tracking-tight text-white mb-4 group-hover:text-indigo-400 transition-all duration-500">
            {room.name}
          </h3>
          <p className="text-gray-300 font-serif italic text-lg leading-relaxed mb-10 max-w-lg line-clamp-2 group-hover:text-white transition-colors">
            "{room.description}"
          </p>

          <div className="flex items-center justify-between pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Curated Community
              </div>
            </div>

            <button
              type="button"
              className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all transform group-hover:rotate-[-45deg] duration-500 shadow-xl cursor-pointer"
            >
              <Icons.ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
