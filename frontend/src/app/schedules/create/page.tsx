'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Badge from '@/components/Badge';
import { 
  UserIcon,
  BuildingOffice2Icon,
  FolderOpenIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UsersIcon,
  PlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import TagAutocompleteInput from '@/components/TagAutocompleteInput';

const scheduleTypes = [
  {
    id: 'personal',
    title: '개인 일정',
    description: '개인적인 약속, 할 일 등',
    icon: UserIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badge: 'info'
  },
  {
    id: 'department',
    title: '부서 일정',
    description: '부서 회의, 팀 일정 등',
    icon: BuildingOffice2Icon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badge: 'success'
  },
  {
    id: 'project',
    title: '프로젝트 일정',
    description: '프로젝트 관련 업무 일정',
    icon: FolderOpenIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badge: 'warning'
  }
];

const userList = [
  '김철수', '이영희', '박민수', '최수정', '홍길동', '정유진', '이수민', '박지현', '최민호', '강다은'
];

export default function ScheduleCreatePage() {
  const router = useRouter();
  // 각 폼의 상태를 분리
  const [personalForm, setPersonalForm] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    duration: 30,
    priority: 'medium',
    description: '',
    emotion: 'normal',
  });
  const [departmentForm, setDepartmentForm] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    duration: 30,
    description: '',
    attendees: [] as string[],
  });
  const [projectForm, setProjectForm] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    duration: 30,
    description: '',
    type: '',
    pm: 0,
    backend: 0,
    frontend: 0,
    design: 0,
    marketer: 0,
    sales: 0,
    admin: 0,
    etc: 0,
  });

  // 각 폼의 입력 핸들러
  const handlePersonalChange = (field: string, value: any) => setPersonalForm(prev => ({ ...prev, [field]: value }));
  const handleDepartmentChange = (field: string, value: any) => {
    if (field === 'attendees') setDepartmentForm(prev => ({ ...prev, attendees: value as string[] }));
    else setDepartmentForm(prev => ({ ...prev, [field]: value }));
  };
  const handleProjectChange = (field: string, value: any) => setProjectForm(prev => ({ ...prev, [field]: value }));

  // 저장(예시)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 저장 로직은 추후 구현
    console.log('개인:', personalForm);
    console.log('부서:', departmentForm);
    console.log('프로젝트:', projectForm);
    router.push('/schedules');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="lg:pl-64">
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="text-sm text-slate-500 mb-2">
                <span>일정 관리</span> <span className="mx-2">/</span> <span className="text-slate-700">새 일정 추가</span>
              </nav>
              <h1 className="text-2xl font-bold text-slate-900">새 일정 추가</h1>
              <p className="text-slate-600 mt-1">새로운 일정을 등록하고 관리하세요</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 flex flex-col items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">개인</h2>
                <section className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col relative">
                  <div className="flex gap-2 absolute top-0 right-4 mt-2">
                    <button type="button" onClick={() => setPersonalForm({ title: '', date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5), duration: 30, priority: 'medium', description: '', emotion: 'normal' })} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">삭제</button>
                    <button type="button" onClick={() => console.log('개인:', personalForm)} className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">저장</button>
                  </div>
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">제목 *</label>
                    <input type="text" value={personalForm.title} onChange={e => handlePersonalChange('title', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">설명</label>
                    <textarea rows={2} value={personalForm.description} onChange={e => handlePersonalChange('description', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">날짜 *</label>
                    <input type="date" value={personalForm.date} onChange={e => handlePersonalChange('date', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">시간 *</label>
                    <input type="time" value={personalForm.time} onChange={e => handlePersonalChange('time', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">소요시간(분)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="480"
                        step="5"
                        value={personalForm.duration}
                        onChange={e => handlePersonalChange('duration', Number(e.target.value))}
                        className="w-full h-2 accent-blue-500 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:transition-all"
                        style={{ minWidth: 0 }}
                      />
                      <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 shadow-sm">{personalForm.duration}분</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-0.5 px-1">
                      <span>5분</span>
                      <span>8시간</span>
                    </div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">중요도</label>
                    <select value={personalForm.priority} onChange={e => handlePersonalChange('priority', e.target.value)} className="px-2 py-1 border rounded text-sm">
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                    </select>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">감정상태</label>
                    <select value={personalForm.emotion} onChange={e => handlePersonalChange('emotion', e.target.value)} className="px-2 py-1 border rounded text-sm">
                      <option value="happy">기쁨</option>
                      <option value="normal">보통</option>
                      <option value="sad">슬픔</option>
                      <option value="angry">화남</option>
                    </select>
                  </form>
                </section>
              </div>
              <div className="flex-1 flex flex-col items-center mb-4">
                <h2 className="text-2xl font-bold text-green-600 mb-2">부서</h2>
                <section className="w-full bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col relative">
                  <div className="flex gap-2 absolute top-0 right-4 mt-2">
                    <button type="button" onClick={() => setDepartmentForm({ title: '', date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5), duration: 30, description: '', attendees: [] })} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">삭제</button>
                    <button type="button" onClick={() => console.log('부서:', departmentForm)} className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">저장</button>
                  </div>
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">제목 *</label>
                    <input type="text" value={departmentForm.title} onChange={e => handleDepartmentChange('title', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">목적</label>
                    <textarea rows={2} value={departmentForm.description} onChange={e => handleDepartmentChange('description', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">날짜 *</label>
                    <input type="date" value={departmentForm.date} onChange={e => handleDepartmentChange('date', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">시간 *</label>
                    <input type="time" value={departmentForm.time} onChange={e => handleDepartmentChange('time', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">참여자</label>
                    <TagAutocompleteInput options={userList} value={departmentForm.attendees} onChange={names => handleDepartmentChange('attendees', names)} placeholder="참여자 이름을 입력하세요 (콤마로 여러 명 입력 가능)" />
                  </form>
                </section>
              </div>
              <div className="flex-1 flex flex-col items-center mb-4">
                <h2 className="text-2xl font-bold text-orange-500 mb-2">프로젝트</h2>
                <section className="w-full bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col relative">
                  <div className="flex gap-2 absolute top-0 right-4 mt-2">
                    <button type="button" onClick={() => setProjectForm({ title: '', date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5), duration: 30, description: '', type: '', pm: 0, backend: 0, frontend: 0, design: 0, marketer: 0, sales: 0, admin: 0, etc: 0 })} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">삭제</button>
                    <button type="button" onClick={() => console.log('프로젝트:', projectForm)} className="px-4 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">저장</button>
                  </div>
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">프로젝트명 *</label>
                    <input type="text" value={projectForm.title} onChange={e => handleProjectChange('title', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">목적</label>
                    <textarea rows={2} value={projectForm.description} onChange={e => handleProjectChange('description', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">종류</label>
                    <select value={projectForm.type} onChange={e => handleProjectChange('type', e.target.value)} className="px-2 py-1 border rounded text-sm">
                      <option value="">선택하세요</option>
                      <option value="웹">웹</option>
                      <option value="앱">앱</option>
                      <option value="AI">AI</option>
                      <option value="기타">기타</option>
                    </select>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">종료일 *</label>
                    <input type="date" value={projectForm.date} onChange={e => handleProjectChange('date', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <label className="block text-xs font-semibold text-slate-700 mb-1">시간 *</label>
                    <input type="time" value={projectForm.time} onChange={e => handleProjectChange('time', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1">PM수</label><input type="number" min="0" value={projectForm.pm} onChange={e => handleProjectChange('pm', Number(e.target.value))} className="px-2 py-1 border rounded w-full" /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1">백엔드수</label><input type="number" min="0" value={projectForm.backend} onChange={e => handleProjectChange('backend', Number(e.target.value))} className="px-2 py-1 border rounded w-full" /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1">프론트수</label><input type="number" min="0" value={projectForm.frontend} onChange={e => handleProjectChange('frontend', Number(e.target.value))} className="px-2 py-1 border rounded w-full" /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1">디자인수</label><input type="number" min="0" value={projectForm.design} onChange={e => handleProjectChange('design', Number(e.target.value))} className="px-2 py-1 border rounded w-full" /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1">마케터수</label><input type="number" min="0" value={projectForm.marketer} onChange={e => handleProjectChange('marketer', Number(e.target.value))} className="px-2 py-1 border rounded w-full" /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1">영업수</label><input type="number" min="0" value={projectForm.sales} onChange={e => handleProjectChange('sales', Number(e.target.value))} className="px-2 py-1 border rounded w-full" /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1">총무수</label><input type="number" min="0" value={projectForm.admin} onChange={e => handleProjectChange('admin', Number(e.target.value))} className="px-2 py-1 border rounded w-full" /></div>
                      <div><label className="block text-xs font-semibold text-slate-700 mb-1">기타인원수</label><input type="number" min="0" value={projectForm.etc} onChange={e => handleProjectChange('etc', Number(e.target.value))} className="px-2 py-1 border rounded w-full" /></div>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 