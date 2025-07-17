import React from 'react';

interface CalendarHeaderProps {
  currentDate: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: string) => void;
  currentView: string;
}

export default function CalendarHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  currentView
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      {/* 왼쪽: 캘린더 제목 + 오늘 버튼 */}
      <div className="w-1/4 flex-shrink-0 flex flex-col justify-center pl-4">
        <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">캘린더</h3>
        <button className="bg-primary-600 text-white rounded px-2 py-1 text-sm font-bold shadow hover:bg-primary-700 transition w-fit" onClick={onToday}>오늘</button>
      </div>
      {/* 가운데: 년월 네비게이션만 */}
      <div className="w-1/2 flex items-center justify-center gap-2">
        <button className="rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm" onClick={onPrev}>&lt;</button>
        <span className="mx-2 text-2xl font-bold text-gray-800">{currentDate}</span>
        <button className="rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm" onClick={onNext}>&gt;</button>
      </div>
      {/* 오른쪽: 빈 공간 (필터/버튼은 캘린더 페이지에서 별도 처리) */}
      <div className="w-1/4 flex items-center justify-end pr-4">
      </div>
    </div>
  );
} 