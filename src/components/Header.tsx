
import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Home, BookOpen, MessageSquare, User, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase, getProfile, updateProfile } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LogoComponent from "./navigation/LogoComponent";

const Header = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { toast } = useToast();

  useEffect(() => {
    const loadUserTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await getProfile(user.id);
        
        if (profile?.theme) {
          setTheme(profile.theme as "light" | "dark");
          document.documentElement.classList.toggle("dark", profile.theme === "dark");
        }
      }
    };
    loadUserTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await updateProfile(user.id, { theme: newTheme });

      if (!error) {
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        toast({
          title: "Theme Updated ✨",
          description: `Switched to ${newTheme} mode`,
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <LogoComponent />

          {/* Navigation */}
          <NavigationMenu>
            <NavigationMenuList className="hidden sm:flex space-x-8">
              <NavigationMenuItem>
                <Link 
                  to="/welcome" 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  to="/study-sessions" 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Study</span>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  to="/messages" 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  {theme === "light" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
