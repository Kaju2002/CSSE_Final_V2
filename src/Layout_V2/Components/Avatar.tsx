import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  shape?: 'circle' | 'rounded' | 'square';
  badge?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  shape = 'circle',
  badge
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={`${sizeClasses[size]} ${shapeClasses[shape]} object-cover`}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]} ${shapeClasses[shape]}
            flex items-center justify-center
            bg-gradient-to-br from-blue-500 to-purple-600
            text-white font-semibold
          `}
        >
          {name ? getInitials(name) : '?'}
        </div>
      )}

      {/* Status Indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block
            ${statusSizes[size]} ${statusColors[status]}
            rounded-full ring-2 ring-white
          `}
        />
      )}

      {/* Badge */}
      {badge && (
        <span className="absolute -top-1 -right-1">
          {badge}
        </span>
      )}
    </div>
  );
};

