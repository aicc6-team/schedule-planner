import { useState } from 'react';

interface TagAutocompleteInputProps {
  options: string[];
  value: string[];
  onChange: (names: string[]) => void;
  placeholder?: string;
}

export default function TagAutocompleteInput({ options, value, onChange, placeholder }: TagAutocompleteInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 입력값 변경 시 자동완성 추천
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    // 콤마(,) 입력 시 분리해서 태그 추가
    if (val.includes(',')) {
      const names = val.split(',').map(v => v.trim()).filter(Boolean);
      const newTags = [...value, ...names.filter(n => n && !value.includes(n))];
      onChange(newTags);
      setInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 자동완성 추천
    if (val.length > 0) {
      setSuggestions(options.filter(opt => opt.includes(val) && !value.includes(opt)));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 태그 추가
  const addTag = (name: string) => {
    if (!value.includes(name) && name) {
      onChange([...value, name]);
    }
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // 태그 삭제
  const removeTag = (name: string) => {
    onChange(value.filter(v => v !== name));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-1 min-h-[40px] items-center border border-slate-300 rounded-lg px-2 py-1 bg-white focus-within:ring-2 focus-within:ring-blue-500">
        {value.map(name => (
          <span key={name} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {name}
            <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" onClick={() => removeTag(name)}>
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
              addTag(input.trim());
              e.preventDefault();
            }
            if (e.key === 'Backspace' && !input && value.length > 0) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={placeholder}
          className="border-none outline-none min-w-[120px] flex-1 py-1"
          onFocus={() => input && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow z-10 max-h-40 overflow-auto">
          {suggestions.map(s => (
            <div
              key={s}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
              onMouseDown={() => addTag(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 