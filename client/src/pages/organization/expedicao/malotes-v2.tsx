import React, { useState } from "react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Package,
  FileText,
  MapPin,
  Calendar,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Dados simulados dos malotes
const malotesData = [
  {
    id: "ML-12345",
    data: "15/11/2023",
    transportadora: "Correios - SEDEX",
    pedidos: 5,
    status: "Em Preparação",
    localizacao: "Agência Correios - Centro",
    createdAt: "10/11/2023",
    prontos: 3,
    total: 6
  },
  {
    id: "ML-12346",
    data: "14/11/2023",
    transportadora: "Correios - PAC",
    pedidos: 8,
    status: "Enviado",
    localizacao: "Agência Correios - Vila Mariana",
    createdAt: "14/11/2023",
    prontos: 8,
    total: 8
  },
  {
    id: "ML-12347",
    data: "14/11/2023",
    transportadora: "Jadlog - Expresso",
    pedidos: 4,
    status: "Agendado",
    localizacao: "Unidade Jadlog - Lapa",
    createdAt: "15/11/2023",
    prontos: 4,
    total: 4
  },
  {
    id: "ML-12348",
    data: "13/11/2023",
    transportadora: "Transportadora - Standard",
    pedidos: 3,
    status: "Cancelado",
    localizacao: "Transportadora XYZ - Unidade Central",
    createdAt: "13/11/2023",
    prontos: 0,
    total: 3
  },
  {
    id: "ML-12349",
    data: "15/11/2023",
    transportadora: "Correios - SEDEX",
    pedidos: 6,
    status: "Em Preparação",
    localizacao: "Agência Correios - Centro",
    createdAt: "15/11/2023",
    prontos: 4,
    total: 6
  }
];

export default function MalotesV2() {
  const [termoBusca, setTermoBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [transportadoraFiltro, setTransportadoraFiltro] = useState("todas");
  
  // Filtrar malotes com base nos filtros e na busca
  const malotesFiltrados = malotesData.filter(malote => {
    // Filtro de busca
    if (termoBusca && !malote.id.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    // Filtro de status
    if (statusFiltro !== "todos" && malote.status !== statusFiltro) {
      return false;
    }
    
    // Filtro de transportadora
    if (transportadoraFiltro !== "todas" && !malote.transportadora.includes(transportadoraFiltro)) {
      return false;
    }
    
    return true;
  });
  
  // Funções para renderização condicional
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em Preparação":
        return "bg-blue-50 text-blue-700";
      case "Enviado":
        return "bg-green-50 text-green-700";
      case "Agendado":
        return "bg-purple-50 text-purple-700";
      case "Cancelado":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };
  
  const getMaloteColor = (status: string) => {
    switch (status) {
      case "Em Preparação":
        return "text-blue-500";
      case "Enviado":
        return "text-green-500";
      case "Agendado":
        return "text-purple-500";
      case "Cancelado":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  
  const getProgressBarColor = (prontos: number, total: number) => {
    const percent = (prontos / total) * 100;
    if (percent === 100) return "bg-green-500";
    if (percent >= 66) return "bg-blue-500";
    if (percent >= 33) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Malotes de Expedição</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os malotes para envio de pedidos
            </p>
          </div>
          
          <Button className="bg-black hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Novo Malote
          </Button>
        </div>
        
        {/* Barra de busca e filtros */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar malotes..."
              className="pl-8"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
          
          <Select
            value={statusFiltro}
            onValueChange={setStatusFiltro}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="Em Preparação">Em Preparação</SelectItem>
              <SelectItem value="Enviado">Enviados</SelectItem>
              <SelectItem value="Agendado">Agendados</SelectItem>
              <SelectItem value="Cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={transportadoraFiltro}
            onValueChange={setTransportadoraFiltro}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="Correios">Correios</SelectItem>
              <SelectItem value="Jadlog">Jadlog</SelectItem>
              <SelectItem value="Transportadora">Transportadoras</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Lista de Malotes */}
        <div className="space-y-4">
          {malotesFiltrados.map((malote) => (
            <div key={malote.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-start p-4">
                {/* Ícone do malote */}
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getMaloteColor(malote.status)} bg-gray-100 mr-4`}>
                  <Package className="h-6 w-6" />
                </div>
                
                {/* Informações principais */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-lg">{malote.id}</h3>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(malote.status)}>
                        {malote.status}
                      </Badge>
                      
                      <span className="text-sm text-gray-500">
                        Criado em: {malote.createdAt}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{malote.data}</span>
                    
                    <Package className="h-4 w-4 ml-2" />
                    <span>{malote.pedidos} pedidos</span>
                    
                    <FileText className="h-4 w-4 ml-2" />
                    <span>{malote.transportadora}</span>
                  </div>
                  
                  {/* Localização */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{malote.localizacao}</span>
                  </div>
                  
                  {/* Barra de progresso */}
                  {malote.status !== "Cancelado" && (
                    <div className="flex items-center gap-2">
                      <Progress 
                        className="flex-1 h-2"
                        value={(malote.prontos / malote.total) * 100}
                        style={{ 
                          backgroundColor: "#e5e7eb",
                        }}
                      >
                        <div
                          className={`h-full ${getProgressBarColor(malote.prontos, malote.total)}`}
                          style={{ 
                            width: `${(malote.prontos / malote.total) * 100}%`,
                            transition: "width 0.3s ease-in-out"
                          }}
                        />
                      </Progress>
                      
                      <span className="text-sm font-medium">
                        {malote.prontos}/{malote.total} prontos
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Botão de detalhes */}
                <Button variant="outline" size="sm" className="ml-4">
                  <Eye className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
              </div>
            </div>
          ))}
          
          {malotesFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-lg">
              <Package className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum malote encontrado</p>
              <p className="text-sm max-w-md mt-2">
                Não foram encontrados malotes com os filtros selecionados
              </p>
            </div>
          )}
        </div>
      </div>
    </OrganizationLayout>
  );
}