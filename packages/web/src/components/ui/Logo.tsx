import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'y-mark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
    header: 'h-20'
  };

  const baseClasses = `${sizeClasses[size]} w-auto ${className}`;

  if (variant === 'full') {
    return (
      <img 
        src="/logo.svg" 
        alt="PrivyCycle" 
        className={baseClasses}
      />
    );
  }

  if (variant === 'y-mark') {
    return (
      <img 
        src="/y-logo.svg" 
        alt="PrivyCycle" 
        className={baseClasses}
      />
    );
  }

  // Compact variant - use y-logo for mobile
  return (
    <img 
      src="/y-logo.svg" 
      alt="PrivyCycle" 
      className={baseClasses}
    />
  );
};

interface IllustrationProps {
  type: 'women' | 'gradient' | 'blurb-gradient' | 'round-gradient';
  className?: string;
  alt?: string;
}

export const Illustration: React.FC<IllustrationProps> = ({ 
  type, 
  className = '',
  alt = ''
}) => {
  const svgMap = {
    'women': '/women.svg',
    'gradient': '/gradient.svg',
    'blurb-gradient': '/blurb-gradient.svg',
    'round-gradient': '/round-gradient.svg'
  };

  return (
    <img 
      src={svgMap[type]} 
      alt={alt || `${type} illustration`}
      className={className}
    />
  );
};
