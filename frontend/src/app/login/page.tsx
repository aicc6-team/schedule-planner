'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 로그인 로직 구현
    console.log('로그인 시도:', { email, password });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false
      });
      
      if (result?.error) {
        console.error('로그인 에러:', result.error);
        // TODO: 에러 토스트 표시
      }
    } catch (error) {
      console.error('로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이거나 이미 로그인된 경우 로딩 상태 표시
  if (status === 'loading' || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-600">
            내 일정을 부탁해
          </h2>
          <p className="mt-2 text-secondary-600">
            계정에 로그인하세요
          </p>
        </div>
        
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field mt-1"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field mt-1"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  로그인 상태 유지
                </label>
              </div>
              
              <div className="text-sm">
                <Link href="/forgot-password" className="text-primary-600 hover:text-primary-500">
                  비밀번호 찾기
                </Link>
              </div>
            </div>
            
            <div>
              <button type="submit" className="btn-primary w-full">
                로그인
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => console.log('Google 로그인')}
              >
                Google로 로그인
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-500">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 