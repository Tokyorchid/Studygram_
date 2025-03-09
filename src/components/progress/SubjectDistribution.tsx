
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const subjectData = [
  { name: 'Math', value: 35 },
  { name: 'Science', value: 25 },
  { name: 'History', value: 20 },
  { name: 'Languages', value: 15 },
  { name: 'Arts', value: 5 },
];

const COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#10B981', '#3B82F6'];

const SubjectDistribution = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
      <h2 className="text-xl font-semibold mb-6">Subject Distribution</h2>
      <div className="h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={subjectData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {subjectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '0.5rem'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubjectDistribution;
