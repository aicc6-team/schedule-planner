import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // OAuth 에러 처리
    if (error) {
      console.error('OAuth 에러:', error);
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
    }

    // 인증 코드가 없는 경우
    if (!code) {
      console.error('인증 코드가 없습니다.');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // 백엔드로 인증 코드 전송하여 토큰 교환
    const backendUrl = 'http://localhost:3001/api/auth/google/callback';
    const response = await fetch(`${backendUrl}?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('백엔드 토큰 교환 실패:', response.statusText);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('토큰 교환 실패:', data.error);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    // 토큰을 쿼리 파라미터로 전달하면서 대시보드로 리디렉션
    // 실제 운영에서는 보안을 위해 세션이나 쿠키를 사용해야 합니다
    const tokens = encodeURIComponent(JSON.stringify(data.data.tokens));
    return NextResponse.redirect(new URL(`/dashboard?tokens=${tokens}`, request.url));

  } catch (error) {
    console.error('OAuth 콜백 처리 중 오류:', error);
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
  }
} 