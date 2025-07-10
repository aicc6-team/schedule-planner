import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-500',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
};

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color,
  change 
}: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-secondary-900">{value}</p>
            {change && (
              <span className={`ml-2 text-sm font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 