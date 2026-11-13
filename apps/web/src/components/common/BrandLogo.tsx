import React from 'react';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  symbolClassName?: string;
  textClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  symbolClassName = '',
  textClassName = '',
}) => {
  const sizeStyles = {
    sm: {
      box: 'w-6 h-6 rounded-lg text-xs font-black shadow-xs',
      text: 'text-base font-extrabold tracking-tight',
      gap: 'gap-2',
    },
    md: {
      box: 'w-8 h-8 rounded-xl text-base font-black shadow-sm',
      text: 'text-xl font-extrabold tracking-tight',
      gap: 'gap-2.5',
    },
    lg: {
      box: 'w-10 h-10 rounded-2xl text-lg font-black shadow-md',
      text: 'text-2xl font-black tracking-tight',
      gap: 'gap-3',
    },
  }[size];

  return (
    <div className={`flex items-center ${sizeStyles.gap} select-none ${className}`}>
      <div
        className={`${sizeStyles.box} bg-blue-600 text-white flex items-center justify-center shadow-blue-500/20 shrink-0 transition-transform ${symbolClassName}`}
        aria-hidden="true"
      >
        B
      </div>
      {showText && (
        <span className={`${sizeStyles.text} text-gray-900 ${textClassName}`}>
          Boim
        </span>
      )}
    </div>
  );
};
