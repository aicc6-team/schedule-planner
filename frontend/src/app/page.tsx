'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 개발 중에는 로그인 없이 바로 일정 관리 페이지로 이동
    router.push('/schedules');
  }, [router]);

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-secondary-600">로딩 중...</p>
      </div>
      {/* Animation CSS (for fade-in, slide-up) */}
      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1.2s ease; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 1.2s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
} 