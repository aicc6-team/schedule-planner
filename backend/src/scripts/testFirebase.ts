import { db } from '../config/firebase';
import 'dotenv/config';

async function testFirebaseConnection() {
  try {
    console.log('🔥 Firebase 연결 테스트 시작...');
    
    // Firestore 연결 테스트
    const testCollection = db.collection('test_connection');
    const testDoc = testCollection.doc('test');
    
    // 테스트 데이터 작성
    await testDoc.set({
      message: 'Firebase 연결 테스트 성공!',
      timestamp: new Date().toISOString(),
      test: true
    });
    
    console.log('✅ Firestore 쓰기 테스트 성공');
    
    // 테스트 데이터 읽기
    const doc = await testDoc.get();
    if (doc.exists) {
      console.log('✅ Firestore 읽기 테스트 성공');
      console.log('📄 읽은 데이터:', doc.data());
    } else {
      console.log('❌ Firestore 읽기 테스트 실패');
    }
    
    // 테스트 데이터 삭제
    await testDoc.delete();
    console.log('✅ Firestore 삭제 테스트 성공');
    
    console.log('🎉 모든 Firebase 연결 테스트 통과!');
    
  } catch (error) {
    console.error('❌ Firebase 연결 테스트 실패:', error);
    throw error;
  }
}

// 스크립트 실행
if (require.main === module) {
  testFirebaseConnection()
    .then(() => {
      console.log('✅ 테스트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 테스트 실패:', error);
      process.exit(1);
    });
}

export { testFirebaseConnection }; 