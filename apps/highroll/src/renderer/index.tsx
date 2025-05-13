import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { AppContextProvider } from './store/AppContext';
import './styles.css';

// Create root and render the App component
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>
);
