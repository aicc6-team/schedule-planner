import { db } from '../config/firebase';
import 'dotenv/config';

// 타입 정의
interface PersonalSchedule {
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  importance: string;
  emotion: string;
  projectId: string;
  assignee: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentSchedule {
  title: string;
  objective: string;
  date: string;
  time: string;
  participants: string[];
  department: string;
  projectId: string;
  organizer: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectSchedule {
  projectId: string;
  projectName: string;
  objective: string;
  category: string;
  startDate: string;
  endDate: string;
  time: string;
  roles: {
    pm: number;
    backend: number;
    frontend: number;
    designer: number;
    marketer: number;
    sales: number;
    general: number;
    others: number;
  };
  participants: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 시드 데이터
const personalSchedules: PersonalSchedule[] = [
  {
    title: "백엔드 API 구축",
    description: "백엔드 API 구축",
    date: "2025-07-04",
    time: "13:10",
    durationMinutes: 30,
    importance: "높음",
    emotion: "보통",
    projectId: "project-001",
    assignee: "김개발",
    status: "pending",
    createdAt: "2025-07-04T05:29:00.279Z",
    updatedAt: "2025-07-04T05:29:00.279Z"
  },
  {
    title: "프론트엔드 컴포넌트 개발",
    description: "React 컴포넌트 개발",
    date: "2025-07-05",
    time: "14:00",
    durationMinutes: 120,
    importance: "중간",
    emotion: "좋음",
    projectId: "project-001",
    assignee: "박프론트",
    status: "pending",
    createdAt: "2025-07-04T05:29:00.279Z",
    updatedAt: "2025-07-04T05:29:00.279Z"
  }
];

const departmentSchedules: DepartmentSchedule[] = [
  {
    title: "부서 회의",
    objective: "주간 회의",
    date: "2025-07-04",
    time: "13:10",
    participants: ["김팀장", "이대리", "김개발"],
    department: "개발팀",
    projectId: "project-001",
    organizer: "김팀장",
    status: "pending",
    createdAt: "2025-07-04T05:29:00.279Z",
    updatedAt: "2025-07-04T05:29:00.279Z"
  },
  {
    title: "기획 검토 회의",
    objective: "프로젝트 기획 검토",
    date: "2025-07-06",
    time: "10:00",
    participants: ["김팀장", "박기획", "이대리"],
    department: "기획팀",
    projectId: "project-001",
    organizer: "박기획",
    status: "pending",
    createdAt: "2025-07-04T05:29:00.279Z",
    updatedAt: "2025-07-04T05:29:00.279Z"
  }
];

const projectSchedules: ProjectSchedule[] = [
  {
    projectId: "project-001",
    projectName: "내 일정 프로젝트",
    objective: "프로젝트 기획 정리",
    category: "기획",
    startDate: "2025-07-01",
    endDate: "2025-07-04",
    time: "13:10",
    roles: {
      pm: 1,
      backend: 2,
      frontend: 2,
      designer: 1,
      marketer: 0,
      sales: 0,
      general: 0,
      others: 0
    },
    participants: ["김개발", "이대리", "박프론트"],
    status: "pending",
    createdAt: "2025-07-04T05:29:00.279Z",
    updatedAt: "2025-07-04T05:29:00.279Z"
  },
  {
    projectId: "project-002",
    projectName: "모바일 앱 개발",
    objective: "모바일 앱 개발 및 출시",
    category: "개발",
    startDate: "2025-07-10",
    endDate: "2025-08-15",
    time: "09:00",
    roles: {
      pm: 1,
      backend: 1,
      frontend: 2,
      designer: 2,
      marketer: 1,
      sales: 0,
      general: 0,
      others: 0
    },
    participants: ["김팀장", "박개발자", "이디자이너"],
    status: "pending",
    createdAt: "2025-07-04T05:29:00.279Z",
    updatedAt: "2025-07-04T05:29:00.279Z"
  }
];

// 시드 함수들
export const seedPersonalSchedules = async () => {
  console.log('🌱 개인 일정 시드 데이터 생성 중...');
  const batch = db.batch();
  
  personalSchedules.forEach((schedule) => {
    const docRef = db.collection('personal_schedules').doc();
    batch.set(docRef, schedule);
  });
  
  await batch.commit();
  console.log('✅ 개인 일정 시드 데이터 생성 완료');
};

export const seedDepartmentSchedules = async () => {
  console.log('🌱 부서 일정 시드 데이터 생성 중...');
  const batch = db.batch();
  
  departmentSchedules.forEach((schedule) => {
    const docRef = db.collection('department_schedules').doc();
    batch.set(docRef, schedule);
  });
  
  await batch.commit();
  console.log('✅ 부서 일정 시드 데이터 생성 완료');
};

export const seedProjectSchedules = async () => {
  console.log('🌱 프로젝트 일정 시드 데이터 생성 중...');
  const batch = db.batch();
  
  projectSchedules.forEach((schedule) => {
    const docRef = db.collection('project_schedules').doc();
    batch.set(docRef, schedule);
  });
  
  await batch.commit();
  console.log('✅ 프로젝트 일정 시드 데이터 생성 완료');
};

// 모든 시드 데이터 생성
export const seedAllData = async () => {
  try {
    console.log('🚀 Firestore 시드 데이터 생성 시작...');
    
    await seedPersonalSchedules();
    await seedDepartmentSchedules();
    await seedProjectSchedules();
    
    console.log('🎉 모든 시드 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 스크립트 실행
if (require.main === module) {
  seedAllData().catch(console.error);
} 