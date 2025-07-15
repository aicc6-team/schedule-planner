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
      <div className="flex items-center gap-2">
        <button className="bg-primary-600 text-white rounded px-3 py-1 font-bold shadow hover:bg-primary-700 transition" onClick={onToday}>오늘</button>
        <button className="rounded p-1 hover:bg-gray-100" onClick={onPrev}>&lt;</button>
        <button className="rounded p-1 hover:bg-gray-100" onClick={onNext}>&gt;</button>
        <span className="ml-4 text-xl font-bold text-gray-800">{currentDate}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded ${currentView === 'dayGridMonth' ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
          onClick={() => onViewChange('dayGridMonth')}
        >월</button>
        <button
          className={`px-3 py-1 rounded ${currentView === 'timeGridWeek' ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
          onClick={() => onViewChange('timeGridWeek')}
        >주</button>
        <button
          className={`px-3 py-1 rounded ${currentView === 'timeGridDay' ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
          onClick={() => onViewChange('timeGridDay')}
        >일</button>
        <button className="ml-4 bg-blue-600 text-white rounded px-4 py-1 font-bold shadow hover:bg-blue-700 transition">+ 만들기</button>
      </div>
    </div>
  );
} 