import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useRoomsStore } from '../store/useRoomsStore';
import { useItemsStore } from '../store/useItemsStore';
import { ArrowLeft, MoreVertical, Share } from 'lucide-react';

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = useRoomsStore(state => state.rooms.find(r => r.id === id));
  const items = useItemsStore(state => state.items.filter(i => i.roomId === id));

  if (!room) return <div className="p-10 text-white">Room not found</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 min-h-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <h2 className="text-4xl font-bold tracking-tight">{room.name}</h2>
          <p className="text-gray-400 mt-2 font-medium">{items.length} items</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full flex items-center gap-2 text-sm font-medium transition-colors border border-white/5 shadow-sm">
            <Share size={16} /> Share Room
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5">
            <MoreVertical size={16} />
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-3xl border border-white/5 border-dashed">
           <div className="w-16 h-16 bg-white/10 rounded-2xl mb-4"></div>
           <p className="text-gray-400 font-medium">This room is empty.</p>
           <p className="text-sm text-gray-500 mt-1">Share content to Muse to collect items here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-[#1c1c1c] rounded-2xl border border-white/5 overflow-hidden group hover:border-[#6366f1]/50 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:shadow-[#6366f1]/10">
               <div className="h-48 bg-[#252525] relative">
                  {/* Item Visual Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-gray-600 font-medium">Visual Preview</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-transparent opacity-80"></div>
               </div>
               <div className="p-5">
                 <h4 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">{item.title}</h4>
                 {item.note && <p className="text-sm text-[#a3a3a3] line-clamp-3 mb-3 italic">"{item.note}"</p>}
                 <div className="flex items-center justify-between mt-4">
                   <p className="text-xs text-gray-500 truncate max-w-[70%]">{new URL(item.sourceUrl).hostname}</p>
                   <p className="text-[10px] text-gray-600 font-medium">{new Date(item.dateSaved).toLocaleDateString()}</p>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
