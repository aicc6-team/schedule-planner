'use client';

import { useState } from 'react';
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

// 임시 데이터 (type: personal, department, project, company)
const mockSchedules = [
  {
    id: '1',
    title: '팀 미팅',
    description: '주간 진행상황 공유 및 다음 주 계획 수립',
    startTime: '2024-01-15T10:00:00',
    endTime: '2024-01-15T11:00:00',
    priority: 'high' as const,
    type: 'department' as const,
    assignee: '홍길동',
    project: '웹사이트 리뉴얼',
  },
  {
    id: '2',
    title: '코드 리뷰',
    description: '프론트엔드 컴포넌트 검토 및 피드백',
    startTime: '2024-01-15T14:00:00',
    endTime: '2024-01-15T15:30:00',
    priority: 'medium' as const,
    type: 'project' as const,
    assignee: '김철수',
    project: '웹사이트 리뉴얼',
  },
  {
    id: '3',
    title: '고객 미팅',
    description: '신규 프로젝트 요구사항 논의',
    startTime: '2024-01-16T09:00:00',
    endTime: '2024-01-16T10:30:00',
    priority: 'high' as const,
    type: 'company' as const,
    assignee: '이영희',
    project: '모바일 앱 개발',
  },
  {
    id: '4',
    title: '디자인 검토',
    description: 'UI/UX 디자인 피드백 및 수정사항 논의',
    startTime: '2024-01-16T13:00:00',
    endTime: '2024-01-16T14:00:00',
    priority: 'low' as const,
    type: 'personal' as const,
    assignee: '박민수',
    project: '웹사이트 리뉴얼',
  },
  {
    id: '5',
    title: '신규 서비스 기획 회의',
    description: '신규 서비스 런칭을 위한 아이디어 회의',
    startTime: '2024-12-01T10:00:00',
    endTime: '2024-12-01T12:00:00',
    priority: 'high' as const,
    type: 'department' as const,
    assignee: '최은지',
    project: '신규 서비스',
  },
  {
    id: '6',
    title: '연말 결산 보고',
    description: '2024년 연말 결산 및 내년 계획 발표',
    startTime: '2024-12-20T15:00:00',
    endTime: '2024-12-20T16:30:00',
    priority: 'medium' as const,
    type: 'company' as const,
    assignee: '이상훈',
    project: '경영관리',
  },
  {
    id: '7',
    title: '프로젝트 마감',
    description: '웹사이트 리뉴얼 프로젝트 최종 마감',
    startTime: '2024-12-31T09:00:00',
    endTime: '2024-12-31T18:00:00',
    priority: 'high' as const,
    type: 'project' as const,
    assignee: '김철수',
    project: '웹사이트 리뉴얼',
  },
  {
    id: '8',
    title: '2025년 신년 워크숍',
    description: '전사 신년 워크숍 및 팀빌딩',
    startTime: '2025-01-10T09:00:00',
    endTime: '2025-01-10T18:00:00',
    priority: 'medium' as const,
    type: 'company' as const,
    assignee: '관리자',
    project: '워크숍',
  },
  {
    id: '9',
    title: '상반기 목표 설정 회의',
    description: '2025년 상반기 부서별 목표 설정',
    startTime: '2025-01-15T14:00:00',
    endTime: '2025-01-15T16:00:00',
    priority: 'high' as const,
    type: 'department' as const,
    assignee: '부서장',
    project: '경영관리',
  },
  {
    id: '10',
    title: '신규 프로젝트 킥오프',
    description: '신규 프로젝트 시작 및 팀 소개',
    startTime: '2025-02-01T10:00:00',
    endTime: '2025-02-01T12:00:00',
    priority: 'high' as const,
    type: 'project' as const,
    assignee: '프로젝트PM',
    project: '신규 프로젝트',
  },
];

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

type Schedule = typeof mockSchedules[number] & { adjusted?: boolean };

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
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'working' | 'done'>('working');

  // 유형별 개수 요약
  const typeCounts = typeTabs.reduce((acc, tab) => {
    if (tab.value === 'all') return acc;
    acc[tab.value] = mockSchedules.filter(s => s.type === tab.value).length;
    return acc;
  }, {} as Record<string, number>);

  // 필터링
  const filteredSchedules = mockSchedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || schedule.priority === priorityFilter;
    const matchesType = typeTab === 'all' || schedule.type === typeTab;
    return matchesSearch && matchesPriority && matchesType;
  });

  // 일정 필터링 (탭별)
  const now = new Date();
  const workingSchedules = filteredSchedules.filter(s => new Date(s.endTime) >= now) as Schedule[];
  const doneSchedules = filteredSchedules.filter(s => new Date(s.endTime) < now) as Schedule[];

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

          {/* 결과 통계 */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-secondary-600">
              총 {filteredSchedules.length}개의 일정
            </p>
            <div className="flex gap-2">
              {priorityFilter !== 'all' && getPriorityBadge(priorityFilter)}
            </div>
          </div>

          {/* 탭 UI */}
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

          {/* 영역별 카드 리스트 - 탭에 따라 분기 */}
          {activeTab === 'working' ? (
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
                            <button className="text-xs text-red-500 hover:underline ml-2">삭제</button>
                            <button className="text-xs text-primary-500 hover:underline">수정</button>
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
                            <Badge variant="secondary" size="sm">완료</Badge>
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
        </div>
      </main>
    </div>
  );
} 