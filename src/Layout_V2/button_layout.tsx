import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  variant?: 'solid' | 'gradient'
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'solid',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center px-5 py-2 rounded-md text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9ec1eb]'

  const variantStyles =
    variant === 'gradient'
      ? 'bg-[linear-gradient(90deg,#2379bb,#206eaa)] hover:opacity-90'
      : 'bg-[#2a6bb7] hover:bg-[#245ca0] active:bg-[#1f4f8a]'

  return (
    <button {...props} className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </button>
  )
}

export default Button
