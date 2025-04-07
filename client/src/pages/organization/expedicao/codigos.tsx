import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  QrCode,
  Scan,
  Settings,
  CheckCircle2,
  XCircle,
  ListChecks,
  History,
  Camera,
  Package,
  Truck,
  AlertTriangle,
  Download
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Histórico de verificações simuladas
const historicoDeLeituras = [
  {
    id: 1,
    codigo: "PED-12345-P3",
    tipo: "pedido",
    resultado: "sucesso",
    mensagem: "Pedido verificado com sucesso",
    data: "2025-04-07T14:35:10",
  },
  {
    id: 2,
    codigo: "ME-987654",
    tipo: "malote",
    resultado: "sucesso",
    mensagem: "Malote verificado com sucesso",
    data: "2025-04-07T14:32:05",
  },
  {
    id: 3,
    codigo: "PED-12347-P2",
    tipo: "pedido",
    resultado: "erro",
    mensagem: "Produto não consta no pedido",
    data: "2025-04-07T14:30:22",
  },
  {
    id: 4,
    codigo: "ETQ-789456",
    tipo: "produto",
    resultado: "sucesso",
    mensagem: "Produto verificado com sucesso",
    data: "2025-04-07T14:25:48",
  },
  {
    id: 5,
    codigo: "ME-987651",
    tipo: "malote",
    resultado: "erro",
    mensagem: "Malote não encontrado",
    data: "2025-04-07T14:20:15",
  },
  {
    id: 6,
    codigo: "PED-12342-P1",
    tipo: "pedido",
    resultado: "sucesso",
    mensagem: "Pedido verificado com sucesso",
    data: "2025-04-07T14:15:33",
  },
];

export default function LeituraCodigos() {
  const { toast } = useToast();
  const [codigo, setCodigo] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<{
    codigo: string;
    tipo: string;
    resultado: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para processar a leitura de código
  const processarCodigo = () => {
    if (!codigo) {
      toast({
        title: "Erro de leitura",
        description: "Nenhum código foi informado",
        variant: "destructive",
      });
      return;
    }

    // Lógica simulada para identificar o tipo de código e validar
    let tipo = "";
    let resultado: "sucesso" | "erro" = "sucesso";
    let mensagem = "";

    if (codigo.startsWith("PED-")) {
      tipo = "pedido";
      // Simulando 80% de sucesso para pedidos
      if (Math.random() > 0.2) {
        resultado = "sucesso";
        mensagem = "Pedido verificado com sucesso";
      } else {
        resultado = "erro";
        mensagem = "Pedido não encontrado ou inválido";
      }
    } else if (codigo.startsWith("ME-")) {
      tipo = "malote";
      // Simulando 90% de sucesso para malotes
      if (Math.random() > 0.1) {
        resultado = "sucesso";
        mensagem = "Malote verificado com sucesso";
      } else {
        resultado = "erro";
        mensagem = "Malote não encontrado";
      }
    } else if (codigo.startsWith("ETQ-")) {
      tipo = "produto";
      // Simulando 85% de sucesso para produtos
      if (Math.random() > 0.15) {
        resultado = "sucesso";
        mensagem = "Produto verificado com sucesso";
      } else {
        resultado = "erro";
        mensagem = "Produto não encontrado no sistema";
      }
    } else {
      tipo = "desconhecido";
      resultado = "erro";
      mensagem = "Formato de código não reconhecido";
    }

    // Definir o resultado da leitura
    setUltimoResultado({
      codigo,
      tipo,
      resultado,
      mensagem,
    });

    // Exibir toast conforme o resultado
    toast({
      title: resultado === "sucesso" ? "Leitura realizada" : "Erro na leitura",
      description: mensagem,
      variant: resultado === "sucesso" ? "default" : "destructive",
    });

    // Limpar campo de entrada
    setCodigo("");
    
    // Focar novamente no input para próxima leitura
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Formatar a data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leitura de Códigos</h1>
            <p className="text-muted-foreground mt-1">
              Escaneie códigos de barras e QR codes para verificação
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsCameraActive(!isCameraActive)}>
              <Camera className="w-4 h-4 mr-2" />
              {isCameraActive ? "Desativar Câmera" : "Ativar Câmera"}
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar Histórico
            </Button>
          </div>
        </div>
        
        {/* Área de Leitura */}
        <Card>
          <CardHeader>
            <CardTitle>Leitor de Códigos</CardTitle>
            <CardDescription>
              Digite ou escaneie o código de barras ou QR code para verificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="codigo">Código</Label>
                <div className="flex mt-2">
                  <Input
                    id="codigo"
                    ref={inputRef}
                    placeholder="Digite ou escaneie o código..."
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        processarCodigo();
                      }
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button 
                    onClick={processarCodigo}
                    className="ml-2 bg-green-600 hover:bg-green-700"
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Verificar
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Resultado da última leitura */}
            {ultimoResultado && (
              <Alert variant={ultimoResultado.resultado === "sucesso" ? "default" : "destructive"}>
                <div className="flex items-center">
                  {ultimoResultado.resultado === "sucesso" ? (
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2 text-red-600" />
                  )}
                  <div>
                    <AlertTitle>
                      {ultimoResultado.resultado === "sucesso"
                        ? "Verificação bem-sucedida"
                        : "Erro na verificação"}
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      <div className="text-sm">
                        <span className="font-medium">Código:</span> {ultimoResultado.codigo}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Tipo:</span> {ultimoResultado.tipo.charAt(0).toUpperCase() + ultimoResultado.tipo.slice(1)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Mensagem:</span> {ultimoResultado.mensagem}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
            
            {/* Área da Câmera (simulada) */}
            {isCameraActive && (
              <div className="mt-4">
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <Camera className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Simulação de câmera ativa
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Posicione o código de barras ou QR code no centro da tela
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Dicas de uso */}
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4 text-sm text-blue-700 dark:text-blue-300">
              <h4 className="font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Dicas para leitura eficiente
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Mantenha o código alinhado com o scanner</li>
                <li>Certifique-se de que o código esteja bem iluminado</li>
                <li>Para códigos de pedidos, use o formato PED-XXXXX</li>
                <li>Para códigos de malotes, use o formato ME-XXXXX</li>
                <li>Para códigos de produtos, use o formato ETQ-XXXXX</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* Histórico de Leituras */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Histórico de Leituras
            </h2>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              Ver histórico completo
            </Button>
          </div>
          
          <div className="border rounded-md divide-y">
            {historicoDeLeituras.map((leitura) => (
              <div 
                key={leitura.id} 
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    {leitura.tipo === "pedido" ? (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <ListChecks className="h-5 w-5 text-blue-600" />
                      </div>
                    ) : leitura.tipo === "malote" ? (
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-purple-600" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{leitura.codigo}</p>
                    <p className="text-sm text-muted-foreground">
                      {leitura.mensagem} • {formatarData(leitura.data)}
                    </p>
                  </div>
                </div>
                <div>
                  {leitura.resultado === "sucesso" ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Sucesso
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Erro
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}