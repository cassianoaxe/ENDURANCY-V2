import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
// Tour Guide removido pois ficou tecnologicamente defasado
import { Calendar, Clock, FileText, Settings, User2, SquareUser, Stethoscope, HeartPulse, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Portal do Paciente</h1>
          <p className="text-gray-500 mt-1">Bem-vindo(a), {user?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" />
            Emergência
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Próximas Consultas</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="medical-info" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Meu Prontuário</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User2 className="h-4 w-4" />
            <span className="hidden md:inline">Meu Perfil</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 patient-stats">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Próxima Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Amanhã, 14:30</div>
                <p className="text-sm text-gray-500">Dr. Carlos Mendes - Cardiologia</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Exames Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-sm text-gray-500">Hemograma, Glicemia</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Medicamentos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-sm text-gray-500">Próxima dose: 2 horas</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="upcoming-appointments">
            <CardHeader>
              <CardTitle>Consultas Agendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="font-semibold">Amanhã, 14:30</span>
                      </div>
                      <h4 className="font-medium mt-1">Dr. Carlos Mendes</h4>
                      <p className="text-sm text-gray-600">Cardiologia - Consulta de rotina</p>
                      <p className="text-sm text-gray-600 mt-1">Hospital Santa Maria - Consultório 302</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Remarcar</button>
                      <button className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100">Cancelar</button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-semibold">15/08/2023, 10:00</span>
                      </div>
                      <h4 className="font-medium mt-1">Dra. Ana Ferreira</h4>
                      <p className="text-sm text-gray-600">Dermatologia - Avaliação de rotina</p>
                      <p className="text-sm text-gray-600 mt-1">Clínica Dermatológica - Sala 105</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Remarcar</button>
                      <button className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100">Cancelar</button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-semibold">22/08/2023, 15:45</span>
                      </div>
                      <h4 className="font-medium mt-1">Dr. Roberto Alves</h4>
                      <p className="text-sm text-gray-600">Ortopedia - Revisão de tratamento</p>
                      <p className="text-sm text-gray-600 mt-1">Centro Médico - Consultório 405</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Remarcar</button>
                      <button className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100">Cancelar</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 new-appointment-button">
                  Agendar Nova Consulta
                </button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="pending-exams">
              <CardHeader>
                <CardTitle>Exames Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Hemograma Completo</p>
                        <p className="text-xs text-gray-500">Solicitado em: 25/07/2023 por Dr. Carlos Mendes</p>
                        <p className="text-xs text-blue-600 mt-1">Jejum de 8 horas</p>
                      </div>
                      <Button variant="outline" size="sm">Agendar</Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Glicemia em Jejum</p>
                        <p className="text-xs text-gray-500">Solicitado em: 25/07/2023 por Dr. Carlos Mendes</p>
                        <p className="text-xs text-blue-600 mt-1">Jejum de 8 horas</p>
                      </div>
                      <Button variant="outline" size="sm">Agendar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="medications">
              <CardHeader>
                <CardTitle>Medicamentos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 border rounded-md bg-blue-50">
                    <div className="flex items-start">
                      <Pill className="h-6 w-6 text-blue-500 mr-3 mt-1" />
                      <div>
                        <p className="font-medium">Losartana 50mg</p>
                        <p className="text-xs text-gray-500">1 comprimido, 2x ao dia (08:00, 20:00)</p>
                        <p className="text-xs text-red-600 mt-1">Próxima dose: 2 horas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex items-start">
                      <Pill className="h-6 w-6 text-blue-500 mr-3 mt-1" />
                      <div>
                        <p className="font-medium">Atorvastatina 20mg</p>
                        <p className="text-xs text-gray-500">1 comprimido, antes de dormir (22:00)</p>
                        <p className="text-xs text-gray-600 mt-1">Próxima dose: Hoje à noite</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex items-start">
                      <Pill className="h-6 w-6 text-blue-500 mr-3 mt-1" />
                      <div>
                        <p className="font-medium">AAS 100mg</p>
                        <p className="text-xs text-gray-500">1 comprimido, 1x ao dia com almoço (12:00)</p>
                        <p className="text-xs text-gray-600 mt-1">Próxima dose: Amanhã</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="appointment-history">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de Consultas</CardTitle>
              <div className="flex items-center space-x-2">
                <input type="text" placeholder="Buscar..." className="px-3 py-1 border rounded-md" />
                <select className="px-3 py-1 border rounded-md">
                  <option>Todos</option>
                  <option>Cardiologia</option>
                  <option>Dermatologia</option>
                  <option>Ortopedia</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-semibold">10/07/2023</span>
                      </div>
                      <h4 className="font-medium mt-1">Dr. Carlos Mendes - Cardiologia</h4>
                      <p className="text-sm text-gray-600">Consulta de rotina</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><span className="font-medium">Diagnóstico:</span> Hipertensão</p>
                        <p className="text-sm"><span className="font-medium">Prescrição:</span> Losartana 50mg, AAS 100mg</p>
                        <p className="text-sm"><span className="font-medium">Exames solicitados:</span> Hemograma, Perfil Lipídico</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Ver detalhes</button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-semibold">15/06/2023</span>
                      </div>
                      <h4 className="font-medium mt-1">Dra. Ana Ferreira - Dermatologia</h4>
                      <p className="text-sm text-gray-600">Avaliação de rotina</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><span className="font-medium">Diagnóstico:</span> Dermatite seborreica</p>
                        <p className="text-sm"><span className="font-medium">Prescrição:</span> Cetoconazol shampoo, Hidrocortisona creme</p>
                        <p className="text-sm"><span className="font-medium">Exames solicitados:</span> Nenhum</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Ver detalhes</button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-semibold">22/05/2023</span>
                      </div>
                      <h4 className="font-medium mt-1">Dr. Roberto Alves - Ortopedia</h4>
                      <p className="text-sm text-gray-600">Dor lombar</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><span className="font-medium">Diagnóstico:</span> Lombalgia</p>
                        <p className="text-sm"><span className="font-medium">Prescrição:</span> Paracetamol, Ciclobenzaprina</p>
                        <p className="text-sm"><span className="font-medium">Exames solicitados:</span> Raio-X coluna lombar</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Ver detalhes</button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="exams-history">
              <CardHeader>
                <CardTitle>Histórico de Exames</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Raio-X Coluna Lombar</p>
                        <p className="text-xs text-gray-500">Realizado em: 25/05/2023</p>
                        <p className="text-xs text-green-600 mt-1">Resultado disponível</p>
                      </div>
                      <button className="text-blue-600 hover:underline">Ver resultado</button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Hemograma Completo</p>
                        <p className="text-xs text-gray-500">Realizado em: 15/04/2023</p>
                        <p className="text-xs text-green-600 mt-1">Resultado disponível</p>
                      </div>
                      <button className="text-blue-600 hover:underline">Ver resultado</button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Eletrocardiograma</p>
                        <p className="text-xs text-gray-500">Realizado em: 10/04/2023</p>
                        <p className="text-xs text-green-600 mt-1">Resultado disponível</p>
                      </div>
                      <button className="text-blue-600 hover:underline">Ver resultado</button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Perfil Lipídico</p>
                        <p className="text-xs text-gray-500">Realizado em: 10/04/2023</p>
                        <p className="text-xs text-green-600 mt-1">Resultado disponível</p>
                      </div>
                      <button className="text-blue-600 hover:underline">Ver resultado</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="prescriptions-history">
              <CardHeader>
                <CardTitle>Histórico de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Losartana 50mg, AAS 100mg</p>
                        <p className="text-xs text-gray-500">Prescrito em: 10/07/2023 por Dr. Carlos Mendes</p>
                        <p className="text-xs text-green-600 mt-1">Válida até: 10/10/2023</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:underline">Ver</button>
                        <button className="text-green-600 hover:underline">Imprimir</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Cetoconazol shampoo, Hidrocortisona creme</p>
                        <p className="text-xs text-gray-500">Prescrito em: 15/06/2023 por Dra. Ana Ferreira</p>
                        <p className="text-xs text-green-600 mt-1">Válida até: 15/08/2023</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:underline">Ver</button>
                        <button className="text-green-600 hover:underline">Imprimir</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Paracetamol, Ciclobenzaprina</p>
                        <p className="text-xs text-gray-500">Prescrito em: 22/05/2023 por Dr. Roberto Alves</p>
                        <p className="text-xs text-red-600 mt-1">Expirada: 22/06/2023</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:underline">Ver</button>
                        <button className="text-green-600 hover:underline">Imprimir</button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="medical-info" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 medical-record">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meu Prontuário</CardTitle>
                <Button variant="outline" size="sm">Imprimir</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Informações Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nome completo</p>
                        <p>Maria Silva</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data de nascimento</p>
                        <p>15/05/1980 (43 anos)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gênero</p>
                        <p>Feminino</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo sanguíneo</p>
                        <p>O+</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Altura</p>
                        <p>1,65 m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Peso</p>
                        <p>68 kg</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Contato de Emergência</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nome</p>
                        <p>João Silva</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relação</p>
                        <p>Cônjuge</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telefone</p>
                        <p>(11) 98765-4321</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Histórico Médico</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Condições Atuais</h4>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Hipertensão (desde 2018)</li>
                          <li>Colesterol alto (desde 2019)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Alergias</h4>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Penicilina - Reação grave</li>
                          <li>Frutos do mar - Reação moderada</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Cirurgias</h4>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Apendicectomia (2005)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Histórico Familiar</h4>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Pai: Hipertensão, Diabetes</li>
                          <li>Mãe: Câncer de mama (em remissão)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Medicamentos Atuais</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-2">Medicamento</th>
                            <th scope="col" className="px-4 py-2">Dosagem</th>
                            <th scope="col" className="px-4 py-2">Frequência</th>
                            <th scope="col" className="px-4 py-2">Início</th>
                            <th scope="col" className="px-4 py-2">Médico</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="px-4 py-2 font-medium">Losartana</td>
                            <td className="px-4 py-2">50mg</td>
                            <td className="px-4 py-2">2x ao dia (08:00, 20:00)</td>
                            <td className="px-4 py-2">10/07/2023</td>
                            <td className="px-4 py-2">Dr. Carlos Mendes</td>
                          </tr>
                          <tr className="border-b">
                            <td className="px-4 py-2 font-medium">Atorvastatina</td>
                            <td className="px-4 py-2">20mg</td>
                            <td className="px-4 py-2">1x ao dia (22:00)</td>
                            <td className="px-4 py-2">10/07/2023</td>
                            <td className="px-4 py-2">Dr. Carlos Mendes</td>
                          </tr>
                          <tr className="border-b">
                            <td className="px-4 py-2 font-medium">AAS</td>
                            <td className="px-4 py-2">100mg</td>
                            <td className="px-4 py-2">1x ao dia (12:00)</td>
                            <td className="px-4 py-2">10/07/2023</td>
                            <td className="px-4 py-2">Dr. Carlos Mendes</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Últimos Sinais Vitais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 border rounded-md">
                        <p className="font-medium">Pressão Arterial</p>
                        <p className="text-2xl">140/90 mmHg</p>
                        <p className="text-xs text-gray-500">10/07/2023</p>
                      </div>
                      <div className="p-3 border rounded-md">
                        <p className="font-medium">Frequência Cardíaca</p>
                        <p className="text-2xl">78 bpm</p>
                        <p className="text-xs text-gray-500">10/07/2023</p>
                      </div>
                      <div className="p-3 border rounded-md">
                        <p className="font-medium">Saturação O2</p>
                        <p className="text-2xl">98%</p>
                        <p className="text-xs text-gray-500">10/07/2023</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1 patient-profile">
              <CardHeader>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <SquareUser className="h-16 w-16 text-gray-500" />
                  </div>
                  <CardTitle>Maria Silva</CardTitle>
                  <p className="text-sm text-gray-500">Paciente desde: 01/01/2018</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Médicos Principais</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <p className="font-medium">Dr. Carlos Mendes</p>
                          <p className="text-xs text-gray-500">Cardiologia</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <p className="font-medium">Dra. Ana Ferreira</p>
                          <p className="text-xs text-gray-500">Dermatologia</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <p className="font-medium">Dr. Roberto Alves</p>
                          <p className="text-xs text-gray-500">Ortopedia</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Plano de Saúde</h3>
                    <p className="mt-1">Saúde Total</p>
                    <p className="text-xs text-gray-500">Plano Premium</p>
                    <p className="text-xs text-gray-500">Cartão: 123456789-0</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Preferências de Notificação</h3>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Lembretes de consulta</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Lembretes de medicação</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Resultados de exames</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2 patient-settings">
              <CardHeader>
                <CardTitle>Minhas Informações</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input type="text" defaultValue="Maria Silva" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" defaultValue="maria.silva@email.com" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefone</label>
                      <input type="tel" defaultValue="(11) 98765-4321" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CPF</label>
                      <input type="text" defaultValue="123.456.789-00" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" readOnly />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço</label>
                    <input type="text" defaultValue="Rua das Flores, 123" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cidade</label>
                      <input type="text" defaultValue="São Paulo" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Estado</label>
                      <input type="text" defaultValue="SP" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CEP</label>
                      <input type="text" defaultValue="01234-567" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Contato de Emergência</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs mb-1">Nome</label>
                        <input type="text" defaultValue="João Silva" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Relação</label>
                        <input type="text" defaultValue="Cônjuge" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Telefone</label>
                        <input type="tel" defaultValue="(11) 98765-4321" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Plano de Saúde</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1">Nome do Plano</label>
                        <input type="text" defaultValue="Saúde Total" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Número do Cartão</label>
                        <input type="text" defaultValue="123456789-0" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
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