'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type ProfileData = {
  age: string;
  gender: string;
  medicalConditions: string;
  medications: string;
  allergies: string;
  lifestyle: string;
};

type ProfileModalProps = {
  profile: ProfileData;
  onSave: (profileData: ProfileData) => void;
  onCancel: () => void;
  showInitialProfilePrompt?: boolean;
};

export default function ProfileModal({ 
  profile, 
  onSave, 
  onCancel,
  showInitialProfilePrompt = false 
}: ProfileModalProps) {
  const [profileData, setProfileData] = useState<ProfileData>(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profileData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4"
      >
        <h2 className="text-2xl font-semibold mb-4">Health Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={profileData.age}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={profileData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
              <textarea
                name="medicalConditions"
                value={profileData.medicalConditions}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medications</label>
              <textarea
                name="medications"
                value={profileData.medications}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Allergies</label>
              <textarea
                name="allergies"
                value={profileData.allergies}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lifestyle (exercise, diet, etc.)</label>
              <textarea
                name="lifestyle"
                value={profileData.lifestyle}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={showInitialProfilePrompt}
            >
              Cancel
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
  );
}