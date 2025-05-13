import React from 'react';

/**
 * Header component for the main application window
 * @param {Object} props - Component props
 * @param {boolean} props.overlayVisible - Whether the overlay is currently visible
 * @param {Function} props.toggleOverlay - Function to toggle overlay visibility
 */
const Header = ({ overlayVisible, toggleOverlay }) => {
  return (
    <header className="header">
      <h1>HighRoll TFT Overlay</h1>
      <div>
        <button 
          className="button" 
          onClick={toggleOverlay}
        >
          {overlayVisible ? 'Hide Overlay' : 'Show Overlay'}
        </button>
      </div>
    </header>
  );
};

export default Header;
