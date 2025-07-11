"use client";

import Navigation from '@/components/Navigation';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavigationPaths = ["/", "/login", "/signup"];
  const showNavigation = !hideNavigationPaths.includes(pathname);

  return (
    <div className="flex min-h-screen bg-secondary-50">
      {showNavigation && <Navigation />}
      <main className="flex-1">{children}</main>
    </div>
  );
} 