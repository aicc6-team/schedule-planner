'use client';

import { useState, useEffect } from 'react';

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
  adjusted?: boolean;
}

interface EditScheduleFormProps {
  schedule: Schedule;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export default function EditScheduleForm({ schedule, onSubmit, onCancel }: EditScheduleFormProps) {
  const [formData, setFormData] = useState({
    title: schedule.title || '',
    description: schedule.description || '',
    date: schedule.startTime ? schedule.startTime.split('T')[0] : '',
    time: schedule.startTime ? schedule.startTime.split('T')[1]?.substring(0, 5) : '',
    durationMinutes: schedule.endTime && schedule.startTime ? 
      Math.round((new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime()) / (1000 * 60)) : 60,
    importance: schedule.priority === 'high' ? '높음' : schedule.priority === 'medium' ? '보통' : '낮음',
    emotion: '보통'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 스케줄 타입에 따라 다른 데이터 구조로 변환
    if (schedule.type === 'personal') {
      const personalData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        durationMinutes: formData.durationMinutes,
        importance: formData.importance,
        emotion: formData.emotion
      };
      onSubmit(personalData);
    } else if (schedule.type === 'department') {
      const departmentData = {
        title: formData.title,
        objective: formData.description,
        date: formData.date,
        time: formData.time,
        participants: ['부서원'] // 기본값
      };
      onSubmit(departmentData);
    } else if (schedule.type === 'project') {
      const projectData = {
        projectName: formData.title,
        objective: formData.description,
        endDate: formData.date,
        time: formData.time,
        category: '개발',
        roles: {
          pm: 1,
          backend: 1,
          frontend: 1,
          designer: 1,
          marketer: 1,
          sales: 1,
          general: 1,
          others: 1
        }
      };
      onSubmit(projectData);
    } else if (schedule.type === 'company') {
      const companyData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        participants: ['회사원'] // 기본값
      };
      onSubmit(companyData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationMinutes' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          제목
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          설명
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            날짜
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            시간
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
      </div>

      {schedule.type === 'personal' && (
        <>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              소요 시간 (분)
            </label>
            <input
              type="number"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              중요도
            </label>
            <select
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="낮음">낮음</option>
              <option value="보통">보통</option>
              <option value="높음">높음</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              감정
            </label>
            <select
              name="emotion"
              value={formData.emotion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="매우 좋음">매우 좋음</option>
              <option value="좋음">좋음</option>
              <option value="보통">보통</option>
              <option value="나쁨">나쁨</option>
              <option value="매우 나쁨">매우 나쁨</option>
            </select>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-secondary-700 bg-secondary-100 rounded-md hover:bg-secondary-200 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          수정
        </button>
      </div>
    </form>
  );
} 