import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserSearch } from "@/components/UserSearch";
import { motion } from "framer-motion";
import { Download, Award, TrendingUp, Brain, Timer, Users, Calendar } from "lucide-react";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

const data = [
  { name: 'Mon', study: 4, focus: 3.5, mood: 85 },
  { name: 'Tue', study: 3, focus: 2.8, mood: 75 },
  { name: 'Wed', study: 5, focus: 4.2, mood: 90 },
  { name: 'Thu', study: 2.5, focus: 2, mood: 65 },
  { name: 'Fri', study: 4.8, focus: 4.5, mood: 95 },
  { name: 'Sat', study: 6, focus: 5.5, mood: 100 },
  { name: 'Sun', study: 3.2, focus: 3, mood: 80 },
];

const subjectData = [
  { name: 'Math', value: 35 },
  { name: 'Science', value: 25 },
  { name: 'History', value: 20 },
  { name: 'Languages', value: 15 },
  { name: 'Arts', value: 5 },
];

const COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#10B981', '#3B82F6'];

const ProgressPage = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    toast.info("Generating your report...");
    
    try {
      const contentElement = reportRef.current;
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        backgroundColor: "#000000",
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('progress-report.pdf');
      
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6 md:space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">📈 Progress Check</h1>
            <p className="text-gray-400">"Life goes on" - and so does your growth!</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Content to be included in the report */}
        <div ref={reportRef}>
          {/* Weekly Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Subject Distribution */}
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
          </div>

          {/* Mood Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold mb-6">Mood Journey</h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
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
                    <Bar 
                      dataKey="mood" 
                      fill="url(#colorGradient)" 
                      name="Mood Score"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-400 mt-4 text-center italic">
                "The best moment is yet to come" - keep pushing! 💫
              </p>
            </div>
          </div>

          {/* Skills Progress */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 mt-6">
            <h2 className="text-xl font-semibold mb-6">Skills Progress</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Critical Thinking</span>
                  <span className="text-purple-400">85%</span>
                </div>
                <Progress value={85} className="h-2 bg-gray-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Problem Solving</span>
                  <span className="text-pink-400">92%</span>
                </div>
                <Progress value={92} className="h-2 bg-gray-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Time Management</span>
                  <span className="text-blue-400">78%</span>
                </div>
                <Progress value={78} className="h-2 bg-gray-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Note Taking</span>
                  <span className="text-green-400">88%</span>
                </div>
                <Progress value={88} className="h-2 bg-gray-800" />
              </div>
            </div>
          </div>

          {/* Achievement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Longest Study Streak</h3>
                  <p className="text-3xl font-bold text-purple-400">7 Days</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                "Make it right, make it shine" - you're doing amazing!
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="bg-pink-500/20 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Average Focus Score</h3>
                  <p className="text-3xl font-bold text-pink-400">4.2/5</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                "Focus on your dreams" - keep that concentration!
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <Timer className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Study Hours</h3>
                  <p className="text-3xl font-bold text-blue-400">28.5</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                "We are bulletproof" - nothing can stop you!
              </p>
            </motion.div>
          </div>
        </div>

        {/* User Search Component - Not included in the report */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UserSearch />
          </div>
        </div>
        
        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Study Buddies</h3>
                <p className="text-3xl font-bold text-green-400">12</p>
                <p className="text-sm text-gray-400">Connected & Growing</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Study Sessions</h3>
                <p className="text-3xl font-bold text-yellow-400">42</p>
                <p className="text-sm text-gray-400">Last 30 Days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressPage;
