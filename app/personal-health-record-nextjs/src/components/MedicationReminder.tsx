'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FiPlusCircle, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiEdit } from 'react-icons/fi';

interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[];
  notes?: string;
  active: boolean;
  created_at?: string;
}

const timeOptions = [
  'Morning', 'Noon', 'Afternoon', 'Evening', 'Bedtime'
];

export default function MedicationReminder() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [newMedication, setNewMedication] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: 'daily',
    time_of_day: ['Morning'],
    notes: '',
    active: true
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      if (editingMedication?.id) {
        // Update existing medication
        const { data, error } = await supabase
          .from('medications')
          .update({
            name: newMedication.name,
            dosage: newMedication.dosage,
            frequency: newMedication.frequency,
            time_of_day: newMedication.time_of_day,
            notes: newMedication.notes,
            active: newMedication.active
          })
          .eq('id', editingMedication.id)
          .select();
          
        if (error) throw error;
        
        // Update local state
        setMedications(prev => 
          prev.map(med => med.id === editingMedication.id ? data[0] : med)
        );
      } else {
        // Add new medication
        const { data, error } = await supabase
          .from('medications')
          .insert([{
            user_id: user.id,
            name: newMedication.name,
            dosage: newMedication.dosage,
            frequency: newMedication.frequency,
            time_of_day: newMedication.time_of_day,
            notes: newMedication.notes,
            active: true,
            created_at: new Date().toISOString()
          }])
          .select();
          
        if (error) throw error;
        
        // Add to local state
        setMedications(prev => [data[0], ...prev]);
      }
      
      // Reset form and state
      resetForm();
      
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setNewMedication({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      time_of_day: medication.time_of_day || ['Morning'],
      notes: medication.notes || '',
      active: medication.active
    });
    setShowForm(true);
  };

  const handleTimeOfDayChange = (time: string) => {
    const updatedTimes = [...newMedication.time_of_day];
    
    if (updatedTimes.includes(time)) {
      // Remove it if already selected
      const index = updatedTimes.indexOf(time);
      updatedTimes.splice(index, 1);
    } else {
      // Add it if not selected
      updatedTimes.push(time);
    }
    
    setNewMedication({
      ...newMedication,
      time_of_day: updatedTimes
    });
  };

  const toggleMedicationStatus = async (medicationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ active: !currentStatus })
        .eq('id', medicationId);
        
      if (error) throw error;
      
      // Update local state
      setMedications(prev => 
        prev.map(med => med.id === medicationId ? {...med, active: !currentStatus} : med)
      );
      
    } catch (error) {
      console.error('Error toggling medication status:', error);
    }
  };

  const resetForm = () => {
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'daily',
      time_of_day: ['Morning'],
      notes: '',
      active: true
    });
    setEditingMedication(null);
    setShowForm(false);
  };

  // Group medications by time of day
  const getMedicationsByTime = () => {
    const result = {};
    
    timeOptions.forEach(time => {
      result[time] = medications.filter(
        med => med.active && med.time_of_day && med.time_of_day.includes(time)
      );
    });
    
    return result;
  };
  
  const medicationsByTime = getMedicationsByTime();
  const activeMedications = medications.filter(med => med.active);
  const inactiveMedications = medications.filter(med => !med.active);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Medication Reminders</h2>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
          >
            <FiPlusCircle className="mr-1" size={16} /> Add Medication
          </motion.button>
        </div>
        
        {/* Time-based medication schedule */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">Today's Schedule</h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeMedications.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">No active medications</p>
              <button 
                onClick={() => setShowForm(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Add your first medication
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {timeOptions.map(time => (
                <div key={time} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 flex items-center">
                    <FiClock className="text-gray-500 mr-2" size={16} />
                    <span className="font-medium text-gray-700">{time}</span>
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {medicationsByTime[time].length} medications
                    </span>
                  </div>
                  
                  {medicationsByTime[time].length > 0 ? (
                    <div className="divide-y">
                      {medicationsByTime[time].map(med => (
                        <div key={med.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                          <div>
                            <div className="font-medium">{med.name}</div>
                            <div className="text-sm text-gray-600">{med.dosage}</div>
                            {med.notes && (
                              <div className="text-xs text-gray-500 mt-1">{med.notes}</div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(med)}
                              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                              aria-label="Edit medication"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => toggleMedicationStatus(med.id, med.active)}
                              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                              aria-label="Mark as inactive"
                            >
                              <FiXCircle size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No medications scheduled for this time
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Inactive medications */}
        {inactiveMedications.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Inactive Medications</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="space-y-2">
                {inactiveMedications.map(med => (
                  <div key={med.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                    <span className="text-gray-500">{med.name} ({med.dosage})</span>
                    <button
                      onClick={() => toggleMedicationStatus(med.id, med.active)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Reactivate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Add/Edit Medication Form */}
        <AnimatePresence>
          {showForm && (
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
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {editingMedication ? 'Edit Medication' : 'Add Medication'}
                    </h2>
                    <button onClick={resetForm} className="text-gray-500">
                      <FiXCircle size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Lisinopril"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        required
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 10mg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="twice-daily">Twice Daily</option>
                        <option value="as-needed">As Needed</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time of Day
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {timeOptions.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleTimeOfDayChange(time)}
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              newMedication.time_of_day.includes(time)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        value={newMedication.notes || ''}
                        onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Special instructions or notes"
                        rows={3}
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {editingMedication ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 