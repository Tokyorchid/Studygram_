
import { Progress } from "@/components/ui/progress";

const SkillsProgress = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
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
  );
};

export default SkillsProgress;
