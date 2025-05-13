import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

/**
 * Main App component for the HighRoll application
 */
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);

  // Toggle overlay visibility
  const toggleOverlay = () => {
    const newVisibility = !overlayVisible;
    setOverlayVisible(newVisibility);
    
    if (newVisibility) {
      window.electron.showOverlay();
    } else {
      window.electron.hideOverlay();
    }
  };

  // Update overlay transparency
  const updateOverlayOpacity = (opacity) => {
    setOverlayOpacity(opacity);
    window.electron.setOverlayTransparency(opacity);
  };

  return (
    <>
      <Header 
        overlayVisible={overlayVisible} 
        toggleOverlay={toggleOverlay} 
      />
      <div className="main-content">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        <MainContent 
          activeTab={activeTab} 
          overlayOpacity={overlayOpacity}
          updateOverlayOpacity={updateOverlayOpacity}
        />
      </div>
    </>
  );
};

export default App;
