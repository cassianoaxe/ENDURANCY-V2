import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, ArrowRight, Package, PackageOpen, 
  Download, Printer, Search, Filter, BarChart2, 
  Check, X, AlertCircle, Clock, Layers, Eye
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
import { Progress } from "@/components/ui/progress";

// Dados de estoque
const estoqueProdutos = [
  {
    id: "EST-001",
    nome: "CBD Full Spectrum",
    strain: "Charlotte's Web",
    quantidade: 35,
    unidade: "kg",
    lote: "CLT-001",
    dataEntrada: "01/05/2025",
    validade: "01/05/2026",
    status: "Disponível"
  },
  {
    id: "EST-002",
    nome: "THC Isolado",
    strain: "OG Kush",
    quantidade: 15,
    unidade: "kg",
    lote: "CLT-002",
    dataEntrada: "25/04/2025",
    validade: "25/04/2026",
    status: "Disponível"
  },
  {
    id: "EST-003",
    nome: "Extrato de CBG",
    strain: "Sour Diesel",
    quantidade: 8,
    unidade: "kg",
    lote: "CLT-003",
    dataEntrada: "15/04/2025",
    validade: "15/04/2026",
    status: "Baixo Estoque"
  },
  {
    id: "EST-004",
    nome: "Terpenos Especiais",
    strain: "Blue Dream",
    quantidade: 5,
    unidade: "L",
    lote: "CLT-004",
    dataEntrada: "10/04/2025",
    validade: "10/10/2025",
    status: "Baixo Estoque"
  },
  {
    id: "EST-005",
    nome: "Extrato Bruto",
    strain: "Amnesia Haze",
    quantidade: 0,
    unidade: "kg",
    lote: "CLT-005",
    dataEntrada: "01/04/2025",
    validade: "01/04/2026",
    status: "Esgotado"
  }
];

// Dados de lotes em cultivo
const lotesEmCultivo = [
  {
    id: "CLT-001",
    strain: "Charlotte's Web",
    fase: "Floração",
    plantas: 50,
    dataPlantio: "15/02/2025",
    previsaoColheita: "15/05/2025",
    produtividadeEstimada: 40,
    unidade: "kg",
    responsavel: "João Silva"
  },
  {
    id: "CLT-006",
    strain: "AC/DC",
    fase: "Vegetativa",
    plantas: 75,
    dataPlantio: "01/03/2025",
    previsaoColheita: "01/06/2025",
    produtividadeEstimada: 55,
    unidade: "kg",
    responsavel: "Maria Oliveira"
  },
  {
    id: "CLT-007",
    strain: "Cannatonic",
    fase: "Germinação",
    plantas: 100,
    dataPlantio: "15/04/2025",
    previsaoColheita: "15/07/2025",
    produtividadeEstimada: 70,
    unidade: "kg",
    responsavel: "Pedro Santos"
  }
];

// Dados de movimentação de estoque
const movimentacoes = [
  { 
    id: "MOV-001", 
    data: "02/05/2025", 
    produto: "CBD Full Spectrum", 
    tipo: "Entrada", 
    quantidade: 10, 
    unidade: "kg", 
    origem: "Colheita", 
    lote: "CLT-001",
    responsavel: "João Silva" 
  },
  { 
    id: "MOV-002", 
    data: "01/05/2025", 
    produto: "THC Isolado", 
    tipo: "Saída", 
    quantidade: 5, 
    unidade: "kg", 
    destino: "Produção", 
    lote: "CLT-002",
    responsavel: "Ana Costa" 
  },
  { 
    id: "MOV-003", 
    data: "30/04/2025", 
    produto: "Extrato de CBG", 
    tipo: "Entrada", 
    quantidade: 8, 
    unidade: "kg", 
    origem: "Colheita", 
    lote: "CLT-003",
    responsavel: "Carlos Mendes" 
  },
  { 
    id: "MOV-004", 
    data: "25/04/2025", 
    produto: "Terpenos Especiais", 
    tipo: "Saída", 
    quantidade: 2, 
    unidade: "L", 
    destino: "Laboratório", 
    lote: "CLT-004",
    responsavel: "Maria Oliveira" 
  },
  { 
    id: "MOV-005", 
    data: "20/04/2025", 
    produto: "Extrato Bruto", 
    tipo: "Saída", 
    quantidade: 12, 
    unidade: "kg", 
    destino: "Produção", 
    lote: "CLT-005",
    responsavel: "Pedro Santos" 
  }
];

const EstoqueCultivoPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterStrain, setFilterStrain] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestão de Estoque</h1>
            <p className="text-gray-600 mt-1">Controle e gerenciamento de produtos derivados do cultivo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" asChild>
              <a href="/organization/cultivation">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </a>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-1">
              <PackageOpen className="h-4 w-4" />
              <span>Novo Item</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">63 kg</p>
                  <p className="text-xs text-gray-500">5 produtos diferentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Previsão de Colheita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart2 className="h-8 w-8 text-green-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">165 kg</p>
                  <p className="text-xs text-gray-500">Próximos 90 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Itens Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-amber-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-gray-500">Estoque baixo ou esgotado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Movimentações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowRight className="h-8 w-8 text-purple-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">37</p>
                  <p className="text-xs text-gray-500">Últimos 30 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="estoque" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="estoque">Estoque Atual</TabsTrigger>
            <TabsTrigger value="lotes">Lotes em Cultivo</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="estoque">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Produtos em Estoque</CardTitle>
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
                  Produtos disponíveis no estoque da organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
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
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="baixo">Baixo Estoque</SelectItem>
                          <SelectItem value="esgotado">Esgotado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={filterStrain} onValueChange={setFilterStrain}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Strain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as Strains</SelectItem>
                          <SelectItem value="charlotte">Charlotte's Web</SelectItem>
                          <SelectItem value="og">OG Kush</SelectItem>
                          <SelectItem value="sour">Sour Diesel</SelectItem>
                          <SelectItem value="blue">Blue Dream</SelectItem>
                          <SelectItem value="amnesia">Amnesia Haze</SelectItem>
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
                        <TableHead>Produto</TableHead>
                        <TableHead>Strain</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Data de Entrada</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estoqueProdutos.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium">{produto.id}</TableCell>
                          <TableCell>{produto.nome}</TableCell>
                          <TableCell>{produto.strain}</TableCell>
                          <TableCell>{produto.quantidade} {produto.unidade}</TableCell>
                          <TableCell>{produto.lote}</TableCell>
                          <TableCell>{produto.dataEntrada}</TableCell>
                          <TableCell>{produto.validade}</TableCell>
                          <TableCell>
                            {produto.status === "Disponível" ? (
                              <Badge className="bg-green-100 text-green-800">
                                Disponível
                              </Badge>
                            ) : produto.status === "Baixo Estoque" ? (
                              <Badge className="bg-amber-100 text-amber-800">
                                Baixo Estoque
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                Esgotado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver detalhes">
                              <Eye className="h-4 w-4" />
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
                  Exibindo 5 de 5 produtos
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="lotes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lotes em Cultivo</CardTitle>
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
                  Lotes que estão em cultivo e entrarão no estoque após a colheita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Strain</TableHead>
                        <TableHead>Fase</TableHead>
                        <TableHead>Plantas</TableHead>
                        <TableHead>Data do Plantio</TableHead>
                        <TableHead>Previsão de Colheita</TableHead>
                        <TableHead>Produtividade Estimada</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lotesEmCultivo.map((lote) => {
                        // Cálculo do progresso baseado na data de plantio e previsão de colheita
                        const dataInicio = new Date(lote.dataPlantio.split('/').reverse().join('-'));
                        const dataFim = new Date(lote.previsaoColheita.split('/').reverse().join('-'));
                        const hoje = new Date();
                        const totalDias = (dataFim.getTime() - dataInicio.getTime()) / (1000 * 3600 * 24);
                        const diasPassados = (hoje.getTime() - dataInicio.getTime()) / (1000 * 3600 * 24);
                        const progresso = Math.max(0, Math.min(100, Math.round((diasPassados / totalDias) * 100)));
                        
                        return (
                          <TableRow key={lote.id}>
                            <TableCell className="font-medium">{lote.id}</TableCell>
                            <TableCell>{lote.strain}</TableCell>
                            <TableCell>{lote.fase}</TableCell>
                            <TableCell>{lote.plantas}</TableCell>
                            <TableCell>{lote.dataPlantio}</TableCell>
                            <TableCell>{lote.previsaoColheita}</TableCell>
                            <TableCell>{lote.produtividadeEstimada} {lote.unidade}</TableCell>
                            <TableCell>{lote.responsavel}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Progress value={progresso} className="h-2" />
                                <span className="text-xs text-gray-500">{progresso}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver detalhes">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Exibindo 3 de 3 lotes ativos
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="movimentacoes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Movimentações de Estoque</CardTitle>
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
                  Histórico de entradas e saídas de produtos no estoque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Origem/Destino</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoes.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="font-medium">{mov.id}</TableCell>
                          <TableCell>{mov.data}</TableCell>
                          <TableCell>{mov.produto}</TableCell>
                          <TableCell>
                            {mov.tipo === "Entrada" ? (
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                                <ArrowRight className="h-3 w-3" />
                                <span>Entrada</span>
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                                <ArrowLeft className="h-3 w-3" />
                                <span>Saída</span>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{mov.quantidade} {mov.unidade}</TableCell>
                          <TableCell>{mov.lote}</TableCell>
                          <TableCell>{mov.origem || mov.destino}</TableCell>
                          <TableCell>{mov.responsavel}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver detalhes">
                              <Eye className="h-4 w-4" />
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
                  Exibindo 5 de 37 movimentações
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
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(EstoqueCultivoPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});