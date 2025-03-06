
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          The Vibes Are Immaculate! ✨
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Ready to level up your learning journey today
        </p>
      </div>
      <Button 
        onClick={() => navigate("/study-sessions")}
        className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transform hover:scale-105 transition-all duration-300 text-lg font-semibold px-8 py-6 h-auto"
      >
        Start The Grind
      </Button>
    </div>
  );
};

export default DashboardHeader;
