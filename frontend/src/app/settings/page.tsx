'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { 
  UserIcon,
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  CalendarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const settingsSections = [
  {
    id: 'profile',
    title: '프로필 설정',
    icon: UserIcon,
    description: '개인 정보 및 계정 설정',
  },
  {
    id: 'notifications',
    title: '알림 설정',
    icon: BellIcon,
    description: '알림 및 리마인더 설정',
  },
  {
    id: 'calendar',
    title: '캘린더 연동',
    icon: CalendarIcon,
    description: 'Google Calendar 연동 설정',
  },
  {
    id: 'security',
    title: '보안 설정',
    icon: ShieldCheckIcon,
    description: '비밀번호 및 보안 설정',
  },
  {
    id: 'preferences',
    title: '환경설정',
    icon: CogIcon,
    description: '앱 사용 환경 설정',
  },
  {
    id: 'language',
    title: '언어 설정',
    icon: GlobeAltIcon,
    description: '언어 및 지역 설정',
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '홍길동',
    email: 'hong@example.com',
    company: '테크스타트업',
    department: '개발팀',
    position: '시니어 개발자',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    reminderTime: '30',
    dailyDigest: true,
    weeklyReport: true,
  });

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">개인 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              이름
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              className="input-field"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              회사
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.company}
              onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              부서
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.department}
              onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              직책
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.position}
              onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="btn-primary">저장</button>
      </div>
    </div>
  );

  const renderNotificationSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">알림 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-secondary-900">이메일 알림</h4>
              <p className="text-sm text-secondary-600">중요한 일정 및 업데이트를 이메일로 받습니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  emailNotifications: e.target.checked
                })}
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-secondary-900">푸시 알림</h4>
              <p className="text-sm text-secondary-600">브라우저 푸시 알림을 받습니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  pushNotifications: e.target.checked
                })}
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-secondary-900">일일 요약</h4>
              <p className="text-sm text-secondary-600">매일 오늘의 일정 요약을 받습니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.dailyDigest}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  dailyDigest: e.target.checked
                })}
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              리마인더 시간 (분)
            </label>
            <select
              className="input-field"
              value={notificationSettings.reminderTime}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                reminderTime: e.target.value
              })}
            >
              <option value="15">15분 전</option>
              <option value="30">30분 전</option>
              <option value="60">1시간 전</option>
              <option value="1440">1일 전</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="btn-primary">저장</button>
      </div>
    </div>
  );

  const renderCalendarSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Google Calendar 연동</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
            <div>
              <h4 className="font-medium text-secondary-900">Google Calendar</h4>
              <p className="text-sm text-secondary-600">Google Calendar와 일정을 동기화합니다</p>
            </div>
            <button className="btn-primary">연동하기</button>
          </div>
          
          <div className="bg-secondary-50 p-4 rounded-lg">
            <h4 className="font-medium text-secondary-900 mb-2">연동 상태</h4>
            <p className="text-sm text-secondary-600">현재 Google Calendar와 연동되지 않았습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationSection();
      case 'calendar':
        return renderCalendarSection();
      default:
        return (
          <div className="text-center py-12">
            <p className="text-secondary-600">설정을 선택해주세요</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">설정</h1>
            <p className="text-secondary-600">계정 및 앱 설정을 관리하세요</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 사이드바 */}
            <div className="lg:col-span-1">
              <div className="card">
                <nav className="space-y-2">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeSection === section.id
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">{section.title}</div>
                          <div className="text-xs text-secondary-500">{section.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-3">
              <div className="card">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 