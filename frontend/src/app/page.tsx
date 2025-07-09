'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-700 mb-4">AI 기반 스마트 일정 관리</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-secondary-800 mb-6">내 일정을 부탁해</h2>
        <p className="text-lg text-secondary-600 mb-8">
          팀과 프로젝트의 모든 일정을 한 곳에서!<br />
          AI가 자동으로 최적화하고, 구글 캘린더와 완벽 연동.<br />
          복잡한 일정도 한눈에, 실시간 협업의 시작!
        </p>
        <a href="/signup" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow transition">무료로 시작하기</a>
        <div className="mt-6 text-sm text-secondary-400">이미 계정이 있으신가요? <a href="/login" className="text-primary-600 hover:underline">로그인</a></div>
      </div>
      <div className="w-full max-w-3xl mx-auto mt-8">
        {/* 주요 기능/혜택 섹션 예시 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🤖</span>
            <div className="font-bold text-primary-700 mb-1">AI 역산 스케줄링</div>
            <div className="text-sm text-secondary-600">마감일 기준 자동 일정 생성, 우선순위 기반 일정 재배치</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🔄</span>
            <div className="font-bold text-primary-700 mb-1">구글 캘린더 연동</div>
            <div className="text-sm text-secondary-600">양방향 동기화, 구글 OAuth 인증, 실시간 일정 반영</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">👥</span>
            <div className="font-bold text-primary-700 mb-1">실시간 협업</div>
            <div className="text-sm text-secondary-600">팀/부서/프로젝트 일정 통합, 실시간 동기화, 충돌 감지</div>
          </div>
        </div>
      </div>
    </div>
  );
} 