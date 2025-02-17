import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Progress from "./pages/Progress";
import StudySessions from "./pages/StudySessions";
import Messages from "./pages/Messages";
import Posts from "./pages/Posts";
import NotFound from "./pages/NotFound";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-black flex flex-col">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <main className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/study-sessions" element={<StudySessions />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
