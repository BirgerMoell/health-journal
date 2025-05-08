'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity, 
  FiHeart, 
  FiTrendingUp, 
  FiTrendingDown,
  FiMoon,
  FiThermometer,
  FiClock
} from 'react-icons/fi';

export default function HealthSummary() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Example health data - in a real app, this would be fetched from your database
  const sleepData = [7.5, 6.2, 8, 7, 6.5, 7.8, 8.2];
  const heartRateData = [68, 72, 65, 70, 66, 68, 64];
  
  // Calculate averages
  const avgSleep = (sleepData.reduce((sum, val) => sum + val, 0) / sleepData.length).toFixed(1);
  const avgHeartRate = Math.round(heartRateData.reduce((sum, val) => sum + val, 0) / heartRateData.length);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
            activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
            activeTab === 'sleep' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('sleep')}
        >
          Sleep
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
            activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Today's Summary</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center text-blue-800 mb-1">
                  <FiMoon className="mr-1" />
                  <span className="text-sm font-medium">Sleep</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold">{avgSleep}</span>
                  <span className="text-sm text-blue-700 ml-1">hours</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-blue-700">
                  <FiTrendingUp className="mr-1" />
                  <span>5% above average</span>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center text-red-800 mb-1">
                  <FiHeart className="mr-1" />
                  <span className="text-sm font-medium">Heart Rate</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold">{avgHeartRate}</span>
                  <span className="text-sm text-red-700 ml-1">bpm</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-red-700">
                  <FiTrendingDown className="mr-1" />
                  <span>Resting</span>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center text-green-800 mb-1">
                  <FiActivity className="mr-1" />
                  <span className="text-sm font-medium">Activity</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold">25</span>
                  <span className="text-sm text-green-700 ml-1">min</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-green-700">
                  <FiClock className="mr-1" />
                  <span>Today</span>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="flex items-center text-amber-800 mb-1">
                  <FiThermometer className="mr-1" />
                  <span className="text-sm font-medium">Stress</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold">Low</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-amber-700">
                  <FiTrendingDown className="mr-1" />
                  <span>10% decrease</span>
                </div>
              </div>
            </div>
            
            <button 
              className="w-full mt-2 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => window.location.href = '/trends'}
            >
              View Detailed Trends
            </button>
          </div>
        )}
        
        {activeTab === 'sleep' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-800">Sleep Tracking</h3>
            <p className="text-sm text-gray-600">
              Your 7-day average sleep is {avgSleep} hours. Most adults need 7-8 hours for optimal health.
            </p>
            
            <div className="flex mt-3">
              {sleepData.map((hours, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{['M','T','W','T','F','S','S'][index]}</div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${hours * 10}px` }}
                    className="w-5 bg-blue-400 rounded-sm"
                  />
                  <div className="text-xs font-medium mt-1">{hours}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-800">Activity Tracking</h3>
            <p className="text-sm text-gray-600">
              You've logged 25 minutes of activity today. Your weekly goal is 150 minutes.
            </p>
            
            <div className="bg-gray-100 h-6 rounded-full overflow-hidden mt-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '35%' }}
                className="h-full bg-green-500 text-xs font-medium text-white flex items-center pl-2"
              >
                35%
              </motion.div>
            </div>
            
            <button 
              className="mt-2 py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm w-full"
            >
              Log Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 