# 일정 관리 시스템 백엔드

JSON 데이터를 기반으로 Cloud Firestore에 초기 데이터를 삽입하는 기능을 제공합니다.

## 📋 기능

- **Firestore 컬렉션 자동 생성**: JSON 데이터 구조를 기반으로 Firestore 컬렉션 생성
- **초기 데이터 삽입**: JSON 파일의 데이터를 Firestore에 자동 삽입
- **배치 작업 지원**: 안전한 데이터 삽입을 위한 배치 처리
- **CLI 도구**: 명령줄에서 쉽게 Firestore 초기화 및 시드 실행

## 🛠️ 설치

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

```bash
cp env.example .env
```

`.env` 파일을 편집하여 Firebase 프로젝트 설정을 입력하세요:

```env
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

### 3. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. 프로젝트 설정 → 서비스 계정 → Firebase Admin SDK → 새 비공개 키 생성
3. 다운로드한 JSON 파일의 내용을 `.env` 파일에 복사

## 🚀 사용법

### Firestore 초기화 및 시드

```bash
# 모든 데이터 시드 (컬렉션이 이미 존재하는 경우)
npm run seed

# Firestore 초기화 후 모든 데이터 시드
npm run seed:reset

# 특정 컬렉션만 시드
npm run seed:collection users
npm run seed:collection projects
npm run seed:collection schedules
npm run seed:collection conflicts
npm run seed:collection analytics

# 모든 컬렉션 초기화
npm run seed:clear
```

### 개발 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 📊 Firestore 컬렉션 구조

### Users 컬렉션
- 사용자 정보 (이름, 이메일, 역할, 팀 등)
- Google Calendar 연동을 위한 토큰 저장

### Projects 컬렉션
- 프로젝트 정보 (이름, 설명, 마감일, 상태 등)
- 프로젝트 멤버 정보 (배열 형태로 저장)

### Schedules 컬렉션
- 일정 정보 (제목, 설명, 시작/종료 시간, 우선순위 등)
- 역할별 인원 분배 정보 (객체 형태로 저장)
- Google Calendar 이벤트 ID 연동

### Conflicts 컬렉션
- 일정 충돌 정보 (충돌 유형, 심각도, 해결 상태 등)
- 충돌 해결 방법 및 상태 추적

### Analytics 컬렉션
- 프로젝트 및 전체 통계 지표
- 다양한 기간별 분석 데이터

## 🔧 CLI 명령어

```bash
# 도움말 보기
npm run seed -- help

# 특정 컬렉션 시드
npm run seed:collection users

# Firestore 초기화
npm run db:init
```

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase 설정
│   ├── types/
│   │   └── database.ts          # Firestore 타입 정의
│   ├── services/
│   │   └── firestoreSeeder.ts   # Firestore 데이터 삽입 서비스
│   └── scripts/
│       └── seedFirestore.ts     # CLI 스크립트
├── data/
│   ├── users.json               # 사용자 데이터
│   ├── projects.json            # 프로젝트 데이터
│   ├── schedules.json           # 일정 데이터
│   ├── conflicts.json           # 충돌 데이터
│   └── analytics.json           # 분석 데이터
├── package.json
├── tsconfig.json
└── env.example
```

## 🔍 데이터 확인

Firestore에 데이터가 정상적으로 삽입되었는지 확인:

```javascript
// Firebase Console에서 확인하거나
// Firestore API를 통해 확인

// 사용자 수 확인
const usersSnapshot = await db.collection('users').get();
console.log('Users count:', usersSnapshot.size);

// 프로젝트 수 확인
const projectsSnapshot = await db.collection('projects').get();
console.log('Projects count:', projectsSnapshot.size);

// 일정 수 확인
const schedulesSnapshot = await db.collection('schedules').get();
console.log('Schedules count:', schedulesSnapshot.size);

// 충돌 수 확인
const conflictsSnapshot = await db.collection('conflicts').get();
console.log('Conflicts count:', conflictsSnapshot.size);

// 분석 데이터 수 확인
const analyticsSnapshot = await db.collection('analytics').get();
console.log('Analytics count:', analyticsSnapshot.size);
```

## ⚠️ 주의사항

1. **Firestore 백업**: `npm run seed:reset` 실행 시 기존 데이터가 모두 삭제됩니다.
2. **환경 변수**: `.env` 파일의 Firebase 설정 정보를 정확히 설정하세요.
3. **Firebase 권한**: 서비스 계정 키가 올바르게 설정되어야 합니다.

## 🐛 문제 해결

### Firebase 연결 실패
- Firebase 프로젝트가 올바르게 설정되었는지 확인
- `.env` 파일의 Firebase 설정 정보 확인
- 서비스 계정 키가 유효한지 확인

### JSON 파일 읽기 실패
- `data/` 폴더의 JSON 파일이 존재하는지 확인
- JSON 파일 형식이 올바른지 확인

### 배치 작업 실패
- 데이터 삽입 순서 확인 (users → projects → schedules → conflicts → analytics)
- 참조하는 데이터가 먼저 삽입되었는지 확인
- Firestore 할당량 제한 확인 