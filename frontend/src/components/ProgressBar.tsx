interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  primary: 'bg-primary-600',
  green: 'bg-green-600',
  yellow: 'bg-yellow-600',
  red: 'bg-red-600',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export default function ProgressBar({ 
  progress, 
  label, 
  showPercentage = true,
  color = 'primary',
  size = 'md'
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm text-secondary-600 mb-1">
          {label && <span>{label}</span>}
          {showPercentage && <span>{clampedProgress}%</span>}
        </div>
      )}
      <div className={`w-full bg-secondary-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
} 