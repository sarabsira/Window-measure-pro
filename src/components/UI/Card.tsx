import React from 'react';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden ${
        hoverable ? 'cursor-pointer hover:shadow-md hover:border-teal-200 transition-all duration-200' : ''
      } ${className}`}
    >
      {header && (
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">{header}</div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
