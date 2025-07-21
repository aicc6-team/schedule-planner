'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Listbox } from '@headlessui/react';

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

// API 호출 함수들
const API_BASE_URL = 'http://localhost:3001';

const fetchPersonalSchedule = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/personal/${id}`);
  if (!response.ok) {
    throw new Error('개인 일정을 불러오는데 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

const fetchDepartmentSchedule = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/department/${id}`);
  if (!response.ok) {
    throw new Error('부서 일정을 불러오는데 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

const fetchProjectSchedule = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/project/${id}`);
  if (!response.ok) {
    throw new Error('프로젝트 일정을 불러오는데 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

// 업데이트 API 호출 함수들
const updatePersonalSchedule = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/personal/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('개인 일정 수정에 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

const updateDepartmentSchedule = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/department/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('부서 일정 수정에 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

const updateProjectSchedule = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/project/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('프로젝트 일정 수정에 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

// useSearchParams를 사용하는 컴포넌트를 분리
function ScheduleCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 파라미터 받기
  const mode = searchParams.get('mode'); // 'edit' 또는 null
  const scheduleId = searchParams.get('id');
  const scheduleType = searchParams.get('type');
  const isEditMode = mode === 'edit' && scheduleId && scheduleType;
  
  // 에러 및 알림 상태
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [isLoading, setIsLoading] = useState(!!isEditMode);

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
    hour: new Date().getHours(),
    durationHours: 1,
    importance: 'medium',
    emotion: 'normal',
    status: 'pending',
  });
  
  const [departmentForm, setDepartmentForm] = useState({
    title: '',
    objective: '',
    date: new Date().toISOString().slice(0, 10),
    hour: new Date().getHours(),
    participants: [] as string[],
    status: 'pending',
  });
  
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    objective: '',
    category: '',
    endDate: new Date().toISOString().slice(0, 10),
    hour: new Date().getHours(),
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

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      loadScheduleData();
    }
  }, [isEditMode]);

  const loadScheduleData = async () => {
    try {
      setIsLoading(true);
      
      let scheduleData;
      if (scheduleType === 'personal') {
        scheduleData = await fetchPersonalSchedule(scheduleId!);
        setPersonalForm({
          title: scheduleData.title || '',
          description: scheduleData.description || '',
          date: scheduleData.date || '',
          hour: scheduleData.time ? Number(scheduleData.time.split(':')[0]) : 0,
          durationHours: scheduleData.durationMinutes ? Math.max(1, Math.round(scheduleData.durationMinutes / 60)) : 1,
          importance: scheduleData.importance || 'medium',
          emotion: scheduleData.emotion || 'normal',
          status: scheduleData.status || 'pending',
        });
      } else if (scheduleType === 'department') {
        scheduleData = await fetchDepartmentSchedule(scheduleId!);
        setDepartmentForm({
          title: scheduleData.title || '',
          objective: scheduleData.objective || '',
          date: scheduleData.date || '',
          hour: scheduleData.time ? Number(scheduleData.time.split(':')[0]) : 0,
          participants: scheduleData.participants || [],
          status: scheduleData.status || 'pending',
        });
      } else if (scheduleType === 'project') {
        scheduleData = await fetchProjectSchedule(scheduleId!);
        setProjectForm({
          projectName: scheduleData.projectName || '',
          objective: scheduleData.objective || '',
          category: scheduleData.category || '',
          endDate: scheduleData.endDate || '',
          hour: scheduleData.time ? Number(scheduleData.time.split(':')[0]) : 0,
          roles: scheduleData.roles || { pm: 0, backend: 0, frontend: 0, designer: 0, marketer: 0, sales: 0, general: 0, others: 0 },
          status: scheduleData.status || 'pending',
        });
      }
      
      addToast({
        type: 'success',
        title: '일정 로드 완료',
        message: '기존 일정 정보를 불러왔습니다.',
      });
      
    } catch (error) {
      console.error('일정 로드 실패:', error);
      addToast({
        type: 'error',
        title: '일정 로드 실패',
        message: '기존 일정을 불러오는데 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!personalForm.hour) {
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
    if (!departmentForm.hour) {
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
    if (!projectForm.hour) {
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
      const scheduleData = {
        ...personalForm,
        time: `${personalForm.hour.toString().padStart(2, '0')}:00`,
        durationMinutes: personalForm.durationHours * 60,
        projectId: '',
        assignee: '사용자',
      };
      
      if (isEditMode && scheduleType === 'personal') {
        await updatePersonalSchedule(scheduleId!, scheduleData);
        addToast({ 
          type: 'success', 
          title: '수정 완료', 
          message: '개인 일정이 성공적으로 수정되었습니다.' 
        });
        // 수정 완료 후 일정 관리 페이지로 이동
        setTimeout(() => router.push('/schedules'), 1000);
      } else {
        await createPersonalSchedule(scheduleData);
        addToast({ 
          type: 'success', 
          title: '저장 완료', 
          message: '개인 일정이 성공적으로 저장되었습니다.' 
        });
      }
      // 폼 초기화
      setPersonalForm({
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        hour: new Date().getHours(),
        durationHours: 1,
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
      const scheduleData = {
        ...departmentForm,
        time: `${departmentForm.hour.toString().padStart(2, '0')}:00`,
        department: '',
        projectId: '',
        organizer: '관리자',
      };
      
      if (isEditMode && scheduleType === 'department') {
        await updateDepartmentSchedule(scheduleId!, scheduleData);
        addToast({ 
          type: 'success', 
          title: '수정 완료', 
          message: '부서 일정이 성공적으로 수정되었습니다.' 
        });
        // 수정 완료 후 일정 관리 페이지로 이동
        setTimeout(() => router.push('/schedules'), 1000);
      } else {
        await createDepartmentSchedule(scheduleData);
        addToast({ 
          type: 'success', 
          title: '저장 완료', 
          message: '부서 일정이 성공적으로 저장되었습니다.' 
        });
      }
      // 폼 초기화
      setDepartmentForm({
        title: '',
        objective: '',
        date: new Date().toISOString().slice(0, 10),
        hour: new Date().getHours(),
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
      const scheduleData = {
        ...projectForm,
        time: `${projectForm.hour.toString().padStart(2, '0')}:00`,
        projectId: '',
        startDate: projectForm.endDate,
        participants: [],
      };
      
      if (isEditMode && scheduleType === 'project') {
        await updateProjectSchedule(scheduleId!, scheduleData);
        addToast({ 
          type: 'success', 
          title: '수정 완료', 
          message: '프로젝트 일정이 성공적으로 수정되었습니다.' 
        });
        // 수정 완료 후 일정 관리 페이지로 이동
        setTimeout(() => router.push('/schedules'), 1000);
      } else {
        await createProjectSchedule(scheduleData);
        addToast({ 
          type: 'success', 
          title: '저장 완료', 
          message: '프로젝트 일정이 성공적으로 저장되었습니다.' 
        });
      }
      // 폼 초기화
      setProjectForm({
        projectName: '',
        objective: '',
        category: '',
        endDate: new Date().toISOString().slice(0, 10),
        hour: new Date().getHours(),
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
        <div className="p-8">
          <header className="flex items-center justify-between pb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900">{isEditMode ? '일정 수정' : '새 일정 추가'}</h3>
              <p className="text-slate-600 mt-1">{isEditMode ? '기존 일정을 수정하고 관리하세요' : '새로운 일정을 등록하고 관리하세요'}</p>
            </div>
          </header>
        </div>
        
        <div className="p-8">
          {isLoading ? (
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-secondary-600">일정 정보를 불러오고 있습니다...</span>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 flex flex-col items-center mb-4">
                <div className="w-full flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-blue-600 m-0 text-left">개인</h2>
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setPersonalForm({ 
                        title: '', 
                        description: '',
                        date: new Date().toISOString().slice(0, 10), 
                        hour: new Date().getHours(),
                        durationHours: 1,
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
                </div>
                <section className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col relative">
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">제목 *</label>
                    <input 
                      type="text" 
                      value={personalForm.title} 
                      onChange={e => handlePersonalChange('title', e.target.value)} 
                      className={`w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none ${errors.personal_title ? 'border-red-500' : ''}`}
                      placeholder="일정 제목을 입력하세요"
                    />
                    {errors.personal_title && <span className="text-red-500 text-xs">{errors.personal_title}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">설명</label>
                    <textarea 
                      rows={2} 
                      value={personalForm.description} 
                      onChange={e => handlePersonalChange('description', e.target.value)} 
                      className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none"
                      placeholder="일정에 대한 설명을 입력하세요"
                    />
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">날짜 *</label>
                    <input 
                      type="date" 
                      value={personalForm.date} 
                      onChange={e => handlePersonalChange('date', e.target.value)} 
                      className={`w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none ${errors.personal_date ? 'border-red-500' : ''}`}
                    />
                    {errors.personal_date && <span className="text-red-500 text-xs">{errors.personal_date}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">시간 *</label>
                    <Listbox value={personalForm.hour} onChange={v => handlePersonalChange('hour', v)}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none">
                          {personalForm.hour}시
                        </Listbox.Button>
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                          {Array.from({ length: 24 }, (_, i) => (
                            <Listbox.Option key={i} value={i} className={({ active }) => `cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`}>{i}시</Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                    {errors.personal_time && <span className="text-red-500 text-xs">{errors.personal_time}</span>}
                    <div className="flex flex-row items-start mb-1">
                      <label className="block text-xs font-semibold text-slate-700 mt-2 flex-1">소요시간(시간)</label>
                      <span className="block text-sm font-medium text-blue-700 text-right flex-none mt-2">{personalForm.durationHours}시간</span>
                    </div>
                    <input type="range" min={1} max={24} value={personalForm.durationHours} onChange={e => handlePersonalChange('durationHours', Number(e.target.value))} className="w-full accent-blue-600" />
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">중요도</label>
                    <select value={personalForm.importance} onChange={e => handlePersonalChange('importance', e.target.value)} className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none">
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                    </select>
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">감정상태</label>
                    <select value={personalForm.emotion} onChange={e => handlePersonalChange('emotion', e.target.value)} className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none">
                      <option value="happy">기쁨</option>
                      <option value="normal">보통</option>
                      <option value="sad">슬픔</option>
                      <option value="angry">화남</option>
                    </select>
                    

                  </form>
                </section>
              </div>
              <div className="flex-1 flex flex-col items-center mb-4">
                <div className="w-full flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-green-600 m-0 text-left">부서</h2>
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setDepartmentForm({ 
                        title: '', 
                        objective: '',
                        date: new Date().toISOString().slice(0, 10), 
                        hour: new Date().getHours(),
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
                </div>
                <section className="w-full bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col relative">
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">제목 *</label>
                    <input 
                      type="text" 
                      value={departmentForm.title} 
                      onChange={e => handleDepartmentChange('title', e.target.value)} 
                      className={`w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none ${errors.department_title ? 'border-red-500' : ''}`}
                      placeholder="부서 일정 제목을 입력하세요"
                    />
                    {errors.department_title && <span className="text-red-500 text-xs">{errors.department_title}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">목적</label>
                    <textarea 
                      rows={2} 
                      value={departmentForm.objective} 
                      onChange={e => handleDepartmentChange('objective', e.target.value)} 
                      className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none"
                      placeholder="부서 일정의 목적을 입력하세요"
                    />
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">날짜 *</label>
                    <input 
                      type="date" 
                      value={departmentForm.date} 
                      onChange={e => handleDepartmentChange('date', e.target.value)} 
                      className={`w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none ${errors.department_date ? 'border-red-500' : ''}`}
                    />
                    {errors.department_date && <span className="text-red-500 text-xs">{errors.department_date}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">시간 *</label>
                    <Listbox value={departmentForm.hour} onChange={v => handleDepartmentChange('hour', v)}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none">
                          {departmentForm.hour}시
                        </Listbox.Button>
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                          {Array.from({ length: 24 }, (_, i) => (
                            <Listbox.Option key={i} value={i} className={({ active }) => `cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-green-100 text-green-900' : 'text-gray-900'}`}>{i}시</Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">참여자</label>
                    <input 
                      type="text" 
                      value={departmentForm.participants.join(', ')} 
                      onChange={e => handleDepartmentChange('participants', e.target.value.split(',').map(name => name.trim()).filter(name => name))} 
                      className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none"
                      placeholder="참여자 이름을 입력하세요 (콤마로 여러 명 입력 가능)" 
                    />
                  </form>
                </section>
              </div>
              <div className="flex-1 flex flex-col items-center mb-4">
                <div className="w-full flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-orange-500 m-0 text-left">프로젝트</h2>
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setProjectForm({ 
                        projectName: '', 
                        objective: '',
                        category: '',
                        endDate: new Date().toISOString().slice(0, 10), 
                        hour: new Date().getHours(),
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
                </div>
                <section className="w-full bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col relative">
                  <form className="flex-1 flex flex-col gap-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">프로젝트명 *</label>
                    <input 
                      type="text" 
                      value={projectForm.projectName} 
                      onChange={e => handleProjectChange('projectName', e.target.value)} 
                      className={`w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none ${errors.project_projectName ? 'border-red-500' : ''}`}
                      placeholder="프로젝트명을 입력하세요"
                    />
                    {errors.project_projectName && <span className="text-red-500 text-xs">{errors.project_projectName}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">목적</label>
                    <textarea 
                      rows={2} 
                      value={projectForm.objective} 
                      onChange={e => handleProjectChange('objective', e.target.value)} 
                      className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none"
                      placeholder="프로젝트의 목적을 입력하세요"
                    />
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                    <select value={projectForm.category} onChange={e => handleProjectChange('category', e.target.value)} className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none">
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
                      className={`w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none ${errors.project_endDate ? 'border-red-500' : ''}`}
                    />
                    {errors.project_endDate && <span className="text-red-500 text-xs">{errors.project_endDate}</span>}
                    
                    <label className="block text-xs font-semibold text-slate-700 mb-1">마감 시간 *</label>
                    <Listbox value={projectForm.hour} onChange={v => handleProjectChange('hour', v)}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none">
                          {projectForm.hour}시
                        </Listbox.Button>
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                          {Array.from({ length: 24 }, (_, i) => (
                            <Listbox.Option key={i} value={i} className={({ active }) => `cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'}`}>{i}시</Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">역할별 인원수</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">PM수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.pm} 
                          onChange={e => handleProjectChange('roles.pm', Number(e.target.value))} 
                          className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">백엔드수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.backend} 
                          onChange={e => handleProjectChange('roles.backend', Number(e.target.value))} 
                          className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">프론트수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.frontend} 
                          onChange={e => handleProjectChange('roles.frontend', Number(e.target.value))} 
                          className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">디자이너수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.designer} 
                          onChange={e => handleProjectChange('roles.designer', Number(e.target.value))} 
                          className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">마케터수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.marketer} 
                          onChange={e => handleProjectChange('roles.marketer', Number(e.target.value))} 
                          className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">영업수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.sales} 
                          onChange={e => handleProjectChange('roles.sales', Number(e.target.value))} 
                          className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">일반직수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.general} 
                          onChange={e => handleProjectChange('roles.general', Number(e.target.value))} 
                          className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">기타인원수</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={projectForm.roles.others} 
                          onChange={e => handleProjectChange('roles.others', Number(e.target.value))} 
                          className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none" 
                        />
                      </div>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </div>
          )}
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

export default function ScheduleCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScheduleCreateContent />
    </Suspense>
  );
} 