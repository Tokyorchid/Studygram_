import { Link } from "react-router-dom";
import { Heart, Sparkles, Users, GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto py-12 bg-black/50 backdrop-blur-lg border-t border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="text-xl font-serif tracking-wider">
              <span className="text-white">STUDY</span>
              <span className="text-purple-500">/</span>
              <span className="text-white">GRAM</span>
            </div>
            <p className="text-sm text-gray-400">
              Where learning meets community
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/study-sessions" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                  Study Sessions
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                  Community Chat
                </Link>
              </li>
              <li>
                <Link to="/progress" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                  Track Progress
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                  Study Tips
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Community Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Users className="w-6 h-6 text-purple-500 mb-2" />
                <span className="text-lg font-bold text-white">1,000+</span>
                <span className="text-xs text-gray-400">Active Students</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <GraduationCap className="w-6 h-6 text-purple-500 mb-2" />
                <span className="text-lg font-bold text-white">500+</span>
                <span className="text-xs text-gray-400">Study Groups</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Studygram. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;