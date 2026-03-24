import React from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';
import { useConnectionsStore } from '../../store/useConnectionsStore';

export default function ConnectionMap() {
  const user = useUserStore(state => state.user);
  const relationships = useConnectionsStore(state => state.relationships);

  if (!user) return null;

  // Simple fixed orbit logic for MVP 
  const orbits = [
    { radius: 100, dur: 25 },
    { radius: 160, dur: 45 },
    { radius: 220, dur: 60 },
  ];

  return (
    <div className="w-full aspect-square bg-[#0a0a0a] rounded-3xl border border-white/5 shadow-inner relative flex items-center justify-center overflow-hidden">
      
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
      <div className="z-20 w-16 h-16 rounded-full border-[3px] border-[#0a0a0a] bg-[#1c1c1c] shadow-[0_0_20px_rgba(108,99,255,0.3)] flex items-center justify-center overflow-hidden relative">
         {user.avatarUrl ? (
           <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
         ) : (
           <span className="font-serif text-xl">{user.name.charAt(0)}</span>
         )}
      </div>

      {/* Orbital Connection Nodes */}
      {relationships.map((rel, index) => {
         const orbit = orbits[index % orbits.length];
         // Unique delay sets the start angle so they aren't clustered
         const delay = index * -6; 
         
         return (
           <motion.div 
             key={rel.id}
             className="absolute"
             style={{ width: orbit.radius * 2, height: orbit.radius * 2 }}
             initial={{ rotate: 0 }}
             animate={{ rotate: 360 }}
             transition={{ duration: orbit.dur, repeat: Infinity, ease: "linear", delay }}
           >
             {/* The Node itself placed at the top edge of the orbit bounding box */}
             <motion.div 
               className="w-12 h-12 -ml-6 -mt-6 rounded-full border-[3px] border-[#1c1c1c] shadow-[0_0_15px_rgba(0,229,255,0.15)] overflow-hidden cursor-pointer group"
               style={{ position: 'absolute', top: 0, left: '50%' }}
               initial={{ rotate: 0 }}
               animate={{ rotate: -360 }} // Counter-rotate so image stays upright to watcher
               transition={{ duration: orbit.dur, repeat: Infinity, ease: "linear", delay }}
             >
               <img src={rel.avatar} alt={rel.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               <div className="absolute inset-0 rounded-full border border-[#00E5FF]/0 group-hover:border-[#00E5FF] transition-colors"></div>
             </motion.div>
           </motion.div>
         );
      })}

    </div>
  );
}
