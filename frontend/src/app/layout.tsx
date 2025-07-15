import type { Metadata } from 'next';
import './globals.css';
import { ToastContainer } from '@/components/Toast';

export const metadata: Metadata = {
  title: '내 일정을 부탁해',
  description: 'AI 기반 스마트 일정 관리 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard CDN */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css" />
      </head>
      <body className="font-sans">
        <div className="min-h-screen bg-secondary-50">
          {children}
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}