import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import TourGuide from '@/components/features/TourGuide';
import { User, CircleUser, Activity, Calendar, FileText, Settings, Users, HeartPulse, PanelRight, Stethoscope } from 'lucide-react';

// Dados de demonstração
const appointmentsData = [
  { month: 'Jan', appointments: 120 },
  { month: 'Fev', appointments: 150 },
  { month: 'Mar', appointments: 180 },
  { month: 'Abr', appointments: 220 },
  { month: 'Mai', appointments: 250 },
  { month: 'Jun', appointments: 280 },
  { month: 'Jul', appointments: 310 },
];

const userTypesData = [
  { month: 'Jan', doctors: 8, patients: 120 },
  { month: 'Fev', doctors: 10, patients: 150 },
  { month: 'Mar', doctors: 12, patients: 180 },
  { month: 'Abr', doctors: 12, patients: 220 },
  { month: 'Mai', doctors: 15, patients: 250 },
  { month: 'Jun', doctors: 18, patients: 280 },
  { month: 'Jul', doctors: 20, patients: 310 },
];

export default function OrgAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Organizacional</h1>
          <p className="text-gray-500 mt-1">Bem-vindo, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Plano Premium</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden md:inline">Médicos</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Pacientes</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Consultas</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dashboard-stats">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Médicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">20</div>
                <p className="text-xs text-green-500">+2 no último mês</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">310</div>
                <p className="text-xs text-green-500">+30 no último mês</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consultas (Mês Atual)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">128</div>
                <p className="text-xs text-green-500">+12% em relação ao mês anterior</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={appointmentsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userTypesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="doctors" fill="#8884d8" name="Médicos" />
                      <Bar dataKey="patients" fill="#82ca9d" name="Pacientes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Consultas de Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3">Paciente</th>
                        <th scope="col" className="px-6 py-3">Médico</th>
                        <th scope="col" className="px-6 py-3">Horário</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Maria Silva</td>
                        <td className="px-6 py-4">Dr. Carlos Mendes</td>
                        <td className="px-6 py-4">14:00</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Confirmada</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Ver</button>
                          <button className="text-red-600 hover:underline">Cancelar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">João Pereira</td>
                        <td className="px-6 py-4">Dra. Ana Ferreira</td>
                        <td className="px-6 py-4">15:30</td>
                        <td className="px-6 py-4">
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Aguardando</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Ver</button>
                          <button className="text-red-600 hover:underline">Cancelar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Luiza Costa</td>
                        <td className="px-6 py-4">Dr. Roberto Alves</td>
                        <td className="px-6 py-4">16:45</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Confirmada</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Ver</button>
                          <button className="text-red-600 hover:underline">Cancelar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="doctors" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 doctors-list">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lista de Médicos</CardTitle>
                <button className="add-doctor-button px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                  Adicionar Médico
                </button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">Especialidade</th>
                        <th scope="col" className="px-6 py-3">CRM</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Consultas/Mês</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Dr. Carlos Mendes</td>
                        <td className="px-6 py-4">Cardiologia</td>
                        <td className="px-6 py-4">CRM-12345</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">42</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Editar</button>
                          <button className="text-red-600 hover:underline">Desativar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Dra. Ana Ferreira</td>
                        <td className="px-6 py-4">Dermatologia</td>
                        <td className="px-6 py-4">CRM-67890</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">38</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Editar</button>
                          <button className="text-red-600 hover:underline">Desativar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Dr. Roberto Alves</td>
                        <td className="px-6 py-4">Ortopedia</td>
                        <td className="px-6 py-4">CRM-54321</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">35</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Editar</button>
                          <button className="text-red-600 hover:underline">Desativar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Dra. Juliana Santos</td>
                        <td className="px-6 py-4">Pediatria</td>
                        <td className="px-6 py-4">CRM-98765</td>
                        <td className="px-6 py-4">
                          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Férias</span>
                        </td>
                        <td className="px-6 py-4">0</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Editar</button>
                          <button className="text-green-600 hover:underline">Ativar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Dr. Marcos Oliveira</td>
                        <td className="px-6 py-4">Clínica Geral</td>
                        <td className="px-6 py-4">CRM-24680</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">45</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Editar</button>
                          <button className="text-red-600 hover:underline">Desativar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="patients" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 patients-list">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lista de Pacientes</CardTitle>
                <button className="add-patient-button px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                  Adicionar Paciente
                </button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">CPF</th>
                        <th scope="col" className="px-6 py-3">Data de Nascimento</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Última Consulta</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Maria Silva</td>
                        <td className="px-6 py-4">123.456.789-00</td>
                        <td className="px-6 py-4">15/05/1980</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">10/07/2023</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Ver Prontuário</button>
                          <button className="text-green-600 hover:underline">Agendar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">João Pereira</td>
                        <td className="px-6 py-4">987.654.321-00</td>
                        <td className="px-6 py-4">22/11/1975</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">05/07/2023</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Ver Prontuário</button>
                          <button className="text-green-600 hover:underline">Agendar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Luiza Costa</td>
                        <td className="px-6 py-4">456.789.123-00</td>
                        <td className="px-6 py-4">30/03/1990</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">20/06/2023</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Ver Prontuário</button>
                          <button className="text-green-600 hover:underline">Agendar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Pedro Santos</td>
                        <td className="px-6 py-4">789.123.456-00</td>
                        <td className="px-6 py-4">12/09/1985</td>
                        <td className="px-6 py-4">
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Inativo</span>
                        </td>
                        <td className="px-6 py-4">15/02/2023</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Ver Prontuário</button>
                          <button className="text-green-600 hover:underline">Agendar</button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Ana Oliveira</td>
                        <td className="px-6 py-4">321.654.987-00</td>
                        <td className="px-6 py-4">05/12/1982</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">25/07/2023</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:underline mr-3">Ver Prontuário</button>
                          <button className="text-green-600 hover:underline">Agendar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-xs text-gray-500">3 restantes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consultas Esta Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">48</div>
                <p className="text-xs text-green-500">+8% em relação à semana anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5%</div>
                <p className="text-xs text-green-500">-2% em relação ao mês anterior</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="appointment-calendar">
            <CardHeader>
              <CardTitle>Calendário de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 border rounded-md">
                <p className="text-lg font-medium">Componente de Calendário</p>
                <p className="text-sm text-gray-500">Interface de calendário para visualização e agendamento de consultas</p>
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                  Agendar Nova Consulta
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">R$ 45.325,00</div>
                <p className="text-xs text-green-500">+12% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Médio por Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">R$ 150,00</div>
                <p className="text-xs text-green-500">+5% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consultas Pendentes de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8</div>
                <p className="text-xs text-gray-500">R$ 1.200,00 em aberto</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">ID</th>
                      <th scope="col" className="px-6 py-3">Paciente</th>
                      <th scope="col" className="px-6 py-3">Médico</th>
                      <th scope="col" className="px-6 py-3">Data</th>
                      <th scope="col" className="px-6 py-3">Valor</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">#1234</td>
                      <td className="px-6 py-4 font-medium">Maria Silva</td>
                      <td className="px-6 py-4">Dr. Carlos Mendes</td>
                      <td className="px-6 py-4">25/07/2023</td>
                      <td className="px-6 py-4">R$ 150,00</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Pago</span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">#1235</td>
                      <td className="px-6 py-4 font-medium">João Pereira</td>
                      <td className="px-6 py-4">Dra. Ana Ferreira</td>
                      <td className="px-6 py-4">24/07/2023</td>
                      <td className="px-6 py-4">R$ 180,00</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Pago</span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">#1236</td>
                      <td className="px-6 py-4 font-medium">Luiza Costa</td>
                      <td className="px-6 py-4">Dr. Roberto Alves</td>
                      <td className="px-6 py-4">24/07/2023</td>
                      <td className="px-6 py-4">R$ 200,00</td>
                      <td className="px-6 py-4">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Pendente</span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">#1237</td>
                      <td className="px-6 py-4 font-medium">Pedro Santos</td>
                      <td className="px-6 py-4">Dr. Marcos Oliveira</td>
                      <td className="px-6 py-4">23/07/2023</td>
                      <td className="px-6 py-4">R$ 150,00</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Pago</span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">#1238</td>
                      <td className="px-6 py-4 font-medium">Ana Oliveira</td>
                      <td className="px-6 py-4">Dra. Juliana Santos</td>
                      <td className="px-6 py-4">23/07/2023</td>
                      <td className="px-6 py-4">R$ 180,00</td>
                      <td className="px-6 py-4">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Pendente</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="org-settings">
              <CardHeader>
                <CardTitle>Configurações da Organização</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome da Organização</label>
                    <input type="text" defaultValue="Hospital Santa Maria" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Principal</label>
                    <input type="email" defaultValue="contato@santamaria.com" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <input type="tel" defaultValue="(11) 1234-5678" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço</label>
                    <textarea defaultValue="Av. Paulista, 1000 - São Paulo, SP" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" rows={3}></textarea>
                  </div>
                  <button type="button" className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90">
                    Salvar Alterações
                  </button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="billing-info">
              <CardHeader>
                <CardTitle>Informações de Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium text-lg">Plano Atual: Premium</h3>
                    <p className="text-sm text-gray-500 mt-1">Renovação em: 15/08/2023</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold">R$ 299/mês</span>
                      <button className="text-blue-600 hover:underline">Alterar Plano</button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium">Método de Pagamento</h3>
                    <div className="flex items-center mt-2">
                      <div className="bg-gray-200 rounded-md p-2 mr-3">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <path d="M2 10h20" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Cartão terminando em 4242</p>
                        <p className="text-sm text-gray-500">Expira em 12/2024</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:underline mt-3 block">Alterar método de pagamento</button>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium">Histórico de Faturas</h3>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span>15/07/2023</span>
                        <span>R$ 299,00</span>
                        <button className="text-blue-600 hover:underline">PDF</button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>15/06/2023</span>
                        <span>R$ 299,00</span>
                        <button className="text-blue-600 hover:underline">PDF</button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>15/05/2023</span>
                        <span>R$ 299,00</span>
                        <button className="text-blue-600 hover:underline">PDF</button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Tour Guide para primeiro acesso */}
      <TourGuide
        tourId="org-admin-dashboard-tour"
        steps={[
          {
            selector: '.dashboard-stats',
            title: 'Estatísticas da Organização',
            content: 'Aqui você vê os principais números da sua organização: médicos, pacientes e consultas.',
            buttonText: 'Próximo',
            placementBeacon: 'top',
          },
          {
            selector: '.doctors-list',
            title: 'Gerenciamento de Médicos',
            content: 'Visualize e gerencie todos os médicos da sua organização. Adicione novos médicos ou edite informações existentes.',
            buttonText: 'Próximo',
            placementBeacon: 'top',
          },
          {
            selector: '.patients-list',
            title: 'Gerenciamento de Pacientes',
            content: 'Visualize e gerencie todos os pacientes atendidos em sua organização.',
            buttonText: 'Próximo',
            placementBeacon: 'top',
          },
          {
            selector: '.appointment-calendar',
            title: 'Agenda de Consultas',
            content: 'Gerencie todas as consultas em um calendário interativo. Agende, reagende ou cancele consultas.',
            buttonText: 'Próximo',
            placementBeacon: 'top',
          },
          {
            selector: '.org-settings',
            title: 'Configurações da Organização',
            content: 'Atualize as informações e configurações da sua organização.',
            buttonText: 'Próximo',
            placementBeacon: 'left',
          },
          {
            selector: '.billing-info',
            title: 'Informações de Pagamento',
            content: 'Verifique seu plano atual, método de pagamento e acesse o histórico de faturas.',
            buttonText: 'Finalizar Tour',
            placementBeacon: 'left',
          },
        ]}
      />
    </div>
  );
}