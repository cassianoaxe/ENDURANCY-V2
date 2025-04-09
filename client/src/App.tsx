import { Suspense, lazy, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/globals.css';

// Lazy-loaded components
const Login = lazy(() => import('./pages/LoginSimple'));
const PatientLogin = lazy(() => import('./pages/PatientLogin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const OrgDashboard = lazy(() => import('./pages/organization/Dashboard'));
const DoctorDashboard = lazy(() => import('./pages/doctor/Dashboard'));
const DoctorPrescricoes = lazy(() => import('./pages/doctor/Prescricoes'));
const DoctorAfiliacao = lazy(() => import('./pages/doctor/Afiliacao'));
const DoctorProntuarios = lazy(() => import('./pages/doctor/Prontuarios'));
const DoctorAgenda = lazy(() => import('./pages/doctor/Agenda'));
const DoctorPacientes = lazy(() => import('./pages/doctor/Pacientes'));
const ManagerDashboard = lazy(() => import('./pages/manager/Dashboard'));
const PatientDashboard = lazy(() => import('./pages/patient/Dashboard'));
const PatientPrescriptions = lazy(() => import('./pages/patient/Prescriptions'));
const PharmacistPrescriptions = lazy(() => import('./pages/pharmacist/Prescriptions'));

export default function App() {
  const [location, setLocation] = useLocation();
  
  // Check authentication status
  const { data: user, isLoading, isError, error } = useQuery({ 
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });
  
  useEffect(() => {
    console.log('Caminho atual:', location);
    console.log('Usuário autenticado:', !!user);
    console.log('Papel do usuário:', user?.role);
    
    // Check authentication status
    console.log('Verificando status de autenticação...');
    
    if (!user && location !== '/login' && !location.includes('/patient-login') && !location.includes('/register')) {
      console.log('Caminho atual:', '/login');
      console.log('Usuário não autenticado. Status:', isError ? 401 : 'carregando');
      if (isError) {
        console.log('Erro de autenticação:', JSON.stringify(error));
      }
    }
  }, [location, user, isError, error]);

  // Role-based redirect
  useEffect(() => {
    if (user && location === '/login') {
      switch(user.role) {
        case 'admin':
          setLocation('/admin/dashboard');
          break;
        case 'org_admin':
          setLocation('/organization/dashboard');
          break;
        case 'manager':
          setLocation('/manager/dashboard');
          break;
        case 'doctor':
          setLocation('/doctor/dashboard');
          break;
        case 'pharmacist':
          setLocation('/pharmacist/prescriptions');
          break;
        case 'patient':
          setLocation('/patient/dashboard');
          break;
        default:
          setLocation('/dashboard');
      }
    }
  }, [user, location, setLocation]);

  // Loading fallback
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  // Error handling for network issues
  if (isError && location !== '/login' && !location.includes('/patient-login')) {
    // Redirect to login page for authentication errors
    if (location !== '/login') {
      setTimeout(() => setLocation('/login'), 50);
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Erro de conexão</h1>
        <p className="text-center mb-6">
          Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.
        </p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        <Button variant="outline" className="mt-2" onClick={() => setLocation('/login')}>Ir para Login</Button>
        <Toaster />
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* Public routes */}
          <Route path="/login" component={Login} />
          <Route path="/patient-login/:organizationId?" component={PatientLogin} />
          <Route path="/patient-login" component={PatientLogin} />
          
          {/* Doctor routes */}
          <Route path="/doctor/dashboard" component={DoctorDashboard} />
          <Route path="/doctor/prescricoes" component={DoctorPrescricoes} />
          <Route path="/doctor/afiliacao" component={DoctorAfiliacao} />
          <Route path="/doctor/prontuarios" component={DoctorProntuarios} />
          <Route path="/doctor/agenda" component={DoctorAgenda} />
          <Route path="/doctor/pacientes" component={DoctorPacientes} />
          
          {/* Pharmacist routes */}
          <Route path="/pharmacist/prescriptions" component={PharmacistPrescriptions} />
          
          {/* Patient routes */}
          <Route path="/patient/dashboard" component={PatientDashboard} />
          <Route path="/patient/prescriptions" component={PatientPrescriptions} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" component={AdminDashboard} />
          
          {/* Organization admin routes */}
          <Route path="/organization/dashboard" component={OrgDashboard} />
          
          {/* Manager routes */}
          <Route path="/manager/dashboard" component={ManagerDashboard} />
          
          {/* Default route */}
          <Route path="/dashboard" component={Dashboard} />
          
          {/* Home route */}
          <Route path="/">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Bem-vindo à plataforma médica</h1>
                <p className="mb-6">Por favor, faça login para continuar</p>
                <Button onClick={() => setLocation('/login')}>Ir para Login</Button>
              </div>
            </div>
          </Route>
          
          {/* 404 route */}
          <Route>
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Página não encontrada</h1>
                <p className="mb-6">A página que você está procurando não existe.</p>
                <Button onClick={() => setLocation('/')}>Voltar para o início</Button>
              </div>
            </div>
          </Route>
        </Switch>
      </Suspense>
      <Toaster />
    </>
  );
}