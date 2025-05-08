'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlusCircle } from 'react-icons/fi';
import MedicationReminder from '@/components/MedicationReminder';

export default function MedicationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Medication Management</h1>
        <p className="text-gray-600">Keep track of your medications and set reminders</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <MedicationReminder />
      </div>
      
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">Medication Tips</h2>
        <ul className="space-y-2 text-blue-700">
          <li>• Take medications at the same time each day to establish a routine</li>
          <li>• Use pill organizers to help you remember which medications to take</li>
          <li>• Always take the full course of antibiotics, even if you feel better</li>
          <li>• Keep a list of all your medications to share with healthcare providers</li>
          <li>• Check for drug interactions when starting new medications</li>
        </ul>
      </div>
    </div>
  );
} 