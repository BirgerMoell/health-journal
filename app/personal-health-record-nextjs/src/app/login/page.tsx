'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from '@/components/AuthForm';
import DirectLogin from '@/components/DirectLogin';
import SupabaseDebug from '@/components/SupabaseDebug';
import { FiHeart, FiShield, FiDatabase } from 'react-icons/fi';

export default function LoginPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  // Cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const features = [
    {
      icon: FiHeart,
      title: "Track Your Health Journey",
      description: "Keep a journal of your symptoms, medications, and health experiences in one secure place."
    },
    {
      icon: FiShield,
      title: "AI-Powered Health Insights",
      description: "Receive personalized health suggestions and spot patterns with our medical AI assistant."
    },
    {
      icon: FiDatabase,
      title: "Secure & Private",
      description: "Your health data is encrypted and never shared without your explicit permission."
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Left side - Features showcase */}
      <div className="md:w-1/2 p-8 flex items-center justify-center">
        <div className="max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-teal-700">Personal Health Record</h1>
            <p className="mt-2 text-gray-600">Your health journey, powered by AI</p>
          </motion.div>
          
          <div className="relative h-64 overflow-hidden rounded-xl bg-white shadow-lg">
            <AnimatePresence mode="wait">
              {features.map((feature, index) => (
                index === currentFeature && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 p-6 flex flex-col justify-center"
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-full mb-4">
                      <feature.icon size={28} className="text-teal-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h2>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            
            {/* Feature navigation dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full ${
                    currentFeature === index ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Testimonials or additional info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-teal-100"
          >
            <blockquote className="text-gray-600 italic text-sm">
              "This application helped me identify patterns in my health I never noticed before. The AI insights were spot on!"
            </blockquote>
            <p className="text-right text-xs text-gray-500 mt-2">— Sarah K., Healthcare Professional</p>
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="md:w-1/2 p-4 md:p-8 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <AuthForm />
          
          <div className="text-center mt-4">
            <DirectLogin />
          </div>
          
          {/* Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8">
              <SupabaseDebug />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 