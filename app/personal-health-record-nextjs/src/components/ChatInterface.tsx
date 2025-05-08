'use client';

import { useState, useRef, useEffect } from 'react';
import { streamAPI, callAPI, saveChatMessage, loadChatHistory } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load chat history from Supabase when component mounts
  useEffect(() => {
    async function fetchChatHistory() {
      try {
        const history = await loadChatHistory();
        if (history.length > 0) {
          // Format the messages for our component
          const formattedMessages = history.map(msg => ({
            role: msg.role,
            content: msg.content,
            id: msg.id
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    
    fetchChatHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message immediately to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Save user message to Supabase
    try {
      await saveChatMessage('user', userMessage);
    } catch (error) {
      console.error('Error saving user message:', error);
    }
    
    // Add empty assistant message that will be streamed
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    setIsLoading(true);

    try {
      let fullResponse = '';
      
      // Stream the response
      await streamAPI(
        userMessage,
        'You are an expert medical doctor providing health advice and analysis.',
        (chunk, _) => {
          // Update the last message (assistant's message) with the new content
          fullResponse += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = fullResponse;
            }
            return newMessages;
          });
        }
      );
      
      // Save the complete assistant response to Supabase
      try {
        await saveChatMessage('assistant', fullResponse);
      } catch (error) {
        console.error('Error saving assistant response:', error);
      }
      
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = 'Sorry, I encountered an error while processing your request.';
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show content until history is loaded
  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <p className="ml-2">Loading chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content || (isLoading && index === messages.length - 1 ? '...' : '')}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`px-4 py-2 rounded-lg ${
            isLoading || !input.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 