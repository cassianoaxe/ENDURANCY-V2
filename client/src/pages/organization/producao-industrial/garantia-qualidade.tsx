import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck,
  Clipboard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function GarantiaQualidadePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('visao-geral');

  // Dados simulados para auditoria de qualidade
  const auditoriasRecentes = [
    { id: 1, nome: 'Auditoria QA Mensal - Abril', data: '2025-04-05', responsavel: 'Ana Costa', status: 'concluida', resultado: 'aprovado', observacoes: 2 },
    { id: 2, nome: 'Inspeção de Conformidade GxP', data: '2025-03-27', responsavel: 'Carlos Santos', status: 'concluida', resultado: 'aprovado', observacoes: 0 },
    { id: 3, nome: 'Auditoria de Fornecedor - MatPrima', data: '2025-03-15', responsavel: 'Juliana Martins', status: 'concluida', resultado: 'aprovado_com_observacoes', observacoes: 5 },
    { id: 4, nome: 'Inspeção de BPF - Linha 2', data: '2025-03-08', responsavel: 'Ricardo Oliveira', status: 'concluida', resultado: 'aprovado', observacoes: 1 },
  ];

  // Políticas de qualidade
  const politicasQualidade = [
    { id: 1, nome: 'PQ-001: Política de Controle de Qualidade', versao: '3.2', atualizacao: '2025-01-15', status: 'ativo' },
    { id: 2, nome: 'PQ-002: Política de BPF (GMP)', versao: '2.5', atualizacao: '2024-11-20', status: 'ativo' },
    { id: 3, nome: 'PQ-003: Política de Homologação de Fornecedores', versao: '1.8', atualizacao: '2024-12-05', status: 'ativo' },
    { id: 4, nome: 'PQ-004: Política de Gerenciamento de Risco', versao: '2.1', atualizacao: '2025-02-10', status: 'ativo' },
    { id: 5, nome: 'PQ-005: Política de Tratamento de Não-Conformidades', versao: '1.4', atualizacao: '2024-10-18', status: 'ativo' },
  ];

  // Treinamentos programados
  const treinamentos = [
    { id: 1, nome: 'Boas Práticas de Fabricação', data: '2025-04-20', responsavel: 'Mariana Silva', participantes: 12, status: 'agendado' },
    { id: 2, nome: 'Identificação de Não-Conformidades', data: '2025-05-05', responsavel: 'Roberto Alves', participantes: 8, status: 'agendado' },
    { id: 3, nome: 'Auditoria Interna de Qualidade', data: '2025-04-15', responsavel: 'Carla Mendes', participantes: 6, status: 'agendado' },
  ];

  return (
    <OrganizationLayout>
      <div className="container px-6 py-4">
        <div className="flex flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Garantia da Qualidade</h1>
              <p className="text-gray-500 mt-1">
                Documentação, auditorias e políticas para garantia da qualidade
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <FileText size={16} />
                Relatórios
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                <ShieldCheck size={16} />
                Nova Auditoria
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
                value="auditorias" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Auditorias
              </TabsTrigger>
              <TabsTrigger 
                value="politicas" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Políticas e Procedimentos
              </TabsTrigger>
              <TabsTrigger 
                value="treinamentos" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Treinamentos
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo da aba Visão Geral */}
            <TabsContent value="visao-geral" className="pt-4 space-y-6">
              {/* Cards de resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Auditorias (30 dias)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{auditoriasRecentes.length}</div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Clipboard size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-green-600 font-medium">100%</span> taxa de aprovação
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Políticas Ativas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{politicasQualidade.length}</div>
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <FileText size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-blue-600 font-medium">2 atualizações</span> recentes
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Próximos Treinamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{treinamentos.length}</div>
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <Users size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-purple-600 font-medium">{treinamentos.reduce((acc, t) => acc + t.participantes, 0)} participantes</span> previstos
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Conformidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">98.5%</div>
                      <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <ShieldCheck size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-amber-600 font-medium">+2.3%</span> comparado ao trimestre anterior
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Auditorias recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Auditorias Recentes</CardTitle>
                  <CardDescription>Últimas auditorias e inspeções de qualidade realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Auditoria</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Observações</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditoriasRecentes.map((auditoria) => (
                          <TableRow key={auditoria.id}>
                            <TableCell className="font-medium">{auditoria.nome}</TableCell>
                            <TableCell>{auditoria.data}</TableCell>
                            <TableCell>{auditoria.responsavel}</TableCell>
                            <TableCell>
                              {auditoria.resultado === 'aprovado' && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Aprovado
                                </Badge>
                              )}
                              {auditoria.resultado === 'aprovado_com_observacoes' && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                                  Com observações
                                </Badge>
                              )}
                              {auditoria.resultado === 'reprovado' && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Reprovado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{auditoria.observacoes}</TableCell>
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
                  <Button variant="outline">Ver Todas as Auditorias</Button>
                </CardFooter>
              </Card>

              {/* Próximos Treinamentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Treinamentos</CardTitle>
                  <CardDescription>Treinamentos da equipe para garantia da qualidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {treinamentos.map((treinamento) => (
                      <div key={treinamento.id} className="border p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {treinamento.nome}
                            </h3>
                            <p className="text-sm text-gray-500">Responsável: {treinamento.responsavel}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                              <Calendar size={14} />
                              {treinamento.data}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                              <Users size={14} />
                              {treinamento.participantes} participantes
                            </Badge>
                            <Button variant="ghost" size="sm" className="text-gray-500">
                              <ArrowRight size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline">Gerenciar Treinamentos</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Conteúdo das outras abas (placeholders simples) */}
            <TabsContent value="auditorias" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Auditorias de Qualidade</CardTitle>
                  <CardDescription>Gestão completa de auditorias e inspeções</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Clipboard className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Conteúdo em Desenvolvimento</h3>
                    <p className="text-gray-500 max-w-md">
                      Esta seção permitirá gerenciar todas as auditorias de qualidade, desde o planejamento até a execução e acompanhamento de ações corretivas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="politicas" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Políticas e Procedimentos</CardTitle>
                  <CardDescription>Documentação de políticas de qualidade e procedimentos operacionais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Versão</TableHead>
                          <TableHead>Última Atualização</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {politicasQualidade.map((politica) => (
                          <TableRow key={politica.id}>
                            <TableCell className="font-medium">PQ-{politica.id.toString().padStart(3, '0')}</TableCell>
                            <TableCell>{politica.nome}</TableCell>
                            <TableCell>v{politica.versao}</TableCell>
                            <TableCell>{politica.atualizacao}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                Ativo
                              </Badge>
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

            <TabsContent value="treinamentos" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Treinamentos de Qualidade</CardTitle>
                  <CardDescription>Gestão dos treinamentos da equipe em práticas de qualidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Users className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Conteúdo em Desenvolvimento</h3>
                    <p className="text-gray-500 max-w-md">
                      Esta seção permitirá gerenciar todos os treinamentos relacionados à qualidade, incluindo agendamento, materiais, certificações e acompanhamento de participação.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </OrganizationLayout>
  );
}