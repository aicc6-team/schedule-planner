import React from 'react';

export default function CalendarPage() {
  return (
    <div
      className="flex justify-center items-center w-full h-screen"
      style={{ marginLeft: '128px' }}
    >
      <iframe
        src="https://calendar.google.com/calendar/embed?src=alswlalswl1592%40gmail.com&ctz=Asia%2FSeoul"
        style={{ border: 0 }}
        width="1000"
        height="750"
        frameBorder="0"
        scrolling="no"
        title="Google Calendar"
      ></iframe>
    </div>
  );
} 