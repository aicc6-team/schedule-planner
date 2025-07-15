import React from 'react';
import Navigation from '@/components/Navigation';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="flex justify-center items-center w-full h-screen">
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
      </main>
    </div>
  );
} 