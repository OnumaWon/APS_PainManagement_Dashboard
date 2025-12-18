
import React from 'react';

interface CardProps {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, action, className = '' }) => {
  return (
    <div className={`rounded-xl shadow-sm border flex flex-col transition-colors duration-200 ${className} 
      bg-white border-slate-200 
      dark:bg-slate-800 dark:border-slate-700`}>
      <div className="px-6 py-4 border-b flex justify-between items-start 
        border-slate-100 dark:border-slate-700">
        <div className="flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider 
            text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs mt-1 
            text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6 flex-1 min-h-[250px] relative text-slate-900 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
};
