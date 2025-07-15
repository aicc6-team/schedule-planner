import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="card text-center py-12">
      <div className="text-secondary-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-secondary-900 mb-2">
        {title}
      </h3>
      <p className="text-secondary-600 mb-4 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <button 
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
} 