import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';
// Firebase Admin SDK 초기화
const initializeFirebase = () => {
  if (getApps().length === 0) {
    // 환경 변수에서 Firebase 설정 가져오기
    const serviceAccount = {
      type: process.env['FIREBASE_TYPE'],
      project_id: process.env['FIREBASE_PROJECT_ID'],
      private_key_id: process.env['FIREBASE_PRIVATE_KEY_ID'],
      private_key: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
      client_email: process.env['FIREBASE_CLIENT_EMAIL'],
      client_id: process.env['FIREBASE_CLIENT_ID'],
      auth_uri: process.env['FIREBASE_AUTH_URI'],
      token_uri: process.env['FIREBASE_TOKEN_URI'],
      auth_provider_x509_cert_url: process.env['FIREBASE_AUTH_PROVIDER_X509_CERT_URL'],
      client_x509_cert_url: process.env['FIREBASE_CLIENT_X509_CERT_URL'],
    };

    const appOptions: any = {
      credential: cert(serviceAccount as any),
    };

    if (process.env['FIREBASE_DATABASE_URL']) {
      appOptions.databaseURL = process.env['FIREBASE_DATABASE_URL'];
    }

    initializeApp(appOptions);

    console.log('✅ Firebase Admin SDK 초기화 완료');
  }

  return {
    db: getFirestore(),
    auth: getAuth(),
  };
};

// Firestore 데이터베이스 인스턴스 가져오기
export const getFirestoreDB = () => {
  const { db } = initializeFirebase();
  return db;
};

// Firebase Auth 인스턴스 가져오기
export const getFirebaseAuth = () => {
  const { auth } = initializeFirebase();
  return auth;
};

// Firestore 컬렉션 참조 가져오기
export const getCollection = (collectionName: string) => {
  const db = getFirestoreDB();
  return db.collection(collectionName);
};

// Firestore 문서 참조 가져오기
export const getDocument = (collectionName: string, docId: string) => {
  const db = getFirestoreDB();
  return db.collection(collectionName).doc(docId);
};

// 배치 작업을 위한 배치 인스턴스 가져오기
export const getBatch = () => {
  const db = getFirestoreDB();
  return db.batch();
};

// 트랜잭션을 위한 트랜잭션 인스턴스 가져오기
export const getTransaction = () => {
  const db = getFirestoreDB();
  return db.runTransaction;
}; 