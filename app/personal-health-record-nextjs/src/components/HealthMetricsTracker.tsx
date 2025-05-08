'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiHeart, FiDroplet, FiMoon } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface Metric {
  id?: string;
  metric_type: string;
  value: number;
  unit: string;
  notes?: string;
  recorded_at: string;
}

export default function HealthMetricsTracker() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('sleep');
  const [showForm, setShowForm] = useState(false);
  const [newMetric, setNewMetric] = useState<Metric>({
    metric_type: 'sleep',
    value: 7.5,
    unit: 'hours',
    notes: '',
    recorded_at: new Date().toISOString()
  });

  // Metric types configuration
  const metricTypes = [
    {
      id: 'sleep',
      name: 'Sleep',
      icon: FiMoon,
      color: 'blue',
      unit: 'hours',
      min: 0,
      max: 12,
      step: 0.5
    },
    {
      id: 'heart_rate',
      name: 'Heart Rate',
      icon: FiHeart,
      color: 'red',
      unit: 'bpm',
      min: 40,
      max: 200,
      step: 1
    },
    {
      id: 'activity',
      name: 'Activity',
      icon: FiActivity,
      color: 'green',
      unit: 'minutes',
      min: 0,
      max: 240,
      step: 5
    },
    {
      id: 'water',
      name: 'Water',
      icon: FiDroplet,
      color: 'cyan',
      unit: 'cups',
      min: 0,
      max: 15,
      step: 1
    }
  ];

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricTypeChange = (type: string) => {
    setActiveMetric(type);
    const metricConfig = metricTypes.find(m => m.id === type);
    
    setNewMetric({
      ...newMetric,
      metric_type: type,
      unit: metricConfig?.unit || '',
      value: metricConfig?.min || 0
    });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMetric({
      ...newMetric,
      value: parseFloat(e.target.value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('health_metrics')
        .insert([{
          user_id: user.id,
          metric_type: newMetric.metric_type,
          value: newMetric.value,
          unit: newMetric.unit,
          notes: newMetric.notes,
          recorded_at: new Date().toISOString()
        }])
        .select();
        
      if (error) throw error;
      
      // Add the new metric to the list
      setMetrics(prev => [data[0], ...prev]);
      setShowForm(false);
      
      // Reset form
      const metricConfig = metricTypes.find(m => m.id === activeMetric);
      setNewMetric({
        metric_type: activeMetric,
        value: metricConfig?.min || 0,
        unit: metricConfig?.unit || '',
        notes: '',
        recorded_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error saving metric:', error);
    }
  };

  // Get active metric config
  const activeMetricConfig = metricTypes.find(m => m.id === activeMetric) || metricTypes[0];
  
  // Filter metrics by type for the current view
  const filteredMetrics = metrics.filter(m => m.metric_type === activeMetric);
  
  // Calculate average for the active metric
  const average = filteredMetrics.length 
    ? filteredMetrics.reduce((sum, m) => sum + m.value, 0) / filteredMetrics.length 
    : 0;

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Health Metrics</h2>
        
        {/* Metric Type Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
          {metricTypes.map(type => (
            <motion.button
              key={type.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full flex items-center ${
                activeMetric === type.id 
                  ? `bg-${type.color}-500 text-white` 
                  : `bg-${type.color}-100 text-${type.color}-700`
              }`}
              onClick={() => handleMetricTypeChange(type.id)}
            >
              <type.icon className="mr-2" size={16} />
              {type.name}
            </motion.button>
          ))}
        </div>
        
        {/* Current Average */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-500 mb-1">Average {activeMetricConfig.name}</div>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-gray-800">{average.toFixed(1)}</span>
            <span className="text-gray-500 ml-1 mb-1">{activeMetricConfig.unit}</span>
          </div>
        </div>
        
        {/* Add New Button */}
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`mb-6 w-full py-2 rounded-lg bg-${activeMetricConfig.color}-100 text-${activeMetricConfig.color}-700 font-medium flex items-center justify-center`}
            onClick={() => setShowForm(true)}
          >
            <span className="mr-2">+</span> Add {activeMetricConfig.name} Entry
          </motion.button>
        )}
        
        {/* Entry Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
              onSubmit={handleSubmit}
            >
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Record {activeMetricConfig.name}</h3>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Value ({activeMetricConfig.unit})</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min={activeMetricConfig.min}
                      max={activeMetricConfig.max}
                      step={activeMetricConfig.step}
                      value={newMetric.value}
                      onChange={handleValueChange}
                      className={`w-full h-2 bg-${activeMetricConfig.color}-200 rounded-lg appearance-none cursor-pointer`}
                    />
                    <span className="ml-3 min-w-[60px] text-center font-medium">
                      {newMetric.value} {activeMetricConfig.unit}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={newMetric.notes || ''}
                    onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
                    placeholder="Add any notes about this entry"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded text-gray-600"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-${activeMetricConfig.color}-500 text-white rounded`}
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        {/* Recent Entries */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800">Recent Entries</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading metrics...</p>
            </div>
          ) : filteredMetrics.length > 0 ? (
            filteredMetrics.slice(0, 5).map((metric, index) => (
              <motion.div
                key={metric.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 border-l-4 border-${activeMetricConfig.color}-400 bg-${activeMetricConfig.color}-50 rounded-r flex justify-between items-center`}
              >
                <div>
                  <div className="flex items-baseline">
                    <span className="font-medium text-gray-800">{metric.value}</span>
                    <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                  </div>
                  {metric.notes && (
                    <p className="text-sm text-gray-600 mt-1">{metric.notes}</p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(metric.recorded_at)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No {activeMetricConfig.name.toLowerCase()} entries yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-blue-500 mt-2 hover:underline"
              >
                Add your first entry
              </button>
            </div>
          )}
          
          {filteredMetrics.length > 5 && (
            <div className="text-center mt-2">
              <button className="text-sm text-blue-500 hover:underline">
                View all {filteredMetrics.length} entries
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 