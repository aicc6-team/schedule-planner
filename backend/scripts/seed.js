#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Firestore 시드 데이터 실행 스크립트');
console.log('=====================================');

try {
  // TypeScript 파일을 컴파일하고 실행
  console.log('📦 TypeScript 컴파일 중...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  console.log('🚀 시드 데이터 실행 중...');
  execSync('node dist/scripts/seedFirestore.js', { stdio: 'inherit' });
  
  console.log('✅ 시드 데이터 실행 완료!');
} catch (error) {
  console.error('❌ 시드 데이터 실행 실패:', error.message);
  process.exit(1);
} 