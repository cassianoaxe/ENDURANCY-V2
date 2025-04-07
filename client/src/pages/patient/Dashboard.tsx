import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Package, MessageSquare, ShoppingBag, FileEdit, CalendarClock, Phone, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Prescription {
  id: number;
  medicamento: string;
  dosagem: string;
  medico: string;
  validade: string;
  status: 'ativa' | 'inativa' | 'expirada';
}

interface Appointment {
  id: number;
  medico: string;
  tipo: string;
  data: string;
  horario: string;
  modalidade: 'presencial' | 'telemedicina';
}

interface Subscription {
  id: number;
  nome: string;
  valor: number;
  vencimento: string;
  pagamento: string;
  status: 'pago' | 'pendente' | 'atrasado';
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [treatmentStatus, setTreatmentStatus] = useState({
    months: 0,
    activeMedications: 0,
    nextAppointmentDays: 0,
    pendingOrders: 0
  });

  // Simulação de carregamento de dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Aqui, em um ambiente real, você faria chamadas à API para buscar os dados
        // Por enquanto, vamos simular os dados baseados na imagem

        // Simular pequeno atraso para mostrar estado de carregamento
        await new Promise(resolve => setTimeout(resolve, 800));

        setCurrentPrescription({
          id: 1,
          medicamento: 'CBD Oil 5%',
          dosagem: '20mg 2x daily',
          medico: 'Dr. João Mendes',
          validade: '2024-05-19',
          status: 'ativa'
        });

        setNextAppointment({
          id: 1,
          medico: 'Dr. João Mendes',
          tipo: 'Follow-up',
          data: '2023-08-15',
          horario: '14:30',
          modalidade: 'telemedicina'
        });

        setSubscription({
          id: 1,
          nome: 'Anuidade 2024',
          valor: 120.00,
          vencimento: '2024-03-15',
          pagamento: '2024-03-10',
          status: 'pago'
        });

        setTreatmentStatus({
          months: 6,
          activeMedications: 2,
          nextAppointmentDays: 3,
          pendingOrders: 1
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Função para verificar se uma data já passou
  const isExpired = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 dark:text-green-400 font-semibold text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Portal do Paciente</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.name || 'Maria Oliveira'} • MediCannabis Farma
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={() => setLocation('/api/auth/logout')}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 3-column grid with cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Prescrição Atual */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prescrição Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPrescription ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{currentPrescription.medicamento}</h3>
                    <p className="text-sm text-gray-500">{currentPrescription.dosagem}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Médico:</span>
                      <span>{currentPrescription.medico}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Válido até:</span>
                      <span>{formatDate(currentPrescription.validade)}</span>
                    </p>
                  </div>
                  <Badge 
                    className={
                      currentPrescription.status === 'ativa' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                    }
                  >
                    {currentPrescription.status === 'ativa' ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma prescrição ativa encontrada.</p>
              )}
            </CardContent>
          </Card>

          {/* Próxima Consulta */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Próxima Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{nextAppointment.medico}</h3>
                    <p className="text-sm text-gray-500">{nextAppointment.tipo}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Data: {formatDate(nextAppointment.data)}</span>
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Horário: {nextAppointment.horario}</span>
                    </p>
                  </div>
                  <Badge 
                    className={
                      nextAppointment.modalidade === 'telemedicina'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                    }
                  >
                    {nextAppointment.modalidade === 'telemedicina' ? 'Telemedicina' : 'Presencial'}
                  </Badge>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma consulta agendada.</p>
              )}
            </CardContent>
          </Card>

          {/* Status da Anuidade */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status da Anuidade</CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{subscription.nome}</h3>
                    <p className="text-xl font-medium">R$ {subscription.valor.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Vencimento:</span>
                      <span>{formatDate(subscription.vencimento)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Pago em:</span>
                      <span>{formatDate(subscription.pagamento)}</span>
                    </p>
                  </div>
                  <Badge 
                    className={
                      subscription.status === 'pago' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : subscription.status === 'pendente'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                    }
                  >
                    {subscription.status === 'pago' ? 'Pago' : 
                     subscription.status === 'pendente' ? 'Pendente' : 'Atrasado'}
                  </Badge>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma informação de anuidade encontrada.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md border">
            <TabsTrigger value="visao-geral" className="rounded-sm">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="produtos" className="rounded-sm">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="meus-pedidos" className="rounded-sm">
              Meus Pedidos
            </TabsTrigger>
            <TabsTrigger value="prescricoes" className="rounded-sm">
              Prescrições
            </TabsTrigger>
            <TabsTrigger value="documentos" className="rounded-sm">
              Documentos
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="rounded-sm">
              Mensagens
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Fazer um Pedido
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileEdit className="mr-2 h-4 w-4" />
                  Enviar Nova Prescrição
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Agendar Consulta
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  Contatar Médico
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status do Tratamento */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-rose-600">
                  <HeartPulse className="mr-2 h-5 w-5" />
                  <span>Acompanhamento ativo - {treatmentStatus.months} meses</span>
                </div>
                
                <div className="flex items-center text-blue-600">
                  <Pill className="mr-2 h-5 w-5" />
                  <span>{treatmentStatus.activeMedications} medicações ativas</span>
                </div>
                
                <div className="flex items-center text-emerald-600">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Próxima consulta em {treatmentStatus.nextAppointmentDays} dias</span>
                </div>
                
                <div className="flex items-center text-purple-600">
                  <Package className="mr-2 h-5 w-5" />
                  <span>{treatmentStatus.pendingOrders} pedido em trânsito</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Components that are missing from imports
const Bell = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
);

const HeartPulse = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
  </svg>
);

const Pill = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
    <path d="m8.5 8.5 7 7"></path>
  </svg>
);

export default PatientDashboard;