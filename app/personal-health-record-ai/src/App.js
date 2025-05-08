import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { callOpenAI, streamOpenAI} from './api/call_open_ai';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { FaHeartbeat } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';


import prompts from './prompts.json';

const allSpecialties = [
  ...prompts["Physician Specialties"],
  ...prompts["Non-Physician Specialties"],
  ...prompts["Other Healthcare Professionals"]
];


function App() {
  const [showChat, setShowChat] = useState(false);
  const [journalEntries, setJournalEntries] = useState([
    {
      id: 1,
      text: "Today I started a new exercise routine. Feeling a bit sore but motivated!",
      date: "2023-05-15 08:30:00"
    },
    {
      id: 2,
      text: "Blood pressure reading: 120/80. Doctor says it's within normal range.",
      date: "2023-05-14 19:45:00"
    },
    {
      id: 3,
      text: "Tried a new healthy recipe for dinner. It was delicious and nutritious!",
      date: "2023-05-13 21:00:00"
    },
    {
      id: 4,
      text: "Went for a 5k run this morning. Personal best time!",
      date: "2023-05-12 07:15:00"
    },
    {
      id: 5,
      text: "Feeling a bit under the weather. Slight fever and sore throat.",
      date: "2023-05-11 22:30:00"
    }
  ]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [chatHistory, setChatHistory] = useState({});
  const [userMessage, setUserMessage] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [leftWidth, setLeftWidth] = useState(33);
  const [middleWidth, setMiddleWidth] = useState(34);
  const [rightWidth, setRightWidth] = useState(33);
  const leftRef = useRef(null);
  const middleRef = useRef(null);
  const rightRef = useRef(null);
  const leftDragControls = useDragControls();
  const middleDragControls = useDragControls();
  const [selectedSpecialist, setSelectedSpecialist] = useState('');

  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        setShowChat(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      text: currentEntry,
      date: new Date().toLocaleString()
    };
    setJournalEntries([newEntry, ...journalEntries]);
    setCurrentEntry('');

    try {
      const prompt = `Please provide health advice based on the following journal entry:
        
        Journal Entry: ${currentEntry}`;

      let systemPrompt;
      if (selectedSpecialist) {
        const specialistPrompt = allSpecialties.find(
          (sp) => sp["Healthcare Specialist"] === selectedSpecialist
        );
        if (specialistPrompt) {
          systemPrompt = specialistPrompt.Prompt;
        }
      }

      let fullResponse = '';
      await streamOpenAI(prompt, systemPrompt, (chunk, currentFullResponse) => {
        fullResponse = currentFullResponse;
        setChatHistory(prev => ({
          ...prev,
          [newEntry.id]: [{ role: 'assistant', content: fullResponse }]
        }));
      });
      
      // Final update to ensure we have the complete response
      setChatHistory(prev => ({
        ...prev,
        [newEntry.id]: [{ role: 'assistant', content: fullResponse }]
      }));
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      setChatHistory(prev => ({
        ...prev,
        [newEntry.id]: [{ role: 'assistant', content: 'Sorry, there was an error getting AI feedback. Please try again later.' }]
      }));
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || !selectedEntry) return;

    const updatedChatHistory = [...(chatHistory[selectedEntry.id] || []), { role: 'user', content: userMessage }];
    setChatHistory(prev => ({
      ...prev,
      [selectedEntry.id]: updatedChatHistory
    }));
    setUserMessage('');

    try {
      const prompt = userMessage;
      let systemPrompt;
      if (selectedSpecialist) {
        const specialistPrompt = allSpecialties.find(
          (sp) => sp["Healthcare Specialist"] === selectedSpecialist
        );
        if (specialistPrompt) {
          systemPrompt = specialistPrompt.Prompt;
        }
      }
      const response = await callOpenAI(prompt, systemPrompt);
      setChatHistory(prev => ({
        ...prev,
        [selectedEntry.id]: [...updatedChatHistory, { role: 'assistant', content: response }]
      }));
    } catch (error) {
      console.error('Error getting AI response:', error);
      setChatHistory(prev => ({
        ...prev,
        [selectedEntry.id]: [...updatedChatHistory, { role: 'assistant', content: 'Sorry, there was an error. Please try again later.' }]
      }));
    }
  };

  const handleEntryClick = async (entry) => {
    setSelectedEntry(entry);
    if (!chatHistory[entry.id]) {
      try {
        const prompt = `Please provide health advice based on the following journal entry:
          
          Journal Entry: ${entry.text}`;
        
        let systemPrompt;
        if (selectedSpecialist) {
          const specialistPrompt = allSpecialties.find(
            (sp) => sp["Healthcare Specialist"] === selectedSpecialist
          );
          if (specialistPrompt) {
            systemPrompt = specialistPrompt.Prompt;
          }
        }
        const feedback = await callOpenAI(prompt, systemPrompt);
        setChatHistory(prev => ({
          ...prev,
          [entry.id]: [{ role: 'assistant', content: feedback }]
        }));
      } catch (error) {
        console.error('Error getting AI feedback:', error);
        setChatHistory(prev => ({
          ...prev,
          [entry.id]: [{ role: 'assistant', content: 'Sorry, there was an error getting AI feedback. Please try again later.' }]
        }));
      }
    }
  };

  const handleDrag = (event, info, section) => {
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-teal-600 text-white shadow-lg"
      >
        <div className="flex items-center justify-between p-6">
          <h1 className="text-3xl font-bold flex items-center">
            <FaHeartbeat className="mr-2" />
            Personal Health AI Assistant
          </h1>
        </div>

        <div className="flex items-center justify-end p-4">
          <label htmlFor="specialist-select" className="mr-2 text-sm font-medium">
            Select Specialist:
          </label>
          <select
            id="specialist-select"
            className="bg-white text-teal-800 border border-teal-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            onChange={(e) => {
              const specialist = e.target.value;
              console.log("Selected specialist:", specialist);
              setSelectedSpecialist(specialist);
            }}
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
        <motion.section 
          ref={leftRef}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col p-8 border-r border-teal-200 relative"
          style={{ width: `${leftWidth}%`, minWidth: '10%' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-teal-800">New Entry</h2>
          <form onSubmit={handleJournalSubmit} className="space-y-4">
            <textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="How are you feeling? Describe your current health..."
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ease-in-out"
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-300 ease-in-out"
            >
              Submit
            </motion.button>
          </form>
          <motion.div
            className="absolute top-0 right-0 w-1 h-full bg-teal-300 cursor-col-resize"
            drag="x"
            dragControls={leftDragControls}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            onDrag={(event, info) => handleDrag(event, info, 'left')}
            onPointerDown={(e) => leftDragControls.start(e)}
          />
        </motion.section>
        <motion.section 
          ref={middleRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col flex-1 p-8 border-r border-teal-200 relative"
          style={{ width: `${middleWidth}%`, minWidth: '10%' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-teal-800">Health Journal</h2>
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {journalEntries.map((entry) => (
                <motion.div 
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out cursor-pointer" 
                  onClick={() => handleEntryClick(entry)}
                >
                  <p className="mb-2 text-gray-800">{entry.text}</p>
                  <small className="text-teal-500">{entry.date}</small>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <motion.div
            className="absolute top-0 right-0 w-1 h-full bg-teal-300 cursor-col-resize"
            drag="x"
            dragControls={middleDragControls}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            onDrag={(event, info) => handleDrag(event, info, 'middle')}
            onPointerDown={(e) => middleDragControls.start(e)}
          />
        </motion.section>
        <motion.section 
          ref={rightRef}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col p-8"
          style={{ width: `${rightWidth}%`, minWidth: '10%' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-teal-800">AI Chat</h2>
          {selectedEntry && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 mb-4 rounded-lg shadow-sm"
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
                      className={`mb-2 p-2 rounded-md ${message.role === 'user' ? 'bg-teal-100 text-right' : 'bg-blue-50'}`}
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
          )}
        </motion.section>
      </main>
    </div>
  );
}

export default App;
