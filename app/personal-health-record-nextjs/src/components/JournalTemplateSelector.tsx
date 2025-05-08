'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, 
  FiAlertCircle, 
  FiClipboard, 
  FiHeart, 
  FiThermometer,
  FiXCircle,
  FiArrowRight
} from 'react-icons/fi';

interface JournalTemplateProps {
  onSelect: (template: string) => void;
  onClose: () => void;
}

export default function JournalTemplateSelector({ onSelect, onClose }: JournalTemplateProps) {
  const templates = [
    {
      id: 'general',
      title: 'General Health Check-in',
      icon: FiClipboard,
      color: 'bg-blue-100 text-blue-700',
      description: 'A general overview of how you're feeling today.',
      template: `Today I am feeling: 

My energy level is: 

Something I'm grateful for: 

My main health concern right now: 

Steps I'm taking for my wellbeing:`
    },
    {
      id: 'symptoms',
      title: 'Symptom Tracker',
      icon: FiThermometer,
      color: 'bg-red-100 text-red-700',
      description: 'Track specific symptoms and their details.',
      template: `Symptoms I'm experiencing: 

When they started: 

Severity (1-10): 

What makes them better or worse: 

Other relevant details:`
    },
    {
      id: 'medication',
      title: 'Medication Log',
      icon: FiHeart,
      color: 'bg-purple-100 text-purple-700',
      description: 'Keep track of medications and their effects.',
      template: `Medications I took today:

Time(s) taken:

Side effects noticed:

Questions for my healthcare provider:

Notes about effectiveness:`
    },
    {
      id: 'wellness',
      title: 'Wellness Activities',
      icon: FiActivity,
      color: 'bg-green-100 text-green-700',
      description: 'Document exercise, meditation, and wellness activities.',
      template: `Wellness activities completed today:

Duration:

How I felt during the activity:

How I feel afterward:

Goals for next time:`
    },
    {
      id: 'mental',
      title: 'Mental Health Check-in',
      icon: FiAlertCircle,
      color: 'bg-amber-100 text-amber-700',
      description: 'Focus on your mental and emotional wellbeing.',
      template: `My overall mental state today:

Stressors I'm experiencing:

Coping strategies I'm using:

Self-care activities I've done:

Something positive that happened today:`
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        onSelect(template.template);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Journal Templates</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Select a template to help structure your journal entry. Templates can guide your reflection and make it easier to track health patterns over time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {templates.map(template => (
                <motion.div
                  key={template.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateClick(template.id)}
                >
                  <div className="flex items-start">
                    <div className={`rounded-full p-2 ${template.color} mr-3`}>
                      <template.icon size={18} />
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{template.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Template Preview */}
            {selectedTemplate && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Template Preview</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm">
                    {templates.find(t => t.id === selectedTemplate)?.template}
                  </pre>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUseTemplate}
                disabled={!selectedTemplate}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  !selectedTemplate 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Use Template <FiArrowRight className="ml-2" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 