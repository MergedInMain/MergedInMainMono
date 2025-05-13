import React from 'react';
import Dashboard from './Dashboard';
import Settings from './Settings';

/**
 * Main content area that displays different tabs based on selection
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {number} props.overlayOpacity - Current overlay opacity
 * @param {Function} props.updateOverlayOpacity - Function to update overlay opacity
 */
const MainContent = ({ activeTab, overlayOpacity, updateOverlayOpacity }) => {
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'compositions':
        return <div className="card"><h2>Team Compositions</h2><p>This feature will be implemented in Phase 3.</p></div>;
      case 'items':
        return <div className="card"><h2>Item Optimizer</h2><p>This feature will be implemented in Phase 3.</p></div>;
      case 'augments':
        return <div className="card"><h2>Augment Analysis</h2><p>This feature will be implemented in Phase 3.</p></div>;
      case 'settings':
        return <Settings overlayOpacity={overlayOpacity} updateOverlayOpacity={updateOverlayOpacity} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="content">
      {renderContent()}
    </div>
  );
};

export default MainContent;
