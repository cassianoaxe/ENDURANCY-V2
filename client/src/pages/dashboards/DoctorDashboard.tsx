import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

// Tour Guide removido pois ficou tecnologicamente defasado
import { Calendar, Clock, Users, FileText, Settings, UserCircle, Clipboard, HeartPulse } from 'lucide-react';

// Dados de demonstração
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Portal do Médico</h1>
          <p className="text-gray-500 mt-1">Bem-vindo(a), Dr(a). {user?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Cardiologia</span>
        </div>
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
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Estatísticas</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span className="hidden md:inline">Perfil</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 doctor-stats">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-xs text-green-500">2 concluídas, 3 restantes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Próxima Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">14:30</div>
                <p className="text-xs text-gray-500">Maria Silva - Check-up</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">32</div>
                <p className="text-xs text-green-500">+4 comparado à semana anterior</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="schedule-calendar">
            <CardHeader>
              <CardTitle>Agenda do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Quinta-feira, 27 de Julho de 2023</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200">Anterior</button>
                    <button className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200">Próximo</button>
                  </div>
                </div>
                
                <div className="space-y-2 today-appointments">
                  {/* Consulta atual (destacada) */}
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-semibold">14:00 - 14:30</span>
                          <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Em andamento</span>
                        </div>
                        <h4 className="font-medium mt-1">João Pereira</h4>
                        <p className="text-sm text-gray-600">Consulta de rotina - Hipertensão</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90">Atender</button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Adiar</button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Próximas consultas */}
                  <div className="p-4 bg-white border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-semibold">14:30 - 15:00</span>
                        </div>
                        <h4 className="font-medium mt-1">Maria Silva</h4>
                        <p className="text-sm text-gray-600">Check-up anual</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Ver detalhes</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-semibold">15:30 - 16:00</span>
                        </div>
                        <h4 className="font-medium mt-1">Pedro Santos</h4>
                        <p className="text-sm text-gray-600">Primeira consulta - Avaliação cardíaca</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Ver detalhes</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-semibold">16:30 - 17:00</span>
                        </div>
                        <h4 className="font-medium mt-1">Ana Oliveira</h4>
                        <p className="text-sm text-gray-600">Retorno - Resultados de exames</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Ver detalhes</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Seção para consultas concluídas */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-500 mb-2">Consultas Concluídas (2)</h3>
                  <div className="space-y-2 completed-appointments">
                    <div className="p-4 bg-gray-50 border rounded-md opacity-75">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="font-semibold">09:00 - 09:30</span>
                            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Concluída</span>
                          </div>
                          <h4 className="font-medium mt-1">Carlos Mendes</h4>
                          <p className="text-sm text-gray-600">Retorno - Acompanhamento pós-cirúrgico</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Ver prontuário</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border rounded-md opacity-75">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="font-semibold">10:30 - 11:00</span>
                            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Concluída</span>
                          </div>
                          <h4 className="font-medium mt-1">Luiza Costa</h4>
                          <p className="text-sm text-gray-600">Consulta de rotina</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Ver prontuário</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patients" className="space-y-4">
          <Card className="patient-list">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meus Pacientes</CardTitle>
              <div className="flex items-center space-x-2">
                <input type="text" placeholder="Buscar paciente..." className="px-3 py-1 border rounded-md" />
                <select className="px-3 py-1 border rounded-md">
                  <option>Todos</option>
                  <option>Ativos</option>
                  <option>Inativos</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">Nome</th>
                      <th scope="col" className="px-6 py-3">Idade</th>
                      <th scope="col" className="px-6 py-3">Diagnóstico</th>
                      <th scope="col" className="px-6 py-3">Última Consulta</th>
                      <th scope="col" className="px-6 py-3">Próxima Consulta</th>
                      <th scope="col" className="px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Maria Silva</td>
                      <td className="px-6 py-4">43</td>
                      <td className="px-6 py-4">Hipertensão</td>
                      <td className="px-6 py-4">10/07/2023</td>
                      <td className="px-6 py-4">Hoje, 14:30</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:underline mr-3">Prontuário</button>
                        <button className="text-green-600 hover:underline">Agendar</button>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">João Pereira</td>
                      <td className="px-6 py-4">65</td>
                      <td className="px-6 py-4">Hipertensão, Diabetes</td>
                      <td className="px-6 py-4">Hoje, 14:00</td>
                      <td className="px-6 py-4">15/08/2023</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:underline mr-3">Prontuário</button>
                        <button className="text-green-600 hover:underline">Agendar</button>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Pedro Santos</td>
                      <td className="px-6 py-4">52</td>
                      <td className="px-6 py-4">Avaliação cardíaca</td>
                      <td className="px-6 py-4">N/A (Primeira consulta)</td>
                      <td className="px-6 py-4">Hoje, 15:30</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:underline mr-3">Prontuário</button>
                        <button className="text-green-600 hover:underline">Agendar</button>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Ana Oliveira</td>
                      <td className="px-6 py-4">38</td>
                      <td className="px-6 py-4">Arritmia cardíaca</td>
                      <td className="px-6 py-4">20/06/2023</td>
                      <td className="px-6 py-4">Hoje, 16:30</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:underline mr-3">Prontuário</button>
                        <button className="text-green-600 hover:underline">Agendar</button>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Carlos Mendes</td>
                      <td className="px-6 py-4">57</td>
                      <td className="px-6 py-4">Pós-operatório bypass</td>
                      <td className="px-6 py-4">Hoje, 09:00</td>
                      <td className="px-6 py-4">20/08/2023</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:underline mr-3">Prontuário</button>
                        <button className="text-green-600 hover:underline">Agendar</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                      <p className="text-xs text-gray-500">43 anos - Hipertensão</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
                      <p className="font-medium">Pedro Santos</p>
                      <p className="text-xs text-gray-500">52 anos - Avaliação cardíaca</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
                      <p className="font-medium">Ana Oliveira</p>
                      <p className="text-xs text-gray-500">38 anos - Arritmia cardíaca</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-2 medical-record-view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Prontuário: João Pereira</CardTitle>
                    <p className="text-sm text-gray-500">65 anos, Masculino - Última atualização: Hoje, 14:00</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90">Editar</button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Imprimir</button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-lg mb-2">Informações Pessoais</h3>
                        <div className="space-y-2">
                          <div className="flex">
                            <span className="font-medium w-32">Data de Nasc:</span>
                            <span>15/03/1958</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">CPF:</span>
                            <span>123.456.789-00</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Telefone:</span>
                            <span>(11) 98765-4321</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Email:</span>
                            <span>joao.pereira@email.com</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Endereço:</span>
                            <span>Rua das Flores, 123, São Paulo, SP</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg mb-2">Histórico Médico</h3>
                        <div className="space-y-2">
                          <div className="flex">
                            <span className="font-medium w-32">Alergias:</span>
                            <span>Penicilina, Sulfas</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Doenças:</span>
                            <span>Hipertensão (desde 2010), Diabetes tipo 2 (desde 2015)</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Cirurgias:</span>
                            <span>Apendicectomia (1990)</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Medicamentos:</span>
                            <span>Losartana 50mg, Metformina 850mg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Consultas Recentes</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">Hoje, 14:00</span>
                            <span className="text-blue-600">Consulta de rotina</span>
                          </div>
                          <p className="mt-1 text-sm">Paciente relatou tontura ocasional. Pressão arterial: 140/90 mmHg. Glicemia: 130 mg/dL. Recomendado ajuste na medicação e exames complementares.</p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">10/06/2023</span>
                            <span className="text-blue-600">Consulta de rotina</span>
                          </div>
                          <p className="mt-1 text-sm">Paciente estável. Pressão arterial: 135/85 mmHg. Glicemia: 120 mg/dL. Mantida medicação atual.</p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">15/03/2023</span>
                            <span className="text-blue-600">Consulta de rotina</span>
                          </div>
                          <p className="mt-1 text-sm">Paciente queixou-se de dor no peito ocasional. Realizado ECG: normal. Pressão arterial: 145/95 mmHg. Ajustada dose de Losartana para 50mg 2x ao dia.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Exames</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="font-medium">Hemograma Completo</p>
                          <p className="text-xs text-gray-500">Realizado em: 05/06/2023</p>
                          <button className="mt-1 text-sm text-blue-600 hover:underline">Ver resultados</button>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="font-medium">Perfil Lipídico</p>
                          <p className="text-xs text-gray-500">Realizado em: 05/06/2023</p>
                          <button className="mt-1 text-sm text-blue-600 hover:underline">Ver resultados</button>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="font-medium">Glicemia em Jejum</p>
                          <p className="text-xs text-gray-500">Realizado em: 05/06/2023</p>
                          <button className="mt-1 text-sm text-blue-600 hover:underline">Ver resultados</button>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="font-medium">Eletrocardiograma</p>
                          <p className="text-xs text-gray-500">Realizado em: 15/03/2023</p>
                          <button className="mt-1 text-sm text-blue-600 hover:underline">Ver resultados</button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consultas este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">48</div>
                <p className="text-xs text-green-500">+12% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Novos Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">7</div>
                <p className="text-xs text-green-500">+2 em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Satisfação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">98%</div>
                <p className="text-xs text-green-500">+2% em relação ao mês anterior</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Consultas da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2} name="Consultas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="diagnoses-chart">
              <CardHeader>
                <CardTitle>Diagnósticos Mais Comuns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="ml-2 w-24 text-sm">Hipertensão</span>
                    <span className="ml-2 text-sm font-medium">70%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="ml-2 w-24 text-sm">Arritmia</span>
                    <span className="ml-2 text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="ml-2 w-24 text-sm">Diabetes</span>
                    <span className="ml-2 text-sm font-medium">35%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="ml-2 w-24 text-sm">Colesterol</span>
                    <span className="ml-2 text-sm font-medium">25%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="ml-2 w-24 text-sm">Outros</span>
                    <span className="ml-2 text-sm font-medium">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="age-distribution">
              <CardHeader>
                <CardTitle>Distribuição de Pacientes por Idade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="w-24 text-sm">0-18</span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">5%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm">19-30</span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">10%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm">31-45</span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">25%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm">46-60</span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">35%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm">61+</span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">25%</span>
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
                  <CardTitle>Dr. Carlos Mendes</CardTitle>
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
                    <p className="mt-1">carlos.mendes@hospital.com</p>
                    <p>(11) 1234-5678</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Especialização</h3>
                    <p className="mt-1">Cardiologia Clínica</p>
                    <p>Ecocardiografia</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Formação</h3>
                    <p className="mt-1">Universidade de São Paulo (USP)</p>
                    <p>Residência: Hospital das Clínicas</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Idiomas</h3>
                    <p className="mt-1">Português, Inglês, Espanhol</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2 doctor-settings">
              <CardHeader>
                <CardTitle>Configurações do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input type="text" defaultValue="Carlos Mendes" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CRM</label>
                      <input type="text" defaultValue="CRM-12345" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" defaultValue="carlos.mendes@hospital.com" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefone</label>
                      <input type="tel" defaultValue="(11) 1234-5678" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Biografia Profissional</label>
                    <textarea 
                      defaultValue="Cardiologista com mais de 15 anos de experiência em tratamento de doenças cardiovasculares. Especializado em ecocardiografia e manejo de hipertensão."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" 
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Especialidades</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Cardiologia Clínica</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Ecocardiografia</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>Cardiologia Intervencionista</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>Arritmias Cardíacas</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Horários de Atendimento</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs mb-1">Segunda</label>
                        <input type="text" defaultValue="09:00 - 18:00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Terça</label>
                        <input type="text" defaultValue="09:00 - 18:00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Quarta</label>
                        <input type="text" defaultValue="09:00 - 18:00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Quinta</label>
                        <input type="text" defaultValue="09:00 - 18:00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Sexta</label>
                        <input type="text" defaultValue="09:00 - 18:00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Sábado</label>
                        <input type="text" defaultValue="09:00 - 12:00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Domingo</label>
                        <input type="text" defaultValue="-" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                      Cancelar
                    </button>
                    <button type="button" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* Tour Guide removido pois ficou tecnologicamente defasado */}
    </div>
  );
}