
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface AttributeRadarProps {
  data: Array<{
    subject: string;
    value: number;
    fullMark: number;
  }>;
}

const AttributeRadar: React.FC<AttributeRadarProps> = ({ data }) => {
  return (
    <div className="w-full h-64 sm:h-80 bg-slate-800 rounded-lg p-4 shadow-inner border border-slate-700">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#fbbf24', fontSize: 10, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Spieler"
            dataKey="value"
            stroke="#fbbf24"
            strokeWidth={3}
            fill="#fbbf24"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttributeRadar;
