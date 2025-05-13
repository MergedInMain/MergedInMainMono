import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useAppContext } from '../store/AppContext';

/**
 * Main App component for the HighRoll application
 */
const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { activeTab, overlayVisible, overlayOpacity } = state;

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

  // Set active tab
  const setActiveTab = (tab: string): void => {
    dispatch({
      type: 'SET_ACTIVE_TAB',
      payload: tab
    });
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
