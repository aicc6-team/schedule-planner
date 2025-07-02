import fs from 'fs/promises';
import path from 'path';
import { getCollection, getBatch } from '../config/firebase';

// JSON 파일에서 데이터 읽기
const readJsonFile = async (filename: string): Promise<any[]> => {
  try {
    const filePath = path.join(__dirname, '../../data', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ JSON 파일 읽기 실패 (${filename}):`, error);
    throw error;
  }
};

// Users 데이터 삽입
const seedUsers = async (): Promise<void> => {
  try {
    const users = await readJsonFile('users.json');
    const usersCollection = getCollection('users');
    const batch = getBatch();
    
    for (const user of users) {
      const docRef = usersCollection.doc(user.id);
      batch.set(docRef, {
        email: user.email,
        name: user.name,
        role: user.role,
        team: user.team,
        avatar: user.avatar,
        google_access_token: user.google_access_token,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at)
      });
    }
    
    await batch.commit();
    console.log(`✅ Users 데이터 삽입 완료 (${users.length}개)`);
  } catch (error) {
    console.error('❌ Users 데이터 삽입 실패:', error);
    throw error;
  }
};

// Projects 데이터 삽입
const seedProjects = async (): Promise<void> => {
  try {
    const projects = await readJsonFile('projects.json');
    const projectsCollection = getCollection('projects');
    const batch = getBatch();
    
    for (const project of projects) {
      const docRef = projectsCollection.doc(project.id);
      batch.set(docRef, {
        name: project.name,
        description: project.description,
        deadline: new Date(project.deadline),
        status: project.status,
        team: project.team,
        members: project.members,
        created_by: project.created_by,
        created_at: new Date(project.created_at),
        updated_at: new Date(project.updated_at)
      });
    }
    
    await batch.commit();
    console.log(`✅ Projects 데이터 삽입 완료 (${projects.length}개)`);
  } catch (error) {
    console.error('❌ Projects 데이터 삽입 실패:', error);
    throw error;
  }
};

// Schedules 데이터 삽입
const seedSchedules = async (): Promise<void> => {
  try {
    const schedules = await readJsonFile('schedules.json');
    const schedulesCollection = getCollection('schedules');
    const batch = getBatch();
    
    for (const schedule of schedules) {
      const docRef = schedulesCollection.doc(schedule.id);
      batch.set(docRef, {
        project_id: schedule.project_id,
        title: schedule.title,
        description: schedule.description,
        start_time: new Date(schedule.start_time),
        end_time: new Date(schedule.end_time),
        assignee: schedule.assignee,
        priority: schedule.priority,
        status: schedule.status,
        type: schedule.type,
        resource_distribution: schedule.resource_distribution,
        total_people: schedule.total_people,
        google_event_id: schedule.google_event_id,
        created_at: new Date(schedule.created_at),
        updated_at: new Date(schedule.updated_at)
      });
    }
    
    await batch.commit();
    console.log(`✅ Schedules 데이터 삽입 완료 (${schedules.length}개)`);
  } catch (error) {
    console.error('❌ Schedules 데이터 삽입 실패:', error);
    throw error;
  }
};

// Conflicts 데이터 삽입
const seedConflicts = async (): Promise<void> => {
  try {
    const conflicts = await readJsonFile('conflicts.json');
    const conflictsCollection = getCollection('conflicts');
    const batch = getBatch();
    
    for (const conflict of conflicts) {
      const docRef = conflictsCollection.doc(conflict.id);
      batch.set(docRef, {
        schedule_id: conflict.schedule_id,
        conflicting_schedule_id: conflict.conflicting_schedule_id,
        conflict_type: conflict.conflict_type,
        description: conflict.description,
        severity: conflict.severity,
        status: conflict.status,
        resolution: conflict.resolution,
        created_at: new Date(conflict.created_at),
        resolved_at: conflict.resolved_at ? new Date(conflict.resolved_at) : null
      });
    }
    
    await batch.commit();
    console.log(`✅ Conflicts 데이터 삽입 완료 (${conflicts.length}개)`);
  } catch (error) {
    console.error('❌ Conflicts 데이터 삽입 실패:', error);
    throw error;
  }
};

// Analytics 데이터 삽입
const seedAnalytics = async (): Promise<void> => {
  try {
    const analytics = await readJsonFile('analytics.json');
    const analyticsCollection = getCollection('analytics');
    const batch = getBatch();
    
    for (const analytic of analytics) {
      const docRef = analyticsCollection.doc(analytic.id);
      batch.set(docRef, {
        project_id: analytic.project_id,
        metric_name: analytic.metric_name,
        value: analytic.value,
        unit: analytic.unit,
        period: analytic.period,
        date: new Date(analytic.date),
        description: analytic.description
      });
    }
    
    await batch.commit();
    console.log(`✅ Analytics 데이터 삽입 완료 (${analytics.length}개)`);
  } catch (error) {
    console.error('❌ Analytics 데이터 삽입 실패:', error);
    throw error;
  }
};

// 전체 데이터 시드 실행
export const seedAllData = async (): Promise<void> => {
  try {
    console.log('🌱 Firestore 데이터 시드 시작...');
    
    // 순서 중요: 참조 관계를 고려하여 순서대로 삽입
    await seedUsers();
    await seedProjects();
    await seedSchedules();
    await seedConflicts();
    await seedAnalytics();
    
    console.log('✅ 모든 데이터 시드 완료!');
  } catch (error) {
    console.error('❌ 데이터 시드 실패:', error);
    throw error;
  }
};

// 특정 컬렉션만 시드
export const seedCollection = async (collectionName: string): Promise<void> => {
  try {
    console.log(`🌱 ${collectionName} 컬렉션 시드 시작...`);
    
    switch (collectionName.toLowerCase()) {
      case 'users':
        await seedUsers();
        break;
      case 'projects':
        await seedProjects();
        break;
      case 'schedules':
        await seedSchedules();
        break;
      case 'conflicts':
        await seedConflicts();
        break;
      case 'analytics':
        await seedAnalytics();
        break;
      default:
        throw new Error(`알 수 없는 컬렉션: ${collectionName}`);
    }
    
    console.log(`✅ ${collectionName} 컬렉션 시드 완료!`);
  } catch (error) {
    console.error(`❌ ${collectionName} 컬렉션 시드 실패:`, error);
    throw error;
  }
};

// Firestore 컬렉션 초기화 (모든 문서 삭제)
export const clearCollection = async (collectionName: string): Promise<void> => {
  try {
    console.log(`🗑️ ${collectionName} 컬렉션 초기화 시작...`);
    
    const collection = getCollection(collectionName);
    const snapshot = await collection.get();
    const batch = getBatch();
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ ${collectionName} 컬렉션 초기화 완료 (${snapshot.docs.length}개 문서 삭제)`);
  } catch (error) {
    console.error(`❌ ${collectionName} 컬렉션 초기화 실패:`, error);
    throw error;
  }
};

// 모든 컬렉션 초기화
export const clearAllCollections = async (): Promise<void> => {
  try {
    console.log('🗑️ 모든 컬렉션 초기화 시작...');
    
    const collections = ['analytics', 'conflicts', 'schedules', 'projects', 'users'];
    
    for (const collectionName of collections) {
      await clearCollection(collectionName);
    }
    
    console.log('✅ 모든 컬렉션 초기화 완료');
  } catch (error) {
    console.error('❌ 컬렉션 초기화 실패:', error);
    throw error;
  }
};

// 데이터베이스 초기화 (모든 컬렉션 삭제 후 재생성)
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Firestore 데이터베이스 초기화 시작...');
    
    await clearAllCollections();
    await seedAllData();
    
    console.log('✅ Firestore 데이터베이스 초기화 완료');
  } catch (error) {
    console.error('❌ Firestore 데이터베이스 초기화 실패:', error);
    throw error;
  }
}; 