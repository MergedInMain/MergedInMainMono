import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useAppContext } from '../store/AppContext';

/**
 * Main App component for the HighRoll application
 */
const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const {
    activeTab,
    overlayVisible,
    overlayOpacity,
    overlayPosition,
    overlaySize,
    appInfo,
    isLoading,
    error
  } = state;

  // Toggle overlay visibility
  const toggleOverlay = (): void => {
    dispatch({
      type: 'SET_OVERLAY_VISIBLE',
      payload: !overlayVisible
    });
  };

  // Update overlay transparency
  const updateOverlayOpacity = (opacity: number): void => {
    dispatch({
      type: 'SET_OVERLAY_OPACITY',
      payload: opacity
    });
  };

  // Update overlay position
  const updateOverlayPosition = (x: number, y: number): void => {
    dispatch({
      type: 'SET_OVERLAY_POSITION',
      payload: { x, y }
    });
  };

  // Update overlay size
  const updateOverlaySize = (width: number, height: number): void => {
    dispatch({
      type: 'SET_OVERLAY_SIZE',
      payload: { width, height }
    });
  };

  // Set active tab
  const setActiveTab = (tab: string): void => {
    dispatch({
      type: 'SET_ACTIVE_TAB',
      payload: tab
    });
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Application error:', error);
      // You could show an error notification here
    }
  }, [error]);

  // Show loading state
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Header
        overlayVisible={overlayVisible}
        toggleOverlay={toggleOverlay}
        appInfo={appInfo}
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
          overlayPosition={overlayPosition}
          updateOverlayPosition={updateOverlayPosition}
          overlaySize={overlaySize}
          updateOverlaySize={updateOverlaySize}
        />
      </div>
    </>
  );
};

export default App;
