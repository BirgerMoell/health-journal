'use client';

import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

interface StreakTrackerProps {
  streak: number;
  className?: string;
}

export default function StreakTracker({ streak, className = '' }: StreakTrackerProps) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      className={`flex items-center bg-amber-100 rounded-full px-3 py-1 ${className}`}
    >
      <FiZap className="text-amber-500 mr-1" size={18} />
      <span className="text-amber-700 font-medium text-sm">{streak}-day streak!</span>
      
      {/* Animated dots */}
      <div className="flex space-x-1 ml-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.6, scale: 0.8 }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.6, 1, 0.6],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 