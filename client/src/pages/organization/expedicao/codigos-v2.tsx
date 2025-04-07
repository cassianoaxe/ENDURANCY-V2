import React, { useState } from "react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  ArrowLeft,
  ScanLine,
  Package,
  FileText,
  Truck,
  Box,
  Eye
} from "lucide-react";

// Dados simulados para pedidos em preparação
const pedidosPreparacao = [
  {
    id: "PED-12345",
    cliente: "João Silva",
    itensVerificados: "0/2",
    itensVerificadosNum: 0,
    totalItens: 2,
    transportadora: "SEDEX",
    prioridade: "Normal"
  },
  {
    id: "PED-12346",
    cliente: "Maria Oliveira",
    itensVerificados: "1/1",
    itensVerificadosNum: 1,
    totalItens: 1,
    transportadora: "PAC",
    prioridade: "Normal"
  },
  {
    id: "PED-12347",
    cliente: "Carlos Santos",
    itensVerificados: "0/3",
    itensVerificadosNum: 0,
    totalItens: 3,
    transportadora: "SEDEX",
    prioridade: "Alta"
  },
  {
    id: "PED-12348",
    cliente: "Ana Oliveira",
    itensVerificados: "2/4",
    itensVerificadosNum: 2,
    totalItens: 4,
    transportadora: "SEDEX",
    prioridade: "Normal"
  }
];

export default function LeitorCodigosV2() {
  const [termoBusca, setTermoBusca] = useState("");
  const [usarCamera, setUsarCamera] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [abaSelecionada, setAbaSelecionada] = useState("separacao");
  
  // Pedidos filtrados com base na busca
  const pedidosFiltrados = pedidosPreparacao.filter(pedido => {
    if (!termoBusca) return true;
    
    return pedido.id.toLowerCase().includes(termoBusca.toLowerCase()) ||
           pedido.cliente.toLowerCase().includes(termoBusca.toLowerCase());
  });
  
  // Função para verificar código
  const verificarCodigo = () => {
    // Lógica de verificação seria implementada aqui
    console.log("Verificando código:", codigo);
    setCodigo("");
  };
  
  // Função para renderizar a cor da prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "Alta":
        return "text-red-600";
      case "Normal":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };
  
  // Função para calcular progresso da verificação
  const calcularProgresso = (verificados: number, total: number) => {
    return `${Math.round((verificados / total) * 100)}%`;
  };

  return (
    <OrganizationLayout>
      <div className="container max-w-5xl py-6 space-y-6">
        {/* Cabeçalho com botão de voltar */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            asChild
          >
            <a href="/organization/expedicao">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </a>
          </Button>
          
          <h1 className="text-2xl font-bold">Leitura de Códigos</h1>
        </div>
        
        <p className="text-muted-foreground">
          Use o leitor para verificar pedidos, malotes e lotes
        </p>
        
        {/* Tabs de funcionalidades */}
        <div className="flex border-b">
          <Button 
            variant={abaSelecionada === "separacao" ? "default" : "ghost"} 
            onClick={() => setAbaSelecionada("separacao")}
            className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary h-9 px-4"
            data-state={abaSelecionada === "separacao" ? "active" : "inactive"}
          >
            <Package className="h-4 w-4 mr-2" />
            Separação de Pedidos
          </Button>
          
          <Button 
            variant={abaSelecionada === "conferencia" ? "default" : "ghost"} 
            onClick={() => setAbaSelecionada("conferencia")}
            className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary h-9 px-4"
            data-state={abaSelecionada === "conferencia" ? "active" : "inactive"}
          >
            <Box className="h-4 w-4 mr-2" />
            Conferência de Malotes
          </Button>
          
          <Button 
            variant={abaSelecionada === "verificacao" ? "default" : "ghost"} 
            onClick={() => setAbaSelecionada("verificacao")}
            className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary h-9 px-4"
            data-state={abaSelecionada === "verificacao" ? "active" : "inactive"}
          >
            <FileText className="h-4 w-4 mr-2" />
            Verificação de Lotes
          </Button>
          
          <Button 
            variant={abaSelecionada === "historico" ? "default" : "ghost"} 
            onClick={() => setAbaSelecionada("historico")}
            className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary h-9 px-4"
            data-state={abaSelecionada === "historico" ? "active" : "inactive"}
          >
            <FileText className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>
        
        {/* Leitor de código de barras */}
        {abaSelecionada === "separacao" && (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-semibold">Leitor de Código de Barras</h2>
              <p className="text-sm text-muted-foreground">
                Escaneie qualquer código para identificar
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Usar câmera</span>
                  <div 
                    className={`w-10 h-5 rounded-full p-0.5 cursor-pointer ${usarCamera ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={() => setUsarCamera(!usarCamera)}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${usarCamera ? 'translate-x-5' : ''}`} 
                    />
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="ml-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Ajuda
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Digite ou escaneie o código de barras"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && codigo) {
                      verificarCodigo();
                    }
                  }}
                />
                
                <Button onClick={verificarCodigo} disabled={!codigo}>
                  <ScanLine className="h-4 w-4 mr-2" />
                  Verificar
                </Button>
              </div>
              
              {usarCamera && (
                <div className="h-48 border border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <ScanLine className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Posicione o código de barras na frente da câmera
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Lista de pedidos para preparação */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pedidos para Preparação</h2>
                
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pedidos..."
                    className="pl-8"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {pedidosFiltrados.map((pedido) => (
                  <div 
                    key={pedido.id}
                    className="border rounded-lg p-4 flex items-center hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{pedido.id}</h3>
                        <span className={`text-sm font-medium ${getPrioridadeColor(pedido.prioridade)}`}>
                          {pedido.prioridade === "Alta" ? "Prioridade Alta" : "Prioridade Normal"}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {pedido.cliente}
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm">
                        <span className="text-gray-500 mr-4">
                          {pedido.itensVerificados} itens verificados
                        </span>
                        
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: calcularProgresso(pedido.itensVerificadosNum, pedido.totalItens) }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4 min-w-[80px]">
                      <div className="text-sm font-medium">{pedido.transportadora}</div>
                    </div>
                  </div>
                ))}
                
                {pedidosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum pedido encontrado com os filtros atuais
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Conteúdo para outras abas */}
        {abaSelecionada !== "separacao" && (
          <div className="flex items-center justify-center h-64 border rounded-lg">
            <div className="text-center text-muted-foreground">
              <p>Conteúdo da aba {abaSelecionada} em desenvolvimento</p>
            </div>
          </div>
        )}
      </div>
    </OrganizationLayout>
  );
}