'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FiCalendar, FiActivity, FiMoon, FiHeart, FiDroplet } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrendsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetricType, setActiveMetricType] = useState('sleep');
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
  
  const metricTypes = [
    { id: 'sleep', name: 'Sleep', icon: FiMoon, color: 'rgba(59, 130, 246, 0.8)', unit: 'hours' },
    { id: 'heart_rate', name: 'Heart Rate', icon: FiHeart, color: 'rgba(239, 68, 68, 0.8)', unit: 'bpm' },
    { id: 'activity', name: 'Activity', icon: FiActivity, color: 'rgba(34, 197, 94, 0.8)', unit: 'minutes' },
    { id: 'water', name: 'Water', icon: FiDroplet, color: 'rgba(6, 182, 212, 0.8)', unit: 'cups' }
  ];
  
  const timeRanges = [
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'Last 30 Days' },
    { id: 'year', label: 'Last 12 Months' }
  ];
  
  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user, activeMetricType, timeRange]);
  
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected time range
      const endDate = new Date();
      let startDate = new Date();
      
      if (timeRange === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (timeRange === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }
      
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('metric_type', activeMetricType)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString())
        .order('recorded_at', { ascending: true });
        
      if (error) throw error;
      setMetrics(data || []);
      
    } catch (error) {
      console.error('Error fetching metrics for trends:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Group data by day for charting
  const prepareChartData = () => {
    if (!metrics.length) return { labels: [], values: [] };
    
    const groupedByDay = {};
    
    metrics.forEach(metric => {
      const date = new Date(metric.recorded_at);
      const day = date.toLocaleDateString();
      
      if (!groupedByDay[day]) {
        groupedByDay[day] = [];
      }
      
      groupedByDay[day].push(metric.value);
    });
    
    // For each day, calculate the average value
    const labels = [];
    const values = [];
    
    Object.keys(groupedByDay).forEach(day => {
      const dayValues = groupedByDay[day];
      const average = dayValues.reduce((sum, val) => sum + val, 0) / dayValues.length;
      
      labels.push(day);
      values.push(average.toFixed(1));
    });
    
    return { labels, values };
  };
  
  const { labels, values } = prepareChartData();
  
  // Get the active metric configuration
  const activeMetric = metricTypes.find(m => m.id === activeMetricType) || metricTypes[0];
  
  const chartData = {
    labels,
    datasets: [
      {
        label: `${activeMetric.name} (${activeMetric.unit})`,
        data: values,
        borderColor: activeMetric.color,
        backgroundColor: `${activeMetric.color.replace('0.8', '0.1')}`,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: activeMetric.color,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
  
  // Calculate some stats
  const calculateStats = () => {
    if (!values.length) return { avg: 0, min: 0, max: 0 };
    
    const numValues = values.map(v => parseFloat(v));
    const avg = numValues.reduce((sum, val) => sum + val, 0) / numValues.length;
    const min = Math.min(...numValues);
    const max = Math.max(...numValues);
    
    return { avg: avg.toFixed(1), min: min.toFixed(1), max: max.toFixed(1) };
  };
  
  const { avg, min, max } = calculateStats();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Health Trends</h1>
        <p className="text-gray-600">Visualize your health metrics over time</p>
      </div>
      
      {/* Metric Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metricTypes.map(metric => (
          <motion.button
            key={metric.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full flex items-center ${
              activeMetricType === metric.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveMetricType(metric.id)}
          >
            <metric.icon className="mr-2" size={16} />
            {metric.name}
          </motion.button>
        ))}
      </div>
      
      {/* Time Range Selector */}
      <div className="flex items-center mb-8">
        <FiCalendar className="text-gray-500 mr-2" />
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          {timeRanges.map(range => (
            <button
              key={range.id}
              className={`px-4 py-2 text-sm ${
                timeRange === range.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setTimeRange(range.id)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Average</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-800">{avg}</span>
            <span className="ml-1 text-gray-600">{activeMetric.unit}</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Minimum</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-800">{min}</span>
            <span className="ml-1 text-gray-600">{activeMetric.unit}</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Maximum</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-800">{max}</span>
            <span className="ml-1 text-gray-600">{activeMetric.unit}</span>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : metrics.length > 0 ? (
          <div className="h-64 md:h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-3">No data available for the selected time range</p>
            <button 
              onClick={() => window.location.href = '/home'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start tracking your health
            </button>
          </div>
        )}
      </div>
      
      {/* Recommendations */}
      {metrics.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-medium text-blue-800 mb-1">Your {activeMetric.name} Insights</h3>
            <p className="text-blue-700">
              {activeMetricType === 'sleep' && 
                `Your average sleep duration is ${avg} hours. Most adults need 7-9 hours of quality sleep for optimal health.`}
              {activeMetricType === 'heart_rate' && 
                `Your average resting heart rate is ${avg} bpm. For most adults, a healthy resting heart rate is 60-100 bpm.`}
              {activeMetricType === 'activity' && 
                `You're averaging ${avg} minutes of activity. Aim for at least 150 minutes of moderate activity per week.`}
              {activeMetricType === 'water' && 
                `You're consuming about ${avg} cups of water daily. Most health authorities recommend 8 cups (64 oz) per day.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 