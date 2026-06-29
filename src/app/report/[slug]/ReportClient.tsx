'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReportClientProps {
  businessName?: string;
  currentScores?: number[];
  projectedGrowth?: number[];
  competitorGrowth?: number[];
  markdownReport?: string;
}

export default function ReportClient({
  businessName,
  currentScores,
  projectedGrowth,
  competitorGrowth,
  markdownReport,
}: ReportClientProps) {
  
  if (markdownReport) {
    return (
      <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-h1:text-emerald-400 prose-h2:text-emerald-400 prose-h3:text-teal-400 prose-p:text-neutral-300 prose-li:text-neutral-300 print:prose-headings:break-after-avoid [&>p]:break-inside-avoid [&>li]:break-inside-avoid">
        <ReactMarkdown>{markdownReport}</ReactMarkdown>
      </div>
    );
  }

  if (currentScores && projectedGrowth && competitorGrowth) {
    const lineData = {
      labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
      datasets: [
        {
          label: businessName || 'Your Business',
          data: projectedGrowth,
          borderColor: '#10b981', // emerald-500
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Competitor Average',
          data: competitorGrowth,
          borderColor: '#52525b', // zinc-500
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4
        }
      ]
    };

    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#e5e5e5', font: { size: 12 } }, position: 'bottom' as const }
      },
      scales: {
        x: { grid: { color: '#262626' }, ticks: { color: '#a1a1aa' } },
        y: { grid: { color: '#262626' }, ticks: { color: '#a1a1aa' }, beginAtZero: true, max: 100 }
      }
    };

    const barData = {
      labels: ['ChatGPT', 'Perplexity', 'Claude', 'Google SGE'],
      datasets: [{
        label: 'Current Readiness Score',
        data: currentScores,
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // emerald
          'rgba(14, 165, 233, 0.8)', // sky
          'rgba(245, 158, 11, 0.8)', // amber
          'rgba(99, 102, 241, 0.8)'  // indigo
        ],
        borderRadius: 4
      }]
    };

    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#a1a1aa' } },
        y: { grid: { color: '#262626' }, ticks: { color: '#a1a1aa' }, beginAtZero: true, max: 100 }
      }
    };

    return (
      <div className="flex flex-col md:flex-row print:!flex-col gap-8 print:gap-12 w-full">
        <div className="flex-1 p-6 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-lg print:break-inside-avoid">
          <h2 className="text-sm font-bold text-white mb-6 text-center tracking-wide uppercase">Projected AI Share of Voice</h2>
          <div className="w-full h-64 relative">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
        <div className="flex-1 p-6 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-lg print:break-inside-avoid">
          <h2 className="text-sm font-bold text-white mb-6 text-center tracking-wide uppercase">Authority by AI Engine</h2>
          <div className="w-full h-64 relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
