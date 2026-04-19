import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl px-5 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7FB77E] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[#7FB77E] hover:bg-[#6ea06c] text-white shadow-sm",
    secondary: "bg-white border-2 border-[#7FB77E] text-[#7FB77E] hover:bg-[#F5F0E6] shadow-sm",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
