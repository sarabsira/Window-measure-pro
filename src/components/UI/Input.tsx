import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  unit?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, unit, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 disabled:bg-slate-50 disabled:text-slate-500 ${
              error
                ? 'border-red-400 bg-red-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            } ${unit ? 'pr-12' : ''} ${className}`}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">
              {unit}
            </span>
          )}
        </div>
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
