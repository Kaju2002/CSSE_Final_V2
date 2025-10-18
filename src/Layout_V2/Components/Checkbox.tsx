import React from 'react';

interface CheckboxProps {
  id?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  helperText?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  indeterminate = false,
  size = 'md',
  error,
  helperText
}) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={checkboxRef}
            id={id}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className={`
              ${sizeClasses[size]}
              text-blue-600 bg-gray-100 border-gray-300 rounded
              focus:ring-blue-500 focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer
              ${error ? 'border-red-500' : ''}
            `}
          />
        </div>
        {label && (
          <label
            htmlFor={id}
            className={`
              ml-2 ${labelSizeClasses[size]} font-medium text-gray-900
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {label}
          </label>
        )}
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p
          className={`
            mt-1 text-sm ml-7
            ${error ? 'text-red-600' : 'text-gray-500'}
          `}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// Checkbox Group Component
interface CheckboxGroupProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string[];
  onChange?: (values: string[]) => void;
  label?: string;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value = [],
  onChange,
  label,
  orientation = 'vertical',
  size = 'md'
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter(v => v !== optionValue);
    onChange?.(newValue);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <div
        className={`
          flex gap-4
          ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}
        `}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            id={option.value}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={(checked) => handleChange(option.value, checked)}
            disabled={option.disabled}
            size={size}
          />
        ))}
      </div>
    </div>
  );
};

