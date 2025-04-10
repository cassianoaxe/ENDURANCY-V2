import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DownloadIcon, BarChart, PieChart, LineChart, CalendarDays, Users, FileText, Filter } from 'lucide-react';
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';

// Dados de consultas por mês
const consultasPorMes = [
  { name: 'Jan', presencial: 5, video: 3, telefone: 2 },
  { name: 'Fev', presencial: 7, video: 4, telefone: 3 },
  { name: 'Mar', presencial: 10, video: 5, telefone: 4 },
  { name: 'Abr', presencial: 8, video: 6, telefone: 3 },
  { name: 'Mai', presencial: 12, video: 7, telefone: 5 },
  { name: 'Jun', presencial: 9, video: 8, telefone: 4 },
];

// Dados de tipos de consulta
const tiposConsulta = [
  { name: 'Presencial', value: 52 },
  { name: 'Vídeo', value: 33 },
  { name: 'Telefone', value: 21 },
];

// Dados de satisfação do paciente
const satisfacaoPaciente = [
  { name: 'Jan', satisfacao: 4.2 },
  { name: 'Fev', satisfacao: 4.4 },
  { name: 'Mar', satisfacao: 4.3 },
  { name: 'Abr', satisfacao: 4.5 },
  { name: 'Mai', satisfacao: 4.7 },
  { name: 'Jun', satisfacao: 4.6 },
];

// Cores para gráfico de pizza
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('semestre');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-3">
          <Select defaultValue={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Último mês</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
              <SelectItem value="semestre">Último semestre</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total de Consultas</CardTitle>
            <CardDescription>Último semestre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">106</div>
            <p className="text-sm text-gray-500 mt-1">
              <span className="text-green-600">+12%</span> em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Taxa de Ocupação</CardTitle>
            <CardDescription>Último semestre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">82%</div>
            <p className="text-sm text-gray-500 mt-1">
              <span className="text-green-600">+5%</span> em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Satisfação Pacientes</CardTitle>
            <CardDescription>Último semestre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.5/5</div>
            <p className="text-sm text-gray-500 mt-1">
              <span className="text-green-600">+0.2</span> em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consultas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="consultas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  <CardTitle>Consultas por Tipo</CardTitle>
                </div>
                <CardDescription>Distribuição de consultas por tipo</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart
                      data={consultasPorMes}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="presencial" fill="#0088FE" name="Presencial" />
                      <Bar dataKey="video" fill="#00C49F" name="Vídeo" />
                      <Bar dataKey="telefone" fill="#FFBB28" name="Telefone" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-4">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <CardTitle>Distribuição por Tipo</CardTitle>
                </div>
                <CardDescription>Proporção de cada tipo de consulta</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={tiposConsulta}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {tiposConsulta.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-4 md:col-span-2">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  <CardTitle>Satisfação do Paciente</CardTitle>
                </div>
                <CardDescription>Média mensal de satisfação (1-5)</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart
                      data={satisfacaoPaciente}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="satisfacao"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Satisfação"
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pacientes">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Estatísticas de Pacientes</CardTitle>
              </div>
              <CardDescription>
                Esta seção está em desenvolvimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">Estatísticas de pacientes serão adicionadas em breve.</p>
                <Button variant="outline" className="mt-4">
                  Ver pacientes atuais
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prescricoes">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Estatísticas de Prescrições</CardTitle>
              </div>
              <CardDescription>
                Esta seção está em desenvolvimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">Estatísticas de prescrições serão adicionadas em breve.</p>
                <Button variant="outline" className="mt-4">
                  Ver prescrições atuais
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <CardTitle>Estatísticas Financeiras</CardTitle>
              </div>
              <CardDescription>
                Esta seção está em desenvolvimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">Estatísticas financeiras serão adicionadas em breve.</p>
                <Button variant="outline" className="mt-4">
                  Ver informações disponíveis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-6" />
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Relatórios Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-primary/10 rounded-md mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Relatório de Consultas</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Relatório detalhado de todas as consultas realizadas
                </p>
                <Button variant="ghost" size="sm" className="mt-3 gap-1">
                  <DownloadIcon className="h-4 w-4" />
                  Baixar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-primary/10 rounded-md mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Relatório de Pacientes</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Relatório com informações dos pacientes atendidos
                </p>
                <Button variant="ghost" size="sm" className="mt-3 gap-1">
                  <DownloadIcon className="h-4 w-4" />
                  Baixar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-primary/10 rounded-md mb-3">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Relatório de Desempenho</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Indicadores de desempenho e métricas de atendimento
                </p>
                <Button variant="ghost" size="sm" className="mt-3 gap-1">
                  <DownloadIcon className="h-4 w-4" />
                  Baixar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}