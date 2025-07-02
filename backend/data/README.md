# 데이터 파일 구조

이 폴더는 MVP 시나리오를 위한 가상 데이터를 포함합니다.

## 파일 목록

### 1. users.json
- **용도**: 가상 사용자 데이터
- **내용**: 
  - 스마트앱개발팀: 김개발(팀장), 박프론트, 윤프론트2, 이백엔드, 강백엔드2, 최디자인, 임디자인2, 권품질
  - 데이터분석팀: 정데이터(팀장), 한분석, 오분석2, 송시각화
  - 마케팅팀: 신마케팅
  - 영업팀: 백영업
  - 인프라팀: 정데브옵스
- **필드**: id, email, name, role, team, avatar, google_access_token, created_at, updated_at

### 2. projects.json
- **용도**: 프로젝트 데이터
- **내용**:
  - 스마트홈 모바일앱 (스마트앱개발팀)
  - 웹 관리자 대시보드 (스마트앱개발팀)
  - 사용자 행동 분석 시스템 (데이터분석팀)
- **필드**: id, name, description, deadline, status, team, members, created_by, created_at, updated_at

### 3. schedules.json
- **용도**: 일정 데이터
- **내용**: 각 프로젝트별 세부 일정들 (총 25개 일정)
- **다양한 일정 유형**: meeting, design, development, testing, marketing, security, training, data_processing, ai_development, infrastructure
- **역할별 인원 분배**: 1-6명까지 다양한 규모의 팀 구성
- **필드**: id, project_id, title, description, start_time, end_time, assignee, priority, status, type, resource_distribution, total_people, google_event_id, created_at, updated_at

### 4. conflicts.json
- **용도**: 일정 충돌 데이터
- **내용**: 리소스 중복, 의존성 충돌 등의 시나리오 (총 10개 충돌)
- **충돌 유형**: resource_overlap (리소스 중복), dependency_conflict (의존성 충돌)
- **심각도**: high, medium, low
- **필드**: id, schedule_id, conflicting_schedule_id, conflict_type, description, severity, status, resolution, created_at, resolved_at

### 5. analytics.json
- **용도**: 분석 데이터
- **내용**: 프로젝트별 및 전체 통계 지표
- **필드**: id, project_id, metric_name, value, unit, period, date, description

## 데이터 관계

```
users (사용자)
├── projects (프로젝트)
│   ├── schedules (일정)
│   │   └── conflicts (충돌)
│   └── analytics (분석)
```

## 사용 방법

1. **개발 환경**: 백엔드 API 개발 시 테스트 데이터로 사용
2. **프론트엔드**: UI 개발 시 실제 데이터처럼 사용
3. **AI 서버**: 일정 최적화 알고리즘 테스트용 데이터

## 주의사항

- 이 데이터는 MVP 시나리오 전용입니다
- 실제 운영 환경에서는 실제 데이터베이스를 사용해야 합니다
- 데이터 구조 변경 시 관련 API도 함께 수정해야 합니다 