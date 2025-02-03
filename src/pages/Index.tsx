import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { BookOpen, Sparkles, Users } from "lucide-react";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: isLogin ? "Welcome back! 👋" : "Welcome to Studygram! 🎉",
      description: isLogin 
        ? "Great to see you again!" 
        : "Let's make learning fun and interactive!",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Hero content */}
        <div className="space-y-6 text-center md:text-left p-4">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4 animate-fade-in">
            Study<span className="text-primary">gram</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in animation-delay-200">
            Join Studygram and make learning fun and interactive!
          </p>
          
          {/* Feature highlights */}
          <div className="grid gap-4 animate-fade-in animation-delay-400">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Collaborative Learning</h3>
                <p className="text-sm text-gray-600">Connect with study buddies</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Interactive Sessions</h3>
                <p className="text-sm text-gray-600">Learn from peers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Earn Achievements</h3>
                <p className="text-sm text-gray-600">Track your progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl animate-scale-in">
            <CardHeader>
              <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
              <CardDescription>
                {isLogin
                  ? "Enter your details to sign in"
                  : "Enter your details to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/50"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {isLogin ? "Sign in" : "Sign up"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;