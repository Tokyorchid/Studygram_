
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LogoComponent = () => {
  return (
    <Link to="/" className="flex items-center group">
      <div className="relative h-10 w-12 mr-2">
        {/* Layered diamond shapes */}
        <motion.div 
          className="absolute h-full w-full"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 bg-purple-300 rounded-sm transform rotate-45 shadow-lg" />
        </motion.div>
        
        <motion.div 
          className="absolute h-full w-full"
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 bg-blue-500 rounded-sm transform rotate-45 shadow-lg" />
        </motion.div>
        
        <motion.div 
          className="absolute h-full w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 bg-purple-500 rounded-sm transform rotate-45 shadow-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white transform -rotate-45">S</span>
          </div>
        </motion.div>
        
        {/* Small accent dots representing the "petals/fragments" from the reference */}
        <motion.div 
          className="absolute h-full w-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="absolute top-[60%] left-[65%] h-1 w-1 rounded-full bg-red-400 opacity-70" />
          <div className="absolute top-[40%] left-[35%] h-1 w-1 rounded-full bg-red-400 opacity-70" />
          <div className="absolute top-[30%] left-[70%] h-1 w-1 rounded-full bg-red-400 opacity-70" />
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
