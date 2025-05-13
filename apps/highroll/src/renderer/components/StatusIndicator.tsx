import React, { useState, useEffect } from 'react';

interface StatusIndicatorProps {
  status: 'idle' | 'sending' | 'receiving' | 'success' | 'error';
  message?: string;
  duration?: number;
}

/**
 * StatusIndicator component for showing IPC communication status
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  message = '', 
  duration = 3000 
}) => {
  const [visible, setVisible] = useState(true);

  // Auto-hide the indicator after duration (if not idle or error)
  useEffect(() => {
    if (status !== 'idle' && status !== 'error') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [status, duration]);

  // Reset visibility when status changes
  useEffect(() => {
    setVisible(true);
  }, [status]);

  if (!visible) return null;

  // Determine the color based on status
  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return '#888888';
      case 'sending':
        return '#0078d4';
      case 'receiving':
        return '#0078d4';
      case 'success':
        return '#00d084';
      case 'error':
        return '#d32f2f';
      default:
        return '#888888';
    }
  };

  // Determine the icon based on status
  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return '⚪';
      case 'sending':
        return '↑';
      case 'receiving':
        return '↓';
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '⚪';
    }
  };

  return (
    <div 
      className="status-indicator"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: `${getStatusColor()}20`,
        color: getStatusColor(),
        border: `1px solid ${getStatusColor()}`,
        marginBottom: '8px',
        fontSize: '14px',
        transition: 'all 0.3s ease'
      }}
    >
      <span style={{ marginRight: '8px', fontWeight: 'bold' }}>
        {getStatusIcon()}
      </span>
      <span>
        {message || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

export default StatusIndicator;
