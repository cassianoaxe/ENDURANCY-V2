import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FileText, Download, Filter, Search, Users, Box, Tag, Beaker, Leaf } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

// Dados simulados para trilha de auditoria
const auditLogData = [
  { 
    id: 1, 
    timestamp: new Date("2025-04-09T08:45:32"), 
    user: "Carlos Silva", 
    action: "Aprovação de lote",
    module: "Garantia de Qualidade",
    target: "Lote #CBD-0042",
    details: "Aprovação final de lote após testes laboratoriais"
  },
  { 
    id: 2, 
    timestamp: new Date("2025-04-09T10:12:03"), 
    user: "Maria Oliveira", 
    action: "Rejeição de extração",
    module: "Controle de Qualidade",
    target: "Extração #EXT-0089",
    details: "Rejeição devido a contaminação microbiana acima do limite permitido"
  },
  { 
    id: 3, 
    timestamp: new Date("2025-04-08T15:32:18"), 
    user: "João Santos", 
    action: "Modificação de parâmetros",
    module: "Extração",
    target: "Processo #PRO-0142",
    details: "Alteração de parâmetros de temperatura e pressão durante a destilação"
  },
  { 
    id: 4, 
    timestamp: new Date("2025-04-08T11:05:42"), 
    user: "Ana Paula Costa", 
    action: "Registro de testes",
    module: "Controle de Qualidade",
    target: "Amostra #AM-0236",
    details: "Registro de testes de potência e perfil de cannabinoides"
  },
  { 
    id: 5, 
    timestamp: new Date("2025-04-07T14:22:51"), 
    user: "Roberto Almeida", 
    action: "Vinculação de lotes",
    module: "Rastreabilidade",
    target: "Lotes #CBD-0039 e #CUL-0087",
    details: "Vinculação de lote de cultivo com lote de extração para rastreabilidade completa"
  },
  { 
    id: 6, 
    timestamp: new Date("2025-04-07T09:18:36"), 
    user: "Camila Ferreira", 
    action: "Aprovação de documentação",
    module: "Garantia de Qualidade",
    target: "Procedimento #SOP-0052",
    details: "Aprovação de procedimento operacional padrão atualizado para extração supercrítica"
  },
  { 
    id: 7, 
    timestamp: new Date("2025-04-06T16:40:12"), 
    user: "Eduardo Martins", 
    action: "Início de produção",
    module: "Produção",
    target: "Ordem #OP-0125",
    details: "Início de ordem de produção para 500 frascos de CBD 30ml 3000mg"
  },
  { 
    id: 8, 
    timestamp: new Date("2025-04-06T10:55:28"), 
    user: "Luciana Gomes", 
    action: "Entrada de matéria-prima",
    module: "Estoque",
    target: "Material #MP-0064",
    details: "Registro de entrada de 50kg de biomassa floral Cannabis Sativa L."
  },
  { 
    id: 9, 
    timestamp: new Date("2025-04-05T13:10:47"), 
    user: "Ricardo Pereira", 
    action: "Atualização de fórmula",
    module: "Desenvolvimento",
    target: "Fórmula #FOR-0028",
    details: "Alteração na proporção de excipientes para melhorar estabilidade do produto"
  },
  { 
    id: 10, 
    timestamp: new Date("2025-04-05T09:30:15"), 
    user: "Patrícia Lima", 
    action: "Calibração de equipamento",
    module: "Manutenção",
    target: "Equipamento #EQ-0012",
    details: "Calibração do HPLC para análises de controle de qualidade"
  }
];

// Opções para filtros
const moduleOptions = [
  "Todos os módulos",
  "Garantia de Qualidade", 
  "Controle de Qualidade", 
  "Extração", 
  "Diluição", 
  "Envase", 
  "Rotulagem", 
  "Estoque",
  "Rastreabilidade"
];

const actionOptions = [
  "Todas as ações",
  "Aprovação", 
  "Rejeição", 
  "Modificação", 
  "Criação", 
  "Exclusão", 
  "Vinculação", 
  "Calibração",
  "Entrada",
  "Saída"
];

// Componente para a página de Trilha de Auditoria
function TrilhaAuditoriaPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState("Todos os módulos");
  const [selectedAction, setSelectedAction] = React.useState("Todas as ações");
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Filtrar os dados baseados nos filtros aplicados
  const filteredData = auditLogData.filter(item => {
    // Filtrar por termo de busca
    const searchMatch = 
      searchTerm === "" || 
      item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por módulo
    const moduleMatch = 
      selectedModule === "Todos os módulos" || 
      item.module === selectedModule;
    
    // Filtrar por ação (verificando se a ação contém o texto selecionado)
    const actionMatch = 
      selectedAction === "Todas as ações" || 
      item.action.toLowerCase().includes(selectedAction.toLowerCase());
    
    // Filtrar por data
    const dateMatch = 
      (!dateRange.from || item.timestamp >= dateRange.from) &&
      (!dateRange.to || item.timestamp <= dateRange.to);
    
    return searchMatch && moduleMatch && actionMatch && dateMatch;
  });

  // Função para gerar relatório
  const generateReport = () => {
    alert("Relatório da trilha de auditoria será exportado em formato CSV");
    // Aqui implementaríamos a exportação real dos dados para CSV
  };

  // Função para simular uma auditoria
  const simulateAudit = () => {
    alert("Iniciando simulação de auditoria para testar a trilha de rastreabilidade");
    // Aqui implementaríamos a lógica de simulação de auditoria
  };

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trilha de Auditoria</h1>
            <p className="text-muted-foreground">
              Monitoramento completo de ações e eventos para garantir conformidade regulatória
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={simulateAudit}>
              <FileText className="h-4 w-4 mr-2" />
              Simular Auditoria
            </Button>
            <Button variant="outline" onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        <Tabs defaultValue="registros">
          <TabsList>
            <TabsTrigger value="registros">Registros de Atividade</TabsTrigger>
            <TabsTrigger value="rastreabilidade">Rastreabilidade</TabsTrigger>
            <TabsTrigger value="simulacoes">Simulações de Recall</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registros">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Registros de Atividade</CardTitle>
                <CardDescription>
                  Histórico completo de ações e eventos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por usuário, item ou descrição..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                      <SelectTrigger className="w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Módulo" />
                      </SelectTrigger>
                      <SelectContent>
                        {moduleOptions.map((module) => (
                          <SelectItem key={module} value={module}>
                            {module}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                      <SelectTrigger className="w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Ação" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionOptions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !dateRange.from && !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "P", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "P", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "P", { locale: ptBR })
                            )
                          ) : (
                            "Período"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={setDateRange as any}
                          numberOfMonths={2}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Data e Hora</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden md:table-cell">Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {format(log.timestamp, "dd/MM/yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {log.user}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  log.action.includes("Aprovação") ? "bg-green-50 text-green-700 border-green-200" :
                                  log.action.includes("Rejeição") ? "bg-red-50 text-red-700 border-red-200" : 
                                  "bg-blue-50 text-blue-700 border-blue-200"
                                )}
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {log.module === "Garantia de Qualidade" ? (
                                  <Tag className="h-4 w-4 text-violet-500" />
                                ) : log.module === "Controle de Qualidade" ? (
                                  <Beaker className="h-4 w-4 text-blue-500" />
                                ) : log.module === "Estoque" ? (
                                  <Box className="h-4 w-4 text-amber-500" />
                                ) : log.module === "Rastreabilidade" ? (
                                  <Leaf className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Box className="h-4 w-4 text-gray-500" />
                                )}
                                {log.module}
                              </div>
                            </TableCell>
                            <TableCell>{log.target}</TableCell>
                            <TableCell className="hidden md:table-cell">{log.details}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Nenhum registro encontrado para os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rastreabilidade">
            <Card>
              <CardHeader>
                <CardTitle>Rastreabilidade Completa</CardTitle>
                <CardDescription>
                  Visualize o fluxo completo da semente ao produto final
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center">
                  <div className="p-6 text-center">
                    <Box className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-medium">Selecione um lote ou produto</h3>
                    <p className="text-muted-foreground mt-2">
                      Digite o código do lote, produto ou escaneie o QR code para visualizar a trilha de rastreabilidade completa.
                    </p>
                    <div className="max-w-sm mx-auto mt-4">
                      <Input placeholder="Digite o código do lote ou produto" className="mb-2" />
                      <Button className="w-full">Buscar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="simulacoes">
            <Card>
              <CardHeader>
                <CardTitle>Simulações de Recall</CardTitle>
                <CardDescription>
                  Simule procedimentos de recall para verificar a eficácia da rastreabilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center">
                  <div className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-medium">Iniciar nova simulação</h3>
                    <p className="text-muted-foreground mt-2">
                      Crie um cenário de recall para testar a capacidade da organização de rastrear e identificar produtos afetados.
                    </p>
                    <div className="flex justify-center mt-4">
                      <Button>Iniciar Simulação</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}

export default TrilhaAuditoriaPage;