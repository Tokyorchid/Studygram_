
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Trophy } from "lucide-react";

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
          title: "Welcome! 🌟",
          description: "Check your email to confirm your account!",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/welcome");
        toast({
          title: "Welcome back! 👋",
          description: "Great to see you again!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? "Join Our Learning Community" : "Welcome Back"}
            </h1>
            <p className="text-gray-400">
              {isSignUp
                ? "Create your account to begin your learning journey"
                : "Sign in to continue your learning progress"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/50 border-purple-500/20 text-white"
            />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/50 border-purple-500/20 text-white"
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-purple-500/20 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Personalized Learning</h3>
            <p className="text-sm text-gray-400">Tailored study paths for your goals</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-purple-500/20 text-center">
            <Users className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Study Groups</h3>
            <p className="text-sm text-gray-400">Learn together with peers</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-purple-500/20 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-gray-400">Monitor your achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
