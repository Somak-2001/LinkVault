import React, { useEffect } from 'react';
import '../styles/toast.css';

const Toast = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
      zIndex: '9999',
      minWidth: '300px',
      maxWidth: '400px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease-out',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    };

    const typeStyles = {
      success: {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))',
        color: 'white',
        icon: '✅',
      },
      error: {
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
        color: 'white',
        icon: '❌',
      },
      warning: {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9))',
        color: 'white',
        icon: '⚠️',
      },
      info: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
        color: 'white',
        icon: 'ℹ️',
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const styles = getToastStyles();

  return (
    <div style={styles}>
      <span style={{ fontSize: '18px' }}>{styles.icon}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '0',
          marginLeft: 'auto',
          opacity: '0.8',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
