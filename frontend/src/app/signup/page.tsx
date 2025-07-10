'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    department: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 회원가입 로직 구현
    console.log('회원가입 시도:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-600">
            회원가입
          </h2>
          <p className="mt-2 text-secondary-600">
            내 일정을 부탁해에 가입하세요
          </p>
        </div>
        
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field mt-1"
                placeholder="홍길동"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field mt-1"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-secondary-700">
                회사명
              </label>
              <input
                id="company"
                name="company"
                type="text"
                className="input-field mt-1"
                placeholder="회사명을 입력하세요"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-secondary-700">
                부서
              </label>
              <select
                id="department"
                name="department"
                className="input-field mt-1"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">부서를 선택하세요</option>
                <option value="개발팀">개발팀</option>
                <option value="기획팀">기획팀</option>
                <option value="디자인팀">디자인팀</option>
                <option value="마케팅팀">마케팅팀</option>
                <option value="영업팀">영업팀</option>
                <option value="인사팀">인사팀</option>
                <option value="기타">기타</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field mt-1"
                placeholder="8자 이상 입력하세요"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-field mt-1"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-secondary-700">
                <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                  이용약관
                </Link>과{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                  개인정보처리방침
                </Link>에 동의합니다
              </label>
            </div>
            
            <div>
              <button type="submit" className="btn-primary w-full">
                회원가입
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => console.log('Google 회원가입')}
              >
                Google로 회원가입
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-500">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 