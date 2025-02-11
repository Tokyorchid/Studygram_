
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome Back! ✨</h1>
        <p className="text-gray-400">Ready to enhance your learning journey today</p>
      </div>
      <Button 
        onClick={() => navigate("/zen-mode")}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
      >
        Start Learning
      </Button>
    </div>
  );
};

export default DashboardHeader;
