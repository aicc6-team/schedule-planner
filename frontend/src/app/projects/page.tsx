'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import ProjectCard from '@/components/ProjectCard';
import SearchBar from '@/components/SearchBar';
import FilterDropdown from '@/components/FilterDropdown';
import EmptyState from '@/components/EmptyState';
import ProgressBar from '@/components/ProgressBar';
import Badge from '@/components/Badge';
import { 
  UserGroupIcon, 
  PlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// 임시 데이터
const mockProjects = [
  {
    id: '1',
    name: '웹사이트 리뉴얼',
    description: '회사 웹사이트 디자인 및 기능 개선 프로젝트',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'active' as const,
    members: ['홍길동', '김철수', '이영희', '박민수'],
    progress: 65,
  },
  {
    id: '2',
    name: '모바일 앱 개발',
    description: 'iOS/Android 크로스 플랫폼 앱 개발',
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    status: 'active' as const,
    members: ['김철수', '이영희'],
    progress: 30,
  },
  {
    id: '3',
    name: '데이터베이스 마이그레이션',
    description: '기존 시스템 데이터베이스 업그레이드',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    status: 'completed' as const,
    members: ['박민수', '홍길동'],
    progress: 100,
  },
  {
    id: '4',
    name: '보안 강화 프로젝트',
    description: '시스템 보안 취약점 점검 및 개선',
    startDate: '2024-03-01',
    endDate: '2024-04-30',
    status: 'planning' as const,
    members: ['이영희', '김철수', '박민수'],
    progress: 0,
  },
];

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'planning', label: '기획' },
  { value: 'active', label: '진행중' },
  { value: 'completed', label: '완료' },
  { value: 'on-hold', label: '보류' },
];

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="warning" size="sm">기획</Badge>;
      case 'active':
        return <Badge variant="success" size="sm">진행중</Badge>;
      case 'completed':
        return <Badge variant="info" size="sm">완료</Badge>;
      case 'on-hold':
        return <Badge variant="secondary" size="sm">보류</Badge>;
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">프로젝트 관리</h1>
              <p className="text-secondary-600">모든 프로젝트를 한 곳에서 관리하세요</p>
            </div>
            <button className="btn-primary mt-4 sm:mt-0">
              <PlusIcon className="h-5 w-5 mr-2" />
              새 프로젝트
            </button>
          </div>

          {/* 검색 및 필터 */}
          <div className="card mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="프로젝트명 또는 설명으로 검색..."
                />
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary"
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  필터
                </button>
              </div>
            </div>

            {/* 필터 옵션 */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FilterDropdown
                    label="상태"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 결과 통계 */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-secondary-600">
              총 {filteredProjects.length}개의 프로젝트
            </p>
            <div className="flex gap-2">
              {statusFilter !== 'all' && getStatusBadge(statusFilter)}
            </div>
          </div>

          {/* 프로젝트 목록 */}
          {filteredProjects.length > 0 ? (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="card">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {project.name}
                          </h3>
                          <p className="text-secondary-600 mt-1">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-secondary-600">시작일</p>
                          <p className="font-medium">{project.startDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-600">종료일</p>
                          <p className="font-medium">{project.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-600">팀원</p>
                          <p className="font-medium">{project.members.length}명</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-secondary-600 mb-1">
                          <span>진행률</span>
                          <span>{project.progress}%</span>
                        </div>
                        <ProgressBar 
                          progress={project.progress} 
                          color={getProgressColor(project.progress) as any}
                          showPercentage={false}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="h-4 w-4 text-secondary-400" />
                        <div className="flex flex-wrap gap-1">
                          {project.members.map((member, index) => (
                            <span 
                              key={index}
                              className="text-sm text-secondary-600"
                            >
                              {member}{index < project.members.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => console.log('프로젝트 수정:', project.id)}
                        className="btn-secondary"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => console.log('프로젝트 삭제:', project.id)}
                        className="btn-danger"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<UserGroupIcon className="h-12 w-12" />}
              title="프로젝트가 없습니다"
              description="새로운 프로젝트를 생성하여 시작해보세요"
              action={{
                label: "프로젝트 생성하기",
                onClick: () => console.log('새 프로젝트 생성')
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
} 