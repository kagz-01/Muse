import { useMemo } from "preact/hooks";

export function LineChart({ data, color = "#60a5fa", title }: { data: number[]; color?: string; title: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / (max - min)) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-[#0d0d0d] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
      <div className="absolute -top-10 -right-10 w-40 h-40 opacity-20 blur-3xl rounded-full pointer-events-none" style={{ backgroundColor: color }} />
      <h3 className="text-white font-bold tracking-widest uppercase text-[10px] mb-8 opacity-70">{title}</h3>
      <div className="relative h-32 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          ))}
          
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id={`glow-${title}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <polygon
            points={`0,100 ${points} 100,100`}
            fill={`url(#grad-${title})`}
          />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            filter={`url(#glow-${title})`}
          />
          
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((val - min) / (max - min)) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill={color}
                className="group-hover:r-2 transition-all cursor-pointer"
              >
                <title>{val}</title>
              </circle>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold tracking-widest uppercase">
        <span>Start</span>
        <span>Now</span>
      </div>
    </div>
  );
}

export function PieChart({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  let currentAngle = 0;
  const paths = data.map(d => {
    if (total === 0) return null;
    const angle = (d.value / total) * 360;
    const rad1 = (currentAngle - 90) * (Math.PI / 180);
    const rad2 = (currentAngle + angle - 90) * (Math.PI / 180);
    
    const x1 = 50 + 40 * Math.cos(rad1);
    const y1 = 50 + 40 * Math.sin(rad1);
    const x2 = 50 + 40 * Math.cos(rad2);
    const y2 = 50 + 40 * Math.sin(rad2);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    // Draw a slice
    const dAttr = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
    currentAngle += angle;
    
    return (
      <path key={d.label} d={dAttr} fill={d.color} className="hover:opacity-80 transition-opacity cursor-pointer">
        <title>{d.label}: {d.value}</title>
      </path>
    );
  });

  return (
    <div className="bg-[#0d0d0d] rounded-[2rem] p-8 border border-white/5 relative shadow-2xl flex flex-col md:flex-row items-center gap-8">
      <div className="flex-1">
        <h3 className="text-white font-bold tracking-widest uppercase text-[10px] mb-8 opacity-70">{title}</h3>
        <div className="flex flex-col gap-3">
          {data.map(d => (
            <div key={d.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-400 font-medium">{d.label}</span>
              </div>
              <span className="text-sm font-bold text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-40 h-40 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          {total === 0 ? (
            <circle cx="50" cy="50" r="40" fill="#1a1a1a" />
          ) : paths}
          {/* Inner cutout for Donut style */}
          <circle cx="50" cy="50" r="25" fill="#0d0d0d" />
        </svg>
      </div>
    </div>
  );
}
