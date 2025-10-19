import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';

// Mock data representing a typical progression over 36 months
// Baseline: CVF 100%, DLCO 80%
const progressionData = [
  { month: 0, cvf: 100, dlco: 80 },
  { month: 6, cvf: 97, dlco: 76 },
  { month: 12, cvf: 94, dlco: 72 },
  { month: 18, cvf: 90, dlco: 67 }, // CVF hits 10% relative decline
  { month: 24, cvf: 86, dlco: 63 },
  { month: 30, cvf: 82, dlco: 59 },
  { month: 36, cvf: 78, dlco: 55 },
];

const CVF_BASELINE = progressionData[0].cvf;
const DLCO_BASELINE = progressionData[0].dlco;

const CVF_THRESHOLD_10_PERCENT = CVF_BASELINE * 0.90; // 10% relative decline
const DLCO_THRESHOLD_15_PERCENT = DLCO_BASELINE * 0.85; // 15% relative decline

// Custom Tooltip for styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-lg shadow-xl">
        <p className="font-bold text-slate-800">{`Mois ${label}`}</p>
        <p className="text-accent-blue">{`CVF : ${payload[0].value}%`}</p>
        <p className="text-slate-600">{`DLCO : ${payload[1].value}%`}</p>
      </div>
    );
  }
  return null;
};

const PrognosisChart: React.FC = () => {
  return (
    <div style={{ width: '100%', height: 400 }} className="bg-white rounded-lg p-4 border border-slate-200">
      <ResponsiveContainer>
        <LineChart
          data={progressionData}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.7)" />
          <XAxis 
            dataKey="month" 
            stroke="#64748B" 
            tick={{ fill: '#64748B', fontSize: 12 }} 
            label={{ value: 'Mois de suivi', position: 'insideBottom', offset: -10, fill: '#475569' }}
          />
          <YAxis 
            stroke="#64748B" 
            tick={{ fill: '#64748B', fontSize: 12 }} 
            domain={[40, 110]} 
            unit="%"
            label={{ value: '% de la valeur prédite', angle: -90, position: 'insideLeft', fill: '#475569' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#38BDF8', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ color: '#475569', paddingTop: '20px' }} />
          
          <ReferenceLine y={CVF_THRESHOLD_10_PERCENT} stroke="#F87171" strokeDasharray="4 4">
             <Label value="Seuil de progression CVF (déclin 10%)" position="insideTopLeft" fill="#F87171" fontSize={12} />
          </ReferenceLine>
           <ReferenceLine y={DLCO_THRESHOLD_15_PERCENT} stroke="#F87171" strokeDasharray="4 4">
             <Label value="Seuil de progression DLCO (déclin 15%)" position="insideBottomLeft" fill="#F87171" fontSize={12} />
          </ReferenceLine>

          <Line
            type="monotone"
            dataKey="cvf"
            name="CVF (% prédit)"
            stroke="#38BDF8" // accent-blue
            strokeWidth={2}
            dot={{ r: 4, fill: '#38BDF8' }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="dlco"
            name="DLCO (% prédit)"
            stroke="#64748B" // slate-500
            strokeWidth={2}
            dot={{ r: 4, fill: '#64748B' }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PrognosisChart;