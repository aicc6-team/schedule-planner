import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 백엔드에서 OAuth URL 가져오기
    const backendUrl = 'http://localhost:3001/api/auth/google';
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: '백엔드 OAuth URL 요청 실패' 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'OAuth URL 생성 실패' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        authUrl: data.data.authUrl
      },
      message: 'OAuth URL이 생성되었습니다.'
    });

  } catch (error) {
    console.error('OAuth URL 요청 중 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'OAuth URL 요청 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
} 