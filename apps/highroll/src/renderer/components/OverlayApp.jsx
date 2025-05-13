import React, { useState, useEffect } from 'react';
import ipcService from '../services/ipc-service';
import StatusIndicator from './StatusIndicator';

/**
 * OverlayApp component for the overlay window
 */
const OverlayApp = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isClickThrough, setIsClickThrough] = useState(false);

  // State for IPC status
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Get initial click-through state
  useEffect(() => {
    const getInitialClickThroughState = async () => {
      try {
        const state = await ipcService.getClickThroughState();
        setIsClickThrough(state);
      } catch (error) {
        console.error('Failed to get click-through state:', error);
      }
    };

    getInitialClickThroughState();
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Toggle click-through mode
  const toggleClickThrough = () => {
    const newState = !isClickThrough;
    setIsClickThrough(newState);

    // Update status
    setStatus('sending');
    setStatusMessage(`Setting click-through to ${newState ? 'enabled' : 'disabled'}`);

    ipcService.setClickThrough(newState);

    // After a short delay, update to success
    setTimeout(() => {
      setStatus('success');
      setStatusMessage(`Click-through ${newState ? 'enabled' : 'disabled'}`);

      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 3000);
    }, 500);
  };

  // Add event listeners for mouse move and up
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Keyboard shortcut for toggling overlay (Alt+Shift+O)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+Shift+C for toggling click-through
      if (e.altKey && e.shiftKey && e.key === 'C') {
        toggleClickThrough();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isClickThrough]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        border: `1px solid ${isClickThrough ? '#00d084' : '#0078d4'}`,
        borderRadius: '4px',
        padding: '10px',
        width: '300px',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '5px',
          backgroundColor: isClickThrough ? '#00d084' : '#0078d4',
          cursor: 'move',
          marginBottom: '10px'
        }}
      >
        <div onMouseDown={handleMouseDown}>
          HighRoll TFT Overlay
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={toggleClickThrough}
            style={{
              backgroundColor: isClickThrough ? '#008f58' : '#005a9e',
              border: 'none',
              color: 'white',
              padding: '2px 5px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title={isClickThrough ? 'Disable Click-Through (Alt+Shift+C)' : 'Enable Click-Through (Alt+Shift+C)'}
          >
            {isClickThrough ? 'Disable Click-Through' : 'Enable Click-Through'}
          </button>
        </div>
      </div>

      {/* Status indicator */}
      {(status !== 'idle' || statusMessage) && (
        <div style={{ marginBottom: '10px' }}>
          <StatusIndicator status={status} message={statusMessage} />
        </div>
      )}

      <div>
        <p>This is a placeholder for the overlay content.</p>
        <p>Game state analysis and recommendations will appear here.</p>
        <p><small>Press Alt+Shift+O to toggle overlay visibility</small></p>
        <p><small>Press Alt+Shift+C to toggle click-through mode</small></p>
      </div>
    </div>
  );
};

export default OverlayApp;
