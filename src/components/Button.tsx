import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp';
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  icon: Icon 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer";
  const variants = {
    primary: "bg-green-700 text-white hover:bg-green-800",
    secondary: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    outline: "border-2 border-white text-white hover:bg-white/10",
    whatsapp: "bg-green-500 text-white hover:bg-green-600"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};
