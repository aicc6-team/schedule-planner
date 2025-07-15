'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  type: 'personal' | 'department' | 'project' | 'company';
  assignee?: string;
  project?: string;
  status: 'completed' | 'pending' | 'overdue';
}

interface SchedulePopupProps {
  open: boolean;
  date: Date | null;
  anchor: DOMRect | null;
  schedules: Schedule[];
  scheduleTypeColors: Record<string, { bg: string; text: string; border: string }>;
  onClose: () => void;
  onDelete: (schedule: Schedule) => void;
}

export default function SchedulePopup({
  open,
  date,
  anchor,
  schedules,
  scheduleTypeColors,
  onClose,
  onDelete
}: SchedulePopupProps) {
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open, onClose]);

  if (!open || !anchor || !date) return null;

  return (
    <div
      ref={popupRef}
      className="absolute z-50 bg-white rounded-xl shadow-lg p-4 min-w-[220px] max-w-xs border border-gray-200"
      style={{
        top: anchor.top + anchor.height + 8,
        left: anchor.left,
      }}
    >
      <div className="font-bold text-gray-800 mb-2 text-base">
        {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
      </div>
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
        {schedules.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">추가 일정이 없습니다.</div>
        ) : (
          schedules.map(sch => {
            const colors = scheduleTypeColors[sch.type] || scheduleTypeColors.personal;
            return (
              <div key={sch.id} className={`${colors.bg} rounded px-2 py-1 flex items-center justify-between gap-2`}>
                <div>
                  <div className={`font-medium ${colors.text} text-sm`}>{sch.title}</div>
                  <div className="text-xs text-gray-500">
                    {sch.startTime.slice(11, 16)} ~ {sch.endTime.slice(11, 16)}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  {sch.type === 'company' ? (
                    <button
                      className="text-xs text-gray-400 bg-gray-100 cursor-not-allowed px-1 py-0.5 rounded"
                      title="회사 일정은 수정할 수 없습니다. 구글 캘린더에서 직접 수정하세요."
                      disabled
                    >수정불가</button>
                  ) : (
                    <button
                      className="text-xs text-blue-600 hover:underline px-1 py-0.5"
                      onClick={() => router.push(`/schedules/create?mode=edit&id=${sch.id}&type=${sch.type}`)}
                      title="수정"
                    >수정</button>
                  )}
                  <button
                    className="text-xs text-red-500 hover:underline px-1 py-0.5"
                    onClick={() => onDelete(sch)}
                    title="삭제"
                  >삭제</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 