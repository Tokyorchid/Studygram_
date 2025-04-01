
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/navigation/Sidebar";
import Index from "./pages/Index";
import Posts from "./pages/Posts";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import StudySessions from "./pages/StudySessions";
import Messages from "./pages/Messages";
import ZenMode from "./pages/ZenMode";
import Welcome from "./pages/Welcome";
import SessionPage from "./pages/SessionPage";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MobileHeader from "./components/navigation/MobileHeader";
import BottomNav from "./components/navigation/BottomNav";
import { useState } from "react";
import "./App.css";
import "./styles/gradientText.css"; // Import the gradient text styles

function App() {
  // Create a client
  const queryClient = new QueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app-container">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          <div className="main-wrapper">
            <MobileHeader onMenuToggle={toggleSidebar} />
            <main className="main-content mt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/study-sessions" element={<StudySessions />} />
                <Route path="/session/:sessionId" element={<SessionPage />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/zen-mode" element={<ZenMode />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </div>
        <Toaster position="top-center" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
