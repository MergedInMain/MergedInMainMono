import React from 'react';
import ReactDOM from 'react-dom/client';
import OverlayApp from './components/OverlayApp';

// Create root and render the OverlayApp component
const root = ReactDOM.createRoot(document.getElementById('overlay-root'));
root.render(
  <React.StrictMode>
    <OverlayApp />
  </React.StrictMode>
);
