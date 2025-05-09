import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  QrCode,
  Barcode,
  Camera,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Package,
  ClipboardList,
  FileCheck,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

// Dados de exemplo para escanemento de códigos
const mockScanHistory = [
  { 
    id: 1, 
    codigo: "COD-12345678", 
    tipo: "qrcode", 
    timestamp: "07/04/2025 14:23:15", 
    status: "valido", 
    pedido: "PED-12345",
    destino: "Separação"
  },
  { 
    id: 2, 
    codigo: "BAR-87654321", 
    tipo: "barcode", 
    timestamp: "07/04/2025 14:22:03", 
    status: "valido", 
    pedido: "PED-12346",
    destino: "Embalagem"
  },
  { 
    id: 3, 
    codigo: "COD-23456789", 
    tipo: "qrcode", 
    timestamp: "07/04/2025 14:18:45", 
    status: "invalido", 
    pedido: null,
    destino: null
  },
  { 
    id: 4, 
    codigo: "BAR-98765432", 
    tipo: "barcode", 
    timestamp: "07/04/2025 14:15:22", 
    status: "valido", 
    pedido: "PED-12347",
    destino: "Expedição"
  },
  { 
    id: 5, 
    codigo: "COD-34567890", 
    tipo: "qrcode", 
    timestamp: "07/04/2025 14:10:17", 
    status: "valido", 
    pedido: "PED-12348",
    destino: "Separação"
  },
  { 
    id: 6, 
    codigo: "BAR-09876543", 
    tipo: "barcode", 
    timestamp: "07/04/2025 14:05:51", 
    status: "invalido", 
    pedido: null,
    destino: null
  }
];

export default function CodigosExpedicao() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scanner");
  const [manualCode, setManualCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<{
    codigo: string;
    tipo: string;
    status: string;
    mensagem: string;
    pedido?: string | null;
    destino?: string | null;
  } | null>(null);

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para filtrar histórico de escaneamentos
  const filteredHistory = mockScanHistory.filter(scan => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        scan.codigo.toLowerCase().includes(searchLower) ||
        (scan.pedido && scan.pedido.toLowerCase().includes(searchLower)) ||
        scan.tipo.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Função para simular escaneamento de código manual
  const processManualCode = () => {
    if (!manualCode.trim()) return;
    
    // Simular processamento (em produção, isso seria uma chamada de API)
    const isValid = Math.random() > 0.2; // 80% de chance de ser válido
    const codeType = manualCode.startsWith("COD") ? "qrcode" : "barcode";
    
    const scannedResult = {
      codigo: manualCode,
      tipo: codeType,
      status: isValid ? "valido" : "invalido",
      mensagem: isValid ? "Código processado com sucesso!" : "Código inválido ou não reconhecido.",
      pedido: isValid ? `PED-${Math.floor(10000 + Math.random() * 90000)}` : null,
      destino: isValid ? (Math.random() > 0.5 ? "Separação" : "Expedição") : null
    };
    
    setLastScannedCode(scannedResult);
    setManualCode("");
  };

  // Função para simular escaneamento via câmera
  const simulateCameraScan = () => {
    // Simular o resultado de um escaneamento de câmera
    const códigos = ["COD-54321678", "BAR-87654321", "COD-87654321", "BAR-12345678"];
    const codigoAleatorio = códigos[Math.floor(Math.random() * códigos.length)];
    
    const isValid = Math.random() > 0.2; // 80% de chance de ser válido
    const codeType = codigoAleatorio.startsWith("COD") ? "qrcode" : "barcode";
    
    const scannedResult = {
      codigo: codigoAleatorio,
      tipo: codeType,
      status: isValid ? "valido" : "invalido",
      mensagem: isValid ? "Código escaneado com sucesso!" : "Código inválido ou não reconhecido.",
      pedido: isValid ? `PED-${Math.floor(10000 + Math.random() * 90000)}` : null,
      destino: isValid ? (Math.random() > 0.5 ? "Separação" : "Expedição") : null
    };
    
    setLastScannedCode(scannedResult);
    setShowCamera(false);
  };

  return (
      <div className="container py-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2"
              onClick={() => navigateTo("/organization/expedicao")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Leitura de Códigos</h1>
            <p className="text-muted-foreground mt-1">
              Escaneie códigos de barras e QR codes para acompanhamento de pedidos
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <ClipboardList className="h-4 w-4 mr-2" />
              Ver Relatório
            </Button>
          </div>
        </div>

        {/* Estatísticas de Leitura */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Escaneamentos</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">{mockScanHistory.length}</span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <QrCode className="h-3 w-3 inline mr-1" />
                  {mockScanHistory.filter(scan => scan.tipo === "qrcode").length} QR codes
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Códigos de Barra</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockScanHistory.filter(scan => scan.tipo === "barcode").length}
                  </span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <Barcode className="h-3 w-3 inline mr-1" />
                  Leituras de código de barras
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Leituras Válidas</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockScanHistory.filter(scan => scan.status === "valido").length}
                  </span>
                </div>
                <div className="mt-4 text-green-600 text-xs">
                  <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  Taxa de sucesso: {Math.round((mockScanHistory.filter(scan => scan.status === "valido").length / mockScanHistory.length) * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Leituras Inválidas</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockScanHistory.filter(scan => scan.status === "invalido").length}
                  </span>
                </div>
                <div className="mt-4 text-red-600 text-xs">
                  <XCircle className="h-3 w-3 inline mr-1" />
                  Escaneamentos com erro
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de leitura */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" defaultValue="scanner">
          <TabsList className="mb-4">
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Scanner de Códigos</CardTitle>
                <CardDescription>
                  Posicione o código em frente à câmera para escaneamento automático
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  {!showCamera ? (
                    <div className="flex flex-col items-center">
                      <Button 
                        size="lg" 
                        className="mb-4"
                        onClick={() => setShowCamera(true)}
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Iniciar Scanner
                      </Button>
                      <div className="text-muted-foreground text-center text-sm max-w-md">
                        Clique no botão acima para iniciar o scanner de códigos.
                        Certifique-se de permitir o acesso à câmera quando solicitado.
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-md">
                      {/* Simulação de interface de câmera */}
                      <div className="border-2 border-dashed border-gray-300 rounded-md bg-gray-50 aspect-video flex flex-col items-center justify-center p-4">
                        <div className="w-full h-full relative flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="border-2 border-green-500 w-3/4 h-1/2 rounded-md flex items-center justify-center">
                              <QrCode className="h-16 w-16 text-gray-300" />
                            </div>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-white/80"
                              onClick={() => setShowCamera(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center mt-4">
                        <Button 
                          className="w-full"
                          onClick={simulateCameraScan}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Simular Escaneamento
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Resultado do último escaneamento */}
                  {lastScannedCode && (
                    <Card className="w-full max-w-md mt-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          {lastScannedCode.status === "valido" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          Resultado do Escaneamento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Código:</span>
                            <span className="font-medium">{lastScannedCode.codigo}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Tipo:</span>
                            <span className="font-medium">
                              {lastScannedCode.tipo === "qrcode" ? "QR Code" : "Código de Barras"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge 
                              variant="outline" 
                              className={`w-fit ${
                                lastScannedCode.status === "valido" 
                                  ? "bg-green-50 text-green-700 hover:bg-green-50" 
                                  : "bg-red-50 text-red-700 hover:bg-red-50"
                              }`}
                            >
                              {lastScannedCode.status === "valido" ? "Válido" : "Inválido"}
                            </Badge>
                          </div>
                          {lastScannedCode.pedido && (
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Pedido:</span>
                              <span className="font-medium">{lastScannedCode.pedido}</span>
                            </div>
                          )}
                          {lastScannedCode.destino && (
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Destino:</span>
                              <span className="font-medium">{lastScannedCode.destino}</span>
                            </div>
                          )}
                          <div className="flex flex-col pt-2">
                            <span className="text-sm">{lastScannedCode.mensagem}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setLastScannedCode(null)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Novo Escaneamento
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Histórico de Escaneamentos</CardTitle>
                <CardDescription>
                  Visualize todos os códigos escaneados recentemente
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, pedido ou tipo..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Destino</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell className="font-medium">{scan.codigo}</TableCell>
                          <TableCell>
                            {scan.tipo === "qrcode" ? (
                              <div className="flex items-center">
                                <QrCode className="h-3 w-3 mr-1 text-blue-600" />
                                <span>QR Code</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Barcode className="h-3 w-3 mr-1 text-gray-600" />
                                <span>Código de Barras</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{scan.timestamp}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${scan.status === "valido" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                                ${scan.status === "invalido" ? "bg-red-50 text-red-700 hover:bg-red-50" : ""}
                              `}
                            >
                              {scan.status === "valido" ? "Válido" : "Inválido"}
                            </Badge>
                          </TableCell>
                          <TableCell>{scan.pedido || "-"}</TableCell>
                          <TableCell>{scan.destino || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhum escaneamento encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Mostrando {filteredHistory.length} de {mockScanHistory.length} registros
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={filteredHistory.length === 0}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled={filteredHistory.length === 0}>
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Entrada Manual de Códigos</CardTitle>
                <CardDescription>
                  Digite o código para processamento manual quando o scanner não conseguir ler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label 
                      htmlFor="manual-code" 
                      className="text-sm font-medium text-gray-700"
                    >
                      Código (QR ou Barras)
                    </label>
                    <Textarea
                      id="manual-code"
                      placeholder="Digite o código aqui (ex: COD-12345678 ou BAR-87654321)"
                      className="min-h-32"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!manualCode.trim()}
                    onClick={processManualCode}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Processar Código
                  </Button>
                  
                  {/* Resultado do processamento manual */}
                  {lastScannedCode && (
                    <Card className="mt-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          {lastScannedCode.status === "valido" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          Resultado do Processamento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Código:</span>
                            <span className="font-medium">{lastScannedCode.codigo}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Tipo:</span>
                            <span className="font-medium">
                              {lastScannedCode.tipo === "qrcode" ? "QR Code" : "Código de Barras"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge 
                              variant="outline" 
                              className={`w-fit ${
                                lastScannedCode.status === "valido" 
                                  ? "bg-green-50 text-green-700 hover:bg-green-50" 
                                  : "bg-red-50 text-red-700 hover:bg-red-50"
                              }`}
                            >
                              {lastScannedCode.status === "valido" ? "Válido" : "Inválido"}
                            </Badge>
                          </div>
                          {lastScannedCode.pedido && (
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Pedido:</span>
                              <span className="font-medium">{lastScannedCode.pedido}</span>
                            </div>
                          )}
                          {lastScannedCode.destino && (
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Destino:</span>
                              <span className="font-medium">{lastScannedCode.destino}</span>
                            </div>
                          )}
                          <div className="flex flex-col pt-2">
                            <span className="text-sm">{lastScannedCode.mensagem}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}