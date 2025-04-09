import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { 
  Calendar, 
  Clock, 
  Users, 
  UserCircle, 
  FileText, 
  Clipboard, 
  BarChart3, 
  Calendar as CalendarIcon,
  Stethoscope
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Dados de exemplo para os gráficos
const appointmentsData = [
  { day: 'Seg', appointments: 8 },
  { day: 'Ter', appointments: 10 },
  { day: 'Qua', appointments: 6 },
  { day: 'Qui', appointments: 12 },
  { day: 'Sex', appointments: 9 },
  { day: 'Sáb', appointments: 4 },
  { day: 'Dom', appointments: 0 },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portal do Médico</h1>
            <p className="text-gray-500 mt-1">Bem-vindo(a), Dr(a). {user?.name || 'Nome do Médico'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800 py-1">Cardiologia</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Consultas Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">8</div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Próxima: 10:30 - Maria Silva</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pacientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">143</div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">+12 nos últimos 30 dias</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Prontuários Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">3</div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Atualizados: 28 de abril</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="medical-records" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span className="hidden md:inline">Prontuários</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Estatísticas</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden md:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Consultas de Hoje</CardTitle>
                <CardDescription>
                  Terça-feira, 30 de abril de 2025
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center justify-center bg-gray-100 p-2 rounded-lg min-w-[70px]">
                          <span className="text-xs text-gray-500">
                            {i === 0 ? '09:00' : i === 1 ? '10:30' : i === 2 ? '14:15' : '16:00'}
                          </span>
                          <span className="text-sm font-semibold">
                            {i === 0 ? '09:30' : i === 1 ? '11:00' : i === 2 ? '14:45' : '16:30'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {i === 0 ? 'João Silva' : i === 1 ? 'Maria Santos' : i === 2 ? 'Carlos Ferreira' : 'Ana Oliveira'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {i === 0 ? 'Consulta de rotina' : i === 1 ? 'Retorno' : i === 2 ? 'Exames' : 'Primeira consulta'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                          Prontuário
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                          Atender
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t p-3">
                <a href="/doctor/agenda" className="text-blue-600 hover:underline text-sm">
                  Ver agenda completa
                </a>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consultas da Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notificações Recentes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            i % 3 === 0 ? "bg-blue-100 text-blue-600" : 
                            i % 3 === 1 ? "bg-green-100 text-green-600" : 
                            "bg-amber-100 text-amber-600"
                          }`}>
                            {i % 3 === 0 ? <CalendarIcon className="h-4 w-4" /> : 
                             i % 3 === 1 ? <Stethoscope className="h-4 w-4" /> : 
                             <FileText className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {i % 3 === 0 ? "Nova consulta agendada" : 
                               i % 3 === 1 ? "Resultados de exame adicionados" : 
                               "Prontuário atualizado"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {i === 0 ? "Há 30 minutos" : i === 1 ? "Há 2 horas" : i === 2 ? "Ontem" : "2 dias atrás"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meus Pacientes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">JS</span>
                      </div>
                      <div>
                        <p className="font-medium">João Silva</p>
                        <p className="text-sm text-gray-500">45 anos - Hipertensão</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:underline">Prontuário</button>
                      <button className="text-green-600 hover:underline">Agendar</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="medical-records" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 medical-record-selector">
                <Card>
                  <CardHeader>
                    <CardTitle>Selecionar Paciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <input type="text" placeholder="Buscar paciente..." className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-md cursor-pointer">
                        <p className="font-medium">João Pereira</p>
                        <p className="text-xs text-gray-500">65 anos - Hipertensão, Diabetes</p>
                      </div>
                      <div className="p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
                        <p className="font-medium">Maria Silva</p>
                        <p className="text-xs text-gray-500">43 anos - Asma</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-span-2 medical-record-detail">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Prontuário: João Pereira</CardTitle>
                      <CardDescription>Última atualização: 25/04/2025</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                        Histórico
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                        Editar
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Informações Básicas</h3>
                          <div className="space-y-2">
                            <div className="flex">
                              <span className="w-36 text-gray-500">Nome:</span>
                              <span>João Pereira</span>
                            </div>
                            <div className="flex">
                              <span className="w-36 text-gray-500">Data de Nascimento:</span>
                              <span>10/05/1960 (65 anos)</span>
                            </div>
                            <div className="flex">
                              <span className="w-36 text-gray-500">Gênero:</span>
                              <span>Masculino</span>
                            </div>
                            <div className="flex">
                              <span className="w-36 text-gray-500">Tipo Sanguíneo:</span>
                              <span>O+</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Condições</h3>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-red-100 text-red-800">Crônica</Badge>
                              <span>Hipertensão</span>
                            </div>
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-red-100 text-red-800">Crônica</Badge>
                              <span>Diabetes Tipo 2</span>
                            </div>
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-yellow-100 text-yellow-800">Controlada</Badge>
                              <span>Colesterol Alto</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Histórico</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium">Alergias</h4>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Penicilina</li>
                              <li>Amendoim</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Cirurgias</h4>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Apendicectomia (2005)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Consultas por Especialidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Cardiologia</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Check-up</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1 doctor-profile">
                <CardHeader>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <UserCircle className="h-16 w-16 text-gray-500" />
                    </div>
                    <CardTitle>Dr. {user?.name || "Carlos Mendes"}</CardTitle>
                    <p className="text-sm text-gray-500">Cardiologia</p>
                    <div className="flex items-center mt-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">CRM-12345</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Informações de Contato</h3>
                      <p className="mt-1">{user?.email || "carlos.mendes@hospital.com"}</p>
                      <p className="mt-1">{user?.phoneNumber || "(11) 98765-4321"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Especialização</h3>
                      <div className="mt-1 space-y-1">
                        <Badge className="bg-blue-100 text-blue-800">Cardiologia</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Horário de Atendimento</h3>
                      <p className="mt-1 text-sm">Seg-Sex: 09:00 - 18:00</p>
                      <p className="text-sm">Sábado: 09:00 - 12:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Horários de Atendimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <form>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs mb-1">Segunda à Sexta</label>
                          <input type="text" defaultValue="09:00 - 18:00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Sábado</label>
                          <input type="text" defaultValue="09:00 - 12:00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
}