'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Badge from '@/components/Badge';
import Toast, { ToastProps } from '@/components/Toast';
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



export default function ScheduleCreatePage() {
  const router = useRouter();
  
  // 에러 및 알림 상태
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Toast 관리 함수
  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // 각 폼의 상태를 백엔드 필드명에 맞게 수정
  const [personalForm, setPersonalForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    durationMinutes: 30,
    importance: 'medium',
    emotion: 'normal',
    status: 'pending',
  });
  
  const [departmentForm, setDepartmentForm] = useState({
    title: '',
    objective: '',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    participants: [] as string[],
    status: 'pending',
  });
  
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    objective: '',
    category: '',
    endDate: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    roles: {
      pm: 0,
      backend: 0,
      frontend: 0,
      designer: 0,
      marketer: 0,
      sales: 0,
      general: 0,
      others: 0,
    },
    status: 'pending',
  });

  // 각 폼의 입력 핸들러
  const handlePersonalChange = (field: string, value: any) => {
    setPersonalForm(prev => ({ ...prev, [field]: value }));
    // 에러 상태 클리어
    if (errors[`personal_${field}`]) {
      setErrors(prev => ({ ...prev, [`personal_${field}`]: '' }));
    }
  };
  
  const handleDepartmentChange = (field: string, value: any) => {
    setDepartmentForm(prev => ({ ...prev, [field]: value }));
    // 에러 상태 클리어
    if (errors[`department_${field}`]) {
      setErrors(prev => ({ ...prev, [`department_${field}`]: '' }));
    }
  };
  
  const handleProjectChange = (field: string, value: any) => {
    if (field.startsWith('roles.')) {
      const roleField = field.split('.')[1];
      setProjectForm(prev => ({ 
        ...prev, 
        roles: { ...prev.roles, [roleField]: value }
      }));
    } else {
      setProjectForm(prev => ({ ...prev, [field]: value }));
    }
    // 에러 상태 클리어
    if (errors[`project_${field}`]) {
      setErrors(prev => ({ ...prev, [`project_${field}`]: '' }));
    }
  };

  // 폼 검증 함수
  const validatePersonalForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!personalForm.title.trim()) {
      newErrors.personal_title = '제목을 입력해주세요.';
    }
    if (!personalForm.date) {
      newErrors.personal_date = '날짜를 선택해주세요.';
    }
    if (!personalForm.time) {
      newErrors.personal_time = '시간을 선택해주세요.';
    }
    
    return newErrors;
  };

  const validateDepartmentForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!departmentForm.title.trim()) {
      newErrors.department_title = '제목을 입력해주세요.';
    }
    if (!departmentForm.date) {
      newErrors.department_date = '날짜를 선택해주세요.';
    }
    if (!departmentForm.time) {
      newErrors.department_time = '시간을 선택해주세요.';
    }
    
    return newErrors;
  };

  const validateProjectForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!projectForm.projectName.trim()) {
      newErrors.project_projectName = '프로젝트명을 입력해주세요.';
    }
    if (!projectForm.endDate) {
      newErrors.project_endDate = '종료일을 선택해주세요.';
    }
    if (!projectForm.time) {
      newErrors.project_time = '시간을 선택해주세요.';
    }
    
    return newErrors;
  };

  // API 호출 함수들
  const createPersonalSchedule = async (data: any) => {
    const response = await fetch('http://localhost:3001/api/schedules/personal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '개인 일정 생성에 실패했습니다.');
    }
    
    return response.json();
  };

  const createDepartmentSchedule = async (data: any) => {
    const response = await fetch('http://localhost:3001/api/schedules/department', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '부서 일정 생성에 실패했습니다.');
    }
    
    return response.json();
  };

  const createProjectSchedule = async (data: any) => {
    const response = await fetch('http://localhost:3001/api/schedules/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '프로젝트 일정 생성에 실패했습니다.');
    }
    
    return response.json();
  };

  // 개별 저장 함수들
  const handlePersonalSave = async () => {
    const validationErrors = validatePersonalForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      addToast({ 
        type: 'error', 
        title: '입력 오류', 
        message: '필수 항목을 모두 입력해주세요.' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 백엔드가 기대하는 필드들을 기본값으로 추가
      const scheduleData = {
        ...personalForm,
        projectId: '', // 기본값
        assignee: '사용자' // 기본값
      };
      await createPersonalSchedule(scheduleData);
      addToast({ 
        type: 'success', 
        title: '저장 완료', 
        message: '개인 일정이 성공적으로 저장되었습니다.' 
      });
      // 폼 초기화
      setPersonalForm({
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5),
        durationMinutes: 30,
        importance: 'medium',
        emotion: 'normal',
        status: 'pending',
      });
    } catch (error) {
      addToast({ 
        type: 'error',
        title: '저장 실패',
        message: error instanceof Error ? error.message : '개인 일정 저장에 실패했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepartmentSave = async () => {
    const validationErrors = validateDepartmentForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      addToast({ 
        type: 'error', 
        title: '입력 오류', 
        message: '필수 항목을 모두 입력해주세요.' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 백엔드가 기대하는 필드들을 기본값으로 추가
      const scheduleData = {
        ...departmentForm,
        department: '', // 기본값
        projectId: '', // 기본값
        organizer: '관리자' // 기본값
      };
      await createDepartmentSchedule(scheduleData);
      addToast({ 
        type: 'success', 
        title: '저장 완료', 
        message: '부서 일정이 성공적으로 저장되었습니다.' 
      });
      // 폼 초기화
      setDepartmentForm({
        title: '',
        objective: '',
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5),
        participants: [],
        status: 'pending',
      });
    } catch (error) {
      addToast({ 
        type: 'error',
        title: '저장 실패',
        message: error instanceof Error ? error.message : '부서 일정 저장에 실패했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectSave = async () => {
    const validationErrors = validateProjectForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      addToast({ 
        type: 'error', 
        title: '입력 오류', 
        message: '필수 항목을 모두 입력해주세요.' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 백엔드가 기대하는 필드들을 기본값으로 추가
      const scheduleData = {
        ...projectForm,
        projectId: '', // 기본값
        startDate: projectForm.endDate, // 종료일과 동일하게 설정
        participants: [] // 기본값
      };
      await createProjectSchedule(scheduleData);
      addToast({ 
        type: 'success', 
        title: '저장 완료', 
        message: '프로젝트 일정이 성공적으로 저장되었습니다.' 
      });
      // 폼 초기화
      setProjectForm({
        projectName: '',
        objective: '',
        category: '',
        endDate: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5),
        roles: {
          pm: 0,
          backend: 0,
          frontend: 0,
          designer: 0,
          marketer: 0,
          sales: 0,
          general: 0,
          others: 0,
        },
        status: 'pending',
      });
    } catch (error) {
      addToast({ 
        type: 'error',
        title: '저장 실패',
        message: error instanceof Error ? error.message : '프로젝트 일정 저장에 실패했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    <button 
                      type="button" 
                      onClick={() => setPersonalForm({ 
                        title: '', 
                        description: '',
                        date: new Date().toISOString().slice(0, 10), 
                        time: new Date().toTimeString().slice(0, 5), 
                        durationMinutes: 30, 
                        importance: 'medium', 
                        emotion: 'normal', 
                        status: 'pending' 
                      })} 
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      disabled={isSubmitting}
                    >
                      삭제
                    </button>
                    <button 
                      type="button" 
                      onClick={handlePersonalSave} 
                      className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '저장 중...' : '저장'}
                    </button>
                  </div>
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">제목 *</label>
                    <input 
                      type="text" 
                      value={personalForm.title} 
                      onChange={e => handlePersonalChange('title', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.personal_title ? 'border-red-500' : ''}`}
                      placeholder="일정 제목을 입력하세요"
                    />
                    {errors.personal_title && <span className="text-red-500 text-xs">{errors.personal_title}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">설명</label>
                    <textarea 
                      rows={2} 
                      value={personalForm.description} 
                      onChange={e => handlePersonalChange('description', e.target.value)} 
                      className="px-2 py-1 border rounded text-sm"
                      placeholder="일정에 대한 설명을 입력하세요"
                    />
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">날짜 *</label>
                    <input 
                      type="date" 
                      value={personalForm.date} 
                      onChange={e => handlePersonalChange('date', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.personal_date ? 'border-red-500' : ''}`}
                    />
                    {errors.personal_date && <span className="text-red-500 text-xs">{errors.personal_date}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">시간 *</label>
                    <input 
                      type="time" 
                      value={personalForm.time} 
                      onChange={e => handlePersonalChange('time', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.personal_time ? 'border-red-500' : ''}`}
                    />
                    {errors.personal_time && <span className="text-red-500 text-xs">{errors.personal_time}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">소요시간(분)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="480"
                        step="5"
                        value={personalForm.durationMinutes}
                        onChange={e => handlePersonalChange('durationMinutes', Number(e.target.value))}
                        className="w-full h-2 accent-blue-500 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:transition-all"
                        style={{ minWidth: 0 }}
                      />
                      <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 shadow-sm">{personalForm.durationMinutes}분</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-0.5 px-1">
                      <span>5분</span>
                      <span>8시간</span>
                    </div>
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">중요도</label>
                    <select value={personalForm.importance} onChange={e => handlePersonalChange('importance', e.target.value)} className="px-2 py-1 border rounded text-sm">
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
                    <button 
                      type="button" 
                      onClick={() => setDepartmentForm({ 
                        title: '', 
                        objective: '',
                        date: new Date().toISOString().slice(0, 10), 
                        time: new Date().toTimeString().slice(0, 5), 
                        participants: [], 
                        status: 'pending' 
                      })} 
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      disabled={isSubmitting}
                    >
                      삭제
                    </button>
                    <button 
                      type="button" 
                      onClick={handleDepartmentSave} 
                      className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '저장 중...' : '저장'}
                    </button>
                  </div>
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">제목 *</label>
                    <input 
                      type="text" 
                      value={departmentForm.title} 
                      onChange={e => handleDepartmentChange('title', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.department_title ? 'border-red-500' : ''}`}
                      placeholder="부서 일정 제목을 입력하세요"
                    />
                    {errors.department_title && <span className="text-red-500 text-xs">{errors.department_title}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">목적</label>
                    <textarea 
                      rows={2} 
                      value={departmentForm.objective} 
                      onChange={e => handleDepartmentChange('objective', e.target.value)} 
                      className="px-2 py-1 border rounded text-sm"
                      placeholder="부서 일정의 목적을 입력하세요"
                    />
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">날짜 *</label>
                    <input 
                      type="date" 
                      value={departmentForm.date} 
                      onChange={e => handleDepartmentChange('date', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.department_date ? 'border-red-500' : ''}`}
                    />
                    {errors.department_date && <span className="text-red-500 text-xs">{errors.department_date}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">시간 *</label>
                    <input 
                      type="time" 
                      value={departmentForm.time} 
                      onChange={e => handleDepartmentChange('time', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.department_time ? 'border-red-500' : ''}`}
                    />
                    {errors.department_time && <span className="text-red-500 text-xs">{errors.department_time}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">참여자</label>
                    <input 
                      type="text" 
                      value={departmentForm.participants.join(', ')} 
                      onChange={e => handleDepartmentChange('participants', e.target.value.split(',').map(name => name.trim()).filter(name => name))} 
                      className="px-2 py-1 border rounded text-sm"
                      placeholder="참여자 이름을 입력하세요 (콤마로 여러 명 입력 가능)" 
                    />
                    

                  </form>
                </section>
              </div>
              <div className="flex-1 flex flex-col items-center mb-4">
                <h2 className="text-2xl font-bold text-orange-500 mb-2">프로젝트</h2>
                <section className="w-full bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col relative">
                  <div className="flex gap-2 absolute top-0 right-4 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setProjectForm({ 
                        projectName: '', 
                        objective: '',
                        category: '',
                        endDate: new Date().toISOString().slice(0, 10), 
                        time: new Date().toTimeString().slice(0, 5), 
                        roles: {
                          pm: 0,
                          backend: 0,
                          frontend: 0,
                          designer: 0,
                          marketer: 0,
                          sales: 0,
                          general: 0,
                          others: 0,
                        },
                        status: 'pending' 
                      })} 
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      disabled={isSubmitting}
                    >
                      삭제
                    </button>
                    <button 
                      type="button" 
                      onClick={handleProjectSave} 
                      className="px-4 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '저장 중...' : '저장'}
                    </button>
                  </div>
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">프로젝트명 *</label>
                    <input 
                      type="text" 
                      value={projectForm.projectName} 
                      onChange={e => handleProjectChange('projectName', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.project_projectName ? 'border-red-500' : ''}`}
                      placeholder="프로젝트명을 입력하세요"
                    />
                    {errors.project_projectName && <span className="text-red-500 text-xs">{errors.project_projectName}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">목적</label>
                    <textarea 
                      rows={2} 
                      value={projectForm.objective} 
                      onChange={e => handleProjectChange('objective', e.target.value)} 
                      className="px-2 py-1 border rounded text-sm"
                      placeholder="프로젝트의 목적을 입력하세요"
                    />
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                    <select value={projectForm.category} onChange={e => handleProjectChange('category', e.target.value)} className="px-2 py-1 border rounded text-sm">
                      <option value="">선택하세요</option>
                      <option value="웹">웹</option>
                      <option value="앱">앱</option>
                      <option value="AI">AI</option>
                      <option value="기타">기타</option>
                    </select>
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">종료일 *</label>
                    <input 
                      type="date" 
                      value={projectForm.endDate} 
                      onChange={e => handleProjectChange('endDate', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.project_endDate ? 'border-red-500' : ''}`}
                    />
                    {errors.project_endDate && <span className="text-red-500 text-xs">{errors.project_endDate}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">마감 시간 *</label>
                    <input 
                      type="time" 
                      value={projectForm.time} 
                      onChange={e => handleProjectChange('time', e.target.value)} 
                      className={`px-2 py-1 border rounded text-sm ${errors.project_time ? 'border-red-500' : ''}`}
                    />
                    {errors.project_time && <span className="text-red-500 text-xs">{errors.project_time}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">역할별 인원수</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">PM수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.pm} 
                          onChange={e => handleProjectChange('roles.pm', Number(e.target.value))} 
                          className="px-2 py-1 border rounded w-full text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">백엔드수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.backend} 
                          onChange={e => handleProjectChange('roles.backend', Number(e.target.value))} 
                          className="px-2 py-1 border rounded w-full text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">프론트수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.frontend} 
                          onChange={e => handleProjectChange('roles.frontend', Number(e.target.value))} 
                          className="px-2 py-1 border rounded w-full text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">디자이너수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.designer} 
                          onChange={e => handleProjectChange('roles.designer', Number(e.target.value))} 
                          className="px-2 py-1 border rounded w-full text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">마케터수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.marketer} 
                          onChange={e => handleProjectChange('roles.marketer', Number(e.target.value))} 
                          className="px-2 py-1 border rounded w-full text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">영업수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.sales} 
                          onChange={e => handleProjectChange('roles.sales', Number(e.target.value))} 
                          className="px-2 py-1 border rounded w-full text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">일반직수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.general} 
                          onChange={e => handleProjectChange('roles.general', Number(e.target.value))} 
                          className="px-2 py-1 border rounded w-full text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">기타인원수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.others} 
                          onChange={e => handleProjectChange('roles.others', Number(e.target.value))} 
                          className="px-2 py-1 border rounded w-full text-sm" 
                        />
                      </div>
                    </div>
                    

                  </form>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Toast 알림 */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
} 