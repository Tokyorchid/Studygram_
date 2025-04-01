
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const LogoComponent = () => {
  return (
    <Link to="/" className="flex items-center group">
      <div className="relative h-10 w-10 mr-2">
        {/* Circular background */}
        <motion.div 
          className="absolute h-full w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 bg-purple-600/20 rounded-full shadow-lg" />
        </motion.div>
        
        {/* Inner circle */}
        <motion.div 
          className="absolute h-full w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 bg-blue-500/20 rounded-full shadow-lg" />
        </motion.div>
        
        {/* Compass icon */}
        <motion.div 
          className="absolute h-full w-full flex items-center justify-center"
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Compass className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
        </motion.div>
      </div>
      
      <div className="ml-2">
        <div className="text-xl md:text-2xl font-light tracking-wider">
          <span className="bg-gradient-to-r from-purple-300 to-blue-400 text-transparent bg-clip-text">STUDY</span>
          <span className="text-purple-500">/</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-300 text-transparent bg-clip-text">GRAM</span>
        </div>
        <span className="text-xs text-purple-300 italic hidden md:block">learning in layers</span>
      </div>
    </Link>
  );
};

export default LogoComponent;
