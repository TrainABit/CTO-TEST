import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppSettingsProvider } from './context/AppSettingsContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppSettingsProvider>
      <App />
    </AppSettingsProvider>
  </React.StrictMode>
);
