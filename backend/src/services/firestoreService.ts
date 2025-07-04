import { db } from '../config/firebase';

// 타입 정의
export interface PersonalSchedule {
  id?: string;
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

export interface DepartmentSchedule {
  id?: string;
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

export interface ProjectSchedule {
  id?: string;
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

// Firestore 서비스
export const firestoreService = {
  // 개인 일정 컬렉션 조회
  async getPersonalSchedules(): Promise<PersonalSchedule[]> {
    try {
      const snapshot = await db.collection('personal_schedules').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PersonalSchedule));
    } catch (error) {
      console.error('개인 일정 조회 실패:', error);
      throw new Error('개인 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 부서 일정 컬렉션 조회
  async getDepartmentSchedules(): Promise<DepartmentSchedule[]> {
    try {
      const snapshot = await db.collection('department_schedules').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DepartmentSchedule));
    } catch (error) {
      console.error('부서 일정 조회 실패:', error);
      throw new Error('부서 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 프로젝트 일정 컬렉션 조회
  async getProjectSchedules(): Promise<ProjectSchedule[]> {
    try {
      const snapshot = await db.collection('project_schedules').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProjectSchedule));
    } catch (error) {
      console.error('프로젝트 일정 조회 실패:', error);
      throw new Error('프로젝트 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 모든 일정 조회 (통합)
  async getAllSchedules(): Promise<{
    personal: PersonalSchedule[];
    department: DepartmentSchedule[];
    project: ProjectSchedule[];
  }> {
    try {
      const [personal, department, project] = await Promise.all([
        this.getPersonalSchedules(),
        this.getDepartmentSchedules(),
        this.getProjectSchedules()
      ]);

      return {
        personal,
        department,
        project
      };
    } catch (error) {
      console.error('전체 일정 조회 실패:', error);
      throw new Error('전체 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // === 개인 일정 CRUD ===
  // 개인 일정 생성
  async createPersonalSchedule(data: Omit<PersonalSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonalSchedule> {
    try {
      const now = new Date().toISOString();
      const scheduleData = {
        ...data,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await db.collection('personal_schedules').add(scheduleData);
      return {
        id: docRef.id,
        ...scheduleData
      };
    } catch (error) {
      console.error('개인 일정 생성 실패:', error);
      throw new Error('개인 일정을 생성하는 중 오류가 발생했습니다.');
    }
  },

  // 개인 일정 상세 조회
  async getPersonalScheduleById(id: string): Promise<PersonalSchedule | null> {
    try {
      const doc = await db.collection('personal_schedules').doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      } as PersonalSchedule;
    } catch (error) {
      console.error('개인 일정 상세 조회 실패:', error);
      throw new Error('개인 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 개인 일정 수정
  async updatePersonalSchedule(id: string, data: Partial<PersonalSchedule>): Promise<PersonalSchedule | null> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('personal_schedules').doc(id).update(updateData);
      return await this.getPersonalScheduleById(id);
    } catch (error) {
      console.error('개인 일정 수정 실패:', error);
      throw new Error('개인 일정을 수정하는 중 오류가 발생했습니다.');
    }
  },

  // 개인 일정 삭제
  async deletePersonalSchedule(id: string): Promise<boolean> {
    try {
      await db.collection('personal_schedules').doc(id).delete();
      return true;
    } catch (error) {
      console.error('개인 일정 삭제 실패:', error);
      throw new Error('개인 일정을 삭제하는 중 오류가 발생했습니다.');
    }
  },

  // === 부서 일정 CRUD ===
  // 부서 일정 생성
  async createDepartmentSchedule(data: Omit<DepartmentSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<DepartmentSchedule> {
    try {
      const now = new Date().toISOString();
      const scheduleData = {
        ...data,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await db.collection('department_schedules').add(scheduleData);
      return {
        id: docRef.id,
        ...scheduleData
      };
    } catch (error) {
      console.error('부서 일정 생성 실패:', error);
      throw new Error('부서 일정을 생성하는 중 오류가 발생했습니다.');
    }
  },

  // 부서 일정 상세 조회
  async getDepartmentScheduleById(id: string): Promise<DepartmentSchedule | null> {
    try {
      const doc = await db.collection('department_schedules').doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      } as DepartmentSchedule;
    } catch (error) {
      console.error('부서 일정 상세 조회 실패:', error);
      throw new Error('부서 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 부서 일정 수정
  async updateDepartmentSchedule(id: string, data: Partial<DepartmentSchedule>): Promise<DepartmentSchedule | null> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('department_schedules').doc(id).update(updateData);
      return await this.getDepartmentScheduleById(id);
    } catch (error) {
      console.error('부서 일정 수정 실패:', error);
      throw new Error('부서 일정을 수정하는 중 오류가 발생했습니다.');
    }
  },

  // 부서 일정 삭제
  async deleteDepartmentSchedule(id: string): Promise<boolean> {
    try {
      await db.collection('department_schedules').doc(id).delete();
      return true;
    } catch (error) {
      console.error('부서 일정 삭제 실패:', error);
      throw new Error('부서 일정을 삭제하는 중 오류가 발생했습니다.');
    }
  },

  // === 프로젝트 일정 CRUD ===
  // 프로젝트 일정 생성
  async createProjectSchedule(data: Omit<ProjectSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectSchedule> {
    try {
      const now = new Date().toISOString();
      const scheduleData = {
        ...data,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await db.collection('project_schedules').add(scheduleData);
      return {
        id: docRef.id,
        ...scheduleData
      };
    } catch (error) {
      console.error('프로젝트 일정 생성 실패:', error);
      throw new Error('프로젝트 일정을 생성하는 중 오류가 발생했습니다.');
    }
  },

  // 프로젝트 일정 상세 조회
  async getProjectScheduleById(id: string): Promise<ProjectSchedule | null> {
    try {
      const doc = await db.collection('project_schedules').doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      } as ProjectSchedule;
    } catch (error) {
      console.error('프로젝트 일정 상세 조회 실패:', error);
      throw new Error('프로젝트 일정을 조회하는 중 오류가 발생했습니다.');
    }
  },

  // 프로젝트 일정 수정
  async updateProjectSchedule(id: string, data: Partial<ProjectSchedule>): Promise<ProjectSchedule | null> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('project_schedules').doc(id).update(updateData);
      return await this.getProjectScheduleById(id);
    } catch (error) {
      console.error('프로젝트 일정 수정 실패:', error);
      throw new Error('프로젝트 일정을 수정하는 중 오류가 발생했습니다.');
    }
  },

  // 프로젝트 일정 삭제
  async deleteProjectSchedule(id: string): Promise<boolean> {
    try {
      await db.collection('project_schedules').doc(id).delete();
      return true;
    } catch (error) {
      console.error('프로젝트 일정 삭제 실패:', error);
      throw new Error('프로젝트 일정을 삭제하는 중 오류가 발생했습니다.');
    }
  }
}; 