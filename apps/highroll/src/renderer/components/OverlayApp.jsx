import React, { useState } from 'react';

/**
 * OverlayApp component for the overlay window
 */
const OverlayApp = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        border: '1px solid #0078d4',
        borderRadius: '4px',
        padding: '10px',
        width: '300px',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          padding: '5px',
          backgroundColor: '#0078d4',
          cursor: 'move',
          marginBottom: '10px'
        }}
        onMouseDown={handleMouseDown}
      >
        HighRoll TFT Overlay
      </div>
      
      <div>
        <p>This is a placeholder for the overlay content.</p>
        <p>Game state analysis and recommendations will appear here.</p>
      </div>
    </div>
  );
};

export default OverlayApp;
