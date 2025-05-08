"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const FAQItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex w-full justify-between items-center py-5 px-4 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-800">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="h-5 w-5 text-green-600" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 text-gray-600 bg-gray-50 rounded-b-lg">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQPage() {
  const faqs = [
    {
      question: "What is Health Journal?",
      answer: (
        <p>
          Health Journal is a personal wellness companion that helps you track your health metrics, 
          journal your feelings, and gain insights about your wellbeing over time. With a secure and 
          private space to record your health journey, you can make more informed decisions about your lifestyle.
        </p>
      )
    },
    {
      question: "Is my health data secure?",
      answer: (
        <p>
          Absolutely. We take data security seriously. Your health information is encrypted and stored 
          securely using industry-standard encryption. We never share your personal data with third parties 
          without your explicit consent. For more details, please check our <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>.
        </p>
      )
    },
    {
      question: "How do I get started with Health Journal?",
      answer: (
        <div>
          <p>Getting started is easy:</p>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Create an account using your email</li>
            <li>Set up your profile with basic health information</li>
            <li>Start journaling your daily health observations</li>
            <li>Track patterns and insights on your dashboard</li>
          </ol>
        </div>
      )
    },
    {
      question: "Can I export my health data?",
      answer: (
        <p>
          Yes, you can export your health data in various formats including PDF and CSV. This makes it easy 
          to share information with healthcare providers or keep personal backups of your health journey.
        </p>
      )
    },
    {
      question: "Is Health Journal available on all devices?",
      answer: (
        <p>
          Health Journal is available as a mobile app for iOS and Android devices, as well as a web application 
          that works on any modern browser. Your data synchronizes across all your devices automatically.
        </p>
      )
    },
    {
      question: "How can I contact support?",
      answer: (
        <p>
          For any questions or issues, please email us at <span className="text-green-600">support@healthjournal.com</span> or 
          use the help chat feature in the app. Our support team is available Monday through Friday, 9am-5pm EST.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl opacity-90">
            Find answers to common questions about your Health Journal experience
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 text-center p-8 bg-green-50 rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            We're here to help. Contact our support team for personalized assistance.
          </p>
          <a 
            href="mailto:support@healthjournal.com" 
            className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-300"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between">
          <Link 
            href="/" 
            className="text-green-600 hover:text-green-800 flex items-center"
          >
            ← Back to Health Journal
          </Link>
          <Link 
            href="/privacy" 
            className="text-green-600 hover:text-green-800 flex items-center"
          >
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}