'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FilterDropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  className = "" 
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-secondary-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          className="input-field text-left flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'text-secondary-900' : 'text-secondary-500'}>
            {selectedOption ? selectedOption.label : '선택하세요'}
          </span>
          <ChevronDownIcon className={`h-5 w-5 text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-200 rounded-md shadow-lg">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 배경 클릭 시 닫기 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 