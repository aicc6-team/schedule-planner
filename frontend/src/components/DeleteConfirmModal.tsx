'use client';

import React from 'react';

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

interface DeleteConfirmModalProps {
  open: boolean;
  schedule: Schedule | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  open,
  schedule,
  onCancel,
  onConfirm
}: DeleteConfirmModalProps) {
  if (!open || !schedule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-xs w-full relative">
        <div className="text-lg font-bold text-gray-800 mb-3">일정 삭제</div>
        <div className="mb-4 text-gray-700 text-sm">
          정말 <span className="font-semibold text-red-600">{schedule.title}</span> 일정을 삭제하시겠습니까?
        </div>
        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" 
            onClick={onCancel}
          >
            취소
          </button>
          <button 
            className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 font-semibold" 
            onClick={onConfirm}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
} 