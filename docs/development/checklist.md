# 📋 [내 일정을 부탁해] 개발 체크리스트

## Phase 1: 핵심 인프라 구축 (1-2주)

### 1.1 백엔드 서버 구축
- [x] Node.js + Express + TypeScript 프로젝트 초기화
- [x] CORS 설정
- [x] .env 환경변수 구성
- [x] 기본 라우터 및 에러 핸들링 구현

### 1.2 Firebase 인증 연동
- [x] Firebase 프로젝트 및 Admin SDK 설정
- [ ] Google OAuth2 로그인 구현
- [ ] JWT 발급 및 검증 미들웨어 구현 (jsonwebtoken, joi)
- [ ] 로그인/로그아웃 API
- [x] Cloud Firestore 연결
- [ ] 사용자 정보 저장/조회 API 구현
- [ ] 데이터베이스 보안 규칙 설정 (사용자별 데이터 접근 제한)

### 1.3 프론트엔드 구조 설계 (Next.js 14)
- [x] Next.js 14 + TypeScript + Tailwind CSS 초기 설정
- [ ] Redux Toolkit 기반 상태관리 구성
- [x] App Router 기반 라우팅
- [x] 공통 레이아웃 설계

### 1.4 공통 API 및 인증 미들웨어
- [ ] 인증 미들웨어 (JWT)
- [ ] 사용자 정보 API
- [x] API 응답 포맷 표준화
- [x] CORS 최적화

---

## Phase 2: 일정 관리 핵심 기능 개발 (2-3주)

### 2.1 일정 CRUD 기능
- [x] DB 스키마 설계 (schedules: id, user_id, title, description, start_time, end_time, priority, status, created_at, updated_at)
- [x] REST API 구현 (Create, Read, Update, Delete)
- [x] 일정 관련 프론트 컴포넌트: ScheduleForm, ScheduleList, ScheduleCard, ScheduleModal
- [ ] schedules slice 구성 및 fetch 연동

### 2.2 일정 상태 관리
- [x] 상태 분류: 진행 중 / 완료 / 지난 일정
- [ ] 상태 자동 갱신 로직 (API 호출 시 현재 시간과 비교하여 동적 갱신)
- [x] UI 필터링 및 완료처리

### 2.3 일정 충돌 감지 및 알림
- [x] 일정 겹침 탐지 알고리즘 및 충돌 검사 API
- [x] UI 경고 및 해결 옵션

### 2.4 공통 UI/UX 컴포넌트
- [x] Toast, Modal, LoadingSpinner, Input, Button, DatePicker
- [x] Header, Sidebar, MainContent 레이아웃
- [x] 반응형 대응 및 UI 개선

---

## Phase 3: 고급 기능 및 외부 연동 (2-3주)

### 3.1 Google Calendar 연동
- [ ] Google Calendar API 설정
- [ ] OAuth 토큰 저장 및 관리
- [ ] 캘린더 동기화 API 구현
- [ ] 양방향 동기화 (로컬→구글, 구글→로컬)
- [ ] 연동 UI 및 토큰 만료 처리
- [ ] 연동 해제 기능

### 3.2 AI 일정 최적화
- [ ] FastAPI 기반 AI 서버 구축
- [ ] OpenAI API + LangChain 연동
- [ ] 역산 스케줄링 알고리즘 및 UI 연동

### 3.3 분석 차트 및 통계
- [ ] 일정 통계 수집 API
- [ ] Chart.js 기반 분석 차트 시각화
- [ ] 대시보드 구성

### 3.4 실시간 동기화
- [ ] Cloud Firestore 실시간 리스너 설정
- [ ] 프론트엔드 실시간 업데이트 구현
- [ ] 실시간 구독 반영 및 충돌 해결 로직 (마지막 수정 우선)

---

## Phase 4: 마감 테스트 및 점검 (1주)

### 4.1 기능 점검 및 통합 테스트
- [ ] 각 기능별 동작 확인
- [ ] API 통합 테스트
- [ ] UI/UX 테스트

### 4.2 성능 최적화
- [ ] 번들 크기 최적화
- [ ] API 응답 시간 개선
- [ ] 이미지 최적화

### 4.3 사용자 테스트 및 피드백 반영
- [ ] 사용자 테스트 진행
- [ ] 피드백 수집 및 반영

### 4.4 버그 수정 및 최종 점검
- [ ] 발견된 버그 수정
- [ ] 최종 점검 및 완료

---

## 📊 진행률

- **Phase 1**: 9/15 (60%)
- **Phase 2**: 8/12 (67%)
- **Phase 3**: 0/18 (0%)
- **Phase 4**: 0/8 (0%)
- **전체**: 17/53 (32%)

---

## 🎯 성공 기준 체크

- [ ] Phase 1 완료: 사용자 로그인/로그아웃 및 기본 인프라 동작 확인
- [ ] Phase 2 완료: 일정 CRUD 기능 및 상태 관리 정상 동작 확인
- [ ] Phase 3 완료: 구글 캘린더 연동 및 AI 기능 정상 동작 확인
- [ ] Phase 4 완료: 전체 기능 통합 테스트 및 성능 최적화 완료

---

## ⚠️ 위험 요소 모니터링

- [ ] Google Calendar API 할당량 제한 확인
- [ ] OpenAI API 비용 관리 설정
- [ ] Firebase 보안 규칙 테스트 완료 