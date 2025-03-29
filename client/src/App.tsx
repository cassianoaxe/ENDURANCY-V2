import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Organizations from "@/pages/Organizations";
import OrganizationRegistration from "@/pages/OrganizationRegistration";
import EmailTemplates from "@/pages/EmailTemplates";
import Settings from "@/pages/Settings";
import OrderView from "@/pages/OrderView";
import Login from "@/pages/Login";
import ActivityLog from "@/pages/ActivityLog";
import Backups from "@/pages/Backups";
import Emergencies from "@/pages/Emergencies";
import Plans from "@/pages/Plans";
import Requests from "@/pages/Requests";
import Financial from "@/pages/Financial";
import Administrators from "@/pages/Administrators";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import TourGuide from "@/components/features/TourGuide";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import role-specific dashboards
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import OrgAdminDashboard from "@/pages/dashboards/OrgAdminDashboard";
import DoctorDashboard from "@/pages/dashboards/DoctorDashboard";
import PatientDashboard from "@/pages/dashboards/PatientDashboard";

// Simple AppContent component with no external routing library
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Listen for path changes
  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePathChange);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  // Check if user is authenticated - redirect to login if not
  useEffect(() => {
    if (!isLoading && !isAuthenticated && currentPath !== '/login') {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }
  }, [isLoading, isAuthenticated, currentPath]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, only show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (isAuthenticated && currentPath === '/login') {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  }

  // Render the appropriate component based on the current path and user role
  const renderContent = () => {
    const { user } = useAuth();
    const userRole = user?.role;

    // Check if the path matches an order view pattern (/orders/123)
    if (currentPath.startsWith('/orders/')) {
      return <OrderView />;
    }
    
    // Role-specific dashboards
    if (currentPath === '/dashboard' || currentPath === '/') {
      if (userRole === 'admin') {
        return <AdminDashboard />;
      } else if (userRole === 'org_admin') {
        return <OrgAdminDashboard />;
      } else if (userRole === 'doctor') {
        return <DoctorDashboard />;
      } else if (userRole === 'patient') {
        return <PatientDashboard />;
      }
      // Fallback to the original dashboard if role isn't recognized
      return <Dashboard />;
    }
    
    // Handle organization-specific routes
    if (currentPath.startsWith('/organization/')) {
      return (
        <ProtectedRoute allowedRoles={['org_admin']}>
          {currentPath === '/organization/dashboard' ? <OrgAdminDashboard /> : <NotFound />}
        </ProtectedRoute>
      );
    }
    
    // Handle doctor-specific routes
    if (currentPath.startsWith('/doctor/')) {
      return (
        <ProtectedRoute allowedRoles={['doctor']}>
          {currentPath === '/doctor/dashboard' ? <DoctorDashboard /> : <NotFound />}
        </ProtectedRoute>
      );
    }
    
    // Handle patient-specific routes
    if (currentPath.startsWith('/patient/')) {
      return (
        <ProtectedRoute allowedRoles={['patient']}>
          {currentPath === '/patient/dashboard' ? <PatientDashboard /> : <NotFound />}
        </ProtectedRoute>
      );
    }
    
    // Admin-specific routes require admin privileges
    if (['/analytics', '/activity-log', '/backups', '/emergencies', 
         '/plans', '/organizations', '/organization-registration', 
         '/requests', '/financial', '/email-templates', 
         '/administrators', '/settings'].includes(currentPath)) {
      return (
        <ProtectedRoute allowedRoles={['admin']}>
          {(() => {
            switch (currentPath) {
              case '/analytics': return <Analytics />;
              case '/activity-log': return <ActivityLog />;
              case '/backups': return <Backups />;
              case '/emergencies': return <Emergencies />;
              case '/plans': return <Plans />;
              case '/organizations': return <Organizations />;
              case '/organization-registration': return <OrganizationRegistration />;
              case '/requests': return <Requests />;
              case '/financial': return <Financial />;
              case '/email-templates': return <EmailTemplates />;
              case '/administrators': return <Administrators />;
              case '/settings': return <Settings />;
              default: return <NotFound />;
            }
          })()}
        </ProtectedRoute>
      );
    }
    
    // Default case for unrecognized paths
    return <NotFound />;
  };

  // Return the app content
  return (
    <>
      <Layout>
        {renderContent()}
      </Layout>
      <TourGuide />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;