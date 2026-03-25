import React from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';
import { useConnectionsStore } from '../../store/useConnectionsStore';

export default function ConnectionMap() {
  const user = useUserStore(state => state.user);
  const collaborators = useConnectionsStore(state => state.collaborators);

  if (!user) return null;

  // Simple fixed orbit logic for MVP 
  const orbits = [
    { radius: 100, dur: 25 },
    { radius: 160, dur: 45 },
    { radius: 220, dur: 60 },
  ];

  return (
    <div className="w-full aspect-square bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-inner relative flex items-center justify-center overflow-hidden">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 flex items-center justify-center">
         <motion.div 
            className="w-64 h-64 bg-canvas-primary/5 rounded-full blur-3xl absolute"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
         />
         <div className="w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-2xl absolute"></div>
      </div>

      {/* Orbit Rings */}
      {orbits.map((orbit, i) => (
        <div key={i} className="absolute rounded-full border border-white/[0.03]" style={{ width: orbit.radius * 2, height: orbit.radius * 2 }}></div>
      ))}

      {/* Center User Node */}
      <div className="z-20 w-20 h-20 rounded-2xl border-[3px] border-[#0a0a0a] bg-[#1c1c1c] shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center overflow-hidden relative">
         {user.avatarUrl ? (
           <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
         ) : (
           <span className="font-serif text-2xl text-white">{user.name.charAt(0)}</span>
         )}
      </div>

      {/* Orbital Connection Nodes */}
      {collaborators.map((collab, index) => {
         const orbit = orbits[index % orbits.length];
         // Unique delay sets the start angle so they aren't clustered
         const delay = index * -6; 
         
         return (
           <motion.div 
             key={collab.id}
             className="absolute"
             style={{ width: orbit.radius * 2, height: orbit.radius * 2 }}
             initial={{ rotate: 0 }}
             animate={{ rotate: 360 }}
             transition={{ duration: orbit.dur, repeat: Infinity, ease: "linear", delay }}
           >
             {/* The Node itself placed at the top edge of the orbit bounding box */}
             <motion.div 
               className="w-14 h-14 -ml-7 -mt-7 rounded-xl border-[3px] border-[#1c1c1c] shadow-[0_0_20px_rgba(0,229,255,0.2)] overflow-hidden cursor-pointer group"
               style={{ position: 'absolute', top: 0, left: '50%' }}
               initial={{ rotate: 0 }}
               animate={{ rotate: -360 }} // Counter-rotate so image stays upright to watcher
               transition={{ duration: orbit.dur, repeat: Infinity, ease: "linear", delay }}
             >
               <img src={collab.avatar} alt={collab.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               <div className="absolute inset-0 rounded-xl border border-[#00E5FF]/0 group-hover:border-[#00E5FF]/50 transition-colors bg-canvas-primary/10 opacity-0 group-hover:opacity-100"></div>
             </motion.div>
           </motion.div>
         );
      })}

    </div>
  );
}
