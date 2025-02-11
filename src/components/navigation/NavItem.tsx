
import { Link } from "react-router-dom";

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
}

const NavItem = ({ icon, text, to, active = false }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      active 
        ? "bg-purple-500/20 text-purple-400" 
        : "hover:bg-purple-500/10 text-gray-400 hover:text-purple-400"
    }`}
  >
    {icon}
    <span className="hidden md:block">{text}</span>
  </Link>
);

export default NavItem;
