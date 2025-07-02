'use client';

import Navigation from '@/components/Navigation';
import ScheduleCard from '@/components/ScheduleCard';
import ProjectCard from '@/components/ProjectCard';
import StatsCard from '@/components/StatsCard';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// 임시 데이터
const mockSchedules = [
  {
    id: '1',
    title: '팀 미팅',
    description: '주간 진행상황 공유',
    startTime: '2024-01-15T10:00:00',
    endTime: '2024-01-15T11:00:00',
    priority: 'high' as const,
    type: 'team' as const,
    assignee: '홍길동',
    project: '웹사이트 리뉴얼',
  },
  {
    id: '2',
    title: '코드 리뷰',
    description: '프론트엔드 컴포넌트 검토',
    startTime: '2024-01-15T14:00:00',
    endTime: '2024-01-15T15:30:00',
    priority: 'medium' as const,
    type: 'project' as const,
    assignee: '김철수',
    project: '웹사이트 리뉴얼',
  },
];

const mockProjects = [
  {
    id: '1',
    name: '웹사이트 리뉴얼',
    description: '회사 웹사이트 디자인 및 기능 개선',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'active' as const,
    members: ['홍길동', '김철수', '이영희', '박민수'],
    progress: 65,
  },
  {
    id: '2',
    name: '모바일 앱 개발',
    description: 'iOS/Android 앱 개발 프로젝트',
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    status: 'active' as const,
    members: ['김철수', '이영희'],
    progress: 30,
  },
];

const stats = [
  { name: '오늘 일정', value: '5', icon: CalendarIcon, color: 'blue' as const },
  { name: '진행중 프로젝트', value: '3', icon: UserGroupIcon, color: 'green' as const },
  { name: '완료율', value: '78%', icon: ChartBarIcon, color: 'purple' as const },
  { name: '지연 일정', value: '2', icon: ExclamationTriangleIcon, color: 'red' as const },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">대시보드</h1>
            <p className="text-secondary-600">오늘의 일정과 프로젝트 현황을 확인하세요</p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <StatsCard
                key={stat.name}
                title={stat.name}
                value={stat.value}
                icon={<stat.icon className="h-6 w-6" />}
                color={stat.color}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 오늘의 일정 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900">오늘의 일정</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  전체보기
                </button>
              </div>
              <div className="space-y-4">
                {mockSchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    {...schedule}
                    onEdit={(id) => console.log('일정 수정:', id)}
                    onDelete={(id) => console.log('일정 삭제:', id)}
                  />
                ))}
              </div>
            </div>

            {/* 진행중인 프로젝트 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900">진행중인 프로젝트</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  전체보기
                </button>
              </div>
              <div className="space-y-4">
                {mockProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    onEdit={(id) => console.log('프로젝트 수정:', id)}
                    onDelete={(id) => console.log('프로젝트 삭제:', id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">빠른 액션</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/schedules/create')}
                className="card hover:shadow-lg transition-shadow duration-200 text-left"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-secondary-900">새 일정 추가</h3>
                    <p className="text-sm text-secondary-600">일정을 등록하세요</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/projects')}
                className="card hover:shadow-lg transition-shadow duration-200 text-left"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <UserGroupIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-secondary-900">프로젝트 생성</h3>
                    <p className="text-sm text-secondary-600">새 프로젝트를 시작하세요</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/analytics')}
                className="card hover:shadow-lg transition-shadow duration-200 text-left"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-secondary-900">분석 보기</h3>
                    <p className="text-sm text-secondary-600">일정 통계를 확인하세요</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 