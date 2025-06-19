import { useState, useEffect } from 'react';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { Dashboard } from './components/admin/Dashboard';
import { MachineManagement } from './components/admin/MachineManagement';
import { InventoryManagement } from './components/admin/InventoryManagement';
import { Analytics } from './components/admin/Analytics';
import { ItemsManagement } from './components/admin/ItemsManagement';
import { adminApi } from './services/adminApi';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/sonner';

function AdminApp() {
  const { isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [alertCount, setAlertCount] = useState(0);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Load alert count
      const loadAlerts = async () => {
        try {
          const response = await adminApi.getInventoryAlerts();
          if (response.success) {
            setAlertCount(response.data.length);
          }
        } catch (error) {
          console.error('Error loading alerts:', error);
        }
      };

      loadAlerts();
    }
  }, [isAuthenticated]);

  const handleLogin = async (username: string, password: string) => {
    setLoginLoading(true);
    setLoginError('');
    
    const result = await login(username, password);
    
    if (!result.success) {
      setLoginError(result.error || 'Login failed');
    }
    
    setLoginLoading(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'machines':
        return <MachineManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'analytics':
        return <Analytics />;
      case 'items':
        return <ItemsManagement />;
      case 'users':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
            <p className="text-white/80">User management features coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin 
          onLogin={handleLogin} 
          error={loginError}
          loading={loginLoading}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show admin dashboard if authenticated
  return (
    <AdminLayout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      alertCount={alertCount}
      onLogout={logout}
    >
      {renderPage()}
      <Toaster position="top-right" />
    </AdminLayout>
  );
}

export default AdminApp;