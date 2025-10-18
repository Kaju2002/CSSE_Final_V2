import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse'
}) => {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'circular' ? '40px' : undefined)
  };

  return (
    <div
      className={`
        bg-gray-200
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
};

// Skeleton Group for common loading patterns
interface SkeletonGroupProps {
  type: 'card' | 'list' | 'profile' | 'table';
  rows?: number;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  type,
  rows = 3
}) => {
  switch (type) {
    case 'card':
      return (
        <div className="border rounded-lg p-4 space-y-3">
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" />
        </div>
      );

    case 'list':
      return (
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'profile':
      return (
        <div className="flex items-start space-x-4">
          <Skeleton variant="circular" width={80} height={80} />
          <div className="flex-1 space-y-3">
            <Skeleton variant="text" width="30%" height={24} />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="70%" />
            <div className="flex space-x-2 mt-4">
              <Skeleton variant="rounded" width={100} height={36} />
              <Skeleton variant="rounded" width={100} height={36} />
            </div>
          </div>
        </div>
      );

    case 'table':
      return (
        <div className="space-y-2">
          <div className="flex space-x-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={40} width="25%" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex space-x-2">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <Skeleton key={colIndex} variant="text" width="25%" />
              ))}
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
};

