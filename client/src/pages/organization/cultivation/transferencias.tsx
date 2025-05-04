import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, ArrowRight, ArrowRightLeft, Plus, 
  Download, Upload, Printer, Clock, Calendar, 
  Search, Filter, Users, Building2,
  CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Dados de transferências recentes
const transferenciasRecentes = [
  {
    id: "TR-2025-0012",
    data: "02/05/2025",
    origem: "Estufa #1",
    destino: "Estufa #2",
    tipo: "Mudança de Fase",
    plantas: 15,
    lote: "CLT-001",
    status: "Concluída",
    responsavel: "João Silva"
  },
  {
    id: "TR-2025-0011",
    data: "01/05/2025",
    origem: "Estufa #3",
    destino: "Processamento",
    tipo: "Colheita",
    plantas: 12,
    lote: "CLT-003",
    status: "Em andamento",
    responsavel: "Maria Oliveira"
  },
  {
    id: "TR-2025-0010",
    data: "29/04/2025",
    origem: "Sala de Germinação",
    destino: "Estufa #1",
    tipo: "Transplante",
    plantas: 20,
    lote: "CLT-002",
    status: "Concluída",
    responsavel: "Carlos Mendes"
  },
  {
    id: "TR-2025-0009",
    data: "25/04/2025",
    origem: "Estufa #2",
    destino: "Setor de Extração",
    tipo: "Exportação",
    plantas: 18,
    lote: "CLT-001",
    status: "Concluída",
    responsavel: "Ana Costa"
  },
  {
    id: "TR-2025-0008",
    data: "20/04/2025",
    origem: "Fornecedor",
    destino: "Sala de Germinação",
    tipo: "Importação",
    plantas: 50,
    lote: "CLT-004",
    status: "Concluída",
    responsavel: "Pedro Santos"
  }
];

// Dados históricos por mês
const historicoMensal = [
  { mes: "Janeiro/2025", internas: 32, externas: 8, total: 40 },
  { mes: "Fevereiro/2025", internas: 28, externas: 6, total: 34 },
  { mes: "Março/2025", internas: 35, externas: 10, total: 45 },
  { mes: "Abril/2025", internas: 42, externas: 12, total: 54 },
];

// Estatísticas por tipo de transferência
const estatisticasPorTipo = [
  { tipo: "Mudança de Fase", quantidade: 48, percentual: 28 },
  { tipo: "Transplante", quantidade: 35, percentual: 20 },
  { tipo: "Colheita", quantidade: 30, percentual: 17 },
  { tipo: "Importação", quantidade: 25, percentual: 15 },
  { tipo: "Exportação", quantidade: 20, percentual: 12 },
  { tipo: "Descarte", quantidade: 15, percentual: 8 }
];

// Estatísticas por origem/destino
const estatisticasPorLocal = [
  { local: "Estufa #1", saida: 45, entrada: 30, saldo: -15 },
  { local: "Estufa #2", saida: 30, entrada: 40, saldo: 10 },
  { local: "Estufa #3", saida: 35, entrada: 20, saldo: -15 },
  { local: "Sala de Germinação", saida: 25, entrada: 50, saldo: 25 },
  { local: "Processamento", saida: 5, entrada: 30, saldo: 25 },
  { local: "Setor de Extração", saida: 0, entrada: 18, saldo: 18 }
];

const TransferenciasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestão de Transferências</h1>
            <p className="text-gray-600 mt-1">Controle de movimentação de plantas entre ambientes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" asChild>
              <a href="/organization/cultivation">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </a>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-1">
              <Plus className="h-4 w-4" />
              <span>Nova Transferência</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Transferências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowRightLeft className="h-8 w-8 text-blue-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">173</p>
                  <p className="text-xs text-gray-500">Nos últimos 30 dias: 54</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transferências Internas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowRight className="h-8 w-8 text-green-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">143</p>
                  <p className="text-xs text-gray-500">82% do total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transferências Externas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowRightLeft className="h-8 w-8 text-amber-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">30</p>
                  <p className="text-xs text-gray-500">18% do total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transferências Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-xs text-gray-500">Aguardando confirmação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recentes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="recentes">Transferências Recentes</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recentes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transferências Recentes</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      <span>Exportar</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Printer className="h-4 w-4" />
                      <span>Imprimir</span>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Últimas transferências registradas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar transferências..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Status</SelectItem>
                          <SelectItem value="concluida">Concluídas</SelectItem>
                          <SelectItem value="andamento">Em Andamento</SelectItem>
                          <SelectItem value="cancelada">Canceladas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={filterTipo} onValueChange={setFilterTipo}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Tipos</SelectItem>
                          <SelectItem value="mudanca">Mudança de Fase</SelectItem>
                          <SelectItem value="transplante">Transplante</SelectItem>
                          <SelectItem value="colheita">Colheita</SelectItem>
                          <SelectItem value="importacao">Importação</SelectItem>
                          <SelectItem value="exportacao">Exportação</SelectItem>
                          <SelectItem value="descarte">Descarte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Plantas</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferenciasRecentes.map((transferencia) => (
                        <TableRow key={transferencia.id}>
                          <TableCell className="font-medium">{transferencia.id}</TableCell>
                          <TableCell>{transferencia.data}</TableCell>
                          <TableCell>{transferencia.origem}</TableCell>
                          <TableCell>{transferencia.destino}</TableCell>
                          <TableCell>{transferencia.tipo}</TableCell>
                          <TableCell>{transferencia.plantas}</TableCell>
                          <TableCell>{transferencia.lote}</TableCell>
                          <TableCell>
                            {transferencia.status === "Concluída" ? (
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                                <CheckCircle className="h-3 w-3" />
                                <span>Concluída</span>
                              </Badge>
                            ) : transferencia.status === "Em andamento" ? (
                              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Em andamento</span>
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Cancelada</span>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{transferencia.responsavel}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver detalhes">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Exibindo 5 de 173 transferências
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm">
                    Próxima
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico Mensal</CardTitle>
                  <CardDescription>Quantidade de transferências por mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mês</TableHead>
                          <TableHead>Transferências Internas</TableHead>
                          <TableHead>Transferências Externas</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicoMensal.map((mes) => (
                          <TableRow key={mes.mes}>
                            <TableCell className="font-medium">{mes.mes}</TableCell>
                            <TableCell>{mes.internas}</TableCell>
                            <TableCell>{mes.externas}</TableCell>
                            <TableCell className="font-medium">{mes.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    Total acumulado: 173 transferências
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Filtrar Período</span>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transferências por Tipo</CardTitle>
                  <CardDescription>Distribuição por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {estatisticasPorTipo.map((stat) => (
                      <div key={stat.tipo} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{stat.tipo}</span>
                          <span className="text-sm text-gray-500">{stat.quantidade} ({stat.percentual}%)</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${stat.percentual}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Fluxo por Local</CardTitle>
                  <CardDescription>Entrada e saída de plantas por ambiente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Local</TableHead>
                          <TableHead>Saídas</TableHead>
                          <TableHead>Entradas</TableHead>
                          <TableHead>Saldo</TableHead>
                          <TableHead>Fluxo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estatisticasPorLocal.map((local) => (
                          <TableRow key={local.local}>
                            <TableCell className="font-medium">{local.local}</TableCell>
                            <TableCell>{local.saida}</TableCell>
                            <TableCell>{local.entrada}</TableCell>
                            <TableCell className={
                              local.saldo > 0 
                                ? "text-green-600 font-medium" 
                                : local.saldo < 0 
                                  ? "text-red-600 font-medium" 
                                  : "text-gray-600 font-medium"
                            }>
                              {local.saldo > 0 ? `+${local.saldo}` : local.saldo}
                            </TableCell>
                            <TableCell>
                              <div className="w-32 h-2 bg-gray-100 rounded-full">
                                {local.saldo > 0 ? (
                                  <div 
                                    className="h-full bg-green-500 rounded-full" 
                                    style={{ width: `${Math.min(100, Math.abs(local.saldo) * 2)}%` }}
                                  ></div>
                                ) : local.saldo < 0 ? (
                                  <div 
                                    className="h-full bg-red-500 rounded-full" 
                                    style={{ width: `${Math.min(100, Math.abs(local.saldo) * 2)}%` }}
                                  ></div>
                                ) : (
                                  <div className="h-full bg-gray-300 rounded-full w-[2px]"></div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="estatisticas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Responsáveis</CardTitle>
                  <CardDescription>Colaboradores com mais transferências</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">João Silva</p>
                        <p className="text-sm text-gray-500">42 transferências</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Maria Oliveira</p>
                        <p className="text-sm text-gray-500">38 transferências</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "90%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Carlos Mendes</p>
                        <p className="text-sm text-gray-500">35 transferências</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "83%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Ana Costa</p>
                        <p className="text-sm text-gray-500">30 transferências</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "71%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-pink-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Pedro Santos</p>
                        <p className="text-sm text-gray-500">28 transferências</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: "67%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Ambientes</CardTitle>
                  <CardDescription>Locais com mais movimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Estufa #1</p>
                        <p className="text-sm text-gray-500">75 movimentações</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-cyan-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Estufa #2</p>
                        <p className="text-sm text-gray-500">70 movimentações</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: "93%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-indigo-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Sala de Germinação</p>
                        <p className="text-sm text-gray-500">55 movimentações</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: "73%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Estufa #3</p>
                        <p className="text-sm text-gray-500">55 movimentações</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: "73%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-orange-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Processamento</p>
                        <p className="text-sm text-gray-500">35 movimentações</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: "47%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Formulário de Transferência Rápida</CardTitle>
                  <CardDescription>Registre uma nova transferência</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="origem">Origem</Label>
                        <Select>
                          <SelectTrigger id="origem">
                            <SelectValue placeholder="Selecione o local de origem" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="estufa1">Estufa #1</SelectItem>
                            <SelectItem value="estufa2">Estufa #2</SelectItem>
                            <SelectItem value="estufa3">Estufa #3</SelectItem>
                            <SelectItem value="germinacao">Sala de Germinação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="destino">Destino</Label>
                        <Select>
                          <SelectTrigger id="destino">
                            <SelectValue placeholder="Selecione o local de destino" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="estufa1">Estufa #1</SelectItem>
                            <SelectItem value="estufa2">Estufa #2</SelectItem>
                            <SelectItem value="estufa3">Estufa #3</SelectItem>
                            <SelectItem value="processamento">Processamento</SelectItem>
                            <SelectItem value="extracao">Setor de Extração</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Transferência</Label>
                        <Select>
                          <SelectTrigger id="tipo">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mudanca">Mudança de Fase</SelectItem>
                            <SelectItem value="transplante">Transplante</SelectItem>
                            <SelectItem value="colheita">Colheita</SelectItem>
                            <SelectItem value="importacao">Importação</SelectItem>
                            <SelectItem value="exportacao">Exportação</SelectItem>
                            <SelectItem value="descarte">Descarte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="plantas">Número de Plantas</Label>
                        <Input id="plantas" type="number" placeholder="0" min="1" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lote">Lote</Label>
                        <Select>
                          <SelectTrigger id="lote">
                            <SelectValue placeholder="Selecione o lote" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clt001">CLT-001</SelectItem>
                            <SelectItem value="clt002">CLT-002</SelectItem>
                            <SelectItem value="clt003">CLT-003</SelectItem>
                            <SelectItem value="clt004">CLT-004</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea id="observacoes" placeholder="Adicione informações adicionais sobre esta transferência..." />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-green-600 hover:bg-green-700 gap-1">
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>Registrar Transferência</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(TransferenciasPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});