#!/usr/bin/env node

import { seedAllData, seedCollection, resetDatabase, clearAllCollections } from '../services/firestoreSeeder';

// CLI 인자 파싱
const args = process.argv.slice(2);
const command = args[0];

// 사용법 출력
const showUsage = () => {
  console.log(`
📋 Firestore 데이터 시드 도구 사용법:

npm run seed                    # 모든 데이터 시드
npm run seed:reset             # Firestore 초기화 후 모든 데이터 시드
npm run seed:collection <name> # 특정 컬렉션만 시드
npm run seed:clear             # 모든 컬렉션 초기화

사용 가능한 컬렉션:
- users
- projects  
- schedules
- conflicts
- analytics

예시:
npm run seed:collection users
npm run seed:collection schedules
`);
};

// 메인 실행 함수
const main = async () => {
  try {
    console.log('🚀 Firestore 데이터 시드 도구 시작...\n');
    
    switch (command) {
      case 'all':
      case undefined:
        console.log('🌱 모든 데이터 시드 시작...');
        await seedAllData();
        break;
        
      case 'reset':
        console.log('🔄 Firestore 초기화 후 시드 시작...');
        await resetDatabase();
        break;
        
      case 'collection':
        const collectionName = args[1];
        if (!collectionName) {
          console.error('❌ 컬렉션 이름을 지정해주세요.');
          showUsage();
          process.exit(1);
        }
        
        const validCollections = ['users', 'projects', 'schedules', 'conflicts', 'analytics'];
        if (!validCollections.includes(collectionName.toLowerCase())) {
          console.error(`❌ 유효하지 않은 컬렉션: ${collectionName}`);
          console.log(`사용 가능한 컬렉션: ${validCollections.join(', ')}`);
          process.exit(1);
        }
        
        console.log(`🌱 ${collectionName} 컬렉션 시드 시작...`);
        await seedCollection(collectionName);
        break;
        
      case 'clear':
        console.log('🗑️ 모든 컬렉션 초기화 시작...');
        await clearAllCollections();
        break;
        
      case 'help':
      case '--help':
      case '-h':
        showUsage();
        break;
        
      default:
        console.error(`❌ 알 수 없는 명령: ${command}`);
        showUsage();
        process.exit(1);
    }
    
    console.log('\n✅ 모든 작업이 성공적으로 완료되었습니다!');
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  main();
} 