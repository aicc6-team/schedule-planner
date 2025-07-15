import React from 'react';

interface CalendarSidebarProps {
  calendarVisibility: {
    '서민지': boolean;
    'Tasks': boolean;
    '생일': boolean;
    '대한민국의 휴일': boolean;
  };
  onToggle: (calendarType: keyof CalendarSidebarProps['calendarVisibility']) => void;
}

export default function CalendarSidebar({ calendarVisibility, onToggle }: CalendarSidebarProps) {
  return (
    <aside className="w-64 bg-white h-full flex flex-col p-4 select-none shadow-lg ml-2 border border-gray-200">
      {/* 미니 달력 자리 */}
      <div className="mb-8">
        <div className="font-bold text-gray-700 mb-2 text-sm">2025년 7월</div>
        <div className="bg-gray-50 rounded-lg p-2 text-center text-xs text-gray-400">미니 달력 자리</div>
      </div>
      {/* 내 캘린더 */}
      <div className="mb-6">
        <div className="font-bold text-gray-700 mb-2 text-xs">내 캘린더</div>
        <div className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={calendarVisibility['서민지']} onChange={() => onToggle('서민지')} className="accent-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
          <span className="text-sm text-gray-800">서민지</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={calendarVisibility['Tasks']} onChange={() => onToggle('Tasks')} className="accent-green-500" />
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          <span className="text-sm text-gray-800">Tasks</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={calendarVisibility['생일']} onChange={() => onToggle('생일')} className="accent-blue-500" />
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-sm text-gray-800">생일</span>
        </div>
      </div>
      {/* 다른 캘린더 */}
      <div>
        <div className="font-bold text-gray-700 mb-2 text-xs">다른 캘린더</div>
        <div className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={calendarVisibility['대한민국의 휴일']} onChange={() => onToggle('대한민국의 휴일')} className="accent-green-600" />
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
          <span className="text-sm text-gray-800">대한민국의 휴일</span>
        </div>
      </div>
    </aside>
  );
} 