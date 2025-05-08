'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { callAPI } from '@/lib/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
};

type ChatPanelProps = {
  journalEntry: {
    id: number;
    text: string;
    date: string;
  } | null;
  initialMessages?: Message[];
  systemPrompt?: string;
  profile: any;
};

export default function ChatPanel({ 
  journalEntry, 
  initialMessages = [], 
  systemPrompt,
  profile 
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUserMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userMessage.trim() || !journalEntry) return;
    
    // Add user message to chat
    const newUserMessage: Message = { role: 'user', content: userMessage };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setUserMessage('');
    setIsLoading(true);
    
    try {
      // Create prompt with context
      const prompt = `Context:
        User Profile:
        Age: ${profile.age}
        Gender: ${profile.gender}
        Medical Conditions: ${profile.medicalConditions}
        Medications: ${profile.medications}
        Allergies: ${profile.allergies}
        Lifestyle: ${profile.lifestyle}
        
        Original Entry: ${journalEntry.text}
        
        User Question: ${userMessage}`;
      
      // Get AI response
      const response = await callAPI(prompt, systemPrompt);
      
      // Add AI response to chat
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response,
        timestamp: Date.now()
      };
      
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        role: 'assistant', 
        content: 'Sorry, there was an error. Please try again later.',
        timestamp: Date.now()
      };
      
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!journalEntry) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500">
        <p>Select an entry to chat with AI</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
        <p className="font-semibold">Selected Entry:</p>
        <p>{journalEntry.text}</p>
        <small className="text-teal-500">{journalEntry.date}</small>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`mb-2 p-2 rounded-md ${message.role === 'user' ? 'bg-teal-100 text-right' : 'bg-blue-50'}`}
            >
              <div className={message.role === 'user' ? 'text-teal-800' : 'text-blue-700'}>
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.role === 'assistant' && message.timestamp && (
                <small className="block mt-1 text-gray-500 text-xs">
                  {new Date(message.timestamp).toLocaleString() || 'Date not available'}
                </small>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex space-x-2 p-2 rounded-md bg-blue-50"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={userMessage}
          onChange={handleUserMessageChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ease-in-out"
          disabled={isLoading}
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          className="px-4 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700 transition duration-300 ease-in-out disabled:bg-gray-400"
          disabled={isLoading || !userMessage.trim()}
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}