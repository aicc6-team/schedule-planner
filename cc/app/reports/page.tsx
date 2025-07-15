'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('schedule');

  const reportTypes = [
    { id: 'schedule', name: '일정 분석 리포트', icon: CalendarIcon },
    { id: 'productivity', name: '생산성 분석 리포트', icon: ChartBarIcon },
    { id: 'conflicts', name: '충돌 분석 리포트', icon: ExclamationTriangleIcon },
  ];

  const periods = [
    { id: 'week', name: '주간' },
    { id: 'month', name: '월간' },
    { id: 'quarter', name: '분기' },
    { id: 'year', name: '연간' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-secondary-900">레포트</h1>
            </div>
            <p className="text-secondary-600">
              분석 결과를 보고서 형태로 확인하고 다운로드할 수 있습니다.
            </p>
          </div>

          {/* 필터 및 컨트롤 */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 리포트 타입 선택 */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  리포트 타입
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedReport(type.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                        selectedReport === type.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <type.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 기간 선택 */}
              <div className="lg:w-48">
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  기간
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 리포트 미리보기 */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">리포트 미리보기</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-600 bg-secondary-100 rounded-md hover:bg-secondary-200 transition-colors">
                  <EyeIcon className="h-4 w-4" />
                  미리보기
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-600 bg-secondary-100 rounded-md hover:bg-secondary-200 transition-colors">
                  <PrinterIcon className="h-4 w-4" />
                  인쇄
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  다운로드
                </button>
              </div>
            </div>

            {/* 목업 리포트 내용 */}
            <div className="border border-secondary-200 rounded-lg p-6 bg-secondary-50">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                  {selectedReport === 'schedule' && '일정 분석 리포트'}
                  {selectedReport === 'productivity' && '생산성 분석 리포트'}
                  {selectedReport === 'conflicts' && '충돌 분석 리포트'}
                </h3>
                <p className="text-secondary-600">
                  {periods.find(p => p.id === selectedPeriod)?.name} 리포트 • {new Date().toLocaleDateString('ko-KR')}
                </p>
              </div>

              {/* 목업 차트 및 데이터 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border border-secondary-200">
                  <h4 className="font-semibold text-secondary-900 mb-3">주요 지표</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">총 일정 수</span>
                      <span className="font-semibold">127개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">완료율</span>
                      <span className="font-semibold text-green-600">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">평균 지연일</span>
                      <span className="font-semibold text-orange-600">1.2일</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-secondary-200">
                  <h4 className="font-semibold text-secondary-900 mb-3">카테고리별 분포</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">개발</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">회의</span>
                      <span className="font-semibold">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">기획</span>
                      <span className="font-semibold">25%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 목업 차트 영역 */}
              <div className="bg-white p-6 rounded-lg border border-secondary-200">
                <h4 className="font-semibold text-secondary-900 mb-4">일정 추이</h4>
                <div className="h-64 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-secondary-500">
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">차트가 여기에 표시됩니다</p>
                    <p className="text-xs mt-1">실제 구현 시 Chart.js 또는 Recharts를 사용</p>
                  </div>
                </div>
              </div>

              {/* 요약 및 권장사항 */}
              <div className="mt-6 bg-white p-6 rounded-lg border border-secondary-200">
                <h4 className="font-semibold text-secondary-900 mb-4">요약 및 권장사항</h4>
                <div className="space-y-3 text-secondary-700">
                  <p>• 이번 {periods.find(p => p.id === selectedPeriod)?.name} 동안 전반적으로 일정 관리가 양호했습니다.</p>
                  <p>• 개발 업무 비중이 높아 효율적인 시간 배분이 필요합니다.</p>
                  <p>• 회의 시간을 20% 단축하면 생산성을 더욱 향상시킬 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 리포트 목록 */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">최근 리포트</h2>
            <div className="space-y-3">
              {[
                { name: '일정 분석 리포트', period: '월간', date: '2024-01-15', status: '완료' },
                { name: '생산성 분석 리포트', period: '주간', date: '2024-01-08', status: '완료' },
                { name: '충돌 분석 리포트', period: '월간', date: '2023-12-15', status: '완료' },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-secondary-400" />
                    <div>
                      <p className="font-medium text-secondary-900">{report.name}</p>
                      <p className="text-sm text-secondary-600">{report.period} • {report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {report.status}
                    </span>
                    <button className="text-secondary-400 hover:text-secondary-600">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 