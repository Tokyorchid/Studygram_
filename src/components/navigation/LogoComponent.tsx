
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LogoComponent = () => {
  return (
    <Link to="/" className="flex items-center group">
      <div className="relative h-10 w-12 mr-2">
        <motion.div 
          className="absolute h-full w-full"
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-purple-400/30 rounded-sm transform rotate-45 shadow-lg" />
        </motion.div>
        
        <motion.div 
          className="absolute h-full w-full"
          initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-blue-500/30 rounded-sm transform rotate-45 shadow-lg" />
        </motion.div>
        
        <motion.div 
          className="absolute h-full w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-purple-600 rounded-sm transform rotate-45 shadow-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white transform -rotate-45">SG</span>
          </div>
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
