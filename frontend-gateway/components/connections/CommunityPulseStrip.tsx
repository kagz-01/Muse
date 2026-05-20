import { useEffect, useState } from "preact/hooks";
import { Aperture, MessageSquare, Users, Zap } from "lucide-preact";

const PULSE_MESSAGES = [
  {
    icon: <Zap size={14} />,
    text: "3 Circles Growing in 'Architecture of Silence'",
    color: "text-canvas-primary",
  },
  {
    icon: <Users size={14} />,
    text: "Amina El-Sayed is reflecting in 'Silence'",
    color: "text-amber-400",
  },
  {
    icon: <Aperture size={14} />,
    text: "Global Theme: 'Identity' is surfacing today",
    color: "text-emerald-400",
  },
  {
    icon: <MessageSquare size={14} />,
    text: "New Perspective: Marcus shared a direct insight",
    color: "text-rose-400",
  },
];

export default function CommunityPulseStrip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % PULSE_MESSAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = PULSE_MESSAGES[index];

  return (
    <div className="w-full h-12 bg-white/[0.02] border-y border-white/5 flex items-center justify-center overflow-hidden px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent opacity-50" />

      <div
        key={index}
        className="flex items-center gap-3 relative z-10 animate-in slide-in-from-bottom-2 duration-700 ease-out"
      >
        <span className={`${current.color} drop-shadow-sm`}>
          {current.icon}
        </span>
        <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
          {current.text}
        </span>
      </div>
    </div>
  );
}
