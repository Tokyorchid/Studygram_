import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Welcome back! 👋",
      description: "Great to see you again!",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/30 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-700/30 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="backdrop-blur-sm bg-black/50 border border-purple-500/20 shadow-xl rounded-xl p-8 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/50 border-purple-500/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/50 border-purple-500/20 text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Sign in
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button className="text-sm text-primary hover:text-primary/90 hover:underline">
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
