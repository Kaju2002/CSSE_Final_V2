import React, { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  variant?: 'default' | 'bordered' | 'separated';
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  variant = 'default'
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  const variantClasses = {
    default: 'border-b border-gray-200',
    bordered: 'border border-gray-200 rounded-lg mb-2',
    separated: 'bg-white border border-gray-200 rounded-lg mb-3 shadow-sm'
  };

  return (
    <div className="w-full">
      {items.map((item, index) => {
        const isOpen = openItems.includes(item.id);
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            className={`
              ${variant === 'default' && !isLast ? variantClasses[variant] : ''}
              ${variant !== 'default' ? variantClasses[variant] : ''}
            `}
          >
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={`
                w-full flex items-center justify-between px-4 py-4
                text-left font-medium text-gray-900
                hover:bg-gray-50 transition-colors
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${variant === 'bordered' || variant === 'separated' ? 'rounded-t-lg' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-gray-500">{item.icon}</span>}
                <span>{item.title}</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              className={`
                overflow-hidden transition-all duration-200 ease-in-out
                ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="px-4 py-4 text-gray-700 bg-gray-50">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

