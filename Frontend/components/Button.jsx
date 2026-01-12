
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  type = 'button'
}) => {
  const baseStyles = "px-8 py-4 rounded-md font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B71C1C]";
  
  const variants = {
    primary: "bg-[#B71C1C] text-white hover:bg-[#8E1616]",
    secondary: "bg-[#E0E0E0] text-[#1A1A1A] hover:bg-[#D4D4D4]",
    outline: "border-2 border-[#B71C1C] text-[#B71C1C] hover:bg-[#B71C1C] hover:text-white",
    white: "bg-white text-[#B71C1C] hover:bg-gray-100"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
