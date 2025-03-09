
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', study: 4, focus: 3.5, mood: 85 },
  { name: 'Tue', study: 3, focus: 2.8, mood: 75 },
  { name: 'Wed', study: 5, focus: 4.2, mood: 90 },
  { name: 'Thu', study: 2.5, focus: 2, mood: 65 },
  { name: 'Fri', study: 4.8, focus: 4.5, mood: 95 },
  { name: 'Sat', study: 6, focus: 5.5, mood: 100 },
  { name: 'Sun', study: 3.2, focus: 3, mood: 80 },
];

const WeeklyChart = () => {
  return (
    <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
      <h2 className="text-xl font-semibold mb-6">Weekly Vibe Check</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="study" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Study Hours"
            />
            <Line 
              type="monotone" 
              dataKey="focus" 
              stroke="#EC4899" 
              strokeWidth={2}
              name="Focus Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-400 mt-4 text-center italic">
        "Every step forward is still progress" - Permission to Dance 🎵
      </p>
    </div>
  );
};

export default WeeklyChart;
