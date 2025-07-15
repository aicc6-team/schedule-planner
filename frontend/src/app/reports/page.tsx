'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import Navigation from '@/components/Navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// 타입 정의
type StatsTable = {
  [key: string]: number | string;
};

interface ReportItem {
  id: string | number;
  reportType: 'personal' | 'department' | 'company' | 'project' | string;
  title: string;
  period: string;
  periodLabel: string;
  summary: string;
  pdfUrl: string;
  createdAt: string | { seconds: number; nanoseconds?: number };
  scheduleData: any[];
  statsTable: StatsTable;
  averageDailySchedules: number;
  completedSchedules: number;
  completionRate: number;
  totalSchedules: number;
  userId?: string;
}

const typeOptions = [
  { value: 'all', label: '전체' },
  { value: 'personal', label: '개인' },
  { value: 'department', label: '부서' },
  { value: 'company', label: '회사' },
  { value: 'project', label: '프로젝트' },
];

const reportTypeLabel: { [key: string]: string } = {
  personal: '개인 일정 분석 리포트',
  department: '부서 일정 분석 리포트',
  company: '회사 일정 분석 리포트',
  project: '프로젝트 일정 분석 리포트',
};

function formatDate(createdAt: any) {
  if (!createdAt) return '';
  if (typeof createdAt === 'string') {
    return createdAt.slice(0, 10).replace(/-/g, '.');
  }
  if (createdAt.seconds) {
    // Firestore Timestamp 객체
    const d = new Date(createdAt.seconds * 1000);
    return d.toISOString().slice(0, 10).replace(/-/g, '.');
  }
  return '';
}

// 날짜를 로컬 기준 YYYY-MM-DD로 변환하는 함수
function formatDateToLocalYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(new Date().setDate(1)), new Date()]);
  const [selectedType, setSelectedType] = useState('all');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 레포트 목록 불러오기
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [from, to] = dateRange;
        const body: any = {};
        if (from) body.from = formatDateToLocalYYYYMMDD(from);
        if (to) body.to = formatDateToLocalYYYYMMDD(to);
        if (selectedType !== 'all') {
          body.type = selectedType;
        }
        const res = await fetch('http://localhost:3001/api/analytics/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data.reports || []);
      } catch (e) {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [dateRange, selectedType]);

  // PDF 다운로드
  const handleDownload = async (pdfUrl: string) => {
    try {
      const res = await fetch('http://localhost:3001' + pdfUrl);
      if (!res.ok) throw new Error('PDF 다운로드 실패');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfUrl.split('/').pop() || 'report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert('PDF 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-secondary-900 mb-1">레포트 히스토리</h1>
          <p className="text-secondary-600 mb-6 text-sm">
            이전에 생성된 분석 레포트의 목록을 확인하고, PDF 다운로드 및 상세 요약을 볼 수 있습니다
          </p>
          {/* 필터 영역 */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2 text-sm min-w-[240px]">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <DatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                dateFormat="yyyy/MM/dd"
                className="outline-none border-none bg-transparent text-sm w-full"
                placeholderText="날짜 선택"
                isClearable
              />
            </div>
            <select
              className="border border-gray-200 rounded px-3 py-2 text-sm bg-white"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* 레포트 카드 리스트 */}
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-center text-gray-400 py-8">불러오는 중...</div>
            ) : reports.length === 0 ? (
              <div className="text-center text-gray-400 py-8">레포트가 없습니다.</div>
            ) : reports.map(report => (
              <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" fill="#e5e7eb"/><rect x="7" y="7" width="10" height="2" rx="1" fill="#a3a3a3"/><rect x="7" y="11" width="10" height="2" rx="1" fill="#a3a3a3"/><rect x="7" y="15" width="6" height="2" rx="1" fill="#a3a3a3"/></svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-secondary-900 mb-1">{reportTypeLabel[report.reportType] || '일정 분석 리포트'}</div>
                  <div className="text-xs text-gray-500 mb-1">{report.periodLabel}</div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    요약: {report.summary}
                  </div>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 border border-primary-200 rounded-lg bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100 transition ml-4"
                  onClick={() => handleDownload(report.pdfUrl)}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" fill="#e0e7ff"/><path d="M8 11h8M8 15h4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
