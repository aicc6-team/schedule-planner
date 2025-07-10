'use client';

import { useState } from 'react';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  members: string[];
  progress: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  active: '진행중',
  completed: '완료',
  paused: '일시정지',
};

const statusIcons = {
  active: ClockIcon,
  completed: CheckCircleIcon,
  paused: ClockIcon,
};

export default function ProjectCard({
  id,
  name,
  description,
  startDate,
  endDate,
  status,
  members,
  progress,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const StatusIcon = statusIcons[status];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-secondary-900">{name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
              <StatusIcon className="h-3 w-3 inline mr-1" />
              {statusLabels[status]}
            </span>
          </div>
          
          {description && (
            <p className="text-secondary-600 text-sm mb-3">{description}</p>
          )}
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-secondary-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {formatDate(startDate)} - {formatDate(endDate)}
            </div>
            
            <div className="flex items-center text-sm text-secondary-600">
              <UserGroupIcon className="h-4 w-4 mr-2" />
              {members.length}명 참여
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-secondary-600 mb-1">
              <span>진행률</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* 멤버 아바타 */}
          {members.length > 0 && (
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {members.slice(0, 3).map((member, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-primary-700"
                  >
                    {member.charAt(0)}
                  </div>
                ))}
                {members.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-secondary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-secondary-600">
                    +{members.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
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