import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Microscope,
  Beaker,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  Clock,
  Calendar,
  BarChart4,
  LineChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ControleQualidadePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('visao-geral');

  // Dados simulados para testes de qualidade
  const testesRecentes = [
    { id: 1, lote: 'L23451-A', nome: 'Teor de Cannabinoides', data: '2025-04-08', responsavel: 'Dra. Luiza Mendes', status: 'aprovado', resultado: '12.5% CBD', referencia: '10-15% CBD' },
    { id: 2, lote: 'L23451-A', nome: 'Teste de Solventes Residuais', data: '2025-04-07', responsavel: 'Dr. Felipe Santos', status: 'aprovado', resultado: '<0.01%', referencia: '<0.05%' },
    { id: 3, lote: 'L23452-B', nome: 'Teor de Cannabinoides', data: '2025-04-05', responsavel: 'Dra. Luiza Mendes', status: 'aprovado', resultado: '8.2% CBD', referencia: '>5% CBD' },
    { id: 4, lote: 'L23452-B', nome: 'Microbiológico', data: '2025-04-04', responsavel: 'Dr. André Costa', status: 'pendente', resultado: 'Em análise', referencia: 'Ausência' },
    { id: 5, lote: 'L23445-C', nome: 'Metais Pesados', data: '2025-03-29', responsavel: 'Dr. Felipe Santos', status: 'aprovado', resultado: '<0.5 ppm', referencia: '<2.0 ppm' },
  ];

  // Equipamentos de laboratório
  const equipamentos = [
    { id: 1, nome: 'HPLC-001', tipo: 'Cromatografia (HPLC)', ultimaCalibracao: '2025-03-15', proximaCalibracao: '2025-06-15', status: 'operacional' },
    { id: 2, nome: 'GC-MS-002', tipo: 'Cromatografia Gasosa (GC-MS)', ultimaCalibracao: '2025-02-20', proximaCalibracao: '2025-05-20', status: 'operacional' },
    { id: 3, nome: 'ICP-001', tipo: 'Espectrometria (ICP-MS)', ultimaCalibracao: '2025-01-30', proximaCalibracao: '2025-04-30', status: 'manutencao' },
    { id: 4, nome: 'MICROBIO-001', tipo: 'Análise Microbiológica', ultimaCalibracao: '2025-03-25', proximaCalibracao: '2025-06-25', status: 'operacional' },
  ];

  // Parâmetros de controle
  const parametrosControle = [
    { id: 1, nome: 'Teor de Cannabinoides', metodo: 'HPLC', frequencia: 'Cada lote', criterioAceitacao: 'Conforme especificação do produto' },
    { id: 2, nome: 'Solventes Residuais', metodo: 'GC-MS', frequencia: 'Cada lote', criterioAceitacao: '<0.05% para solventes individuais' },
    { id: 3, nome: 'Pesticidas', metodo: 'LC-MS/MS', frequencia: 'Cada lote', criterioAceitacao: 'Ausência ou <LOQ' },
    { id: 4, nome: 'Microbiológico', metodo: 'Cultura', frequencia: 'Cada lote', criterioAceitacao: 'Ausência de patógenos' },
    { id: 5, nome: 'Metais Pesados', metodo: 'ICP-MS', frequencia: 'Cada lote', criterioAceitacao: '<2.0 ppm para Pb, Cd, As, Hg combinados' },
  ];

  return (
    <OrganizationLayout>
      <div className="container px-6 py-4">
        <div className="flex flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Controle de Qualidade</h1>
              <p className="text-gray-500 mt-1">
                Análises laboratoriais e controle de qualidade dos produtos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <FileText size={16} />
                Relatórios
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                <Beaker size={16} />
                Novo Teste
              </Button>
            </div>
          </div>

          {/* Tabs de navegação */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-transparent border-b w-full rounded-none p-0 h-auto space-x-8">
              <TabsTrigger 
                value="visao-geral" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="testes" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Testes Laboratoriais
              </TabsTrigger>
              <TabsTrigger 
                value="equipamentos" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Equipamentos
              </TabsTrigger>
              <TabsTrigger 
                value="parametros" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Parâmetros
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo da aba Visão Geral */}
            <TabsContent value="visao-geral" className="pt-4 space-y-6">
              {/* Cards de resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Testes (30 dias)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{testesRecentes.length}</div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Beaker size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-green-600 font-medium">{testesRecentes.filter(t => t.status === 'aprovado').length}</span> aprovados, <span className="text-amber-600 font-medium">{testesRecentes.filter(t => t.status === 'pendente').length}</span> pendentes
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Equipamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{equipamentos.length}</div>
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Microscope size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-blue-600 font-medium">{equipamentos.filter(e => e.status === 'operacional').length}/{equipamentos.length}</span> operacionais
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Tempo Médio de Análise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">2.5d</div>
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <Clock size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-purple-600 font-medium">-0.5 dias</span> comparado ao mês anterior
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Taxa de Conformidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">97.2%</div>
                      <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <BarChart4 size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-amber-600 font-medium">+1.5%</span> comparado ao trimestre anterior
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Testes recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Testes Recentes</CardTitle>
                  <CardDescription>Últimos testes laboratoriais realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lote</TableHead>
                          <TableHead>Teste</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Resultado</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testesRecentes.map((teste) => (
                          <TableRow key={teste.id}>
                            <TableCell className="font-medium">{teste.lote}</TableCell>
                            <TableCell>{teste.nome}</TableCell>
                            <TableCell>{teste.data}</TableCell>
                            <TableCell>{teste.responsavel}</TableCell>
                            <TableCell>
                              <div className="text-sm">{teste.resultado}</div>
                              <div className="text-xs text-gray-500">Ref: {teste.referencia}</div>
                            </TableCell>
                            <TableCell>
                              {teste.status === 'aprovado' && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Aprovado
                                </Badge>
                              )}
                              {teste.status === 'pendente' && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                              {teste.status === 'reprovado' && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Reprovado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline">Ver Todos os Testes</Button>
                </CardFooter>
              </Card>

              {/* Equipamentos em manutenção */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Equipamentos</CardTitle>
                  <CardDescription>Monitoramento dos equipamentos de laboratório</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Equipamento</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Última Calibração</TableHead>
                          <TableHead>Próxima Calibração</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipamentos.map((equipamento) => (
                          <TableRow key={equipamento.id}>
                            <TableCell className="font-medium">{equipamento.nome}</TableCell>
                            <TableCell>{equipamento.tipo}</TableCell>
                            <TableCell>{equipamento.ultimaCalibracao}</TableCell>
                            <TableCell>{equipamento.proximaCalibracao}</TableCell>
                            <TableCell>
                              {equipamento.status === 'operacional' && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  Operacional
                                </Badge>
                              )}
                              {equipamento.status === 'manutencao' && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                  Em Manutenção
                                </Badge>
                              )}
                              {equipamento.status === 'inativo' && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                  Inativo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conteúdo das outras abas (placeholders e tabelas) */}
            <TabsContent value="testes" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Testes</CardTitle>
                  <CardDescription>Gerenciamento dos testes laboratoriais e controle de qualidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lote</TableHead>
                          <TableHead>Teste</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Resultado</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testesRecentes.map((teste) => (
                          <TableRow key={teste.id}>
                            <TableCell className="font-medium">{teste.lote}</TableCell>
                            <TableCell>{teste.nome}</TableCell>
                            <TableCell>{teste.data}</TableCell>
                            <TableCell>{teste.responsavel}</TableCell>
                            <TableCell>
                              <div className="text-sm">{teste.resultado}</div>
                              <div className="text-xs text-gray-500">Ref: {teste.referencia}</div>
                            </TableCell>
                            <TableCell>
                              {teste.status === 'aprovado' && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Aprovado
                                </Badge>
                              )}
                              {teste.status === 'pendente' && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                              {teste.status === 'reprovado' && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Reprovado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipamentos" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Equipamentos de Laboratório</CardTitle>
                  <CardDescription>Gerenciamento de equipamentos e calibração</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Equipamento</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Última Calibração</TableHead>
                          <TableHead>Próxima Calibração</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipamentos.map((equipamento) => (
                          <TableRow key={equipamento.id}>
                            <TableCell className="font-medium">{equipamento.nome}</TableCell>
                            <TableCell>{equipamento.tipo}</TableCell>
                            <TableCell>{equipamento.ultimaCalibracao}</TableCell>
                            <TableCell>{equipamento.proximaCalibracao}</TableCell>
                            <TableCell>
                              {equipamento.status === 'operacional' && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  Operacional
                                </Badge>
                              )}
                              {equipamento.status === 'manutencao' && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                  Em Manutenção
                                </Badge>
                              )}
                              {equipamento.status === 'inativo' && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                  Inativo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline">Agendar Calibração</Button>
                  <Button variant="outline">Relatório de Manutenção</Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">Adicionar Equipamento</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="parametros" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parâmetros de Controle</CardTitle>
                  <CardDescription>Configuração dos parâmetros e especificações de qualidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parâmetro</TableHead>
                          <TableHead>Método Analítico</TableHead>
                          <TableHead>Frequência</TableHead>
                          <TableHead>Critério de Aceitação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parametrosControle.map((parametro) => (
                          <TableRow key={parametro.id}>
                            <TableCell className="font-medium">{parametro.nome}</TableCell>
                            <TableCell>{parametro.metodo}</TableCell>
                            <TableCell>{parametro.frequencia}</TableCell>
                            <TableCell>{parametro.criterioAceitacao}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline">Histórico de Alterações</Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">Adicionar Parâmetro</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </OrganizationLayout>
  );
}