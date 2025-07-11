'use client';


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, UserGroupIcon, CalendarIcon, BoltIcon, StarIcon, ArrowRightIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon, EnvelopeIcon, VideoCameraIcon, XCircleIcon } from '@heroicons/react/24/outline';


// Animation utility classes (fade-in, slide-up)
const fadeIn = 'animate-fade-in';
const slideUp = 'animate-slide-up';


export default function LandingPage() {
  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>내 일정을 부탁해 | AI 기반 스마트 일정 관리</title>
        <meta name="description" content="AI가 자동으로 최적화하는 스마트 일정 관리 플랫폼. 팀과 프로젝트의 모든 일정을 한 곳에서! 무료로 시작하세요." />
        <meta property="og:title" content="내 일정을 부탁해 | AI 기반 스마트 일정 관리" />
        <meta property="og:description" content="AI가 자동으로 최적화하는 스마트 일정 관리 플랫폼. 팀과 프로젝트의 모든 일정을 한 곳에서! 무료로 시작하세요." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
      </head>
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
        {/* Top Navigation */}
        <nav className="w-full flex items-center justify-between px-8 py-4 bg-white/80 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-primary-700">내 일정을 부탁해</span>
          </div>
          <div className="hidden md:flex gap-8 text-secondary-700 font-medium">
            <a href="#features" className="hover:text-primary-600 transition">주요 기능</a>
            <a href="#pricing" className="hover:text-primary-600 transition">요금제</a>
            <a href="#customers" className="hover:text-primary-600 transition">고객사례</a>
            <a href="#faq" className="hover:text-primary-600 transition">FAQ</a>
            <a href="#contact" className="hover:text-primary-600 transition">문의</a>
          </div>
          <div className="flex items-center gap-x-4">
            <a href="/login" className="text-primary-600 font-semibold hover:underline flex items-center h-12">로그인</a>
            <a href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg shadow transition flex items-center gap-1 h-12">무료로 시작하기 <ArrowRightIcon className="w-4 h-4" /></a>
          </div>
        </nav>


        {/* Hero Section */}
        <section className={`relative w-full flex flex-col items-center justify-center text-center py-24 px-4 bg-gradient-to-br from-primary-100 via-white to-blue-50 overflow-hidden ${fadeIn}`}>
          <div className="absolute inset-0 pointer-events-none select-none opacity-20 bg-[url('/pattern.svg')] bg-repeat" />
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-primary-700 mb-4 drop-shadow-lg">AI 기반 스마트 일정 관리</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-secondary-800 mb-6">팀과 프로젝트의 모든 일정을 한 곳에서!</h2>
            <p className="text-lg text-secondary-600 mb-8 max-w-xl mx-auto">
              AI가 자동으로 최적화하고, 구글 캘린더와 완벽 연동.<br />
              복잡한 일정도 한눈에, 실시간 협업의 시작!
            </p>
            <a href="/signup" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-xl transition transform hover:scale-105">무료로 시작하기</a>
            <div className="mt-6 text-sm text-secondary-400">이미 계정이 있으신가요? <a href="/login" className="text-primary-600 hover:underline">로그인</a></div>
          </div>
          {/* 실제 서비스 화면 미리보기 (스크린샷/애니메이션) */}
          <div className="relative z-10 flex flex-col items-center mt-12">
            <img src="/hero-illustration.svg" alt="일정 관리 일러스트" className="w-80 md:w-[420px] mx-auto drop-shadow-xl rounded-2xl border-4 border-primary-100 animate-fade-in" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-6 bg-primary-200 blur-2xl opacity-30 rounded-full" />
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className={`w-full max-w-6xl mx-auto mt-[180px] px-4 ${slideUp}`}>
          <h3 className="text-2xl font-bold text-primary-700 mb-10 text-center">주요 기능</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition group">
              <BoltIcon className="w-12 h-12 text-primary-500 mb-3 group-hover:animate-bounce" />
              <div className="font-bold text-lg text-primary-700 mb-2">AI 역산 스케줄링</div>
              <div className="text-base text-secondary-600 text-center">마감일 기준 자동 일정 생성, 우선순위 기반 일정 재배치</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition group">
              <CalendarIcon className="w-12 h-12 text-blue-500 mb-3 group-hover:animate-spin" />
              <div className="font-bold text-lg text-primary-700 mb-2">구글 캘린더 연동</div>
              <div className="text-base text-secondary-600 text-center">양방향 동기화, 구글 OAuth 인증, 실시간 일정 반영</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition group">
              <UserGroupIcon className="w-12 h-12 text-green-500 mb-3 group-hover:animate-pulse" />
              <div className="font-bold text-lg text-primary-700 mb-2">실시간 협업</div>
              <div className="text-base text-secondary-600 text-center">팀/부서/프로젝트 일정 통합, 실시간 동기화, 충돌 감지</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition group">
              <CheckCircleIcon className="w-12 h-12 text-orange-500 mb-3 group-hover:animate-bounce" />
              <div className="font-bold text-lg text-primary-700 mb-2">간편한 일정 관리</div>
              <div className="text-base text-secondary-600 text-center">드래그&드롭, 반복 일정, 알림, 직관적 UI</div>
            </div>
          </div>
        </section>


        {/* Pricing/Benefits Section */}
        <section id="pricing" className={`w-full max-w-5xl mx-auto mt-[180px] px-4 ${fadeIn}`}>
          <h3 className="text-2xl font-bold text-primary-700 mb-10 text-center">요금제 및 혜택</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center border-2 border-primary-200 relative hover:scale-105 hover:shadow-2xl transition">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow">무료</span>
              <StarIcon className="w-10 h-10 text-yellow-400 mb-3" />
              <div className="font-bold text-xl text-primary-700 mb-2">무료 플랜</div>
              <div className="text-3xl font-extrabold text-primary-600 mb-3">0원</div>
              <ul className="text-base text-secondary-600 mb-6 space-y-1">
                <li>5인 이하 팀 무료</li>
                <li>기본 일정/업무 관리</li>
                <li>구글 캘린더 연동</li>
                <li>실시간 협업</li>
              </ul>
              <a href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-8 rounded-lg shadow transition">무료로 시작</a>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center border-4 border-primary-400 scale-105 z-10 relative hover:scale-110 hover:shadow-2xl transition">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow">추천</span>
              <StarIcon className="w-10 h-10 text-primary-500 mb-3" />
              <div className="font-bold text-xl text-primary-700 mb-2">스탠다드</div>
              <div className="text-3xl font-extrabold text-primary-600 mb-3">₩4,000<span className="text-base font-normal text-secondary-500">/인/월</span></div>
              <ul className="text-base text-secondary-600 mb-6 space-y-1">
                <li>무제한 팀원</li>
                <li>고급 일정/업무 관리</li>
                <li>API/외부 연동</li>
                <li>우선 지원</li>
              </ul>
              <a href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-8 rounded-lg shadow transition">1개월 무료체험</a>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center border-2 border-gray-200 relative hover:scale-105 hover:shadow-2xl transition">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow">기업</span>
              <StarIcon className="w-10 h-10 text-gray-400 mb-3" />
              <div className="font-bold text-xl text-primary-700 mb-2">엔터프라이즈</div>
              <div className="text-3xl font-extrabold text-primary-600 mb-3">맞춤 견적</div>
              <ul className="text-base text-secondary-600 mb-6 space-y-1">
                <li>대규모 조직/기업</li>
                <li>전용 지원/보안</li>
                <li>커스텀 연동/기능</li>
                <li>컨설팅 제공</li>
              </ul>
              <a href="#contact" className="bg-gray-200 hover:bg-gray-300 text-primary-700 font-bold py-2 px-8 rounded-lg shadow transition">도입 문의</a>
            </div>
          </div>
        </section>


        {/* Customer Logos/Testimonials Section */}
        <section id="customers" className={`w-full max-w-6xl mx-auto mt-[180px] px-4 ${slideUp}`}>
          <h3 className="text-2xl font-bold text-primary-700 mb-10 text-center">고객사 & 이용사례</h3>
          <div className="flex flex-wrap justify-center items-center gap-10 mb-10 bg-gradient-to-r from-primary-100 to-blue-100 py-6 rounded-2xl shadow">
            {[
              { x: 0, y: 0 },    // NeoLogi
              { x: 1, y: 0 },    // TaskBee
              { x: 2, y: 0 },    // Cloudary
              { x: 0, y: 1 },    // Metacore
              { x: 1, y: 1 },    // Flexdo
              { x: 2, y: 1 },    // Vantask
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  width: '192px',
                  height: '128px',
                  overflow: 'hidden',
                  display: 'inline-block',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  background: '#fff'
                }}
              >
                <img
                  src="/Logo.png"
                  alt={`협력사 로고${i + 1}`}
                  style={{
                    width: `${192 * 3}px`,
                    height: `${128 * 2}px`,
                    objectFit: 'none',
                    objectPosition: `-${pos.x * 192}px -${pos.y * 128}px`
                  }}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 문성훈 - 4.5점 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-400" />
                <span className="font-bold text-primary-700">문성훈</span>
                <span className="flex gap-0.5">
                  {[...Array(4)].map((_,i)=>(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />))}
                  <StarIcon className="w-4 h-4 text-yellow-400 opacity-50" style={{clipPath:'inset(0 50% 0 0)'}} />
                </span>
              </div>
              <div className="text-base text-secondary-600 mb-1">“AI가 일정 우선순위를 잘 잡아줘서 업무가 훨씬 효율적입니다. 가끔 세부 조정이 필요하지만 전반적으로 만족해요!”</div>
              <div className="text-xs text-secondary-400">- IT 스타트업 PM</div>
            </div>
            {/* 서민지 - 5점 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-400" />
                <span className="font-bold text-primary-700">서민지</span>
                <span className="flex gap-0.5">{[...Array(5)].map((_,i)=>(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />))}</span>
              </div>
              <div className="text-base text-secondary-600 mb-1">“팀원들과 실시간으로 일정을 공유할 수 있어 협업이 정말 쉬워졌어요. UI도 직관적이고 너무 만족합니다!”</div>
              <div className="text-xs text-secondary-400">- 마케팅 팀장</div>
            </div>
            {/* 남윤동 - 5점 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-400" />
                <span className="font-bold text-primary-700">남윤동</span>
                <span className="flex gap-0.5">{[...Array(5)].map((_,i)=>(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />))}</span>
              </div>
              <div className="text-base text-secondary-600 mb-1">“구글 캘린더 연동이 완벽해서 여러 일정 관리가 한결 편해졌습니다. 추천합니다!”</div>
              <div className="text-xs text-secondary-400">- 프리랜서 개발자</div>
            </div>
            {/* 홍세준 - 4점 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-400" />
                <span className="font-bold text-primary-700">홍세준</span>
                <span className="flex gap-0.5">{[...Array(4)].map((_,i)=>(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />))}</span>
              </div>
              <div className="text-base text-secondary-600 mb-1">“기능이 다양해서 좋지만, 모바일에서 약간 느릴 때가 있습니다. 그래도 전체적으로 만족해요.”</div>
              <div className="text-xs text-secondary-400">- 대학생</div>
            </div>
            {/* 홍원섭 - 4.5점 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-400" />
                <span className="font-bold text-primary-700">홍원섭</span>
                <span className="flex gap-0.5">
                  {[...Array(4)].map((_,i)=>(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />))}
                  <StarIcon className="w-4 h-4 text-yellow-400 opacity-50" style={{clipPath:'inset(0 50% 0 0)'}} />
                </span>
              </div>
              <div className="text-base text-secondary-600 mb-1">“AI 스케줄링이 정말 유용합니다. 다만, 가끔 알림이 늦게 오는 점만 개선되면 완벽할 것 같아요.”</div>
              <div className="text-xs text-secondary-400">- 삼성 전자 기술개발팀 대리</div>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section id="faq" className={`w-full max-w-3xl mx-auto mt-[180px] px-4 ${fadeIn}`}>
          <h3 className="text-2xl font-bold text-primary-700 mb-8 text-center">자주 묻는 질문</h3>
          <div className="space-y-4">
            {[
              {q:'정말 무료로 쓸 수 있나요?',a:'네! 5인 이하 팀은 완전 무료로 모든 핵심 기능을 이용할 수 있습니다.'},
              {q:'AI 스케줄링은 어떻게 동작하나요?',a:'마감일과 우선순위만 입력하면 AI가 자동으로 일정을 배치해줍니다.'},
              {q:'구글 캘린더 연동은 안전한가요?',a:'구글 OAuth 인증을 사용하며, 데이터는 안전하게 암호화되어 처리됩니다.'},
              {q:'팀원이 많아도 쓸 수 있나요?',a:'스탠다드/엔터프라이즈 플랜에서는 무제한 팀원, 고급 기능을 지원합니다.'},
            ].map((item,i)=>(
              <details key={i} className="bg-white rounded-xl shadow p-4 group">
                <summary className="font-semibold text-primary-700 cursor-pointer flex items-center justify-between">
                  {item.q}
                  <span className="ml-2 text-primary-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 text-secondary-600 text-base">{item.a}</div>
              </details>
            ))}
          </div>
        </section>


        {/* How it Works Section */}
        <section id="howitworks" className="w-full max-w-5xl mx-auto mt-[120px] px-4 animate-fade-in">
          <h3 className="text-2xl font-bold text-primary-700 mb-14 text-center">이용 방법</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="flex flex-col items-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <UserGroupIcon className="w-14 h-14 text-primary-500 mb-4 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold mb-4 text-lg">1. 회원가입</div>
              <div className="text-secondary-600 text-center text-base">간편하게 이메일로 가입</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <UserGroupIcon className="w-14 h-14 text-green-500 mb-4 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold mb-4 text-lg">2. 팀/프로젝트 생성</div>
              <div className="text-secondary-600 text-center text-base">팀원 초대, 프로젝트 등록</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <CalendarIcon className="w-14 h-14 text-blue-500 mb-4 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold mb-4 text-lg">3. 일정 입력</div>
              <div className="text-secondary-600 text-center text-base">일정/업무 등록, 마감일 설정</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <BoltIcon className="w-14 h-14 text-yellow-500 mb-4 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold mb-4 text-lg">4. AI 자동 스케줄링</div>
              <div className="text-secondary-600 text-center text-base">AI가 최적 일정 자동 배치</div>
            </div>
          </div>
        </section>


        {/* Why Us Section (Comparison Table) */}
        <section id="whyus" className="w-full max-w-4xl mx-auto mt-[120px] px-4 animate-slide-up">
          <h3 className="text-2xl font-bold text-primary-700 mb-14 text-center">왜 &quot;내 일정을 부탁해&quot;인가요?</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow-xl text-center border border-primary-100">
              <thead>
                <tr className="bg-gradient-to-r from-primary-100 to-blue-100">
                  <th className="py-6 px-8 font-bold text-primary-700 text-lg">기능</th>
                  <th className="py-6 px-8 font-bold text-primary-700 text-lg">내 일정을 부탁해</th>
                  <th className="py-6 px-8 font-bold text-secondary-600 text-lg">타사 A</th>
                  <th className="py-6 px-8 font-bold text-secondary-600 text-lg">타사 B</th>
                </tr>
              </thead>
              <tbody className="text-secondary-700">
                <tr className="hover:bg-primary-50 transition-colors">
                  <td className="py-5 px-8 font-medium text-base">AI 자동 스케줄링</td>
                  <td className="py-5 px-8"><CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" /></td>
                  <td className="py-5 px-8"><XCircleIcon className="w-6 h-6 text-red-400 mx-auto" /></td>
                  <td className="py-5 px-8"><XCircleIcon className="w-6 h-6 text-red-400 mx-auto" /></td>
                </tr>
                <tr className="bg-primary-50/30 hover:bg-primary-50 transition-colors">
                  <td className="py-5 px-8 font-medium text-base">구글 캘린더 연동</td>
                  <td className="py-5 px-8"><CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" /></td>
                  <td className="py-5 px-8"><CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" /></td>
                  <td className="py-5 px-8"><XCircleIcon className="w-6 h-6 text-red-400 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-primary-50 transition-colors">
                  <td className="py-5 px-8 font-medium text-base">실시간 협업</td>
                  <td className="py-5 px-8"><CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" /></td>
                  <td className="py-5 px-8"><XCircleIcon className="w-6 h-6 text-red-400 mx-auto" /></td>
                  <td className="py-5 px-8"><CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="bg-primary-50/30 hover:bg-primary-50 transition-colors">
                  <td className="py-5 px-8 font-medium text-base">무료 플랜</td>
                  <td className="py-5 px-8"><CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" /></td>
                  <td className="py-5 px-8"><XCircleIcon className="w-6 h-6 text-red-400 mx-auto" /></td>
                  <td className="py-5 px-8"><CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>


        {/* Security & Privacy Section */}
        <section id="security" className="w-full max-w-3xl mx-auto mt-[120px] px-4 animate-fade-in">
          <h3 className="text-2xl font-bold text-primary-700 mb-12 text-center">보안 & 개인정보 보호</h3>
          <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-12 flex flex-col items-center gap-8 border border-primary-100">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full blur-lg opacity-30"></div>
              <ShieldCheckIcon className="w-14 h-14 text-primary-400 mb-4 relative z-10" />
            </div>
            <div className="text-xl font-semibold text-primary-700 mb-4">ISMS 인증, SSL 암호화, 안전한 데이터 관리</div>
            <div className="text-lg text-secondary-600 text-center">모든 데이터는 SSL로 암호화되어 안전하게 관리되며, ISMS 인증과 개인정보 보호법을 준수합니다.</div>
          </div>
        </section>


        {/* Integration Section */}
        <section id="integration" className="w-full max-w-3xl mx-auto mt-[120px] px-4 animate-slide-up">
          <h3 className="text-2xl font-bold text-primary-700 mb-12 text-center">외부 연동</h3>
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-12 flex flex-col items-center gap-8 border border-blue-100">
            <div className="flex gap-10 mb-6">
              <div className="p-4 bg-blue-100 rounded-full">
                <CalendarIcon className="w-12 h-12 text-blue-500" />
              </div>
              <div className="p-4 bg-purple-100 rounded-full">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-purple-500" />
              </div>
              <div className="p-4 bg-indigo-100 rounded-full">
                <UserGroupIcon className="w-12 h-12 text-indigo-500" />
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <VideoCameraIcon className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            <div className="text-lg text-secondary-600 text-center">구글 캘린더 외에도 슬랙, MS Teams, Zoom 등 다양한 협업툴과 연동 예정!</div>
          </div>
        </section>


        {/* Roadmap Section */}
        <section id="roadmap" className="w-full max-w-3xl mx-auto mt-[120px] px-4 animate-fade-in">
          <h3 className="text-2xl font-bold text-primary-700 mb-12 text-center">로드맵</h3>
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-12 border border-green-100">
            <ul className="space-y-8">
              <li className="flex items-center gap-6 p-5 bg-white rounded-lg shadow-sm">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-bold text-primary-600 text-lg">2025 Q3:</span>
                <span className="text-secondary-700 text-base">모바일 앱 출시</span>
              </li>
              <li className="flex items-center gap-6 p-5 bg-white rounded-lg shadow-sm">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-bold text-primary-600 text-lg">2025 Q4:</span>
                <span className="text-secondary-700 text-base">외부 API 연동, 다국어 지원</span>
              </li>
              <li className="flex items-center gap-6 p-5 bg-white rounded-lg shadow-sm">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="font-bold text-primary-600 text-lg">2026 상반기:</span>
                <span className="text-secondary-700 text-base">AI 추천 기능 고도화</span>
              </li>
            </ul>
          </div>
        </section>


        {/* Team Section */}
        <section id="team" className="w-full max-w-4xl mx-auto mt-[120px] px-4 animate-slide-up">
          <h3 className="text-2xl font-bold text-primary-700 mb-14 text-center">팀 소개</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-10 flex flex-col items-center border border-primary-100 hover:scale-105 transition-transform">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full blur-lg opacity-30"></div>
                <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="이창행" className="w-24 h-24 rounded-full relative z-10" />
              </div>
              <div className="font-bold text-primary-700 text-lg mb-2">이창행</div>
              <div className="text-secondary-600 text-base mb-2">CEO / Product Owner</div>
              <div className="text-sm text-secondary-400 mb-2">"더 똑똑한 협업을 위해!"</div>
            </div>
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-10 flex flex-col items-center border border-green-100 hover:scale-105 transition-transform">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-lg opacity-30"></div>
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="전서연" className="w-24 h-24 rounded-full relative z-10" />
              </div>
              <div className="font-bold text-primary-700 text-lg mb-2">전서연</div>
              <div className="text-secondary-600 text-base mb-2">CTO / AI Lead</div>
              <div className="text-sm text-secondary-400 mb-2">"AI로 일정관리를 혁신!"</div>
            </div>
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-10 flex flex-col items-center border border-blue-100 hover:scale-105 transition-transform">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-lg opacity-30"></div>
                <img src="https://randomuser.me/api/portraits/women/21.jpg" alt="서민지" className="w-24 h-24 rounded-full relative z-10" />
              </div>
              <div className="font-bold text-primary-700 text-lg mb-2">서민지</div>
              <div className="text-secondary-600 text-base mb-2">Frontend Engineer</div>
              <div className="text-sm text-secondary-400 mb-2">"사용자 경험 최우선!"</div>
            </div>
          </div>
        </section>


        {/* Blog/News Section */}
        <section id="blog" className="w-full max-w-4xl mx-auto mt-[120px] px-4 animate-fade-in">
          <h3 className="text-2xl font-bold text-primary-700 mb-14 text-center">블로그 & 소식</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl p-10 flex flex-col gap-4 border border-orange-100 hover:scale-105 transition-transform">
              <div className="font-bold text-primary-700 text-lg mb-2">AI로 업무 효율 2배 올리기</div>
              <div className="text-secondary-600 text-base mb-2">2024.07.10</div>
              <div className="text-lg text-secondary-700">AI 스케줄링을 활용한 실제 업무 자동화 사례를 소개합니다.</div>
            </div>
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-10 flex flex-col gap-4 border border-purple-100 hover:scale-105 transition-transform">
              <div className="font-bold text-primary-700 text-lg mb-2">일정 관리 꿀팁 5가지</div>
              <div className="text-secondary-600 text-base mb-2">2024.06.28</div>
              <div className="text-lg text-secondary-700">프로젝트 일정 관리를 더 똑똑하게 하는 방법을 알아보세요.</div>
            </div>
          </div>
        </section>


        {/* API/Developer Section */}
        <section id="api" className="w-full max-w-3xl mx-auto mt-[120px] px-4 animate-fade-in">
          <h3 className="text-2xl font-bold text-primary-700 mb-12 text-center">API & 개발자 지원</h3>
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-12 flex flex-col items-center gap-8 border border-indigo-100">
            <div className="text-xl font-semibold text-primary-700 mb-4">오픈 API 제공</div>
            <div className="text-lg text-secondary-600 text-center mb-4">외부 시스템과의 연동을 위한 REST API, 개발자 문서, 샘플 코드 제공</div>
            <a href="#" className="mt-2 text-primary-600 hover:underline hover:text-primary-700 transition-colors">API 문서 보기 &rarr;</a>
          </div>
        </section>


        {/* Contact/Support Section */}
        <section id="support" className="w-full max-w-3xl mx-auto mt-[120px] px-4 animate-slide-up">
          <h3 className="text-2xl font-bold text-primary-700 mb-12 text-center">고객지원 & 문의</h3>
          <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-xl p-12 flex flex-col items-center gap-8 border border-teal-100">
            <div className="text-lg text-secondary-600 text-center mb-4">실시간 채팅, 이메일, 전화번호, 문의 폼 등 다양한 방법으로 지원합니다.</div>
            <div className="flex flex-col gap-4 items-center">
              <span className="text-primary-700 font-semibold text-base">이메일: support@myschedule.com</span>
              <span className="text-primary-700 font-semibold text-base">전화: 02-1234-5678</span>
              <a href="#contact" className="text-primary-600 hover:underline hover:text-primary-700 transition-colors">문의 폼 바로가기 &rarr;</a>
            </div>
          </div>
        </section>


        {/* Final CTA Section */}
        <section id="contact" className={`w-full flex flex-col items-center justify-center text-center py-20 px-4 mt-24 bg-gradient-to-br from-primary-100 via-white to-blue-50 ${slideUp}`}>
          <h3 className="text-3xl font-bold text-primary-700 mb-4 drop-shadow">지금 바로 스마트한 일정 관리를 시작하세요!</h3>
          <p className="text-lg text-secondary-600 mb-8">무료로 체험하고, 팀의 생산성을 높이세요.</p>
          <a href="/signup" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-12 rounded-2xl text-xl shadow-xl transition transform hover:scale-105">무료로 시작하기</a>
          <div className="mt-8 flex flex-col items-center gap-2">
            <ShieldCheckIcon className="w-8 h-8 text-primary-400" />
            <span className="text-sm text-secondary-500">ISMS 인증, SSL 암호화, 안전한 데이터 관리</span>
          </div>
        </section>


        {/* Footer */}
        <footer className="w-full text-center text-xs text-secondary-400 py-8 mt-8 border-t bg-white/70 flex flex-col items-center gap-4">
          <div>&copy; {new Date().getFullYear()} 내 일정을 부탁해. All rights reserved.</div>
          <form className="flex items-center gap-2 max-w-xs mx-auto">
            <EnvelopeIcon className="w-5 h-5 text-primary-400" />
            <input type="email" placeholder="이메일로 소식 받기" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm" />
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition">구독</button>
          </form>
        </footer>
      </div>
      {/* Animation CSS (for fade-in, slide-up) */}
      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1.2s ease; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 1.2s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </>
  );
}

