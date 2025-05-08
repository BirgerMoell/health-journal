'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SignOutButton from '@/components/SignOutButton';
import { 
  FiBookOpen, 
  FiMessageSquare, 
  FiUser, 
  FiActivity, 
  FiCalendar, 
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';
import InsightCard from '@/components/InsightCard';
import HealthSummary from '@/components/HealthSummary';
import StreakTracker from '@/components/StreakTracker';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const controls = useAnimation();
  const [ref, inView] = useInView();
  const [recentJournalEntries, setRecentJournalEntries] = useState([]);
  const [recentChatMessages, setRecentChatMessages] = useState([]);
  const [healthInsights, setHealthInsights] = useState([]);
  const [entryStreak, setEntryStreak] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Animate sections into view when scrolled to
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Fetch journal entries, chat messages, and generate insights
  useEffect(() => {
    if (user) {
      fetchJournalEntries();
      fetchChatHistory();
      calculateEntryStreak();
      setTimeout(() => setShowWelcome(false), 3000);
    }
  }, [user]);
  
  // Function to fetch journal entries from Supabase
  const fetchJournalEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      setRecentJournalEntries(data || []);
      generateInsightsFromEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching journal entries:', error);
    }
  };
  
  // Generate AI insights based on journal entries
  const generateInsightsFromEntries = (entries) => {
    // This would ideally call an API endpoint to analyze entries
    // For now, we'll use placeholder insights
    if (entries.length > 0) {
      setHealthInsights([
        { 
          title: "Sleep Pattern", 
          description: "Your sleep quality is improving based on recent entries.",
          trend: "improving", 
          icon: "sleep" 
        },
        { 
          title: "Stress Level", 
          description: "Consider trying mindfulness techniques to manage stress peaks.",
          trend: "neutral", 
          icon: "stress" 
        },
        { 
          title: "Physical Activity", 
          description: "You've mentioned exercise in 3 of your last 5 entries.",
          trend: "improving", 
          icon: "activity" 
        }
      ]);
    }
  };
  
  // Calculate streak of consecutive days with entries
  const calculateEntryStreak = async () => {
    try {
      const today = new Date();
      const { data, error } = await supabase
        .from('journal_entries')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Simple streak calculation (could be much more sophisticated)
      if (data && data.length > 0) {
        let streak = 0;
        let currentDate = new Date();
        
        for (const entry of data) {
          const entryDate = new Date(entry.created_at);
          if (isSameDay(entryDate, currentDate) || isDayBefore(entryDate, currentDate)) {
            streak++;
            currentDate = entryDate;
          } else {
            break;
          }
        }
        
        setEntryStreak(streak);
      }
    } catch (error: any) {
      console.error('Error calculating streak:', error);
    }
  };
  
  // Helper functions for date comparison
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };
  
  const isDayBefore = (date1, date2) => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffMs = date2.getTime() - date1.getTime();
    return diffMs <= oneDayMs && diffMs > 0;
  };
  
  // Function to fetch chat history from Supabase
  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setRecentChatMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching chat history:', error?.message || String(error));
    }
  };
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="animate-pulse h-16 w-16 rounded-full border-4 border-t-teal-500 border-b-blue-500 border-l-transparent border-r-transparent animate-spin"></div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-teal-700 font-medium"
        >
          Loading your health dashboard...
        </motion.p>
      </div>
    );
  }
  
  // Motion variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  // Renders the welcome animation or main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8 px-4">
      <AnimatePresence>
        {showWelcome ? (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50"
          >
            <div className="text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
                className="inline-block mb-4"
              >
                <div className="w-20 h-20 rounded-full border-4 border-teal-500 border-t-transparent"></div>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-teal-700 mb-2"
              >
                Welcome back, {user?.email?.split('@')[0]}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600"
              >
                Loading your personal health insights...
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto max-w-6xl"
          >
            {/* Header with streak and profile */}
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-teal-700">Health Dashboard</h1>
                {entryStreak > 0 && (
                  <StreakTracker streak={entryStreak} className="ml-4" />
                )}
              </div>
              <div className="flex items-center">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-full p-2 shadow-md text-teal-500 mr-3"
                  onClick={() => router.push('/notifications')}
                >
                  <FiAlertCircle size={24} />
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center"
                >
                  <SignOutButton />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Health summary section */}
            <motion.div variants={itemVariants} className="mb-8">
              <HealthSummary 
                entries={recentJournalEntries} 
                insights={healthInsights}
              />
            </motion.div>
            
            {/* Quick actions row */}
            <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4 mb-8">
              {[
                { text: "New Journal Entry", icon: FiBookOpen, path: "/journal" },
                { text: "Ask AI Assistant", icon: FiMessageSquare, path: "/chat" },
                { text: "Track Vitals", icon: FiActivity, path: "/vitals" },
                { text: "View Calendar", icon: FiCalendar, path: "/calendar" }
              ].map((action, index) => (
                <Link href={action.path} key={index}>
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ y: 0 }}
                    className="bg-white rounded-xl p-4 flex flex-col items-center justify-center h-32 shadow-md hover:bg-teal-50 transition-colors duration-300"
                  >
                    <action.icon size={32} className="text-teal-600 mb-2" />
                    <p className="text-center text-sm font-medium text-gray-700">{action.text}</p>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
            
            {/* Main content - three column layout */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              ref={ref}
            >
              {/* Recent journal entries card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FiBookOpen className="text-teal-600 mr-2" size={20} />
                    <h2 className="text-xl font-semibold text-teal-700">Journal Entries</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {recentJournalEntries.length > 0 ? (
                      recentJournalEntries.slice(0, 3).map(entry => (
                        <motion.div 
                          key={entry.id}
                          whileHover={{ x: 5 }}
                          className="p-3 border-l-4 border-teal-400 bg-teal-50 rounded-r"
                        >
                          <p className="text-xs text-teal-600 font-medium">
                            {new Date(entry.created_at).toLocaleDateString(undefined, { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                            {entry.text}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No journal entries yet</p>
                    )}
                  </div>
                  
                  <Link href="/journal">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full mt-4 py-2 rounded-lg bg-teal-100 text-teal-700 font-medium hover:bg-teal-200 transition-colors"
                    >
                      View All Entries
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
              
              {/* Health AI Assistant card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FiMessageSquare className="text-blue-600 mr-2" size={20} />
                    <h2 className="text-xl font-semibold text-blue-700">AI Assistant</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {recentChatMessages.length > 0 ? (
                      <div className="bg-blue-50 rounded-lg p-3">
                        {recentChatMessages.slice(0, 2).map(msg => (
                          <div key={msg.id} className={`mb-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <span className={`inline-block px-3 py-2 rounded-lg text-sm ${
                              msg.role === 'user' 
                                ? 'bg-blue-200 text-blue-800 rounded-br-none' 
                                : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
                            }`}>
                              {msg.text.length > 60 
                                ? `${msg.text.substring(0, 60)}...` 
                                : msg.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-blue-50 rounded-lg p-5 text-center">
                        <p className="text-blue-700 mb-2 font-medium">Start a conversation</p>
                        <p className="text-sm text-blue-600">Ask about your symptoms, medications, or health goals.</p>
                      </div>
                    )}
                    
                    <div className="pt-3">
                      <p className="text-sm text-gray-600 mb-3">Quick prompts:</p>
                      {["Why am I feeling tired?", "Help with my headaches", "Nutrition advice"].map((prompt, i) => (
                        <motion.div 
                          key={i}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="bg-gray-100 mb-2 px-3 py-2 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => router.push(`/chat?prompt=${encodeURIComponent(prompt)}`)}
                        >
                          {prompt}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <Link href="/chat">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full mt-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors"
                    >
                      Chat with AI Assistant
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
              
              {/* Health Insights card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FiTrendingUp className="text-purple-600 mr-2" size={20} />
                    <h2 className="text-xl font-semibold text-purple-700">AI Insights</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {healthInsights.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {healthInsights.map((insight, index) => (
                          <InsightCard
                            key={index}
                            title={insight.title}
                            description={insight.description}
                            trend={insight.trend}
                            icon={insight.icon}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-purple-50 rounded-lg p-5 text-center">
                        <p className="text-purple-700 mb-2 font-medium">No insights yet</p>
                        <p className="text-sm text-purple-600">Add more journal entries to generate health insights.</p>
                      </div>
                    )}
                  </div>
                  
                  <Link href="/insights">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full mt-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 transition-colors"
                    >
                      View All Insights
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 