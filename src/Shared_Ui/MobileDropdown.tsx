import React, { useState } from 'react';

interface MobileDropdownProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MobileDropdown: React.FC<MobileDropdownProps> = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <button
        type="button"
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-left text-base font-semibold shadow-md focus:outline-none focus:ring-0 focus:border-gray-400 flex justify-between items-center transition hover:border-[#a0aec0] hover:shadow-lg"
        onClick={() => setOpen(o => !o)}
      >
        <span className="truncate text-[#1a2540]">{selected ? selected.label : (placeholder || 'Select...')}</span>
        <svg className={`ml-2 h-5 w-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl bg-white shadow-xl max-h-48 overflow-y-auto border border-gray-200 no-scrollbar py-1">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`block w-full text-left px-4 py-2 text-base hover:bg-[#f1f5f9] transition-colors ${opt.value === value ? 'bg-[#e2e8f0] font-bold text-[#1a2540]' : 'text-[#1a2540]'}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileDropdown;
