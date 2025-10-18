import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'thin',
  spacing = 'md',
  label,
  labelPosition = 'center'
}) => {
  const thicknessClasses = {
    thin: orientation === 'horizontal' ? 'border-t' : 'border-l',
    medium: orientation === 'horizontal' ? 'border-t-2' : 'border-l-2',
    thick: orientation === 'horizontal' ? 'border-t-4' : 'border-l-4'
  };

  const variantClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted'
  };

  const spacingClasses = {
    horizontal: {
      none: 'my-0',
      sm: 'my-2',
      md: 'my-4',
      lg: 'my-8'
    },
    vertical: {
      none: 'mx-0',
      sm: 'mx-2',
      md: 'mx-4',
      lg: 'mx-8'
    }
  };

  if (label && orientation === 'horizontal') {
    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    return (
      <div className={`relative ${spacingClasses.horizontal[spacing]}`}>
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div
            className={`
              w-full border-gray-300
              ${thicknessClasses[thickness]}
              ${variantClasses[variant]}
            `}
          />
        </div>
        <div className={`relative flex ${alignmentClasses[labelPosition]}`}>
          <span className="bg-white px-3 text-sm text-gray-500">
            {label}
          </span>
        </div>
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <div
        className={`
          border-gray-300 h-full
          ${thicknessClasses[thickness]}
          ${variantClasses[variant]}
          ${spacingClasses.vertical[spacing]}
        `}
      />
    );
  }

  return (
    <hr
      className={`
        border-gray-300
        ${thicknessClasses[thickness]}
        ${variantClasses[variant]}
        ${spacingClasses.horizontal[spacing]}
      `}
    />
  );
};

