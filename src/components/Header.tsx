import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Home, BookOpen, MessageSquare, User } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-serif tracking-wider">
              <span className="text-white">STUDY</span>
              <span className="text-purple-500">/</span>
              <span className="text-white">GRAM</span>
            </div>
          </Link>

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
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;