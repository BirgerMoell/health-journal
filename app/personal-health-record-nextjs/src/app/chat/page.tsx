'use client';

import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">AI Health Assistant</h1>
      <ChatInterface />
    </div>
  );
} 