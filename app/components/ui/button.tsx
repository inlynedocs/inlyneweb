import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'lg';
  className?: string;
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1 text-sm',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({ size = 'sm', className = '', children, ...props }) => (
  <button
    className={`
      ${sizeClasses[size]}
      bg-[#EC6D26]
      hover:bg-[#CD5512]
      text-white
      font-semibold
      rounded-2xl
      shadow
      cursor-pointer
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);
