'use client';

import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-secondary-900 bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl`}>
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* 콘텐츠 */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
} 