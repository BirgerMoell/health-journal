'use client';

import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiAlertCircle, FiMoon, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface InsightCardProps {
  title: string;
  description: string;
  trend: 'improving' | 'declining' | 'neutral';
  icon: string;
}

export default function InsightCard({ title, description, trend, icon }: InsightCardProps) {
  // Map icon string to actual icon component
  const getIcon = () => {
    switch (icon) {
      case 'activity':
        return <FiActivity className="text-green-500" size={24} />;
      case 'heart':
        return <FiHeart className="text-red-500" size={24} />;
      case 'sleep':
        return <FiMoon className="text-blue-500" size={24} />;
      case 'stress':
        return <FiAlertCircle className="text-amber-500" size={24} />;
      default:
        return <FiActivity className="text-green-500" size={24} />;
    }
  };

  // Get trend icon and color
  const getTrendIndicator = () => {
    switch (trend) {
      case 'improving':
        return {
          icon: <FiTrendingUp size={16} />,
          color: 'text-green-500',
          label: 'Improving'
        };
      case 'declining':
        return {
          icon: <FiTrendingDown size={16} />,
          color: 'text-red-500',
          label: 'Declining'
        };
      default:
        return {
          icon: null,
          color: 'text-gray-500',
          label: 'Steady'
        };
    }
  };

  const trendIndicator = getTrendIndicator();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm p-5 h-full border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-full bg-gray-50">{getIcon()}</div>
        <div className={`flex items-center ${trendIndicator.color} text-xs font-medium`}>
          {trendIndicator.icon && <span className="mr-1">{trendIndicator.icon}</span>}
          {trendIndicator.label}
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
} 