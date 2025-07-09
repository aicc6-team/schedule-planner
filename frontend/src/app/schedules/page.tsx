'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ScheduleCard from '@/components/ScheduleCard';
import SearchBar from '@/components/SearchBar';
import FilterDropdown from '@/components/FilterDropdown';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import { 
  CalendarIcon, 
  PlusIcon,
  FunnelIcon,
  UserIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  BriefcaseIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';

// API 호출 함수들
const API_BASE_URL = 'http://localhost:3001';

const fetchPersonalSchedules = async (): Promise<PersonalSchedule[]> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/personal`);
  if (!response.ok) {
    throw new Error('개인 일정을 가져오는데 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

const fetchDepartmentSchedules = async (): Promise<DepartmentSchedule[]> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/department`);
  if (!response.ok) {
    throw new Error('부서 일정을 가져오는데 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

const fetchProjectSchedules = async (): Promise<ProjectSchedule[]> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/project`);
  if (!response.ok) {
    throw new Error('프로젝트 일정을 가져오는데 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};

const fetchAllSchedules = async (): Promise<{personal: PersonalSchedule[], department: DepartmentSchedule[], project: ProjectSchedule[]}> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/all`);
  if (!response.ok) {
    throw new Error('전체 일정을 가져오는데 실패했습니다.');
  }
  const result = await response.json();
  return result.data;
};



// 삭제 API 호출 함수들 추가
const deletePersonalSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/personal/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('개인 일정 삭제에 실패했습니다.');
  }
};

const deleteDepartmentSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/department/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('부서 일정 삭제에 실패했습니다.');
  }
};

const deleteProjectSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/project/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('프로젝트 일정 삭제에 실패했습니다.');
  }
};

// 완료 처리 API 호출 함수들 추가
const completePersonalSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/personal/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' })
  });
  if (!response.ok) {
    throw new Error('개인 일정 완료 처리에 실패했습니다.');
  }
};

const completeDepartmentSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/department/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' })
  });
  if (!response.ok) {
    throw new Error('부서 일정 완료 처리에 실패했습니다.');
  }
};

const completeProjectSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/schedules/project/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' })
  });
  if (!response.ok) {
    throw new Error('프로젝트 일정 완료 처리에 실패했습니다.');
  }
};

// 백엔드 데이터 타입 정의
interface PersonalSchedule {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  importance: string;
  emotion: string;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentSchedule {
  id: string;
  title: string;
  objective: string;
  date: string;
  time: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectSchedule {
  id: string;
  projectName: string;
  objective: string;
  category: string;
  endDate: string;
  time: string;
  roles: {
    pm: number;
    backend: number;
    frontend: number;
    designer: number;
    marketer: number;
    sales: number;
    general: number;
    others: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 프론트엔드에서 사용할 통합 Schedule 타입
interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  type: 'personal' | 'department' | 'project';
  assignee?: string;
  project?: string;
  adjusted?: boolean;
  status?: 'pending' | 'completed';
}

// 백엔드 데이터를 프론트엔드 Schedule 타입으로 변환하는 함수들
const transformPersonalSchedule = (personalSchedule: PersonalSchedule): Schedule => {
  const startDateTime = `${personalSchedule.date}T${personalSchedule.time}:00`;
  const endDateTime = new Date(new Date(startDateTime).getTime() + personalSchedule.durationMinutes * 60000).toISOString();
  
  return {
    id: personalSchedule.id,
    title: personalSchedule.title,
    description: personalSchedule.description,
    startTime: startDateTime,
    endTime: endDateTime,
    priority: personalSchedule.importance === '높음' ? 'high' : personalSchedule.importance === '보통' ? 'medium' : 'low',
    type: 'personal',
    assignee: '개인',
    project: '개인 일정',
    status: (personalSchedule as any).status || 'pending'
  };
};

const transformDepartmentSchedule = (departmentSchedule: DepartmentSchedule): Schedule => {
  const startDateTime = `${departmentSchedule.date}T${departmentSchedule.time}:00`;
  // 부서 일정은 보통 1시간으로 가정
  const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60000).toISOString();
  
  return {
    id: departmentSchedule.id,
    title: departmentSchedule.title,
    description: departmentSchedule.objective,
    startTime: startDateTime,
    endTime: endDateTime,
    priority: 'medium', // 부서 일정은 기본적으로 중간 우선순위
    type: 'department',
    assignee: departmentSchedule.participants[0] || '부서',
    project: '부서 일정',
    status: (departmentSchedule as any).status || 'pending'
  };
};

const transformProjectSchedule = (projectSchedule: ProjectSchedule): Schedule => {
  const startDateTime = `${projectSchedule.endDate}T${projectSchedule.time}:00`;
  // 프로젝트 일정은 마감 시간이므로 시작시간을 1시간 전으로 설정
  const startTime = new Date(new Date(startDateTime).getTime() - 60 * 60000).toISOString();
  
  return {
    id: projectSchedule.id,
    title: projectSchedule.projectName,
    description: projectSchedule.objective,
    startTime: startTime,
    endTime: startDateTime,
    priority: 'high', // 프로젝트 마감은 높은 우선순위
    type: 'project',
    assignee: 'PM',
    project: projectSchedule.projectName,
    status: (projectSchedule as any).status || 'pending'
  };
};

const transformAllSchedules = (allSchedules: {personal: PersonalSchedule[], department: DepartmentSchedule[], project: ProjectSchedule[]}): Schedule[] => {
  const transformedSchedules: Schedule[] = [];
  
  allSchedules.personal.forEach(schedule => {
    transformedSchedules.push(transformPersonalSchedule(schedule));
  });
  
  allSchedules.department.forEach(schedule => {
    transformedSchedules.push(transformDepartmentSchedule(schedule));
  });
  
  allSchedules.project.forEach(schedule => {
    transformedSchedules.push(transformProjectSchedule(schedule));
  });
  
  return transformedSchedules;
};

const typeTabs = [
  { value: 'all', label: '전체', icon: CalendarIcon },
  { value: 'personal', label: '개인', icon: UserIcon },
  { value: 'department', label: '부서', icon: BuildingOffice2Icon },
  { value: 'project', label: '프로젝트', icon: UserGroupIcon },
  { value: 'company', label: '회사', icon: BriefcaseIcon },
];

const priorityOptions = [
  { value: 'all', label: '전체' },
  { value: 'high', label: '높음' },
  { value: 'medium', label: '보통' },
  { value: 'low', label: '낮음' },
];

const areaOrder = [
  { key: 'personal', label: '개인 영역', color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
  { key: 'department', label: '부서 영역', color: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
  { key: 'company', label: '회사 영역', color: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
  { key: 'project', label: '프로젝트 영역', color: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' },
];

function getNextAvailableTime(existing: Schedule[], duration: number, startDate = '2024-01-15T08:00:00') {
  let lastEnd = new Date(startDate);
  for (const s of existing) {
    const end = new Date(s.endTime);
    if (end > lastEnd) lastEnd = end;
  }
  const nextStart = new Date(lastEnd.getTime() + 60 * 60 * 1000);
  const nextEnd = new Date(nextStart.getTime() + duration * 60 * 1000);
  return [nextStart, nextEnd];
}

export default function SchedulesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeTab, setTypeTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjusted, setAdjusted] = useState<Schedule[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'working' | 'done'>('working');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);

  // 데이터 가져오기
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allSchedules = await fetchAllSchedules();
        const transformedSchedules = transformAllSchedules(allSchedules);
        setSchedules(transformedSchedules);
        
        // 성공 토스트
        if ((window as any).showToast) {
          (window as any).showToast({
            type: 'success',
            title: '일정 로드 완료',
            message: `총 ${transformedSchedules.length}개의 일정을 불러왔습니다.`,
          });
        }
      } catch (error) {
        console.error('일정 로드 실패:', error);
        setError(error instanceof Error ? error.message : '일정을 불러오는데 실패했습니다.');
        
        // 에러 토스트
        if ((window as any).showToast) {
          (window as any).showToast({
            type: 'error',
            title: '일정 로드 실패',
            message: '일정을 불러오는데 실패했습니다. 다시 시도해주세요.',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, []);

  // 유형별 개수 요약
  const typeCounts = typeTabs.reduce((acc, tab) => {
    if (tab.value === 'all') return acc;
    acc[tab.value] = schedules.filter(s => s.type === tab.value).length;
    return acc;
  }, {} as Record<string, number>);

  // 필터링
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (schedule.description && schedule.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || schedule.priority === priorityFilter;
    const matchesType = typeTab === 'all' || schedule.type === typeTab;
    return matchesSearch && matchesPriority && matchesType;
  });

  // 일정 필터링 (탭별) - 완료 상태와 날짜 기준으로 수정
  const now = new Date();
  const workingSchedules = filteredSchedules.filter(s => 
    s.status !== 'completed' && new Date(s.endTime) >= now
  ) as Schedule[];
  const doneSchedules = filteredSchedules.filter(s => 
    s.status === 'completed' || new Date(s.endTime) < now
  ) as Schedule[];

  // 미완료 일정 판별 함수
  const isIncomplete = (schedule: Schedule) => {
    return schedule.status !== 'completed' && new Date(schedule.endTime) < now;
  };

  // 영역별 일정 분류
  const areaSchedules = areaOrder.reduce((acc, area) => {
    acc[area.key] = schedules.filter(s => s.type === area.key);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // 충돌/조정 필요 일정 찾기 (동일 시간대 2개 이상)
  function findConflicts(list: Schedule[]): Schedule[] {
    const result: Schedule[] = [];
    const sorted = [...list].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1];
      if (new Date(a.endTime) > new Date(b.startTime)) {
        result.push(a, b);
      }
    }
    return Array.from(new Set(result));
  }

  // 자동 조정 버튼 클릭 시
  async function handleAutoAdjust() {
    setIsAnalyzing(true);
    
    try {
      // AI 분석 시뮬레이션 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let toAdjust: Schedule[] = [];
      areaOrder.forEach(area => {
        const conflicts = findConflicts(areaSchedules[area.key]);
        toAdjust = toAdjust.concat(conflicts.map(s => ({ ...s, area: area.key })));
      });
      
      const adjustedList = schedules.map(s => {
        if (toAdjust.find(t => t.id === s.id)) {
          const duration = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000;
          const [newStart, newEnd] = getNextAvailableTime(schedules, duration);
          return { ...s, startTime: newStart.toISOString(), endTime: newEnd.toISOString(), adjusted: true };
        }
        return s;
      });
      
      setAdjusted(adjustedList);
      setShowAdjustModal(true);
      
      // 성공 토스트
      if ((window as any).showToast) {
        (window as any).showToast({
          type: 'success',
          title: 'AI 분석 완료',
          message: `${toAdjust.length}개의 일정 충돌을 발견하고 조정 방안을 제안했습니다.`,
        });
      }
      // 분석 완료 후 일정 충돌 페이지로 이동
      router.push('/conflicts');
    } catch (error) {
      // 에러 토스트
      if ((window as any).showToast) {
        (window as any).showToast({
          type: 'error',
          title: 'AI 분석 실패',
          message: '일정 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  // 조정 적용
  function applyAdjustment() {
    setSchedules(adjusted);
    setShowAdjustModal(false);
  }

  // 조정 취소
  function cancelAdjustment() {
    setAdjusted([]);
    setShowAdjustModal(false);
  }

  // 일정 수정 핸들러
  const handleEditSchedule = (schedule: Schedule) => {
    // 수정 모드로 create 페이지로 이동
    router.push(`/schedules/create?mode=edit&id=${schedule.id}&type=${schedule.type}`);
  };

  // 일정 삭제 핸들러
  const handleDeleteSchedule = (schedule: Schedule) => {
    setDeletingSchedule(schedule);
    setShowDeleteModal(true);
  };

  // 일정 완료 처리 핸들러
  const handleCompleteSchedule = async (schedule: Schedule) => {
    try {
      setLoading(true);
      
      // 스케줄 타입에 따라 다른 API 호출
      if (schedule.type === 'personal') {
        await completePersonalSchedule(schedule.id);
      } else if (schedule.type === 'department') {
        await completeDepartmentSchedule(schedule.id);
      } else if (schedule.type === 'project') {
        await completeProjectSchedule(schedule.id);
      }
      
      // 일정 목록 다시 로드
      const allSchedules = await fetchAllSchedules();
      const transformedSchedules = transformAllSchedules(allSchedules);
      setSchedules(transformedSchedules);
      
      // 성공 토스트
      if ((window as any).showToast) {
        (window as any).showToast({
          type: 'success',
          title: '일정 완료',
          message: '일정이 완료 처리되어 지난일정으로 이동했습니다.',
        });
      }
    } catch (error) {
      console.error('일정 완료 처리 실패:', error);
      
      // 에러 토스트
      if ((window as any).showToast) {
        (window as any).showToast({
          type: 'error',
          title: '완료 처리 실패',
          message: '일정 완료 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
    } finally {
      setLoading(false);
    }
  };



  // 일정 삭제 확인
  const confirmDeleteSchedule = async () => {
    if (!deletingSchedule) return;
    
    try {
      setLoading(true);
      
      // 스케줄 타입에 따라 다른 API 호출
      if (deletingSchedule.type === 'personal') {
        await deletePersonalSchedule(deletingSchedule.id);
      } else if (deletingSchedule.type === 'department') {
        await deleteDepartmentSchedule(deletingSchedule.id);
      } else if (deletingSchedule.type === 'project') {
        await deleteProjectSchedule(deletingSchedule.id);
      }
      
      // 일정 목록 다시 로드
      const allSchedules = await fetchAllSchedules();
      const transformedSchedules = transformAllSchedules(allSchedules);
      setSchedules(transformedSchedules);
      
      setShowDeleteModal(false);
      setDeletingSchedule(null);
      
      // 성공 토스트
      if ((window as any).showToast) {
        (window as any).showToast({
          type: 'success',
          title: '일정 삭제 완료',
          message: '일정이 성공적으로 삭제되었습니다.',
        });
      }
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      
      // 에러 토스트
      if ((window as any).showToast) {
        (window as any).showToast({
          type: 'error',
          title: '일정 삭제 실패',
          message: '일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 마감일 지난 일정 자동 완료 처리
  useEffect(() => {
    const checkExpiredSchedules = () => {
      const now = new Date();
      const expiredSchedules = schedules.filter(schedule => {
        const endTime = new Date(schedule.endTime);
        return endTime < now && !schedule.adjusted; // 아직 완료 처리되지 않은 일정만
      });
      
      if (expiredSchedules.length > 0) {
        console.log(`${expiredSchedules.length}개의 일정이 마감되었습니다.`);
        
        // 성공 토스트
        if ((window as any).showToast) {
          (window as any).showToast({
            type: 'info',
            title: '마감된 일정',
            message: `${expiredSchedules.length}개의 일정이 마감되어 지난일정으로 이동했습니다.`,
          });
        }
      }
    };
    
    // 초기 체크
    checkExpiredSchedules();
    
    // 1분마다 체크
    const interval = setInterval(checkExpiredSchedules, 60000);
    
    return () => clearInterval(interval);
  }, [schedules]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger" size="sm">높음</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">보통</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">낮음</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'team':
        return <Badge variant="primary" size="sm">팀</Badge>;
      case 'project':
        return <Badge variant="info" size="sm">프로젝트</Badge>;
      case 'client':
        return <Badge variant="purple" size="sm">고객</Badge>;
      case 'design':
        return <Badge variant="secondary" size="sm">디자인</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">일정 관리</h1>
              <p className="text-secondary-600">모든 일정을 한 곳에서 관리하세요</p>
            </div>
            <button 
              onClick={handleAutoAdjust}
              disabled={isAnalyzing}
              className={`
                flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 mt-4 sm:mt-0
                ${isAnalyzing 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                  : 'btn-primary hover:bg-primary-700'
                }
              `}
            >
              <SparklesIcon className={`h-5 w-5 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'AI 분석 중...' : 'AI 자동 분석'}
            </button>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-secondary-600">일정을 불러오고 있습니다...</span>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">오류가 발생했습니다</h3>
                  <p className="mt-1 text-sm">{error}</p>
                  <div className="mt-3">
                    <button 
                      onClick={() => window.location.reload()}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 결과 통계 */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-secondary-600">
                총 {filteredSchedules.length}개의 일정
              </p>
              <div className="flex gap-2">
                {priorityFilter !== 'all' && getPriorityBadge(priorityFilter)}
              </div>
            </div>
          )}

          {/* 탭 UI */}
          {!loading && !error && (
            <div className="flex gap-2 mb-6">
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${activeTab === 'working' ? 'border-primary-500 text-primary-700 bg-white' : 'border-transparent text-secondary-400 bg-secondary-100'}`}
                onClick={() => setActiveTab('working')}
              >
                진행일정
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${activeTab === 'done' ? 'border-primary-500 text-primary-700 bg-white' : 'border-transparent text-secondary-400 bg-secondary-100'}`}
                onClick={() => setActiveTab('done')}
              >
                지난일정
              </button>
            </div>
          )}

          {/* 영역별 카드 리스트 - 탭에 따라 분기 */}
          {!loading && !error && (
            activeTab === 'working' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {areaOrder.map(area => (
                  <div
                    key={area.key}
                    className={`rounded-xl p-4 shadow-sm border ${area.color} ${area.border}`}
                  >
                    <div className={`font-semibold mb-2 flex items-center justify-between ${area.text}`}>
                      <span>{area.label}</span>
                      <span className="text-xs font-normal">{workingSchedules.filter(s => s.type === area.key).length}개 일정</span>
                    </div>
                    {workingSchedules.filter(s => s.type === area.key).length === 0 ? (
                      <div className="text-secondary-400 text-sm py-8 text-center">일정이 없습니다</div>
                    ) : (
                      <ul className="space-y-3">
                        {workingSchedules.filter(s => s.type === area.key).map(schedule => (
                          <li key={schedule.id} className="bg-white rounded-lg p-3 shadow border border-secondary-100 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" className="accent-primary-500" />
                              <span className="font-medium text-secondary-900 flex-1">{schedule.title}</span>
                              {schedule.adjusted && <Badge variant="info" size="sm">조정 완료</Badge>}
                              {isIncomplete(schedule) && <Badge variant="danger" size="sm">미완료</Badge>}
                              <button 
                                onClick={() => handleCompleteSchedule(schedule)} 
                                className="text-xs text-green-600 hover:underline"
                              >
                                완료
                              </button>
                              <button 
                                onClick={() => handleDeleteSchedule(schedule)} 
                                className="text-xs text-red-500 hover:underline ml-2"
                              >
                                삭제
                              </button>
                              <button 
                                onClick={() => handleEditSchedule(schedule)} 
                                className="text-xs text-primary-500 hover:underline"
                              >
                                수정
                              </button>
                            </div>
                            <div className="text-xs text-secondary-600">{schedule.description}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={schedule.priority === 'high' ? 'danger' : schedule.priority === 'medium' ? 'warning' : 'success'} size="sm">
                                {schedule.priority === 'high' ? '높음' : schedule.priority === 'medium' ? '보통' : '낮음'}
                              </Badge>
                              <span className="text-xs text-secondary-400">{schedule.startTime?.slice(0, 10)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {areaOrder.map(area => (
                  <div
                    key={area.key}
                    className={`rounded-xl p-4 shadow-sm border ${area.color} ${area.border}`}
                  >
                    <div className={`font-semibold mb-2 flex items-center justify-between ${area.text}`}>
                      <span>{area.label}</span>
                      <span className="text-xs font-normal">{doneSchedules.filter(s => s.type === area.key).length}개 일정</span>
                    </div>
                    {doneSchedules.filter(s => s.type === area.key).length === 0 ? (
                      <div className="text-secondary-400 text-sm py-8 text-center">완료된 일정이 없습니다</div>
                    ) : (
                      <ul className="space-y-3">
                        {doneSchedules.filter(s => s.type === area.key).map(schedule => (
                          <li key={schedule.id} className="bg-white rounded-lg p-3 shadow border border-secondary-100 flex flex-col gap-1 opacity-60">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-secondary-900 flex-1 line-through">{schedule.title}</span>
                            </div>
                            <div className="text-xs text-secondary-400 line-through">{schedule.description}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={schedule.priority === 'high' ? 'danger' : schedule.priority === 'medium' ? 'warning' : 'success'} size="sm">
                                {schedule.priority === 'high' ? '높음' : schedule.priority === 'medium' ? '보통' : '낮음'}
                              </Badge>
                              <span className="text-xs text-secondary-400">{schedule.startTime?.slice(0, 10)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* 자동 조정 모달 */}
          <Modal isOpen={showAdjustModal} onClose={cancelAdjustment} title="AI 자동 일정 조정 결과">
            <div className="mb-4">
              <div className="font-semibold mb-2">조정 전/후 일정 비교</div>
              <ul className="space-y-2">
                {schedules.map((s, idx) => {
                  const after = adjusted.find(a => a.id === s.id);
                  if (!after || (s.startTime === after.startTime && s.endTime === after.endTime)) return null;
                  return (
                    <li key={s.id} className="text-sm">
                      <span className="font-medium">{s.title}</span> <br />
                      <span className="text-secondary-500">{s.startTime.slice(0,16).replace('T',' ')} ~ {s.endTime.slice(0,16).replace('T',' ')}</span>
                      <span className="mx-2">→</span>
                      <span className="text-primary-600">{after.startTime.slice(0,16).replace('T',' ')} ~ {after.endTime.slice(0,16).replace('T',' ')}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={cancelAdjustment}>취소</button>
              <button className="btn-primary" onClick={applyAdjustment}>적용</button>
            </div>
          </Modal>



          {/* 일정 삭제 확인 모달 */}
          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="일정 삭제">
            {deletingSchedule && (
              <div className="space-y-4">
                <div className="text-secondary-700">
                  <p>다음 일정을 삭제하시겠습니까?</p>
                  <div className="mt-2 p-3 bg-secondary-50 rounded-lg">
                    <p className="font-medium">{deletingSchedule.title}</p>
                    <p className="text-sm text-secondary-600">{deletingSchedule.description}</p>
                    <p className="text-sm text-secondary-500 mt-1">
                      {new Date(deletingSchedule.startTime).toLocaleDateString('ko-KR')} {new Date(deletingSchedule.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="mt-2 text-red-600 text-sm">이 작업은 되돌릴 수 없습니다.</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    className="btn-secondary" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    취소
                  </button>
                  <button 
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors" 
                    onClick={confirmDeleteSchedule}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
} 