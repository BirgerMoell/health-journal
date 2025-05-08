'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import { callAPI } from '@/lib/api';
import {
  FiActivity, 
  FiUser, 
  FiShare2, 
  FiMessageSquare,
  FiDatabase,
  FiSettings
} from 'react-icons/fi';

// Replicating the three-panel layout from the React app
export default function OverviewPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const leftRef = useRef(null);
  const middleRef = useRef(null);
  const rightRef = useRef(null);
  
  // State variables
  const [currentEntry, setCurrentEntry] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [userMessage, setUserMessage] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [useLocalModel, setUseLocalModel] = useState(false);
  const [showInitialProfilePrompt, setShowInitialProfilePrompt] = useState(false);
  
  // Panel widths for resizable layout
  const [leftWidth, setLeftWidth] = useState(30);
  const [middleWidth, setMiddleWidth] = useState(40);
  const [rightWidth, setRightWidth] = useState(30);
  
  // Profile state
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    lifestyle: ''
  });
  
  // Healthcare specialists
  const allSpecialties = [
    { "Healthcare Specialist": "General Practitioner", "Prompt": "You are a general practitioner providing holistic health advice." },
    { "Healthcare Specialist": "Cardiologist", "Prompt": "You are a cardiologist specializing in heart health." },
    { "Healthcare Specialist": "Nutritionist", "Prompt": "You are a nutritionist providing dietary and nutritional advice." },
    { "Healthcare Specialist": "Mental Health Therapist", "Prompt": "You are a mental health therapist providing emotional and psychological support." },
    { "Healthcare Specialist": "Physical Therapist", "Prompt": "You are a physical therapist giving advice on movement and exercise." }
  ];
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Load journal entries from Supabase
  useEffect(() => {
    if (user) {
      fetchJournalEntries();
      
      // Check if profile exists, if not show profile modal
      const savedProfile = localStorage.getItem('healthProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setShowInitialProfilePrompt(true);
        setShowProfileModal(true);
      }
    }
  }, [user]);
  
  // Fetch journal entries from Supabase
  const fetchJournalEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const formattedEntries = data.map(entry => ({
        id: entry.id,
        text: entry.text,
        date: new Date(entry.created_at).toLocaleDateString(),
        created_at: entry.created_at
      }));
      
      setJournalEntries(formattedEntries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };
  
  // Handle journal submission
  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    if (currentEntry.trim() === '') return;
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          { 
            user_id: user.id, 
            text: currentEntry,
            created_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) throw error;
      
      const newEntry = {
        id: data[0].id,
        text: data[0].text,
        date: new Date(data[0].created_at).toLocaleDateString(),
        created_at: data[0].created_at
      };
      
      setJournalEntries([newEntry, ...journalEntries]);
      setCurrentEntry('');
      
      // Auto-select the new entry
      setSelectedEntry(newEntry);
      await generateAIFeedback(newEntry);
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('Failed to save your journal entry. Please try again.');
    }
  };
  
  // Generate AI feedback for a journal entry
  const generateAIFeedback = async (entry) => {
    if (!entry) return;
    
    try {
      const prompt = `Please provide health advice based on the following journal entry:
        
        Journal Entry: ${entry.text}`;
      
      let systemPrompt = "You are a helpful healthcare assistant providing advice.";
      if (selectedSpecialist) {
        const specialistPrompt = allSpecialties.find(
          (sp) => sp["Healthcare Specialist"] === selectedSpecialist
        );
        if (specialistPrompt) {
          systemPrompt = specialistPrompt.Prompt;
        }
      }
      
      const feedback = await callAPI(prompt, systemPrompt);
      
      setChatHistory(prev => ({
        ...prev,
        [entry.id]: [{ 
          role: 'assistant', 
          content: feedback,
          timestamp: new Date().toISOString()
        }]
      }));
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      setChatHistory(prev => ({
        ...prev,
        [entry.id]: [{ 
          role: 'assistant', 
          content: 'Sorry, there was an error getting AI feedback. Please try again later.',
          timestamp: new Date().toISOString()
        }]
      }));
    }
  };
  
  // Handle entry selection
  const handleEntryClick = async (entry) => {
    setSelectedEntry(entry);
    if (!chatHistory[entry.id]) {
      await generateAIFeedback(entry);
    }
  };
  
  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntry || userMessage.trim() === '') return;
    
    const entryId = selectedEntry.id;
    const newUserMessage = { role: 'user', content: userMessage };
    
    // Optimistically update UI
    setChatHistory(prev => ({
      ...prev,
      [entryId]: [...(prev[entryId] || []), newUserMessage]
    }));
    
    setUserMessage('');
    
    try {
      // Get previous messages for context
      const previousMessages = chatHistory[entryId] || [];
      const prompt = `
        Context: The user has shared this health journal entry: "${selectedEntry.text}"
        
        Previous conversation:
        ${previousMessages.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n')}
        
        User's new message: ${newUserMessage.content}
      `;
      
      let systemPrompt = "You are a helpful healthcare assistant providing advice.";
      if (selectedSpecialist) {
        const specialistPrompt = allSpecialties.find(
          (sp) => sp["Healthcare Specialist"] === selectedSpecialist
        );
        if (specialistPrompt) {
          systemPrompt = specialistPrompt.Prompt;
        }
      }
      
      const response = await callAPI(prompt, systemPrompt);
      
      // Update chat history with AI response
      setChatHistory(prev => ({
        ...prev,
        [entryId]: [
          ...(prev[entryId] || []),
          { 
            role: 'assistant', 
            content: response,
            timestamp: new Date().toISOString()
          }
        ]
      }));
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add error message to chat
      setChatHistory(prev => ({
        ...prev,
        [entryId]: [
          ...(prev[entryId] || []),
          { 
            role: 'assistant', 
            content: 'Sorry, there was an error processing your message. Please try again.',
            timestamp: new Date().toISOString()
          }
        ]
      }));
    }
  };
  
  // Handle profile save
  const handleProfileSave = (profileData) => {
    localStorage.setItem('healthProfile', JSON.stringify(profileData));
    setShowInitialProfilePrompt(false);
    setShowProfileModal(false);
  };
  
  // Handle panel resize
  const handleDrag = (event, info, section) => {
    if (!leftRef.current || !middleRef.current || !rightRef.current) return;
    
    const totalWidth = leftRef.current.offsetWidth + middleRef.current.offsetWidth + rightRef.current.offsetWidth;
    const deltaX = info.delta.x;
    
    if (section === 'left') {
      const newLeftWidth = leftWidth + (deltaX / totalWidth) * 100;
      const newMiddleWidth = middleWidth - (deltaX / totalWidth) * 100;
      
      if (newLeftWidth >= 10 && newMiddleWidth >= 10) {
        setLeftWidth(newLeftWidth);
        setMiddleWidth(newMiddleWidth);
      }
    } else if (section === 'middle') {
      const newMiddleWidth = middleWidth + (deltaX / totalWidth) * 100;
      const newRightWidth = rightWidth - (deltaX / totalWidth) * 100;
      
      if (newMiddleWidth >= 10 && newRightWidth >= 10) {
        setMiddleWidth(newMiddleWidth);
        setRightWidth(newRightWidth);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
      >
        <div className="flex items-center justify-between p-6">
          <h1 className="text-3xl font-bold flex items-center">
            <FiActivity className="mr-2" />
            Personal Health AI Assistant
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setUseLocalModel(prev => !prev)}
              className={`flex items-center px-3 py-1 rounded transition-colors ${
                useLocalModel ? 'bg-teal-500 text-white' : 'bg-white text-teal-600'
              }`}
            >
              {useLocalModel ? 'Using Local Model' : 'Using OpenAI'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center text-white hover:text-teal-200 transition-colors"
            >
              <FiShare2 className="text-2xl mr-2" />
              Share Records
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center text-white hover:text-teal-200 transition-colors"
            >
              <FiUser className="text-2xl mr-2" />
              Profile
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end p-4">
          <label htmlFor="specialist-select" className="mr-2 text-sm font-medium">
            Select Specialist:
          </label>
          <select
            id="specialist-select"
            className="bg-white text-teal-800 border border-teal-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            onChange={(e) => setSelectedSpecialist(e.target.value)}
            value={selectedSpecialist}
          >
            <option value="">Choose a specialist</option>
            {allSpecialties.map((item, index) => (
              <option key={index} value={item["Healthcare Specialist"]} className="py-1">
                {item["Healthcare Specialist"]}
              </option>
            ))}
          </select>
        </div>
      </motion.header>
      
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel - Journal Entry Input */}
        <motion.section 
          ref={leftRef}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col p-8 border-r border-teal-200 relative bg-white"
          style={{ width: `${leftWidth}%`, minWidth: '10%' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-teal-800">New Entry</h2>
          <form onSubmit={handleJournalSubmit} className="space-y-4">
            <textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="How are you feeling today? What health concerns do you have?"
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ease-in-out"
              required
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="w-full py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-300 ease-in-out"
            >
              Save Entry
            </motion.button>
          </form>
          
          {/* Drag handle */}
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center hover:bg-teal-100"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            onDrag={(event, info) => handleDrag(event, info, 'left')}
          >
            <div className="h-8 w-1 bg-teal-200 rounded-full"></div>
          </motion.div>
        </motion.section>
        
        {/* Middle Panel - Journal Entries List */}
        <motion.section 
          ref={middleRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col p-8 border-r border-teal-200 relative bg-white"
          style={{ width: `${middleWidth}%`, minWidth: '10%' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-teal-800">Journal Entries</h2>
          <div className="flex-1 overflow-y-auto space-y-3">
            {journalEntries.length > 0 ? (
              journalEntries.map((entry) => (
                <motion.div 
                  key={entry.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedEntry?.id === entry.id
                      ? 'bg-teal-100 border-2 border-teal-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleEntryClick(entry)}
                >
                  <p className="line-clamp-3 text-gray-800">{entry.text}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-teal-600">{entry.date}</span>
                    {chatHistory[entry.id] && (
                      <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-full">
                        {chatHistory[entry.id].length} messages
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <FiMessageSquare className="mx-auto text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500">No journal entries yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first entry to get AI health insights
                </p>
              </div>
            )}
          </div>
          
          {/* Drag handle */}
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center hover:bg-teal-100"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            onDrag={(event, info) => handleDrag(event, info, 'middle')}
          >
            <div className="h-8 w-1 bg-teal-200 rounded-full"></div>
          </motion.div>
        </motion.section>
        
        {/* Right Panel - AI Chat */}
        <motion.section 
          ref={rightRef}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col p-8 bg-white"
          style={{ width: `${rightWidth}%`, minWidth: '10%' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-teal-800">AI Chat</h2>
          {selectedEntry ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 p-4 mb-4 rounded-lg shadow-sm"
              >
                <p className="font-semibold">Selected Entry:</p>
                <p>{selectedEntry.text}</p>
                <small className="text-teal-500">{selectedEntry.date}</small>
              </motion.div>
              <div className="flex-1 overflow-y-auto mb-4">
                <AnimatePresence>
                  {chatHistory[selectedEntry.id]?.map((message, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-2 p-3 rounded-md ${
                        message.role === 'user' 
                          ? 'bg-teal-100 ml-12' 
                          : 'bg-blue-50 mr-12'
                      }`}
                    >
                      <ReactMarkdown className={message.role === 'user' ? 'text-teal-800' : 'text-blue-700'}>
                        {message.content}
                      </ReactMarkdown>
                      {message.role !== 'user' && message.timestamp && (
                        <small className="block mt-1 text-gray-500 text-xs">
                          {new Date(message.timestamp).toLocaleString() || 'Date not available'}
                        </small>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <form onSubmit={handleChatSubmit} className="flex">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ease-in-out"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  className="px-4 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700 transition duration-300 ease-in-out"
                >
                  Send
                </motion.button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FiMessageSquare className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No Entry Selected</h3>
              <p className="text-gray-500">
                Select a journal entry from the list to get AI insights and chat about your health
              </p>
            </div>
          )}
        </motion.section>
      </main>
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4"
          >
            <h2 className="text-2xl font-semibold mb-4">Health Profile</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleProfileSave(profile);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({...profile, gender: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({...profile, height: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({...profile, weight: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                  <textarea
                    value={profile.medicalConditions}
                    onChange={(e) => setProfile({...profile, medicalConditions: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    rows="2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                  <textarea
                    value={profile.medications}
                    onChange={(e) => setProfile({...profile, medications: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    rows="2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Allergies</label>
                  <textarea
                    value={profile.allergies}
                    onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    rows="2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Lifestyle (exercise, diet, etc.)</label>
                  <textarea
                    value={profile.lifestyle}
                    onChange={(e) => setProfile({...profile, lifestyle: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    rows="3"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => !showInitialProfilePrompt && setShowProfileModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={showInitialProfilePrompt}
                >
                  {showInitialProfilePrompt ? 'Required' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4"
          >
            <h2 className="text-2xl font-semibold mb-4">Share Health Records</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Share your health records securely with healthcare providers or family members.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium mb-2">Available Records</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                    <span className="ml-2">Journal Entries ({journalEntries.length})</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                    <span className="ml-2">Health Profile</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                    <span className="ml-2">AI Analysis Reports</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  placeholder="doctor@example.com"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Duration</label>
                <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                  <option>24 hours</option>
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>Until revoked</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Share Records
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 