import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name: string;
  label?: string;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  helperText?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  name,
  label,
  orientation = 'vertical',
  size = 'md',
  error,
  helperText
}) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue);

  const currentValue = value !== undefined ? value : selectedValue;

  const handleChange = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

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
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-3">
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
          <label
            key={option.value}
            className={`
              flex items-start cursor-pointer
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={currentValue === option.value}
                onChange={() => !option.disabled && handleChange(option.value)}
                disabled={option.disabled}
                className={`
                  ${sizeClasses[size]}
                  text-blue-600 bg-gray-100 border-gray-300
                  focus:ring-blue-500 focus:ring-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer
                  ${error ? 'border-red-500' : ''}
                `}
              />
            </div>

            <div className="ml-3">
              <div className="flex items-center gap-2">
                {option.icon && <span className="text-gray-500">{option.icon}</span>}
                <span className={`${labelSizeClasses[size]} font-medium text-gray-900`}>
                  {option.label}
                </span>
              </div>
              {option.description && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p
          className={`
            mt-2 text-sm
            ${error ? 'text-red-600' : 'text-gray-500'}
          `}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

