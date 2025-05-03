import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardSectionProps> = ({ className = '', children, ...props }) => (
  <div className={`flex items-center space-x-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<CardSectionProps> = ({ className = '', children, ...props }) => (
  <div className={`text-gray-700 dark:text-gray-300 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;