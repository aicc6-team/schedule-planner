'use client';

import React from 'react';
import { Schedule } from '@/types/schedule';
import Badge from '@/components/Badge';
import {
  ClockIcon,
  TagIcon,
  UserCircleIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onComplete?: (schedule: Schedule) => void;
  isOverdue?: boolean;
  isPastTab?: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onEdit, onDelete, onComplete, isOverdue, isPastTab }) => {
  const router = useRouter();
  const { title, description, startTime, endTime, priority, type, assignee, project, status } = schedule;

  const getPriorityInfo = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return {
          text: '높음',
          badgeVariant: 'danger',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
        } as const;
      case 'medium':
        return {
          text: '보통',
          badgeVariant: 'warning',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
        } as const;
      case 'low':
        return {
          text: '낮음',
          badgeVariant: 'success',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        } as const;
    }
  };

  const getTypeInfo = (type: 'personal' | 'department' | 'project' | 'company') => {
    switch (type) {
      case 'personal':
        return { text: '개인', badgeVariant: 'primary' } as const;
      case 'department':
        return { text: '부서', badgeVariant: 'info' } as const;
      case 'project':
        return { text: '프로젝트', badgeVariant: 'purple' } as const;
      case 'company':
        return { text: '전사', badgeVariant: 'success' } as const;
    }
  };
  
  const priorityInfo = getPriorityInfo(priority);
  const typeInfo = getTypeInfo(type);

  const cardClasses = `
    rounded-lg border p-3 shadow-sm transition-all duration-200 flex flex-col h-full
    ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-white'}
    ${status === 'completed' ? 'opacity-60 bg-gray-50' : ''}
  `;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={cardClasses}>
      {/* 카드 헤더 */}
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex flex-col">
          <h3 className={`font-bold text-sm ${status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {type === 'project' ? formatDate(endTime) : formatDate(startTime)}
          </p>
        </div>

        {/* 액션 버튼들을 가로로 배치 */}
        <div className="flex items-center gap-1">
          {status !== 'completed' && onComplete && !isOverdue && !isPastTab && (
            <button
              type="button"
              onClick={() => onComplete(schedule)}
              className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors"
              title="완료"
            >
              <CheckIcon className="h-5 w-5 text-green-600 opacity-80" />
            </button>
          )}
          {!isOverdue && !isPastTab && (
            <>
              <button
                type="button"
                onClick={() => router.push(`/schedules/create?id=${schedule.id}&type=${schedule.type}&mode=edit`)}
                className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                title="수정"
              >
                <PencilSquareIcon className="h-5 w-5 text-blue-500 opacity-80" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(schedule)}
                className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                title="삭제"
              >
                <TrashIcon className="h-5 w-5 text-red-600 opacity-80" />
              </button>
            </>
          )}
          {(isOverdue || isPastTab) && onComplete && schedule.status === 'pending' && (
            <button
              type="button"
              onClick={() => onComplete(schedule)}
              className="flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 px-1 py-0.5 rounded text-xs font-medium"
            >
              <ExclamationCircleIcon className="h-3 w-3" strokeWidth={2.5} />
              <span>미완료</span>
            </button>
          )}
        </div>
      </div>

      {/* 카드 본문 */}
      <div className="flex-grow mb-1.5">
        <p className={`text-xs ${status === 'completed' ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>{description}</p>
      </div>

      {/* 카드 푸터 - 더 컴팩트하게 */}
      <div className="pt-1.5 border-t border-gray-200">
        {/* 시간과 우선순위를 한 줄에 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-0.5">
           <div className="flex items-center gap-1">
             <ClockIcon className="h-3 w-3" />
             <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
           </div>
           <Badge variant={priorityInfo.badgeVariant} size="sm">{priorityInfo.text}</Badge>
        </div>
        
        {/* 프로젝트와 타입을 한 줄에 */}
        <div className="flex items-center justify-between text-xs mb-0.5">
          <div className="flex items-center gap-1 text-gray-500">
            <TagIcon className="h-3 w-3" />
            <span className="truncate max-w-20">{project}</span>
          </div>
          <Badge variant={typeInfo.badgeVariant} size="sm">{typeInfo.text}</Badge>
        </div>
        
        {/* 담당자와 상태를 한 줄에 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <UserCircleIcon className="h-3 w-3" />
            <span className="truncate max-w-16">{assignee}</span>
          </div>
          {status === 'completed' && !isOverdue && !isPastTab && (
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <CheckIcon className="h-4 w-4 text-green-600 opacity-80" />
              <span>완료</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard; 