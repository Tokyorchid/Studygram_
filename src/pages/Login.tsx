
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Trophy, Sparkles } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Bestie, you're in! ✨",
          description: "Check your inbox rn, we sent you something!",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/welcome");
        toast({
          title: "The main character is back! ✨",
          description: "Missed you bestie, let's get this bread!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Oof, bestie! 😬",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/30 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="backdrop-blur-sm bg-black/50 border border-purple-500/20 shadow-xl rounded-xl p-8">
          <div className="text-center mb-8 space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {isSignUp ? "Join the Vibe ✨" : "Welcome Back Bestie!"}
            </h1>
            <p className="text-gray-400">
              {isSignUp
                ? "Time to level up your study game fr fr"
                : "The grind doesn't stop, let's get it! 💫"}
            </p>
            <p className="text-sm text-purple-400/80">
              {isSignUp
                ? "no cap, you're about to be the main character of your study journey"
                : "back like you never left, bestie - let's make it iconic"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="drop your email bestie"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/50 border-purple-500/20 text-white placeholder:text-gray-500 focus:ring-purple-500/50"
            />
            <Input
              type="password"
              placeholder="super secret password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/50 border-purple-500/20 text-white placeholder:text-gray-500 focus:ring-purple-500/50"
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:opacity-90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isSignUp ? "Let's Get This Bread" : "Slay The Day"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            >
              {isSignUp
                ? "Already in the squad? Sign in"
                : "First time? Join the vibe"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-purple-500/20 text-center transform hover:scale-[1.02] transition-all duration-200">
            <BookOpen className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Study Your Way</h3>
            <p className="text-sm text-gray-400">fr fr, your journey, your rules</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-purple-500/20 text-center transform hover:scale-[1.02] transition-all duration-200">
            <Users className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Squad Goals</h3>
            <p className="text-sm text-gray-400">link up with the study besties</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-purple-500/20 text-center transform hover:scale-[1.02] transition-all duration-200">
            <Trophy className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Level Up</h3>
            <p className="text-sm text-gray-400">watch your grades go brr</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

