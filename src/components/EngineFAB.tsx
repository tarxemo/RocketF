import React, { useState } from 'react';
import { FaPowerOff, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface EngineFABProps {
  onEngineToggle: (isRunning: boolean) => void;
  isEngineRunning: boolean;
}
const EngineFAB: React.FC<EngineFABProps> = ({ onEngineToggle, isEngineRunning }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleEngineToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEngineToggle(!isEngineRunning);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 mb-4 w-48 bg-slate-800 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-3 text-sm text-slate-300 border-b border-slate-700">
              Engine Controls
            </div>
            <button 
              onClick={handleEngineToggle}
              className={`w-full px-4 py-3 text-left text-sm flex items-center ${isEngineRunning ? 'text-red-400 hover:bg-red-900/20' : 'text-green-400 hover:bg-green-900/20'}`}
            >
              <FaPowerOff className="mr-2" />
              {isEngineRunning ? 'Emergency Stop' : 'Start Engine'}
            </button>
            <div className="p-2 text-xs text-slate-500 border-t border-slate-700">
              {isEngineRunning ? 'Engine is running' : 'Engine is off'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-xl relative overflow-hidden
          ${isEngineRunning 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-green-600 hover:bg-green-700'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div
          animate={{
            scale: isHovered ? 1.2 : 1,
            rotate: isHovered ? 90 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <FaRocket />
        </motion.div>
        
        {/* Pulsing indicator when engine is running */}
        {isEngineRunning && (
          <motion.span 
            className="absolute inset-0 rounded-full bg-red-500 opacity-30"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut' 
            }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default EngineFAB;
