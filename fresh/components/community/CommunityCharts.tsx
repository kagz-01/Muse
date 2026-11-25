import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
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

interface CircleBarEntry {
  name: string;
  members: number;
}

interface ThemeRadarEntry {
  subject: string;
  value: number;
  fullMark: number;
}

export function CircleMembershipChart({
  data,
}: {
  data: CircleBarEntry[];
}) {
  const COLORS = ["#22d3ee", "#a855f7", "#f59e0b", "#10b981", "#f43f5e"];

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.2)"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.4)" }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.2)"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.4)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#fff", fontWeight: "bold" }}
            labelStyle={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="members" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={0.85}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CommunityThemePulse({ data }: { data: ThemeRadarEntry[] }) {
  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "rgba(255,255,255,0.45)",
              fontSize: 9,
              fontWeight: "bold",
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Theme Pulse"
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="#22d3ee"
            fillOpacity={0.2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#fff", fontWeight: "bold" }}
            labelStyle={{ display: "none" }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
