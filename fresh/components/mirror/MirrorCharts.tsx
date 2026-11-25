import { useMemo, useState } from "preact/hooks";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function LineChart({
  data,
  color = "#60a5fa",
  title,
}: {
  data: number[];
  color?: string;
  title: string;
}) {
  const chartData = useMemo(() => {
    return data.map((val, i) => ({
      name: `T-${data.length - i - 1}`,
      value: val,
    }));
  }, [data]);

  return (
    <div className="bg-[#0d0d0d] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden shadow-2xl h-64">
      <div
        className="absolute -top-10 -right-10 w-40 h-40 opacity-20 blur-3xl rounded-full pointer-events-none"
        style={{ backgroundColor: color }}
      />
      {title && (
        <h3 className="text-white font-bold tracking-widest uppercase text-[10px] mb-4 opacity-70">
          {title}
        </h3>
      )}
      <div className="w-full h-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.2)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.2)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              itemStyle={{
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2 }}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PieChart({
  data,
  title,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="bg-[#0d0d0d] rounded-[2rem] p-8 border border-white/5 relative shadow-2xl flex flex-col md:flex-row items-center gap-8 h-72">
      <div className="flex-1 w-full">
        {title && (
          <h3 className="text-white font-bold tracking-widest uppercase text-[10px] mb-6 opacity-70">
            {title}
          </h3>
        )}
        <div className="flex flex-col gap-4">
          {data.map((d, i) => (
            <div
              key={d.label}
              className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-default ${
                activeIndex === i ? "bg-white/5" : ""
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={onPieLeave}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{
                    backgroundColor: d.color,
                    boxShadow: `0 0 10px ${d.color}80`,
                  }}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    activeIndex === i ? "text-white" : "text-gray-400"
                  }`}
                >
                  {d.label}
                </span>
              </div>
              <span
                className={`text-sm font-bold transition-colors ${
                  activeIndex === i ? "text-white" : "text-gray-500"
                }`}
              >
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              itemStyle={{
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              nameKey="label"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === index || activeIndex === -1
                    ? 1
                    : 0.3}
                  className="transition-opacity duration-300 outline-none"
                />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RadarChart({
  data,
  color = "#a855f7",
  title,
}: {
  data: { subject: string; A: number; fullMark: number }[];
  color?: string;
  title: string;
}) {
  return (
    <div className="bg-[#0d0d0d] rounded-[2rem] p-8 border border-white/5 relative shadow-2xl flex flex-col items-center justify-center h-80">
      {title && (
        <h3 className="text-white font-bold tracking-widest uppercase text-[10px] absolute top-8 left-8 opacity-70">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "rgba(255,255,255,0.5)",
              fontSize: 10,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Cognitive Density"
            dataKey="A"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
            itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
            labelStyle={{ display: "none" }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
