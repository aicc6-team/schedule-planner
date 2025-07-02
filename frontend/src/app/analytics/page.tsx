'use client';

import Navigation from '@/components/Navigation';
import StatsCard from '@/components/StatsCard';
import ProgressBar from '@/components/ProgressBar';
import Badge from '@/components/Badge';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

// 임시 데이터
const stats = [
  { 
    name: '전체 일정', 
    value: '24', 
    icon: CalendarIcon, 
    color: 'blue' as const,
    change: { value: 12, isPositive: true }
  },
  { 
    name: '완료된 일정', 
    value: '18', 
    icon: CheckCircleIcon, 
    color: 'green' as const,
    change: { value: 8, isPositive: true }
  },
  { 
    name: '진행중 프로젝트', 
    value: '3', 
    icon: UserGroupIcon, 
    color: 'purple' as const,
    change: { value: 0, isPositive: true }
  },
  { 
    name: '지연 일정', 
    value: '2', 
    icon: ExclamationTriangleIcon, 
    color: 'red' as const,
    change: { value: 1, isPositive: false }
  },
];

const projectProgress = [
  { name: '웹사이트 리뉴얼', progress: 65, status: 'active' },
  { name: '모바일 앱 개발', progress: 30, status: 'active' },
  { name: '데이터베이스 마이그레이션', progress: 100, status: 'completed' },
  { name: '보안 강화 프로젝트', progress: 0, status: 'planning' },
];

const scheduleByType = [
  { type: '팀 미팅', count: 8, percentage: 33 },
  { type: '프로젝트', count: 6, percentage: 25 },
  { type: '고객 미팅', count: 4, percentage: 17 },
  { type: '디자인', count: 3, percentage: 12 },
  { type: '개인', count: 3, percentage: 12 },
];

const scheduleByPriority = [
  { priority: '높음', count: 5, percentage: 21 },
  { priority: '보통', count: 12, percentage: 50 },
  { priority: '낮음', count: 7, percentage: 29 },
];

export default function AnalyticsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="warning" size="sm">기획</Badge>;
      case 'active':
        return <Badge variant="success" size="sm">진행중</Badge>;
      case 'completed':
        return <Badge variant="info" size="sm">완료</Badge>;
      default:
        return null;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'green';
    if (progress >= 50) return 'primary';
    if (progress >= 20) return 'yellow';
    return 'red';
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">분석</h1>
            <p className="text-secondary-600">일정과 프로젝트 현황을 분석해보세요</p>
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
                change={stat.change}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 프로젝트 진행률 */}
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">프로젝트 진행률</h2>
              <div className="space-y-4">
                {projectProgress.map((project) => (
                  <div key={project.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-secondary-900 min-w-0 flex-1">
                        {project.name}
                      </span>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <ProgressBar 
                          progress={project.progress} 
                          color={getProgressColor(project.progress) as any}
                          showPercentage={false}
                        />
                      </div>
                      <span className="text-sm font-medium text-secondary-900 w-12 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 일정 유형별 분포 */}
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">일정 유형별 분포</h2>
              <div className="space-y-3">
                {scheduleByType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-sm text-secondary-900">{item.type}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <ProgressBar 
                          progress={item.percentage} 
                          color="primary"
                          showPercentage={false}
                        />
                      </div>
                      <span className="text-sm font-medium text-secondary-900 w-16 text-right">
                        {item.count}개 ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 우선순위별 분포 */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">우선순위별 분포</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {scheduleByPriority.map((item) => (
                  <div key={item.priority} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {item.priority === '높음' && (
                        <Badge variant="danger" size="lg">{item.priority}</Badge>
                      )}
                      {item.priority === '보통' && (
                        <Badge variant="warning" size="lg">{item.priority}</Badge>
                      )}
                      {item.priority === '낮음' && (
                        <Badge variant="success" size="lg">{item.priority}</Badge>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-secondary-900 mb-1">
                      {item.count}개
                    </div>
                    <div className="text-sm text-secondary-600">
                      전체의 {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 월별 트렌드 */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">월별 일정 트렌드</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { month: '1월', completed: 15, total: 20, trend: 'up' },
                  { month: '2월', completed: 18, total: 22, trend: 'up' },
                  { month: '3월', completed: 12, total: 18, trend: 'down' },
                  { month: '4월', completed: 8, total: 15, trend: 'up' },
                ].map((item) => (
                  <div key={item.month} className="text-center p-4 border border-secondary-200 rounded-lg">
                    <div className="text-lg font-semibold text-secondary-900 mb-2">
                      {item.month}
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-secondary-900">
                        {item.completed}
                      </span>
                      <span className="text-secondary-600">/ {item.total}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {item.trend === 'up' ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.trend === 'up' ? '증가' : '감소'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 