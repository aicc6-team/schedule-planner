'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('admin123@email.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 에러 메시지 확인
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'oauth_error':
          setError('Google OAuth 인증 중 오류가 발생했습니다.');
          break;
        case 'no_code':
          setError('인증 코드를 받지 못했습니다.');
          break;
        case 'token_exchange_failed':
          setError('토큰 교환에 실패했습니다.');
          break;
        case 'callback_error':
          setError('인증 처리 중 오류가 발생했습니다.');
          break;
        default:
          setError('로그인 중 알 수 없은 오류가 발생했습니다.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // 실제 백엔드 라우터 경로로 요청
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: email, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/schedules');
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 백엔드에서 Google OAuth URL 가져오기
      const response = await fetch('http://localhost:3001/api/auth/google');
      const data = await response.json();
      
      if (data.success) {
        // Google OAuth URL로 리디렉션
        window.location.href = data.data.authUrl;
      } else {
        console.error('Google OAuth URL 생성 실패:', data.error);
        setError('Google 로그인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      setError('Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 text-xs underline mt-1"
              >
                닫기
              </button>
            </div>
          )}
          
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
                className="btn-secondary w-full flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">로딩 중...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 