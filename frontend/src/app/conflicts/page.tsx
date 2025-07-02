'use client';

import Navigation from '@/components/Navigation';
import { CalendarIcon, ExclamationTriangleIcon, ArrowRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// mock 충돌 일정 데이터
const conflictSchedules = [
  {
    id: '1',
    title: '팀 미팅',
    time: '2024-06-10 10:00~11:00',
    desc: '주간 팀 미팅',
  },
  {
    id: '2',
    title: '프로젝트 리뷰',
    time: '2024-06-10 10:30~11:30',
    desc: '웹사이트 리뉴얼 리뷰',
  },
  {
    id: '3',
    title: '고객 미팅',
    time: '2024-06-12 14:00~15:00',
    desc: '신규 고객사 미팅',
  },
  {
    id: '4',
    title: '디자인 회의',
    time: '2024-06-15 09:00~10:00',
    desc: 'UI/UX 디자인 논의',
  },
  {
    id: '5',
    title: '개발 스크럼',
    time: '2024-06-15 09:30~10:30',
    desc: '일일 개발 스크럼',
  },
];

// mock 캘린더 일정 데이터
const calendarSchedules = [
  { date: 3, title: '팀 미팅' },
  { date: 10, title: '프로젝트 리뷰' },
  { date: 15, title: '고객 미팅' },
];

const rowCardColors = [
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-pink-200',
];

function renderCalendar(year: number, month: number) {
  // month: 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const weeks: number[][] = [];
  let week: number[] = [];
  let day = 1 - startDay;
  while (day <= daysInMonth) {
    week = [];
    for (let i = 0; i < 7; i++, day++) {
      week.push(day > 0 && day <= daysInMonth ? day : 0);
    }
    weeks.push(week);
  }
  return weeks;
}

export default function ConflictsPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const weeks = renderCalendar(year, month);
  const router = useRouter();

  // 하단: 2주치 시간표 캘린더 (한 줄에 한 주씩)
  const todayDate = new Date();
  const getWeekDates = (start: Date) => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const week1Start = new Date(todayDate);
  const week2Start = new Date(todayDate);
  week2Start.setDate(week2Start.getDate() + 7);
  const week1 = getWeekDates(week1Start);
  const week2 = getWeekDates(week2Start);
  const hours = Array.from({ length: 10 }).map((_, i) => 9 + i); // 9~18시
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">일정 충돌</h1>
            <button
              onClick={() => router.push('/schedules')}
              className="btn-secondary flex items-center gap-1 px-4 py-2 text-sm"
            >
              일정관리
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 상단 좌측: 충돌 일정 리스트 */}
            <div className="card min-h-[200px] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <span className="text-lg font-semibold text-secondary-800">충돌 일정</span>
              </div>
              {/* 2열 그리드: 각 열을 테두리 박스로 감쌈 */}
              <div className="flex flex-col gap-3">
                {Array.from({ length: Math.ceil(conflictSchedules.length / 2) }).map((_, rowIdx) => (
                  <div key={rowIdx} className="flex gap-3">
                    {conflictSchedules.slice(rowIdx * 2, rowIdx * 2 + 2).map(item => (
                      <div key={item.id} className={`flex-1 rounded-lg shadow-sm border p-3 relative ${rowCardColors[rowIdx % rowCardColors.length]}`}>
                        <button
                          className="absolute top-2 right-2 p-1 rounded hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition"
                          style={{ fontSize: 0 }}
                          onClick={() => alert('수정 기능 준비중')}
                          title="수정"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <div className="font-medium text-secondary-900">{item.title}</div>
                        <div className="text-xs text-secondary-700">{item.time}</div>
                        <div className="text-xs text-secondary-800">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* 상단 우측: AI 분석 결과 메시지 */}
            <div className="card min-h-[200px] flex flex-col justify-start items-start text-left">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-primary-500" />
                <span className="text-lg font-semibold text-secondary-800">AI 자동 분석 결과</span>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center w-full">
                <div className="text-secondary-700 text-center w-full">
                  총 <span className="font-bold text-primary-600">5건</span>의 일정 충돌이 발견되었습니다.<br />
                  AI가 자동으로 충돌 원인과 조정 방안을 분석하여 아래와 같이 제안합니다.<br />
                  각 일정의 우선순위, 시간대, 참여자 정보를 종합적으로 고려하였으며,<br />
                  최적의 일정 배치를 위해 일부 일정의 시간이 자동으로 조정될 수 있습니다.<br />
                  조정 결과를 확인하고 필요시 직접 수정하실 수 있습니다.
                </div>
              </div>
            </div>
          </div>
          {/* 하단: 2주치 시간표 캘린더 (한 줄에 한 주씩) */}
          <div className="card min-h-[200px] p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary-500" />
              <span className="font-semibold text-secondary-900">2주간 시간표</span>
            </div>
            <div className="overflow-x-auto space-y-8">
              {[week1, week2].map((week, wIdx) => (
                <div key={wIdx}>
                  <div className="mb-1 flex">
                    <div className="w-14" />
                    {week.map((d, idx) => {
                      const isToday = d.toDateString() === todayDate.toDateString();
                      return (
                        <div
                          key={idx}
                          className={`flex-1 flex flex-col items-center justify-center px-1 py-1 border rounded-lg mx-0.5
                            ${wIdx === 0 ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}
                            ${isToday ? 'bg-primary-100 border-primary-300 text-primary-700 shadow font-bold' : ''}
                          `}
                          style={{ minWidth: 0 }}
                        >
                          <span className="flex items-center gap-1">
                            <span className="text-base font-semibold leading-tight">{d.getMonth() + 1}/{d.getDate()}</span>
                            <span className="text-[11px] text-slate-400">{dayNames[d.getDay()]}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    {hours.map(hour => (
                      <div key={hour} className="flex border-b last:border-b-0">
                        <div className="w-14 text-xs font-semibold text-slate-500 py-1 text-right pr-2 bg-slate-50">{hour}:00</div>
                        {week.map((_, idx) => (
                          <div key={idx} className="flex-1 border-l min-w-[60px] h-8 bg-white"></div>
                        ))}
                      </div>
                    ))}
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