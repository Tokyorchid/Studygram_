import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Stars } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-overlay filter blur-xl animate-blob" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-500/30 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-purple-700/30 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Welcome message */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
              Welcome to Studygram
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            your bestie for productive study sessions ✨
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-xl bg-purple-950/30 backdrop-blur-sm border border-purple-500/20">
            <Stars className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Study Together</h3>
            <p className="text-gray-400">Connect with study buddies and share knowledge</p>
          </div>
          <div className="p-6 rounded-xl bg-purple-950/30 backdrop-blur-sm border border-purple-500/20">
            <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-400">Watch your achievements stack up</p>
          </div>
          <div className="p-6 rounded-xl bg-purple-950/30 backdrop-blur-sm border border-purple-500/20">
            <Stars className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Stay Motivated</h3>
            <p className="text-gray-400">Keep the momentum going with daily streaks</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/login")}
          className="mt-8 px-8 py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group"
        >
          Get Started
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Welcome;