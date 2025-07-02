'use client';

import { useState } from 'react';
import { 
  ClockIcon, 
  UserIcon, 
  CalendarIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface ScheduleCardProps {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  type: 'team' | 'project' | 'personal' | 'client' | 'design' | 'department' | 'company';
  assignee?: string;
  project?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const priorityLabels = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

const typeClasses = {
  personal: 'bg-blue-100 text-blue-800',
  team: 'bg-green-100 text-green-800',
  project: 'bg-purple-100 text-purple-800',
  client: 'bg-orange-100 text-orange-800',
  design: 'bg-pink-100 text-pink-800',
  department: 'bg-cyan-100 text-cyan-800',
  company: 'bg-gray-100 text-gray-800',
};

const typeLabels = {
  personal: '개인',
  team: '팀',
  project: '프로젝트',
  client: '고객',
  design: '디자인',
  department: '부서',
  company: '회사',
};

export default function ScheduleCard({
  id,
  title,
  description,
  startTime,
  endTime,
  priority,
  type,
  assignee,
  project,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (time: string) => {
    return new Date(time).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[priority]}`}>
              {priorityLabels[priority]}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeClasses[type]}`}>
              {typeLabels[type]}
            </span>
          </div>
          
          {description && (
            <p className="text-secondary-600 text-sm mb-3">{description}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-secondary-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {formatDate(startTime)}
            </div>
            
            <div className="flex items-center text-sm text-secondary-600">
              <ClockIcon className="h-4 w-4 mr-2" />
              {formatTime(startTime)} - {formatTime(endTime)}
            </div>
            
            {assignee && (
              <div className="flex items-center text-sm text-secondary-600">
                <UserIcon className="h-4 w-4 mr-2" />
                {assignee}
              </div>
            )}
            
            {project && (
              <div className="flex items-center text-sm text-secondary-600">
                <span className="mr-2">📁</span>
                {project}
              </div>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-secondary-400 hover:text-secondary-600"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 w-32 bg-white rounded-md shadow-lg border border-secondary-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit?.(id);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  수정
                </button>
                <button
                  onClick={() => {
                    onDelete?.(id);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 