import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-blue-600"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M16 24c0-4.4 3.6-8 8-8s8 3.6 8 8"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx="24"
          cy="24"
          r="3"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
