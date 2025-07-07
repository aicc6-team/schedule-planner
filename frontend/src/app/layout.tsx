import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from '@/components/Toast';
import AuthProvider from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-secondary-50">
            {children}
          </div>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
} 