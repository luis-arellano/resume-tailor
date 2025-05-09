"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  ChartBarIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    applicationsByStatus: {},
    averageResponseTime: 0,
    successRate: 0,
    applicationsOverTime: []
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const response = await fetch('/api/job_scans?sort=created_at&order=desc&limit=100');
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error?.message || 'Failed to fetch analytics');
        }

        // Calculate statistics
        const jobScans = responseData.data;
        const statusCounts = jobScans.reduce((acc, scan) => {
          acc[scan.application_status] = (acc[scan.application_status] || 0) + 1;
          return acc;
        }, {});

        // Group applications by year, month and week
        const applicationsByYearMonthWeek = jobScans.reduce((acc, scan) => {
          const date = new Date(scan.created_at);
          const year = date.getFullYear();
          const month = date.toLocaleString('default', { month: 'short' });
          const week = Math.ceil((date.getDate() + date.getDay()) / 7);
          const key = `${year} ${month} W${week}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        // Convert to array format for chart
        const applicationsOverTime = Object.entries(applicationsByYearMonthWeek)
          .map(([period, count]) => ({
            period,
            count
          }))
          .sort((a, b) => {
            // Custom sorting to handle year-month-week format
            const [yearA, monthA, weekA] = a.period.split(' ');
            const [yearB, monthB, weekB] = b.period.split(' ');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndexA = months.indexOf(monthA);
            const monthIndexB = months.indexOf(monthB);
            
            if (yearA !== yearB) {
              return parseInt(yearA) - parseInt(yearB);
            }
            if (monthIndexA !== monthIndexB) {
              return monthIndexA - monthIndexB;
            }
            return parseInt(weekA.replace('W', '')) - parseInt(weekB.replace('W', ''));
          });

        setStats({
          totalApplications: jobScans.length,
          applicationsByStatus: statusCounts,
          averageResponseTime: 0, // TODO: Calculate based on created_at and response times
          successRate: 0, // TODO: Calculate based on status
          applicationsOverTime
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: stats.applicationsOverTime.map(item => item.period),
    datasets: [
      {
        label: 'Applications',
        data: stats.applicationsOverTime.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Applications Over Time'
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (tooltipItem) => {
            return `${tooltipItem.raw} application${tooltipItem.raw === 1 ? '' : 's'}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">Track your job application performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Applications Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <DocumentCheckIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>

          {/* Status Distribution Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status Distribution</p>
                <div className="mt-2 space-y-1">
                  {Object.entries(stats.applicationsByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{status}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Average Response Time Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Response Time</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageResponseTime} days</p>
              </div>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Graph */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
} 