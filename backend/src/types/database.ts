// Firestore 컬렉션 타입 정의

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  team: string;
  avatar: string;
  google_access_token: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  team: string;
  members: string[]; // user IDs
  created_by: string; // user ID
  created_at: Date;
  updated_at: Date;
}

export interface Schedule {
  id: string;
  project_id: string;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  assignee: string; // user ID
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  type: 'meeting' | 'design' | 'development' | 'testing' | 'marketing' | 'security' | 'training' | 'data_processing' | 'ai_development' | 'infrastructure';
  resource_distribution: {
    pm: number;
    frontend: number;
    backend: number;
    designer: number;
    marketer: number;
    sales: number;
    etc: number;
  };
  total_people: number;
  google_event_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Conflict {
  id: string;
  schedule_id: string;
  conflicting_schedule_id: string;
  conflict_type: 'resource_overlap' | 'dependency_conflict' | 'time_overlap';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'ignored';
  resolution: string | null;
  created_at: Date;
  resolved_at: Date | null;
}

export interface Analytics {
  id: string;
  project_id: string | null;
  metric_name: string;
  value: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'current';
  date: Date;
  description: string;
}

// Firestore 컬렉션 이름 상수
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  SCHEDULES: 'schedules',
  CONFLICTS: 'conflicts',
  ANALYTICS: 'analytics'
} as const;

// Firestore 보안 규칙 예시
export const FIRESTORE_SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 프로젝트는 팀원만 접근 가능
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    // 일정은 프로젝트 멤버만 접근 가능
    match /schedules/{scheduleId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/projects/$(resource.data.project_id)) &&
        request.auth.uid in get(/databases/$(database)/documents/projects/$(resource.data.project_id)).data.members;
    }
    
    // 충돌은 관련 일정의 멤버만 접근 가능
    match /conflicts/{conflictId} {
      allow read, write: if request.auth != null && 
        (exists(/databases/$(database)/documents/schedules/$(resource.data.schedule_id)) &&
         request.auth.uid in get(/databases/$(database)/documents/projects/$(get(/databases/$(database)/documents/schedules/$(resource.data.schedule_id)).data.project_id)).data.members);
    }
    
    // 분석 데이터는 프로젝트 멤버만 접근 가능
    match /analytics/{analyticsId} {
      allow read, write: if request.auth != null && 
        (resource.data.project_id == null || 
         (exists(/databases/$(database)/documents/projects/$(resource.data.project_id)) &&
          request.auth.uid in get(/databases/$(database)/documents/projects/$(resource.data.project_id)).data.members));
    }
  }
}
`; 