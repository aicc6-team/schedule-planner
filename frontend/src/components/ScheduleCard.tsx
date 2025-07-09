'use client';

import React from 'react';
import { Schedule } from '@/types/schedule';
import Badge from '@/components/Badge';
import {
  ClockIcon,
  TagIcon,
  UserCircleIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onComplete?: (schedule: Schedule) => void;
  isOverdue?: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onEdit, onDelete, onComplete, isOverdue }) => {
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
    rounded-lg border p-4 shadow-sm transition-all duration-200 flex flex-col h-full
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
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col">
          <h3 className={`font-bold text-lg ${status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{formatDate(startTime)}</p>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {status !== 'completed' && onComplete && !isOverdue && (
                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <button
                      onClick={() => onComplete(schedule)}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <CheckCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      완료
                    </button>
                  )}
                </Menu.Item>
              )}
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={() => onEdit(schedule)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center px-4 py-2 text-sm`}
                  >
                    <PencilIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    수정
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={() => onDelete(schedule)}
                    className={`${
                      active ? 'bg-red-50 text-red-900' : 'text-red-700'
                    } group flex w-full items-center px-4 py-2 text-sm`}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                    삭제
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* 카드 본문 */}
      <div className="flex-grow">
        <p className={`text-sm ${status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      </div>

      {/* 카드 푸터 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
           <div className="flex items-center gap-1">
             <ClockIcon className="h-4 w-4" />
             <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
           </div>
           <Badge variant={priorityInfo.badgeVariant} size="sm">{priorityInfo.text}</Badge>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <TagIcon className="h-4 w-4" />
            <span>{project}</span>
          </div>
          <Badge variant={typeInfo.badgeVariant} size="sm">{typeInfo.text}</Badge>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <UserCircleIcon className="h-4 w-4" />
            <span>{assignee}</span>
          </div>
          {status === 'completed' && (
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircleIcon className="h-4 w-4" />
              <span>완료됨</span>
            </div>
          )}
          {isOverdue && (
            <button
              onClick={() => onComplete && onComplete(schedule)}
              className="flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-md text-sm font-medium"
            >
              <ExclamationCircleIcon className="h-4 w-4" />
              <span>미완료</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard; 