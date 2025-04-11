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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tag, Download, Search, Filter, MoreVertical, Plus, QrCode, ChevronRight, Package, Check, Tags, FileSymlink, PenTool, FileText } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

// Dados simulados para rotulagem
const labelingData = [
  { 
    id: "ROT-0001", 
    date: new Date("2025-04-04"), 
    status: "concluído",
    fillingId: "ENV-0001",
    product: "CBD Óleo 3000mg",
    batchNumber: "FN-3000-0423",
    operator: "Isabela Rodrigues",
    quantity: 200,
    progress: 100,
    qrGenerated: true,
    qualityChecks: [
      { name: "Inspeção Visual", result: "Conforme", status: "aprovado" },
      { name: "Verificação de Texto", result: "Conforme", status: "aprovado" },
      { name: "Alinhamento", result: "Conforme", status: "aprovado" },
      { name: "Verificação de Códigos", result: "Conforme", status: "aprovado" }
    ],
    notes: "Rotulagem realizada sem intercorrências. Todos os rótulos com QR code funcional."
  },
  { 
    id: "ROT-0002", 
    date: new Date("2025-04-05"), 
    status: "concluído",
    fillingId: "ENV-0002",
    product: "CBD Óleo 1000mg",
    batchNumber: "FN-1000-0423",
    operator: "Renato Alves",
    quantity: 300,
    progress: 100,
    qrGenerated: true,
    qualityChecks: [
      { name: "Inspeção Visual", result: "Conforme", status: "aprovado" },
      { name: "Verificação de Texto", result: "Conforme", status: "aprovado" },
      { name: "Alinhamento", result: "Conforme", status: "aprovado" },
      { name: "Verificação de Códigos", result: "Conforme", status: "aprovado" }
    ],
    notes: "Rotulagem concluída conforme especificações."
  },
  { 
    id: "ROT-0003", 
    date: new Date("2025-04-06"), 
    status: "concluído",
    fillingId: "ENV-0003",
    product: "Full Spectrum Óleo 1500mg",
    batchNumber: "FN-1500F-0423",
    operator: "Carla Moreira",
    quantity: 150,
    progress: 100,
    qrGenerated: true,
    qualityChecks: [
      { name: "Inspeção Visual", result: "Conforme", status: "aprovado" },
      { name: "Verificação de Texto", result: "Conforme", status: "aprovado" },
      { name: "Alinhamento", result: "Conforme", status: "aprovado" },
      { name: "Verificação de Códigos", result: "Conforme", status: "aprovado" }
    ],
    notes: "Rotulagem de produtos premium realizada com verificação detalhada."
  },
  { 
    id: "ROT-0004", 
    date: new Date("2025-04-07"), 
    status: "em andamento",
    fillingId: "ENV-0004",
    product: "CBD Óleo 2000mg",
    batchNumber: "FN-2000-0423",
    operator: "Fernando Castro",
    quantity: 250,
    progress: 45,
    qrGenerated: true,
    qualityChecks: [
      { name: "Inspeção Visual", result: "Em andamento", status: "pendente" }
    ],
    notes: "Processo de rotulagem em andamento. 45% concluído."
  },
  { 
    id: "ROT-0005", 
    date: new Date("2025-04-11"), 
    status: "planejado",
    fillingId: "ENV-0005",
    product: "CBD Óleo 5000mg",
    batchNumber: "FN-5000-0423",
    operator: "Paula Oliveira",
    quantity: 100,
    progress: 0,
    qrGenerated: false,
    qualityChecks: [],
    notes: "Rotulagem programada após conclusão do envase."
  }
];

// Componente para a página de Rotulagem
function RotulagemPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedProduct, setSelectedProduct] = useState("todos");
  const [showNewLabelingDialog, setShowNewLabelingDialog] = useState(false);
  const [showGenerateQRDialog, setShowGenerateQRDialog] = useState(false);
  const [selectedLabeling, setSelectedLabeling] = useState<any>(null);
  const [showLabelingDetailDialog, setShowLabelingDetailDialog] = useState(false);

  // Filtrar os dados baseados nos filtros aplicados
  const filteredData = labelingData.filter(item => {
    // Filtrar por termo de busca
    const searchMatch = 
      searchTerm === "" || 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fillingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  const openLabelingDetails = (labeling: any) => {
    setSelectedLabeling(labeling);
    setShowLabelingDetailDialog(true);
  };

  // Abrir diálogo para gerar QR codes
  const openGenerateQRDialog = (labeling: any) => {
    setSelectedLabeling(labeling);
    setShowGenerateQRDialog(true);
  };

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rotulagem</h1>
            <p className="text-muted-foreground">
              Gerenciamento de processos de rotulagem e identificação de produtos
            </p>
          </div>
          <Button onClick={() => setShowNewLabelingDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Rotulagem
          </Button>
        </div>

        <Tabs defaultValue="ativos">
          <TabsList>
            <TabsTrigger value="ativos">Rotulagens Ativas</TabsTrigger>
            <TabsTrigger value="planejados">Rotulagens Planejadas</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="modelos">Modelos de Rótulos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ativos">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Rotulagens em Andamento</CardTitle>
                <CardDescription>
                  Processos de rotulagem ativos ou recentemente concluídos
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
                        <Package className="h-4 w-4 mr-2" />
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
                        <TableHead>QR Code</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((labeling) => (
                          <TableRow key={labeling.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openLabelingDetails(labeling)}>
                            <TableCell className="font-medium">{labeling.id}</TableCell>
                            <TableCell>{format(labeling.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  labeling.status === "concluído" ? "bg-green-50 text-green-700 border-green-200" :
                                  labeling.status === "em andamento" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                  labeling.status === "planejado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-red-50 text-red-700 border-red-200"
                                )}
                              >
                                {labeling.status.charAt(0).toUpperCase() + labeling.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-primary" />
                                {labeling.product}
                              </div>
                            </TableCell>
                            <TableCell>{labeling.batchNumber}</TableCell>
                            <TableCell className="hidden md:table-cell">{labeling.quantity} unid.</TableCell>
                            <TableCell>
                              <div className="w-[100px] flex items-center gap-2">
                                <Progress value={labeling.progress} className="h-2" />
                                <span className="text-xs text-muted-foreground">{labeling.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {labeling.qrGenerated ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Check className="h-3 w-3 mr-1" /> Gerado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Pendente
                                </Badge>
                              )}
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
                                    openLabelingDetails(labeling);
                                  }}>
                                    Ver detalhes
                                  </DropdownMenuItem>
                                  {!labeling.qrGenerated && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      openGenerateQRDialog(labeling);
                                    }}>
                                      Gerar QR Codes
                                    </DropdownMenuItem>
                                  )}
                                  {labeling.status === "em andamento" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Atualizar progresso
                                    </DropdownMenuItem>
                                  )}
                                  {labeling.status === "em andamento" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Finalizar rotulagem
                                    </DropdownMenuItem>
                                  )}
                                  {labeling.status === "planejado" && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Iniciar rotulagem
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            Nenhuma rotulagem encontrada para os filtros aplicados.
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
                <CardTitle>Rotulagens Planejadas</CardTitle>
                <CardDescription>
                  Rotulagens programadas para os próximos dias
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
                        <TableHead>Envase</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Operador</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labelingData.filter(l => l.status === "planejado").length > 0 ? (
                        labelingData.filter(l => l.status === "planejado").map((labeling) => (
                          <TableRow key={labeling.id}>
                            <TableCell className="font-medium">{labeling.id}</TableCell>
                            <TableCell>{format(labeling.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{labeling.product}</TableCell>
                            <TableCell>{labeling.fillingId}</TableCell>
                            <TableCell>{labeling.batchNumber}</TableCell>
                            <TableCell>{labeling.quantity} unid.</TableCell>
                            <TableCell>{labeling.operator}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Iniciar
                                </Button>
                                {!labeling.qrGenerated && (
                                  <Button variant="outline" size="sm" onClick={() => openGenerateQRDialog(labeling)}>
                                    <QrCode className="h-4 w-4 mr-1" /> QR
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Nenhuma rotulagem planejada no momento.
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
                <CardTitle>Histórico de Rotulagens</CardTitle>
                <CardDescription>
                  Registro histórico de rotulagens concluídas
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
                      {labelingData.filter(l => l.status === "concluído").length > 0 ? (
                        labelingData.filter(l => l.status === "concluído").map((labeling) => (
                          <TableRow key={labeling.id}>
                            <TableCell className="font-medium">{labeling.id}</TableCell>
                            <TableCell>{format(labeling.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{labeling.product}</TableCell>
                            <TableCell>{labeling.batchNumber}</TableCell>
                            <TableCell>{labeling.quantity} unid.</TableCell>
                            <TableCell>{labeling.operator}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Aprovado
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openLabelingDetails(labeling)}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Nenhuma rotulagem concluída no histórico.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="modelos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Modelos de Rótulos</CardTitle>
                  <CardDescription>
                    Modelos de rótulos disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <Tag className="h-5 w-5 text-primary mr-2" />
                          <h3 className="font-medium">Rótulo Padrão CBD</h3>
                        </div>
                        <Badge variant="outline">v1.3</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Modelo padrão para produtos CBD com todas as informações regulatórias.
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atualizado: 15/03/2025</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileSymlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <Tag className="h-5 w-5 text-primary mr-2" />
                          <h3 className="font-medium">Rótulo Full Spectrum</h3>
                        </div>
                        <Badge variant="outline">v1.2</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Modelo para produtos full spectrum com informações de terpenos e cannabinoides.
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atualizado: 20/02/2025</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileSymlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <Tag className="h-5 w-5 text-primary mr-2" />
                          <h3 className="font-medium">Rótulo Exportação</h3>
                        </div>
                        <Badge variant="outline">v1.0</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Modelo para produtos de exportação com informações multilíngues.
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atualizado: 10/03/2025</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileSymlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Novo Modelo
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Visualização do Modelo</CardTitle>
                  <CardDescription>
                    Visualização do modelo de rótulo selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 mb-4">
                    <div className="w-full aspect-[3/2] bg-muted rounded-lg flex items-center justify-center">
                      <div className="bg-white w-[80%] h-[80%] rounded shadow-sm p-4 flex flex-col">
                        <div className="border-b pb-2 mb-2">
                          <div className="text-xl font-bold text-center">CBD Óleo 1000mg</div>
                          <div className="text-sm text-center">Óleo de Canabidiol Full Spectrum</div>
                        </div>
                        
                        <div className="flex-1 flex">
                          <div className="w-2/3 pr-2 border-r">
                            <div className="text-xs mb-2 font-medium">Informações do Produto:</div>
                            <div className="space-y-1 text-xs">
                              <div>Conteúdo: 30ml (1000mg CBD)</div>
                              <div>Ingredientes: Óleo MCT, Extrato de Cannabis Sativa L.</div>
                              <div>Modo de usar: 1ml (33.3mg CBD) 1-2 vezes ao dia</div>
                            </div>
                            
                            <div className="text-xs mt-3 mb-1 font-medium">Avisos:</div>
                            <div className="text-[10px]">
                              Manter fora do alcance de crianças. Não usar durante gravidez ou amamentação. Consulte seu médico antes de usar.
                            </div>
                          </div>
                          
                          <div className="w-1/3 pl-2 flex flex-col">
                            <div className="mb-2 border rounded p-1 flex items-center justify-center">
                              <QrCode className="h-16 w-16 text-primary" />
                            </div>
                            <div className="text-[10px] mb-1">
                              <div>Lote: FN-1000-0423</div>
                              <div>Fabricação: 04/2025</div>
                              <div>Validade: 04/2027</div>
                            </div>
                            <div className="mt-auto text-[10px]">
                              <div>Produzido por: Endurancy</div>
                              <div>CNPJ: 12.345.678/0001-90</div>
                              <div>AFE: 1.23.456-7</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline">
                        <PenTool className="h-4 w-4 mr-2" />
                        Editar Modelo
                      </Button>
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Template
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Campos Personalizáveis</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="product-name">Nome do Produto</Label>
                          <Input id="product-name" defaultValue="CBD Óleo 1000mg" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="product-description">Descrição</Label>
                          <Input id="product-description" defaultValue="Óleo de Canabidiol Full Spectrum" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="batch-number">Número do Lote</Label>
                          <Input id="batch-number" defaultValue="FN-1000-0423" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="manufacture-date">Data de Fabricação</Label>
                          <Input id="manufacture-date" type="date" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="expiry-date">Data de Validade</Label>
                          <Input id="expiry-date" type="date" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="label-instructions">Instruções de Uso</Label>
                        <Textarea 
                          id="label-instructions" 
                          defaultValue="1ml (33.3mg CBD) 1-2 vezes ao dia"
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="qr-code" defaultChecked />
                        <label
                          htmlFor="qr-code"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Incluir QR code para rastreabilidade
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para nova rotulagem */}
      <Dialog open={showNewLabelingDialog} onOpenChange={setShowNewLabelingDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Rotulagem</DialogTitle>
            <DialogDescription>
              Cadastre um novo processo de rotulagem
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="fillingId">Envase de Origem</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o envase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="env-0001">ENV-0001 (CBD 3000mg, 200 unid.)</SelectItem>
                    <SelectItem value="env-0002">ENV-0002 (CBD 1000mg, 300 unid.)</SelectItem>
                    <SelectItem value="env-0003">ENV-0003 (Full Spectrum 1500mg, 150 unid.)</SelectItem>
                    <SelectItem value="env-0004">ENV-0004 (CBD 2000mg, 250 unid.)</SelectItem>
                    <SelectItem value="env-0005">ENV-0005 (CBD 5000mg, 100 unid.)</SelectItem>
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
                <Label htmlFor="labelTemplate">Modelo de Rótulo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padrao">Rótulo Padrão CBD (v1.3)</SelectItem>
                    <SelectItem value="full">Rótulo Full Spectrum (v1.2)</SelectItem>
                    <SelectItem value="exportacao">Rótulo Exportação (v1.0)</SelectItem>
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
                  <SelectItem value="isabela">Isabela Rodrigues</SelectItem>
                  <SelectItem value="renato">Renato Alves</SelectItem>
                  <SelectItem value="carla">Carla Moreira</SelectItem>
                  <SelectItem value="fernando">Fernando Castro</SelectItem>
                  <SelectItem value="paula">Paula Oliveira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="generate-qr" />
              <label
                htmlFor="generate-qr"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Gerar QR Codes durante o cadastro
              </label>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Informações adicionais sobre a rotulagem..." />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewLabelingDialog(false)}>Cancelar</Button>
            <Button onClick={() => setShowNewLabelingDialog(false)}>Cadastrar Rotulagem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para gerar QR codes */}
      {selectedLabeling && (
        <Dialog open={showGenerateQRDialog} onOpenChange={setShowGenerateQRDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Gerar QR Codes</DialogTitle>
              <DialogDescription>
                Gerar códigos QR para rastreabilidade do lote {selectedLabeling.batchNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="qr-information">Informações para incluir no QR Code</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="qr-product" defaultChecked />
                    <label
                      htmlFor="qr-product"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Informações do produto
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="qr-batch" defaultChecked />
                    <label
                      htmlFor="qr-batch"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Número do lote e data de fabricação
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="qr-tests" defaultChecked />
                    <label
                      htmlFor="qr-tests"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Resultados de testes de qualidade
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="qr-certificate" defaultChecked />
                    <label
                      htmlFor="qr-certificate"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Link para certificado de análise
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="qr-origin" defaultChecked />
                    <label
                      htmlFor="qr-origin"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Informações de origem e rastreabilidade
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="qr-landing-page">Página de Destino</Label>
                <Select defaultValue="product-verification">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a página de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product-verification">Verificação de Produto</SelectItem>
                    <SelectItem value="product-info">Informações Detalhadas do Produto</SelectItem>
                    <SelectItem value="lab-certificate">Certificado de Análise</SelectItem>
                    <SelectItem value="usage-guide">Guia de Uso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="qr-prefix">Prefixo de URL</Label>
                <Input id="qr-prefix" defaultValue="https://endurancy.com/verify/" />
              </div>
              
              <div className="flex justify-center mt-2">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <QrCode className="h-32 w-32 text-primary" />
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Prévia do QR Code para o lote {selectedLabeling.batchNumber}
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerateQRDialog(false)}>Cancelar</Button>
              <Button onClick={() => {
                // Em uma implementação real, aqui marcaria o QR como gerado
                setShowGenerateQRDialog(false);
              }}>
                Gerar {selectedLabeling.quantity} QR Codes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para detalhes da rotulagem */}
      {selectedLabeling && (
        <Dialog open={showLabelingDetailDialog} onOpenChange={setShowLabelingDetailDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Rotulagem {selectedLabeling.id}</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre o processo de rotulagem
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      selectedLabeling.status === "concluído" ? "bg-green-50 text-green-700 border-green-200" :
                      selectedLabeling.status === "em andamento" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                      selectedLabeling.status === "planejado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {selectedLabeling.status.charAt(0).toUpperCase() + selectedLabeling.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data</h3>
                  <p>{format(selectedLabeling.date, "dd/MM/yyyy")}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Produto</h3>
                  <p>{selectedLabeling.product}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Envase de Origem</h3>
                  <p>{selectedLabeling.fillingId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Número do Lote</h3>
                  <p>{selectedLabeling.batchNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">QR Code</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      selectedLabeling.qrGenerated ? "bg-green-50 text-green-700 border-green-200" : 
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {selectedLabeling.qrGenerated ? (
                      <><Check className="h-3 w-3 mr-1" /> Gerado</>
                    ) : "Pendente"}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Operador</h3>
                  <p>{selectedLabeling.operator}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Quantidade</h3>
                  <p>{selectedLabeling.quantity} unidades</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Progresso</h3>
                <div className="flex items-center gap-3">
                  <Progress value={selectedLabeling.progress} className="h-3 flex-1" />
                  <span className="font-medium">{selectedLabeling.progress}%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Verificações de Qualidade</h3>
                {selectedLabeling.qualityChecks.length > 0 ? (
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
                        {selectedLabeling.qualityChecks.map((check: any, index: number) => (
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
                <p className="text-sm text-muted-foreground">{selectedLabeling.notes}</p>
              </div>
              
              {selectedLabeling.qrGenerated && (
                <div className="flex justify-center mt-2">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <QrCode className="h-24 w-24 text-primary" />
                    <p className="text-xs text-center mt-2">QR Code de amostra</p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              {!selectedLabeling.qrGenerated && (
                <Button variant="outline" className="mr-auto" onClick={() => {
                  setShowLabelingDetailDialog(false);
                  openGenerateQRDialog(selectedLabeling);
                }}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar QR Codes
                </Button>
              )}
              {selectedLabeling.status === "em andamento" && (
                <Button variant="outline" className="mr-auto">
                  <PenTool className="h-4 w-4 mr-2" />
                  Atualizar Progresso
                </Button>
              )}
              {selectedLabeling.status === "em andamento" && (
                <Button variant="default">Finalizar Rotulagem</Button>
              )}
              {selectedLabeling.status === "planejado" && (
                <Button variant="default">Iniciar Rotulagem</Button>
              )}
              {selectedLabeling.status === "concluído" && (
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

export default RotulagemPage;