import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './AdminApp.tsx';
import './index.css';

// Simple routing based on URL path
const isAdminRoute = window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin');

// Handle admin routing for both hash and path-based routing
const handleAdminRouting = () => {
  // If we're on admin route but not authenticated, stay on admin
  if (window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin')) {
    return true;
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {handleAdminRouting() ? <AdminApp /> : <App />}
  </StrictMode>
);

// Handle navigation for SPA routing
window.addEventListener('popstate', () => {
  window.location.reload();
});