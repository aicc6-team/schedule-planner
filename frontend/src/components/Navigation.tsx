'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: ChartBarIcon },
  { name: '일정 관리', href: '/schedules', icon: CalendarIcon },
  { name: '일정 입력', href: '/schedules/create', icon: PlusIcon },
  { name: '캘린더', href: '/calendar', icon: CalendarDaysIcon },
  { name: '일정 충돌', href: '/conflicts', icon: ExclamationTriangleIcon },
  { name: '프로젝트', href: '/projects', icon: UserGroupIcon },
  { name: '분석', href: '/analytics', icon: ChartBarIcon },
  { name: '설정', href: '/settings', icon: Cog6ToothIcon },
];

export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* 모바일 사이드바 */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-secondary-900 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-6 border-b border-secondary-200">
            <h1 className="text-xl font-bold text-primary-600">내 일정을 부탁해</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-secondary-200 p-4">
            <div className="text-xs text-secondary-500 text-center">
              개발 모드 - 로그인 비활성화
            </div>
          </div>
        </div>
      </div>

      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-secondary-200">
          <div className="flex h-16 items-center px-6 border-b border-secondary-200">
            <h1 className="text-xl font-bold text-primary-600">내 일정을 부탁해</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-secondary-200 p-4">
            <div className="text-xs text-secondary-500 text-center">
              개발 모드 - 로그인 비활성화
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 헤더 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-secondary-200">
        <div className="flex h-16 items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-primary-600">내 일정을 부탁해</h1>
          <div className="w-6" /> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>
    </>
  );
} 