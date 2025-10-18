import React from 'react';

interface SwitchProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  labelPosition?: 'left' | 'right';
  helperText?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  labelPosition = 'right',
  helperText
}) => {
  const [isChecked, setIsChecked] = React.useState(defaultChecked || false);

  const currentChecked = checked !== undefined ? checked : isChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !currentChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const sizeConfig = {
    sm: {
      container: 'w-9 h-5',
      toggle: 'w-4 h-4',
      translate: 'translate-x-4'
    },
    md: {
      container: 'w-11 h-6',
      toggle: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      container: 'w-14 h-7',
      toggle: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const config = sizeConfig[size];

  const switchElement = (
    <button
      type="button"
      role="switch"
      aria-checked={currentChecked}
      id={id}
      onClick={handleToggle}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${config.container}
        ${currentChecked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-lg
          transform transition-transform duration-200 ease-in-out
          ${config.toggle}
          ${currentChecked ? config.translate : 'translate-x-0.5'}
        `}
      />
    </button>
  );

  if (!label && !helperText) {
    return switchElement;
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`
          flex items-center gap-3
          ${labelPosition === 'left' ? 'flex-row-reverse justify-end' : ''}
        `}
      >
        {switchElement}
        {label && (
          <label
            htmlFor={id}
            className={`
              text-sm font-medium text-gray-900
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {label}
          </label>
        )}
      </div>
      {helperText && (
        <p className="text-sm text-gray-500 ml-14">
          {helperText}
        </p>
      )}
    </div>
  );
};

