import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Download, Search, Filter, MoreVertical, Plus, Droplets, BarChart3, ChevronRight, Package, Hourglass, FileCheck, PenTool } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

// Dados simulados para envase
const fillingData = [
  { 
    id: "ENV-0001", 
    date: new Date("2025-04-03"), 
    status: "concluído",
    dilutionId: "DIL-0001",
    product: "CBD Óleo 3000mg",
    container: "Frasco 30ml âmbar com conta-gotas",
    batchNumber: "FN-3000-0423",
    operator: "Juliana Mendes",
    quantity: 200,
    progress: 100,
    qualityChecks: [
      { name: "Inspeção Visual", result: "Conforme", status: "aprovado" },
      { name: "Teste de Vazamento", result: "Sem vazamentos", status: "aprovado" },
      { name: "Verificação de Volume", result: "30.2ml (±0.3ml)", status: "aprovado" }
    ],
    notes: "Envase realizado com sucesso e dentro das especificações."
  },
  { 
    id: "ENV-0002", 
    date: new Date("2025-04-04"), 
    status: "concluído",
    dilutionId: "DIL-0002",
    product: "CBD Óleo 1000mg",
    container: "Frasco 30ml âmbar com conta-gotas",
    batchNumber: "FN-1000-0423",
    operator: "Carlos Sousa",
    quantity: 300,
    progress: 100,
    qualityChecks: [
      { name: "Inspeção Visual", result: "Conforme", status: "aprovado" },
      { name: "Teste de Vazamento", result: "Sem vazamentos", status: "aprovado" },
      { name: "Verificação de Volume", result: "30.1ml (±0.2ml)", status: "aprovado" }
    ],
    notes: "Envase realizado conforme procedimento padrão."
  },
  { 
    id: "ENV-0003", 
    date: new Date("2025-04-05"), 
    status: "concluído",
    dilutionId: "DIL-0003",
    product: "Full Spectrum Óleo 1500mg",
    container: "Frasco 30ml âmbar com conta-gotas",
    batchNumber: "FN-1500F-0423",
    operator: "Amanda Costa",
    quantity: 150,
    progress: 100,
    qualityChecks: [
      { name: "Inspeção Visual", result: "Conforme", status: "aprovado" },
      { name: "Teste de Vazamento", result: "Sem vazamentos", status: "aprovado" },
      { name: "Verificação de Volume", result: "30.0ml (±0.2ml)", status: "aprovado" }
    ],
    notes: "Envase de produto full spectrum realizado com sucesso."
  },
  { 
    id: "ENV-0004", 
    date: new Date("2025-04-06"), 
    status: "em andamento",
    dilutionId: "DIL-0004",
    product: "CBD Óleo 2000mg",
    container: "Frasco 30ml âmbar com conta-gotas",
    batchNumber: "FN-2000-0423",
    operator: "Rafael Lima",
    quantity: 250,
    progress: 65,
    qualityChecks: [
      { name: "Inspeção Visual", result: "Em andamento", status: "pendente" }
    ],
    notes: "Envase em andamento. 65% concluído."
  },
  { 
    id: "ENV-0005", 
    date: new Date("2025-04-10"), 
    status: "planejado",
    dilutionId: "DIL-0005",
    product: "CBD Óleo 5000mg",
    container: "Frasco 30ml âmbar com conta-gotas",
    batchNumber: "FN-5000-0423",
    operator: "Mariana Santos",
    quantity: 100,
    progress: 0,
    qualityChecks: [],
    notes: "Envase programado para produtos premium."
  }
];

// Componente para a página de Envase
function EnvasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedProduct, setSelectedProduct] = useState("todos");
  const [showNewFillingDialog, setShowNewFillingDialog] = useState(false);
  const [selectedFilling, setSelectedFilling] = useState<any>(null);
  const [showFillingDetailDialog, setShowFillingDetailDialog] = useState(false);

  // Filtrar os dados baseados nos filtros aplicados
  const filteredData = fillingData.filter(item => {
    // Filtrar por termo de busca
    const searchMatch = 
      searchTerm === "" || 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dilutionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por status
    const statusMatch = 
      selectedStatus === "todos" || 
      item.status === selectedStatus;
    
    // Filtrar por produto
    const productMatch = 
      selectedProduct === "todos" || 
      item.product === selectedProduct;
    
    return searchMatch && statusMatch && productMatch;
  });

  // Abrir diálogo de detalhes
  const openFillingDetails = (filling: any) => {
    setSelectedFilling(filling);
    setShowFillingDetailDialog(true);
  };

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Envase</h1>
            <p className="text-muted-foreground">
              Gerenciamento de processos de envase de produtos
            </p>
          </div>
          <Button onClick={() => setShowNewFillingDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Envase
          </Button>
        </div>

        <Tabs defaultValue="ativos">
          <TabsList>
            <TabsTrigger value="ativos">Envases Ativos</TabsTrigger>
            <TabsTrigger value="planejados">Envases Planejados</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ativos">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Envases em Andamento</CardTitle>
                <CardDescription>
                  Processos de envase ativos ou recentemente concluídos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID, lote ou operador..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="planejado">Planejado</SelectItem>
                        <SelectItem value="em andamento">Em andamento</SelectItem>
                        <SelectItem value="concluído">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="w-[220px]">
                        <Droplets className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os produtos</SelectItem>
                        <SelectItem value="CBD Óleo 1000mg">CBD Óleo 1000mg</SelectItem>
                        <SelectItem value="CBD Óleo 2000mg">CBD Óleo 2000mg</SelectItem>
                        <SelectItem value="CBD Óleo 3000mg">CBD Óleo 3000mg</SelectItem>
                        <SelectItem value="CBD Óleo 5000mg">CBD Óleo 5000mg</SelectItem>
                        <SelectItem value="Full Spectrum Óleo 1500mg">Full Spectrum 1500mg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead className="hidden md:table-cell">Quantidade</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((filling) => (
                          <TableRow key={filling.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openFillingDetails(filling)}>
                            <TableCell className="font-medium">{filling.id}</TableCell>
                            <TableCell>{format(filling.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  filling.status === "concluído" ? "bg-green-50 text-green-700 border-green-200" :
                                  filling.status === "em andamento" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                  filling.status === "planejado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-red-50 text-red-700 border-red-200"
                                )}
                              >
                                {filling.status.charAt(0).toUpperCase() + filling.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                {filling.product}
                              </div>
                            </TableCell>
                            <TableCell>{filling.batchNumber}</TableCell>
                            <TableCell className="hidden md:table-cell">{filling.quantity} unid.</TableCell>
                            <TableCell>
                              <div className="w-[100px] flex items-center gap-2">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full" 
                                    style={{ width: `${filling.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{filling.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    openFillingDetails(filling);
                                  }}>
                                    Ver detalhes
                                  </DropdownMenuItem>
                                  {filling.status === "em andamento" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Atualizar progresso
                                    </DropdownMenuItem>
                                  )}
                                  {filling.status === "em andamento" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Finalizar envase
                                    </DropdownMenuItem>
                                  )}
                                  {filling.status === "planejado" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Iniciar envase
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Nenhum envase encontrado para os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="planejados">
            <Card>
              <CardHeader>
                <CardTitle>Envases Planejados</CardTitle>
                <CardDescription>
                  Envases programados para os próximos dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Data Programada</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Diluição</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Operador</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fillingData.filter(f => f.status === "planejado").length > 0 ? (
                        fillingData.filter(f => f.status === "planejado").map((filling) => (
                          <TableRow key={filling.id}>
                            <TableCell className="font-medium">{filling.id}</TableCell>
                            <TableCell>{format(filling.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{filling.product}</TableCell>
                            <TableCell>{filling.dilutionId}</TableCell>
                            <TableCell>{filling.batchNumber}</TableCell>
                            <TableCell>{filling.quantity} unid.</TableCell>
                            <TableCell>{filling.operator}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Iniciar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Nenhum envase planejado no momento.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Envases</CardTitle>
                <CardDescription>
                  Registro histórico de envases concluídos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Operador</TableHead>
                        <TableHead>Status QC</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fillingData.filter(f => f.status === "concluído").length > 0 ? (
                        fillingData.filter(f => f.status === "concluído").map((filling) => (
                          <TableRow key={filling.id}>
                            <TableCell className="font-medium">{filling.id}</TableCell>
                            <TableCell>{format(filling.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{filling.product}</TableCell>
                            <TableCell>{filling.batchNumber}</TableCell>
                            <TableCell>{filling.quantity} unid.</TableCell>
                            <TableCell>{filling.operator}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Aprovado
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openFillingDetails(filling)}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Nenhum envase concluído no histórico.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="estatisticas">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Produtividade de Envase</CardTitle>
                  <CardDescription>
                    Média de unidades por hora
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold">125</span>
                      <span className="text-sm text-muted-foreground ml-1">unid/hora</span>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      +12% este mês
                    </Badge>
                  </div>
                  <div className="h-[120px] mt-4 flex items-end gap-1">
                    {[35, 42, 58, 65, 72, 85, 92, 85, 95, 98, 102, 125].map((value, index) => (
                      <div
                        key={index}
                        className="bg-primary/80 rounded-t h-[calc(100%*var(--value)/125)]"
                        style={{ '--value': value, width: 'calc(100% / 13)' } as React.CSSProperties}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Abr</span>
                    <span>Mai</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Ago</span>
                    <span>Set</span>
                    <span>Out</span>
                    <span>Nov</span>
                    <span>Dez</span>
                    <span>Jan</span>
                    <span>Fev</span>
                    <span>Mar</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Taxa de Conformidade</CardTitle>
                  <CardDescription>
                    Percentual de aprovação em QC
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold">99.2</span>
                      <span className="text-sm text-muted-foreground ml-1">% conformes</span>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      +0.5% este mês
                    </Badge>
                  </div>
                  <div className="mt-6 relative pt-4">
                    <div className="absolute -top-2 left-0 w-full flex justify-between text-xs">
                      <span className="text-red-500">97%</span>
                      <span className="text-amber-500">98%</span>
                      <span className="text-green-500">99%</span>
                      <span className="text-emerald-500">100%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${99.2}%` }}
                      />
                    </div>
                    <div className="mt-8 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Volume correto:</span>
                        <span className="font-medium">99.7%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Selagem do frasco:</span>
                        <span className="font-medium">99.4%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Inspeção visual:</span>
                        <span className="font-medium">98.5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Volume de Produção</CardTitle>
                  <CardDescription>
                    Total de unidades envasadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold">25,480</span>
                      <span className="text-sm text-muted-foreground ml-1">unidades</span>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      +18% este mês
                    </Badge>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span>CBD Óleo 1000mg</span>
                        </div>
                        <span className="font-medium">8,250 unid.</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${32.3}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span>CBD Óleo 3000mg</span>
                        </div>
                        <span className="font-medium">7,120 unid.</span>
                      </div>
                      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${27.9}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                          <span>CBD Óleo 2000mg</span>
                        </div>
                        <span className="font-medium">5,890 unid.</span>
                      </div>
                      <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${23.1}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span>Outros produtos</span>
                        </div>
                        <span className="font-medium">4,220 unid.</span>
                      </div>
                      <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${16.7}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Desempenho do Processo de Envase</CardTitle>
                  <CardDescription>
                    Métricas de desempenho dos últimos 12 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg flex flex-col items-center">
                      <Droplets className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Total Envasado</h3>
                      <p className="text-2xl font-bold">152,800</p>
                      <p className="text-sm text-muted-foreground">unidades</p>
                    </div>
                    <div className="p-4 border rounded-lg flex flex-col items-center">
                      <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                      <h3 className="font-medium">Eficiência</h3>
                      <p className="text-2xl font-bold">94.5%</p>
                      <p className="text-sm text-muted-foreground">utilização</p>
                    </div>
                    <div className="p-4 border rounded-lg flex flex-col items-center">
                      <Hourglass className="h-8 w-8 text-amber-500 mb-2" />
                      <h3 className="font-medium">Tempo Médio</h3>
                      <p className="text-2xl font-bold">18.5</p>
                      <p className="text-sm text-muted-foreground">seg/unidade</p>
                    </div>
                    <div className="p-4 border rounded-lg flex flex-col items-center">
                      <FileCheck className="h-8 w-8 text-green-500 mb-2" />
                      <h3 className="font-medium">Taxa de Defeitos</h3>
                      <p className="text-2xl font-bold">0.8%</p>
                      <p className="text-sm text-muted-foreground">unidades rejeitadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para novo envase */}
      <Dialog open={showNewFillingDialog} onOpenChange={setShowNewFillingDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Envase</DialogTitle>
            <DialogDescription>
              Cadastre um novo processo de envase
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="dilutionId">Diluição de Origem</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a diluição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dil-0001">DIL-0001 (CBD 3000mg, 200 unid.)</SelectItem>
                    <SelectItem value="dil-0002">DIL-0002 (CBD 1000mg, 300 unid.)</SelectItem>
                    <SelectItem value="dil-0003">DIL-0003 (Full Spectrum 1500mg, 150 unid.)</SelectItem>
                    <SelectItem value="dil-0004">DIL-0004 (CBD 2000mg, 250 unid.)</SelectItem>
                    <SelectItem value="dil-0005">DIL-0005 (CBD 5000mg, 100 unid.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="date">Data de Início</Label>
                <Input type="date" id="date" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="product">Produto</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbd-1000">CBD Óleo 1000mg</SelectItem>
                    <SelectItem value="cbd-2000">CBD Óleo 2000mg</SelectItem>
                    <SelectItem value="cbd-3000">CBD Óleo 3000mg</SelectItem>
                    <SelectItem value="cbd-5000">CBD Óleo 5000mg</SelectItem>
                    <SelectItem value="full-1500">Full Spectrum Óleo 1500mg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="container">Tipo de Frasco</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o frasco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambar-30">Frasco 30ml âmbar com conta-gotas</SelectItem>
                    <SelectItem value="claro-30">Frasco 30ml transparente com conta-gotas</SelectItem>
                    <SelectItem value="ambar-50">Frasco 50ml âmbar com conta-gotas</SelectItem>
                    <SelectItem value="spray-30">Frasco 30ml âmbar com spray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="batchNumber">Número do Lote</Label>
                <Input id="batchNumber" placeholder="Ex: FN-3000-0423" />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input id="quantity" placeholder="Número de unidades" type="number" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="operator">Operador Responsável</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o operador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="juliana">Juliana Mendes</SelectItem>
                  <SelectItem value="carlos">Carlos Sousa</SelectItem>
                  <SelectItem value="amanda">Amanda Costa</SelectItem>
                  <SelectItem value="rafael">Rafael Lima</SelectItem>
                  <SelectItem value="mariana">Mariana Santos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Informações adicionais sobre o envase..." />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFillingDialog(false)}>Cancelar</Button>
            <Button onClick={() => setShowNewFillingDialog(false)}>Cadastrar Envase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para detalhes do envase */}
      {selectedFilling && (
        <Dialog open={showFillingDetailDialog} onOpenChange={setShowFillingDetailDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Envase {selectedFilling.id}</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre o processo de envase
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      selectedFilling.status === "concluído" ? "bg-green-50 text-green-700 border-green-200" :
                      selectedFilling.status === "em andamento" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                      selectedFilling.status === "planejado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {selectedFilling.status.charAt(0).toUpperCase() + selectedFilling.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data</h3>
                  <p>{format(selectedFilling.date, "dd/MM/yyyy")}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Produto</h3>
                  <p>{selectedFilling.product}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Diluição de Origem</h3>
                  <p>{selectedFilling.dilutionId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Número do Lote</h3>
                  <p>{selectedFilling.batchNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Tipo de Embalagem</h3>
                  <p>{selectedFilling.container}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Operador</h3>
                  <p>{selectedFilling.operator}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Quantidade</h3>
                  <p>{selectedFilling.quantity} unidades</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Progresso</h3>
                <div className="flex items-center gap-3">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex-1">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${selectedFilling.progress}%` }}
                    />
                  </div>
                  <span className="font-medium">{selectedFilling.progress}%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Verificações de Qualidade</h3>
                {selectedFilling.qualityChecks.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Verificação</TableHead>
                          <TableHead>Resultado</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedFilling.qualityChecks.map((check: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{check.name}</TableCell>
                            <TableCell>{check.result}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  check.status === "aprovado" ? "bg-green-50 text-green-700 border-green-200" :
                                  check.status === "pendente" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-red-50 text-red-700 border-red-200"
                                )}
                              >
                                {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Não há verificações de qualidade registradas ainda.</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Observações</h3>
                <p className="text-sm text-muted-foreground">{selectedFilling.notes}</p>
              </div>
            </div>
            
            <DialogFooter>
              {selectedFilling.status === "em andamento" && (
                <Button variant="outline" className="mr-auto">
                  <PenTool className="h-4 w-4 mr-2" />
                  Atualizar Progresso
                </Button>
              )}
              {selectedFilling.status === "em andamento" && (
                <Button variant="default">Finalizar Envase</Button>
              )}
              {selectedFilling.status === "planejado" && (
                <Button variant="default">Iniciar Envase</Button>
              )}
              {selectedFilling.status === "concluído" && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </OrganizationLayout>
  );
}

export default EnvasePage;