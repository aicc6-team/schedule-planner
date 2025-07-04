import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

const firebaseConfig = {
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
  universe_domain: process.env['FIREBASE_UNIVERSE_DOMAIN'],
};

if (!getApps().length) {
  initializeApp({
    credential: cert(firebaseConfig as any),
  });
}

export const db = getFirestore();

// Firebase Auth 인스턴스 가져오기
export const getFirebaseAuth = () => {
  return getAuth();
};

// 컬렉션 참조 헬퍼 함수들
export const getCollection = (collectionName: string) => {
  return db.collection(collectionName);
};

export const getDocument = (collectionName: string, docId: string) => {
  return db.collection(collectionName).doc(docId);
};

export const getBatch = () => {
  return db.batch();
};

export const getTransaction = () => {
  return db.runTransaction.bind(db);
}; 