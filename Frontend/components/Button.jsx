
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  type = 'button',
  isLoading = false,
  disabled = false
}) => {
  const baseStyles = "px-8 py-4 rounded-md font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100";
  
  const variants = {
    primary: "bg-primary text-white hover:brightness-110",
    secondary: "bg-secondary text-white hover:brightness-110 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]",
    blood: "bg-blood text-white hover:bg-blood-dark",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    white: "bg-white text-secondary hover:bg-gray-100 font-bold"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Please wait...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
