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
import { Calculator, Droplet, Download, Search, Filter, MoreVertical, Plus, FlaskConical, ChevronRight, Beaker } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

// Dados simulados para diluições
const dilutionData = [
  { 
    id: "DIL-0001", 
    date: new Date("2025-04-02"), 
    status: "concluído",
    extractId: "EXT-0001",
    product: "CBD Isolado 99.9%",
    targetConcentration: "3000mg/30ml",
    carrier: "Óleo MCT",
    technician: "Camila Silva",
    batchSize: "200 unidades",
    testResults: [
      { name: "Concentração Final", result: "3012mg/30ml", status: "aprovado" },
      { name: "Homogeneidade", result: "CV < 2%", status: "aprovado" },
      { name: "Contaminantes", result: "Não detectado", status: "aprovado" }
    ],
    notes: "Diluição realizada com sucesso."
  },
  { 
    id: "DIL-0002", 
    date: new Date("2025-04-03"), 
    status: "concluído",
    extractId: "EXT-0001",
    product: "CBD Isolado 99.9%",
    targetConcentration: "1000mg/30ml",
    carrier: "Óleo MCT",
    technician: "Lucas Ferreira",
    batchSize: "300 unidades",
    testResults: [
      { name: "Concentração Final", result: "997mg/30ml", status: "aprovado" },
      { name: "Homogeneidade", result: "CV < 1.5%", status: "aprovado" },
      { name: "Contaminantes", result: "Não detectado", status: "aprovado" }
    ],
    notes: "Diluição realizada conforme especificações."
  },
  { 
    id: "DIL-0003", 
    date: new Date("2025-04-04"), 
    status: "concluído",
    extractId: "EXT-0002",
    product: "Full Spectrum",
    targetConcentration: "1500mg/30ml",
    carrier: "Óleo de Coco Fracionado",
    technician: "Pedro Costa",
    batchSize: "150 unidades",
    testResults: [
      { name: "Concentração Final", result: "1510mg/30ml", status: "aprovado" },
      { name: "Homogeneidade", result: "CV < 2.2%", status: "aprovado" },
      { name: "Perfil de Terpenos", result: "Conforme", status: "aprovado" }
    ],
    notes: "Diluição de óleo full spectrum com preservação de terpenos."
  },
  { 
    id: "DIL-0004", 
    date: new Date("2025-04-06"), 
    status: "em andamento",
    extractId: "EXT-0003",
    product: "CBD Broad Spectrum",
    targetConcentration: "2000mg/30ml",
    carrier: "Óleo MCT",
    technician: "Ana Oliveira",
    batchSize: "250 unidades",
    testResults: [],
    notes: "Diluição em processo, homogeneização em andamento."
  },
  { 
    id: "DIL-0005", 
    date: new Date("2025-04-09"), 
    status: "planejado",
    extractId: "EXT-0003",
    product: "CBD Broad Spectrum",
    targetConcentration: "5000mg/30ml",
    carrier: "Óleo de Oliva",
    technician: "Bruno Santos",
    batchSize: "100 unidades",
    testResults: [],
    notes: "Diluição programada para produtos premium."
  }
];

// Componente para a página de Diluição
function DiluicaoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedProduct, setSelectedProduct] = useState("todos");
  const [showNewDilutionDialog, setShowNewDilutionDialog] = useState(false);
  const [selectedDilution, setSelectedDilution] = useState<any>(null);
  const [showDilutionDetailDialog, setShowDilutionDetailDialog] = useState(false);

  // Filtrar os dados baseados nos filtros aplicados
  const filteredData = dilutionData.filter(item => {
    // Filtrar por termo de busca
    const searchMatch = 
      searchTerm === "" || 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.extractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.technician.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  const openDilutionDetails = (dilution: any) => {
    setSelectedDilution(dilution);
    setShowDilutionDetailDialog(true);
  };

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Diluição</h1>
            <p className="text-muted-foreground">
              Gerenciamento de processos de diluição e formulação de produtos
            </p>
          </div>
          <Button onClick={() => setShowNewDilutionDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Diluição
          </Button>
        </div>

        <Tabs defaultValue="ativos">
          <TabsList>
            <TabsTrigger value="ativos">Diluições Ativas</TabsTrigger>
            <TabsTrigger value="planejados">Diluições Planejadas</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="calculos">Calculadora de Diluição</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ativos">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Diluições em Andamento</CardTitle>
                <CardDescription>
                  Processos de diluição ativos ou recentemente concluídos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID, extração ou técnico..."
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
                        <Droplet className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os produtos</SelectItem>
                        <SelectItem value="CBD Isolado 99.9%">CBD Isolado 99.9%</SelectItem>
                        <SelectItem value="Full Spectrum">Full Spectrum</SelectItem>
                        <SelectItem value="CBD Broad Spectrum">CBD Broad Spectrum</SelectItem>
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
                        <TableHead>Concentração</TableHead>
                        <TableHead className="hidden md:table-cell">Extração</TableHead>
                        <TableHead className="hidden md:table-cell">Técnico</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((dilution) => (
                          <TableRow key={dilution.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDilutionDetails(dilution)}>
                            <TableCell className="font-medium">{dilution.id}</TableCell>
                            <TableCell>{format(dilution.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  dilution.status === "concluído" ? "bg-green-50 text-green-700 border-green-200" :
                                  dilution.status === "em andamento" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                  dilution.status === "planejado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-red-50 text-red-700 border-red-200"
                                )}
                              >
                                {dilution.status.charAt(0).toUpperCase() + dilution.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FlaskConical className="h-4 w-4 text-indigo-500" />
                                {dilution.product}
                              </div>
                            </TableCell>
                            <TableCell>{dilution.targetConcentration}</TableCell>
                            <TableCell className="hidden md:table-cell">{dilution.extractId}</TableCell>
                            <TableCell className="hidden md:table-cell">{dilution.technician}</TableCell>
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
                                    openDilutionDetails(dilution);
                                  }}>
                                    Ver detalhes
                                  </DropdownMenuItem>
                                  {dilution.status === "em andamento" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Registrar testes
                                    </DropdownMenuItem>
                                  )}
                                  {dilution.status === "em andamento" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Finalizar diluição
                                    </DropdownMenuItem>
                                  )}
                                  {dilution.status === "planejado" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Iniciar diluição
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
                            Nenhuma diluição encontrada para os filtros aplicados.
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
                <CardTitle>Diluições Planejadas</CardTitle>
                <CardDescription>
                  Diluições programadas para os próximos dias
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
                        <TableHead>Concentração</TableHead>
                        <TableHead>Extração</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dilutionData.filter(d => d.status === "planejado").length > 0 ? (
                        dilutionData.filter(d => d.status === "planejado").map((dilution) => (
                          <TableRow key={dilution.id}>
                            <TableCell className="font-medium">{dilution.id}</TableCell>
                            <TableCell>{format(dilution.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{dilution.product}</TableCell>
                            <TableCell>{dilution.targetConcentration}</TableCell>
                            <TableCell>{dilution.extractId}</TableCell>
                            <TableCell>{dilution.technician}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Iniciar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Nenhuma diluição planejada no momento.
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
                <CardTitle>Histórico de Diluições</CardTitle>
                <CardDescription>
                  Registro histórico de diluições concluídas
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
                        <TableHead>Concentração</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dilutionData.filter(d => d.status === "concluído").length > 0 ? (
                        dilutionData.filter(d => d.status === "concluído").map((dilution) => (
                          <TableRow key={dilution.id}>
                            <TableCell className="font-medium">{dilution.id}</TableCell>
                            <TableCell>{format(dilution.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{dilution.product}</TableCell>
                            <TableCell>{dilution.targetConcentration}</TableCell>
                            <TableCell>{dilution.batchSize}</TableCell>
                            <TableCell>{dilution.technician}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openDilutionDetails(dilution)}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Nenhuma diluição concluída no histórico.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calculos">
            <Card>
              <CardHeader>
                <CardTitle>Calculadora de Diluição</CardTitle>
                <CardDescription>
                  Ferramenta para calcular proporções precisas de diluição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Parâmetros de Entrada</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="extract-concentration">Concentração do Extrato (mg/ml)</Label>
                            <Input type="number" id="extract-concentration" placeholder="Ex: 850" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="target-concentration">Concentração Desejada (mg/ml)</Label>
                            <Input type="number" id="target-concentration" placeholder="Ex: 100" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="final-volume">Volume Final Desejado (ml)</Label>
                            <Input type="number" id="final-volume" placeholder="Ex: 30" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="batch-size">Tamanho do Lote (unidades)</Label>
                            <Input type="number" id="batch-size" placeholder="Ex: 100" />
                          </div>
                          
                          <Button className="w-full">
                            <Calculator className="h-4 w-4 mr-2" />
                            Calcular
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Resultados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 rounded-md bg-muted">
                            <h3 className="font-medium text-sm mb-1">Volume de Extrato Necessário</h3>
                            <div className="flex items-baseline">
                              <span className="text-2xl font-bold text-primary">3.53</span>
                              <span className="ml-1 text-muted-foreground">ml por unidade</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Total para o lote: <span className="font-medium">353 ml</span>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-md bg-muted">
                            <h3 className="font-medium text-sm mb-1">Volume de Veículo (Óleo) Necessário</h3>
                            <div className="flex items-baseline">
                              <span className="text-2xl font-bold text-primary">26.47</span>
                              <span className="ml-1 text-muted-foreground">ml por unidade</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Total para o lote: <span className="font-medium">2,647 ml</span>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-md bg-muted">
                            <h3 className="font-medium text-sm mb-1">Quantidade Total de Princípio Ativo</h3>
                            <div className="flex items-baseline">
                              <span className="text-2xl font-bold text-primary">3,000</span>
                              <span className="ml-1 text-muted-foreground">mg por unidade</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Total para o lote: <span className="font-medium">300,000 mg</span>
                            </div>
                          </div>
                          
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Cálculos
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notas e Recomendações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2 text-muted-foreground">
                        <p>• Considere adicionar margem de segurança de 5% para compensar possíveis perdas durante o processo.</p>
                        <p>• Para garantir homogeneidade, utilize agitação mecânica por pelo menos 30 minutos.</p>
                        <p>• Verifique a miscibilidade do extrato com o veículo escolhido antes de iniciar a produção em larga escala.</p>
                        <p>• Certifique-se de realizar testes de controle de qualidade em amostras aleatórias do lote.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para nova diluição */}
      <Dialog open={showNewDilutionDialog} onOpenChange={setShowNewDilutionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Diluição</DialogTitle>
            <DialogDescription>
              Cadastre um novo processo de diluição
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="extractId">Extrato de Origem</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o extrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ext-0001">EXT-0001 (CO2, CBD Isolado, 4.8kg)</SelectItem>
                    <SelectItem value="ext-0002">EXT-0002 (Etanol, CBD Isolado, 4.2kg)</SelectItem>
                    <SelectItem value="ext-0003">EXT-0003 (CO2, Full Spectrum, 5.1kg)</SelectItem>
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
                <Label htmlFor="productType">Tipo de Produto</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="isolado">CBD Isolado 99.9%</SelectItem>
                    <SelectItem value="broad">CBD Broad Spectrum</SelectItem>
                    <SelectItem value="full">Full Spectrum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="carrier">Veículo/Carreador</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mct">Óleo MCT</SelectItem>
                    <SelectItem value="oliva">Óleo de Oliva</SelectItem>
                    <SelectItem value="coco">Óleo de Coco Fracionado</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="concentration">Concentração Alvo</Label>
                <Input id="concentration" placeholder="Ex: 3000mg/30ml" />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="batchSize">Tamanho do Lote</Label>
                <Input id="batchSize" placeholder="Número de unidades" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="technician">Técnico Responsável</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camila">Camila Silva</SelectItem>
                  <SelectItem value="lucas">Lucas Ferreira</SelectItem>
                  <SelectItem value="pedro">Pedro Costa</SelectItem>
                  <SelectItem value="ana">Ana Oliveira</SelectItem>
                  <SelectItem value="bruno">Bruno Santos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Informações adicionais sobre a diluição..." />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDilutionDialog(false)}>Cancelar</Button>
            <Button onClick={() => setShowNewDilutionDialog(false)}>Cadastrar Diluição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para detalhes da diluição */}
      {selectedDilution && (
        <Dialog open={showDilutionDetailDialog} onOpenChange={setShowDilutionDetailDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Diluição {selectedDilution.id}</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre o processo de diluição
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      selectedDilution.status === "concluído" ? "bg-green-50 text-green-700 border-green-200" :
                      selectedDilution.status === "em andamento" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                      selectedDilution.status === "planejado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {selectedDilution.status.charAt(0).toUpperCase() + selectedDilution.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data</h3>
                  <p>{format(selectedDilution.date, "dd/MM/yyyy")}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Produto</h3>
                  <p>{selectedDilution.product}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Concentração Alvo</h3>
                  <p>{selectedDilution.targetConcentration}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Extrato de Origem</h3>
                  <p>{selectedDilution.extractId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Veículo</h3>
                  <p>{selectedDilution.carrier}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Técnico</h3>
                  <p>{selectedDilution.technician}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Tamanho do Lote</h3>
                  <p>{selectedDilution.batchSize}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Resultados dos Testes</h3>
                {selectedDilution.testResults.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teste</TableHead>
                          <TableHead>Resultado</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDilution.testResults.map((test: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{test.name}</TableCell>
                            <TableCell>{test.result}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  test.status === "aprovado" ? "bg-green-50 text-green-700 border-green-200" :
                                  "bg-red-50 text-red-700 border-red-200"
                                )}
                              >
                                {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Não há resultados de testes registrados ainda.</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Observações</h3>
                <p className="text-sm text-muted-foreground">{selectedDilution.notes}</p>
              </div>
            </div>
            
            <DialogFooter>
              {selectedDilution.status === "em andamento" && (
                <Button variant="outline" className="mr-auto">Registrar Testes</Button>
              )}
              {selectedDilution.status === "em andamento" && (
                <Button variant="default">Finalizar Diluição</Button>
              )}
              {selectedDilution.status === "planejado" && (
                <Button variant="default">Iniciar Diluição</Button>
              )}
              {selectedDilution.status === "concluído" && (
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

export default DiluicaoPage;