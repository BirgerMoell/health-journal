'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSmile, FiMeh, FiFrown, FiCamera, FiMic, FiSend } from 'react-icons/fi';
import { saveJournalEntry } from '@/lib/api';

// Define mood options
const moods = [
  { emoji: "😊", label: "Great", value: "great", icon: FiSmile, color: "bg-green-400" },
  { emoji: "😐", label: "Okay", value: "okay", icon: FiMeh, color: "bg-amber-400" },
  { emoji: "😞", label: "Poor", value: "poor", icon: FiFrown, color: "bg-red-400" }
];

// Common symptoms for quick selection
const commonSymptoms = [
  "Headache", "Fatigue", "Nausea", "Dizziness", "Fever", 
  "Pain", "Cough", "Sore throat", "Insomnia", "Anxiety"
];

export interface JournalEntryInputProps {
  userId?: string;
  onSubmit?: (text: string, metadata?: any) => void;
  onNewEntry?: () => void;
}

export default function JournalEntryInput({ userId, onSubmit, onNewEntry }: JournalEntryInputProps) {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [entry]);
  
  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };
  
  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
    setTimeout(() => setStep(2), 300);
  };
  
  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };
  
  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
    if (isRecording) {
      // Stop recording and process result
      setTimeout(() => {
        setEntry(prev => prev + " I recorded this part with voice.");
        setIsRecording(false);
      }, 1500);
    }
  };
  
  const resetForm = () => {
    setEntry('');
    setMood('');
    setSymptoms([]);
    setIsExpanded(false);
    setStep(1);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setIsSaving(true);
    
    try {
      // Create metadata with mood and symptoms
      const metadata = {
        mood,
        symptoms,
        date: new Date().toISOString(),
      };
      
      // If onSubmit prop is provided, call it
      if (onSubmit) {
        onSubmit(entry, metadata);
      } else {
        // Otherwise save directly to Supabase
        await saveJournalEntry(entry, metadata);
        
        // Notify parent component of new entry
        if (onNewEntry) {
          onNewEntry();
        }
      }
      
      // Success animation before reset
      setTimeout(() => {
        setIsSaving(false);
        setTimeout(() => {
          resetForm();
        }, 1000);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting journal entry:', error);
      setIsSaving(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-teal-700">New Health Journal Entry</h2>
      
      <AnimatePresence mode="wait">
        {isSaving ? (
          <motion.div 
            key="saving"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full mb-4"
            />
            <p className="text-teal-600 font-medium">Saving your entry...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-6"
                >
                  <p className="text-gray-600 mb-4">How are you feeling today?</p>
                  <div className="flex justify-center space-x-6 mb-4">
                    {moods.map(moodOption => (
                      <motion.div
                        key={moodOption.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMoodSelect(moodOption.value)}
                        className={`flex flex-col items-center cursor-pointer p-3 rounded-lg ${
                          mood === moodOption.value ? moodOption.color + ' text-white' : 'bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl mb-1">{moodOption.emoji}</span>
                        <span className="text-sm font-medium">{moodOption.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-gray-600">Any symptoms to note?</p>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStep(3)}
                        className="text-sm text-teal-600 font-medium"
                      >
                        Skip →
                      </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {commonSymptoms.map(symptom => (
                        <motion.div
                          key={symptom}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSymptom(symptom)}
                          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                            symptoms.includes(symptom)
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {symptom}
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      className="w-full py-2 mt-2 bg-teal-100 text-teal-700 rounded-lg font-medium"
                    >
                      Continue
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-4">
                    <label className="block text-gray-600 mb-2">Tell us more about how you're feeling:</label>
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="Describe how you're feeling today in detail..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[120px]"
                        rows={5}
                      />
                      <div className="absolute bottom-3 right-3 flex space-x-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => alert('Camera functionality would be implemented here')}
                          className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                        >
                          <FiCamera size={16} />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleVoiceRecord}
                          className={`p-2 rounded-full ${
                            isRecording 
                              ? 'bg-red-500 text-white animate-pulse' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <FiMic size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Summary of selections */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-2">Entry summary:</p>
                    <div className="flex flex-wrap gap-2">
                      {mood && (
                        <span className="px-2 py-1 bg-gray-200 rounded-md text-xs text-gray-700">
                          Feeling: {mood}
                        </span>
                      )}
                      {symptoms.map(symptom => (
                        <span 
                          key={symptom}
                          className="px-2 py-1 bg-gray-200 rounded-md text-xs text-gray-700"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-600"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting || !entry.trim()}
                      className={`px-4 py-2 rounded-md flex items-center ${
                        isSubmitting || !entry.trim()
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Entry'}
                      <FiSend className="ml-2" size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 