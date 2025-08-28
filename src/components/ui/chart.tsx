'use client';

import { Dialog } from './dialog';
import { Player } from '@/types'; // optional, if you have a Player type file
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
}

export const ChartDialog: React.FC<ChartDialogProps> = ({ open, onOpenChange, players }) => {
  // Determine the number of rounds based on max scores length
  const maxRounds = Math.max(...players.map(p => p.scores.length), 0);
  const labels = Array.from({ length: maxRounds }, (_, i) => `Round ${i + 1}`);

  const datasets = players.map((p, idx) => ({
      label: p.name,
      data: cumulativeScores(p.scores),
      borderColor: COLORS[idx % COLORS.length],
      backgroundColor: COLORS[idx % COLORS.length] + '33', // semi-transparent fill
      tension: 0.4
  }))

  const chartData = {
    labels,
    datasets
  };

  const maxScore = Math.max(...datasets.flatMap(d => d.data), 0);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 10 },  // smaller font for player labels
          boxWidth: 12,
          padding: 8
        }
      },
      title: { display: true, text: 'Cumulative Player Scores Over Rounds' }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxScore + 5,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="w-full max-w-lg">
        <Line data={chartData} options={chartOptions} height={400} />
      </div>
    </Dialog>
  );
};

// Some default colors for the lines
const COLORS = [
  '#ec4899', // pink-400
  '#a78bfa', // purple-400
  '#3b82f6', // blue-400
  '#6366f1', // indigo-400
  '#0ea5e9', // sky-400
  '#06b6d4', // cyan-400
  '#14b8a6', // teal-400
  '#f43f5e', // rose-400
  '#d946ef', // fuchsia-400
  '#8b5cf6', // violet-400
  '#f97316', // orange-400
  '#84cc16'  // lime-400
];

function cumulativeScores(scores: number[]): number[] {
  const result: number[] = [];
  scores.forEach((score, idx) => {
    if (idx === 0) result.push(score);
    else result.push(result[idx - 1] + score);
  });
  return result;
}