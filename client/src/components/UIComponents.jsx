import React from 'react';
import { Box, Play, CreditCard, User, AlertCircle } from 'lucide-react'; // Icons

// 1. Container - The main wrapper
export const Container = ({ children, className = "" }) => (
  <div className={`p-6 w-full max-w-4xl mx-auto ${className}`}>{children}</div>
);

// 2. Card - A standard content box
export const Card = ({ title, children, footer }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
    {title && (
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Box size={18} className="text-blue-500" />
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
    {footer && <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-500">{footer}</div>}
  </div>
);

// 3. Button - Deterministic variants
export const Button = ({ children, onClick, variant = 'primary', className = "" }) => {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    ghost: "text-gray-600 hover:bg-gray-100"
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${styles[variant] || styles.primary} ${className}`}
    >
      {variant === 'primary' && <Play size={14} />}
      {children}
    </button>
  );
};

// 4. Input - Standardized text entry
export const Input = ({ label, placeholder, type = "text" }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <input 
      type={type} 
      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      placeholder={placeholder} 
    />
  </div>
);

// 5. Alert - For feedback/status
export const Alert = ({ type = "info", children }) => {
  const styles = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200"
  };
  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 ${styles[type]}`}>
      <AlertCircle size={20} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
};

// 6. Row & Col - For Layout (Flexbox wrappers)
export const Row = ({ children, className = "" }) => (
  <div className={`flex flex-wrap gap-4 ${className}`}>{children}</div>
);

export const Col = ({ children, width = "1" }) => (
  <div className={`flex-1 min-w-[${width}]`}>{children}</div>
);

// EXPORT SCOPE FOR REACT-LIVE
export const Scope = { Container, Card, Button, Input, Alert, Row, Col };