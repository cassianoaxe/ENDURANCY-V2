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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Beaker, Calendar, Download, Filter, MoreVertical, Plus, Search, Leaf, Droplet, Terminal, ChevronRight } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

// Dados simulados para extração
const extractionData = [
  { 
    id: "EXT-0001", 
    startDate: new Date("2025-03-25"), 
    endDate: new Date("2025-03-26"),
    status: "concluído",
    method: "CO2 Supercrítico",
    operador: "Maria Santos",
    sourceBatch: "CLT-0023",
    sourceType: "Flor",
    sourceWeight: "50kg",
    productYield: "4.8kg",
    qualityTests: [
      { name: "Teor de CBD", result: "65.2%", status: "aprovado" },
      { name: "Teor de THC", result: "<0.2%", status: "aprovado" },
      { name: "Pesticidas", result: "Não detectado", status: "aprovado" }
    ],
    notes: "Extração realizada com parâmetros otimizados."
  },
  { 
    id: "EXT-0002", 
    startDate: new Date("2025-03-27"), 
    endDate: new Date("2025-03-28"),
    status: "concluído",
    method: "Etanol",
    operador: "João Oliveira",
    sourceBatch: "CLT-0024",
    sourceType: "Flor",
    sourceWeight: "45kg",
    productYield: "4.2kg",
    qualityTests: [
      { name: "Teor de CBD", result: "62.8%", status: "aprovado" },
      { name: "Teor de THC", result: "<0.3%", status: "aprovado" },
      { name: "Metais pesados", result: "Não detectado", status: "aprovado" }
    ],
    notes: "Extração com etanol a baixa temperatura."
  },
  { 
    id: "EXT-0003", 
    startDate: new Date("2025-04-01"), 
    endDate: new Date("2025-04-02"),
    status: "concluído",
    method: "CO2 Supercrítico",
    operador: "Ana Pereira",
    sourceBatch: "CLT-0025",
    sourceType: "Flor",
    sourceWeight: "55kg",
    productYield: "5.1kg",
    qualityTests: [
      { name: "Teor de CBD", result: "68.5%", status: "aprovado" },
      { name: "Teor de THC", result: "<0.2%", status: "aprovado" },
      { name: "Solventes residuais", result: "Não detectado", status: "aprovado" }
    ],
    notes: "Extração em condições otimizadas de pressão e temperatura."
  },
  { 
    id: "EXT-0004", 
    startDate: new Date("2025-04-05"), 
    endDate: null,
    status: "em andamento",
    method: "CO2 Supercrítico",
    operador: "Carlos Mendes",
    sourceBatch: "CLT-0026",
    sourceType: "Flor",
    sourceWeight: "60kg",
    productYield: "-",
    qualityTests: [],
    notes: "Extração em andamento, programada para conclusão em 06/04."
  },
  { 
    id: "EXT-0005", 
    startDate: new Date("2025-04-08"), 
    endDate: null,
    status: "planejado",
    method: "Etanol",
    operador: "Luiza Cardoso",
    sourceBatch: "CLT-0027",
    sourceType: "Flor",
    sourceWeight: "40kg",
    productYield: "-",
    qualityTests: [],
    notes: "Extração programada."
  }
];

// Componente para a página de Extração
function ExtracaoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedMethod, setSelectedMethod] = useState("todos");
  const [showNewExtractionDialog, setShowNewExtractionDialog] = useState(false);
  const [selectedExtraction, setSelectedExtraction] = useState<any>(null);
  const [showExtractionDetailDialog, setShowExtractionDetailDialog] = useState(false);

  // Filtrar os dados baseados nos filtros aplicados
  const filteredData = extractionData.filter(item => {
    // Filtrar por termo de busca
    const searchMatch = 
      searchTerm === "" || 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceBatch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.operador.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por status
    const statusMatch = 
      selectedStatus === "todos" || 
      item.status === selectedStatus;
    
    // Filtrar por método
    const methodMatch = 
      selectedMethod === "todos" || 
      item.method === selectedMethod;
    
    return searchMatch && statusMatch && methodMatch;
  });

  // Abrir diálogo de detalhes
  const openExtractionDetails = (extraction: any) => {
    setSelectedExtraction(extraction);
    setShowExtractionDetailDialog(true);
  };

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Extração</h1>
            <p className="text-muted-foreground">
              Gerenciamento de processos de extração de princípios ativos
            </p>
          </div>
          <Button onClick={() => setShowNewExtractionDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Extração
          </Button>
        </div>

        <Tabs defaultValue="ativos">
          <TabsList>
            <TabsTrigger value="ativos">Extrações Ativas</TabsTrigger>
            <TabsTrigger value="planejados">Extrações Planejadas</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ativos">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Extrações em Andamento</CardTitle>
                <CardDescription>
                  Processos de extração ativos ou recentemente concluídos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID, lote de origem ou operador..."
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
                    
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger className="w-[200px]">
                        <Beaker className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os métodos</SelectItem>
                        <SelectItem value="CO2 Supercrítico">CO2 Supercrítico</SelectItem>
                        <SelectItem value="Etanol">Etanol</SelectItem>
                        <SelectItem value="Butano">Butano</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Lote de Origem</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead className="hidden md:table-cell">Operador</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((extraction) => (
                          <TableRow key={extraction.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openExtractionDetails(extraction)}>
                            <TableCell className="font-medium">{extraction.id}</TableCell>
                            <TableCell>{format(extraction.startDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  extraction.status === "concluído" ? "bg-green-50 text-green-700 border-green-200" :
                                  extraction.status === "em andamento" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                  extraction.status === "planejado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-red-50 text-red-700 border-red-200"
                                )}
                              >
                                {extraction.status.charAt(0).toUpperCase() + extraction.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {extraction.method === "CO2 Supercrítico" ? 
                                  <Terminal className="h-4 w-4 text-green-500" /> : 
                                  <Droplet className="h-4 w-4 text-blue-500" />
                                }
                                {extraction.method}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-green-500" />
                                {extraction.sourceBatch}
                              </div>
                            </TableCell>
                            <TableCell>{extraction.sourceType}</TableCell>
                            <TableCell className="hidden md:table-cell">{extraction.operador}</TableCell>
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
                                    openExtractionDetails(extraction);
                                  }}>
                                    Ver detalhes
                                  </DropdownMenuItem>
                                  {extraction.status === "em andamento" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Registrar parâmetros
                                    </DropdownMenuItem>
                                  )}
                                  {extraction.status === "em andamento" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Finalizar extração
                                    </DropdownMenuItem>
                                  )}
                                  {extraction.status === "planejado" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Iniciar extração
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
                            Nenhuma extração encontrada para os filtros aplicados.
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
                <CardTitle>Extrações Planejadas</CardTitle>
                <CardDescription>
                  Extrações programadas para os próximos dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Data Programada</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Lote de Origem</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Operador</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractionData.filter(e => e.status === "planejado").length > 0 ? (
                        extractionData.filter(e => e.status === "planejado").map((extraction) => (
                          <TableRow key={extraction.id}>
                            <TableCell className="font-medium">{extraction.id}</TableCell>
                            <TableCell>{format(extraction.startDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{extraction.method}</TableCell>
                            <TableCell>{extraction.sourceBatch}</TableCell>
                            <TableCell>{extraction.sourceType}</TableCell>
                            <TableCell>{extraction.operador}</TableCell>
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
                            Nenhuma extração planejada no momento.
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
                <CardTitle>Histórico de Extrações</CardTitle>
                <CardDescription>
                  Registro histórico de extrações concluídas
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
                        <TableHead>Período</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Lote de Origem</TableHead>
                        <TableHead>Rendimento</TableHead>
                        <TableHead>Operador</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractionData.filter(e => e.status === "concluído").length > 0 ? (
                        extractionData.filter(e => e.status === "concluído").map((extraction) => (
                          <TableRow key={extraction.id}>
                            <TableCell className="font-medium">{extraction.id}</TableCell>
                            <TableCell>
                              {format(extraction.startDate, "dd/MM/yyyy")} - {extraction.endDate ? format(extraction.endDate, "dd/MM/yyyy") : "Em andamento"}
                            </TableCell>
                            <TableCell>{extraction.method}</TableCell>
                            <TableCell>{extraction.sourceBatch}</TableCell>
                            <TableCell>{extraction.productYield}</TableCell>
                            <TableCell>{extraction.operador}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openExtractionDetails(extraction)}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Nenhuma extração concluída no histórico.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para nova extração */}
      <Dialog open={showNewExtractionDialog} onOpenChange={setShowNewExtractionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Extração</DialogTitle>
            <DialogDescription>
              Cadastre uma nova extração no sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="method">Método de Extração</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co2">CO2 Supercrítico</SelectItem>
                    <SelectItem value="etanol">Etanol</SelectItem>
                    <SelectItem value="butano">Butano</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input type="date" id="startDate" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="sourceBatch">Lote de Origem</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o lote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clt-0023">CLT-0023 (Flor, 50kg)</SelectItem>
                    <SelectItem value="clt-0024">CLT-0024 (Flor, 45kg)</SelectItem>
                    <SelectItem value="clt-0025">CLT-0025 (Flor, 55kg)</SelectItem>
                    <SelectItem value="clt-0026">CLT-0026 (Flor, 60kg)</SelectItem>
                    <SelectItem value="clt-0027">CLT-0027 (Flor, 40kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="operator">Operador Responsável</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o operador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maria">Maria Santos</SelectItem>
                    <SelectItem value="joao">João Oliveira</SelectItem>
                    <SelectItem value="ana">Ana Pereira</SelectItem>
                    <SelectItem value="carlos">Carlos Mendes</SelectItem>
                    <SelectItem value="luiza">Luiza Cardoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Informações adicionais sobre a extração..." />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="startNow" />
              <label
                htmlFor="startNow"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Iniciar extração imediatamente
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewExtractionDialog(false)}>Cancelar</Button>
            <Button onClick={() => setShowNewExtractionDialog(false)}>Cadastrar Extração</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para detalhes da extração */}
      {selectedExtraction && (
        <Dialog open={showExtractionDetailDialog} onOpenChange={setShowExtractionDetailDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Extração {selectedExtraction.id}</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre o processo de extração
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      selectedExtraction.status === "concluído" ? "bg-green-50 text-green-700 border-green-200" :
                      selectedExtraction.status === "em andamento" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                      selectedExtraction.status === "planejado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {selectedExtraction.status.charAt(0).toUpperCase() + selectedExtraction.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Método</h3>
                  <p>{selectedExtraction.method}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Data de Início</h3>
                  <p>{format(selectedExtraction.startDate, "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data de Término</h3>
                  <p>{selectedExtraction.endDate ? format(selectedExtraction.endDate, "dd/MM/yyyy") : "Em andamento"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Lote de Origem</h3>
                  <p>{selectedExtraction.sourceBatch} ({selectedExtraction.sourceType})</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Operador</h3>
                  <p>{selectedExtraction.operador}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Quantidade de Entrada</h3>
                  <p>{selectedExtraction.sourceWeight}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Rendimento</h3>
                  <p>{selectedExtraction.productYield}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Testes de Qualidade</h3>
                {selectedExtraction.qualityTests.length > 0 ? (
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
                        {selectedExtraction.qualityTests.map((test: any, index: number) => (
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
                  <p className="text-muted-foreground text-sm">Não há testes de qualidade registrados ainda.</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Observações</h3>
                <p className="text-sm text-muted-foreground">{selectedExtraction.notes}</p>
              </div>
            </div>
            
            <DialogFooter>
              {selectedExtraction.status === "em andamento" && (
                <Button variant="outline" className="mr-auto">Registrar Parâmetros</Button>
              )}
              {selectedExtraction.status === "em andamento" && (
                <Button variant="default">Finalizar Extração</Button>
              )}
              {selectedExtraction.status === "planejado" && (
                <Button variant="default">Iniciar Extração</Button>
              )}
              {selectedExtraction.status === "concluído" && (
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

export default ExtracaoPage;