'use client';

import React from 'react';

interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  type: 'personal' | 'department' | 'project' | 'company';
  assignee?: string;
  project?: string;
  status: 'completed' | 'pending' | 'overdue';
}

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface CalendarGridProps {
  monthMatrix: CalendarCell[];
  schedules: Schedule[];
  selectedTypes: Array<'personal' | 'department' | 'company' | 'project'>;
  scheduleTypeColors: Record<string, { bg: string; text: string; border: string }>;
  onCellClick: (date: Date, schedules: Schedule[]) => void;
  onMoreClick: (date: Date, schedules: Schedule[]) => void;
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarGrid({
  monthMatrix,
  schedules,
  selectedTypes,
  scheduleTypeColors,
  onCellClick,
  onMoreClick
}: CalendarGridProps) {
  
  function getSchedulesForDate(date: Date) {
    return schedules.filter(sch => {
      const schStart = new Date(sch.startTime);
      const schEnd = new Date(sch.endTime);
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
      return schStart < nextDate && schEnd >= targetDate && selectedTypes.includes(sch.type);
    });
  }

  function isTodayCell(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }

  return (
    <>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div
        className="grid grid-cols-7 h-full w-full rounded-b-xl overflow-hidden"
        style={{ gridTemplateRows: `repeat(${monthMatrix.length / 7}, 1fr)`, height: '100%' }}
      >
        {monthMatrix.map((cell, idx) => {
          const schedulesForDate = cell.isCurrentMonth ? getSchedulesForDate(cell.date) : [];
          const showMore = schedulesForDate.length > 3;
          
          const handleCellClick = (e: React.MouseEvent) => {
            if (!cell.isCurrentMonth) return;
            onCellClick(cell.date, schedulesForDate);
          };

          return (
            <div
              key={idx}
              className={`border border-gray-100 flex flex-col h-full p-1 relative
                ${cell.isCurrentMonth ? '' : 'bg-gray-50'}
                ${cell.isCurrentMonth ? '' : 'text-gray-400'}
                ${cell.isCurrentMonth && isTodayCell(cell.date) ? 'z-10' : ''}`}
              style={{overflow: 'hidden', cursor: cell.isCurrentMonth ? 'pointer' : 'default'}}
              onClick={handleCellClick}
            >
              {/* 날짜 숫자 및 오늘 하이라이트 */}
              <div className="flex items-center gap-1 flex-shrink-0 mb-0.5">
                <span className={`inline-block w-6 h-6 text-center leading-6 font-bold text-[15px]
                  ${cell.isCurrentMonth && isTodayCell(cell.date) ? 'bg-blue-500 text-white rounded-full' : cell.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>
                  {cell.date.getDate()}
                </span>
              </div>
              
              {/* 일정 목록: 셀 높이 고정, 내부 overflow-hidden */}
              <div className="overflow-hidden flex flex-col gap-[2px]">
                {cell.isCurrentMonth && schedulesForDate.slice(0, 3).map(sch => {
                  const colors = scheduleTypeColors[sch.type] || scheduleTypeColors.personal;
                  return (
                    <div 
                      key={sch.id} 
                      className={`truncate ${colors.bg} ${colors.text} text-[11px] font-medium rounded px-1 py-0.5 cursor-pointer hover:opacity-80 transition-opacity`} 
                      style={{marginTop: '1px', marginBottom: '1px', lineHeight: '1.2'}}
                    >
                      {sch.title}
                    </div>
                  );
                })}
                
                {/* +N 버튼 */}
                {cell.isCurrentMonth && showMore && (
                  <button
                    className="text-[11px] text-blue-600 font-semibold hover:underline focus:outline-none mt-0.5"
                    onClick={e => {
                      e.stopPropagation();
                      onMoreClick(cell.date, schedulesForDate.slice(3));
                    }}
                    style={{lineHeight: '1.2'}}
                  >
                    +{schedulesForDate.length - 3}개 일정 더보기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
} 