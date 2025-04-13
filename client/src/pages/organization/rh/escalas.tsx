'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Search, 
  MoreVertical, 
  Trash, 
  Edit, 
  Copy, 
  Calendar as CalendarIcon2, 
  Download, 
  Share2, 
  Plus, 
  Users, 
  Clock 
} from "lucide-react";
import { NovaEscalaDialog } from "@/components/rh/NovaEscalaDialog";

export default function EscalasTrabalho() {
  const [abaVisualização, setAbaVisualização] = useState("lista");
  const [departamentoFiltro, setDepartamentoFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [dialogNovaEscalaAberto, setDialogNovaEscalaAberto] = useState(false);
  const [data, setData] = useState<Date | undefined>(new Date());

  // Mock de dados de escalas
  const escalas = [
    {
      id: 1,
      nome: "Escala de Agosto 2023 - Produção",
      responsavel: "Maria Silva",
      departamento: "Produção",
      periodo: {
        inicio: "31/07/2023",
        fim: "30/08/2023"
      },
      colaboradores: ["MS", "RF", "LM"],
      status: "Rascunho"
    },
    {
      id: 2,
      nome: "Escala de Produção - Julho 2023",
      responsavel: "Maria Silva",
      departamento: "Produção",
      periodo: {
        inicio: "30/06/2023",
        fim: "30/07/2023"
      },
      colaboradores: ["MS", "CO", "RF", "+1"],
      status: "Publicada"
    },
    {
      id: 3,
      nome: "Escala de Cultivo - Julho 2023",
      responsavel: "Pedro Santos",
      departamento: "Cultivo",
      periodo: {
        inicio: "30/06/2023",
        fim: "30/07/2023"
      },
      colaboradores: ["PS", "AS", "ML"],
      status: "Publicada"
    },
    {
      id: 4,
      nome: "Escala de Laboratório - Julho 2023",
      responsavel: "Carlos Oliveira",
      departamento: "Qualidade",
      periodo: {
        inicio: "30/06/2023",
        fim: "30/07/2023"
      },
      colaboradores: ["CO", "JF"],
      status: "Rascunho"
    },
    {
      id: 5,
      nome: "Plantão de Fim de Semana - Julho 2023",
      responsavel: "Maria Silva",
      departamento: "Geral",
      periodo: {
        inicio: "30/06/2023",
        fim: "30/07/2023"
      },
      colaboradores: ["MS", "CO", "PS"],
      status: "Publicada"
    }
  ];

  // Filtrar escalas
  const escalasFiltradas = escalas.filter(escala => {
    // Filtro por departamento
    if (departamentoFiltro && escala.departamento !== departamentoFiltro) return false;
    
    // Filtro por status
    if (statusFiltro && escala.status !== statusFiltro) return false;
    
    // Filtro por termo de busca
    if (termoBusca) {
      const termoLower = termoBusca.toLowerCase();
      return (
        escala.nome.toLowerCase().includes(termoLower) ||
        escala.responsavel.toLowerCase().includes(termoLower) ||
        escala.departamento.toLowerCase().includes(termoLower)
      );
    }
    
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalas de Trabalho</h1>
          <p className="text-muted-foreground">
            Gerencie as escalas de trabalho dos colaboradores
          </p>
        </div>
        <Button onClick={() => setDialogNovaEscalaAberto(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Escala
        </Button>
      </div>

      <Tabs value={abaVisualização} onValueChange={setAbaVisualização} className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista de Escalas</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar escalas..."
                className="pl-8"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            
            <Select value={departamentoFiltro} onValueChange={setDepartamentoFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os departamentos</SelectItem>
                <SelectItem value="Produção">Produção</SelectItem>
                <SelectItem value="Qualidade">Qualidade</SelectItem>
                <SelectItem value="Cultivo">Cultivo</SelectItem>
                <SelectItem value="Geral">Geral</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="Publicada">Publicada</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Nome</th>
                  <th className="py-3 px-4 text-left font-medium">Departamento</th>
                  <th className="py-3 px-4 text-left font-medium">Período</th>
                  <th className="py-3 px-4 text-left font-medium">Colaboradores</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {escalasFiltradas.map((escala) => (
                  <tr key={escala.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{escala.nome}</span>
                        <span className="text-xs text-muted-foreground">Responsável: {escala.responsavel}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-muted/30 hover:bg-muted/30">
                        {escala.departamento}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-sm">
                        <span>Início: {escala.periodo.inicio}</span>
                        <span>Fim: {escala.periodo.fim}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex -space-x-2">
                        {escala.colaboradores.slice(0, 3).map((iniciais, index) => (
                          <Avatar key={index} className="h-7 w-7 border-2 border-background">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {iniciais}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {escala.colaboradores.length > 3 && (
                          <Avatar className="h-7 w-7 border-2 border-background">
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              +{escala.colaboradores.length - 3}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        className={
                          escala.status === "Publicada" 
                            ? "bg-green-100 text-green-600 hover:bg-green-100 border-green-200" 
                            : "bg-yellow-100 text-yellow-600 hover:bg-yellow-100 border-yellow-200"
                        }
                      >
                        {escala.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" /> Editar escala
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Copy className="h-4 w-4" /> Duplicar escala
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Download className="h-4 w-4" /> Exportar escala
                          </DropdownMenuItem>
                          {escala.status === "Rascunho" && (
                            <DropdownMenuItem className="gap-2">
                              <Share2 className="h-4 w-4" /> Publicar escala
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 gap-2">
                            <Trash className="h-4 w-4" /> Excluir escala
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="calendario" className="space-y-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, "MMMM yyyy", { locale: ptBR }) : <span>Selecione um mês</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select value={departamentoFiltro} onValueChange={setDepartamentoFiltro}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os departamentos</SelectItem>
                  <SelectItem value="Produção">Produção</SelectItem>
                  <SelectItem value="Qualidade">Qualidade</SelectItem>
                  <SelectItem value="Cultivo">Cultivo</SelectItem>
                  <SelectItem value="Geral">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-sm font-medium text-center">
            <div className="p-2 bg-muted/30 rounded">Domingo</div>
            <div className="p-2 bg-muted/30 rounded">Segunda</div>
            <div className="p-2 bg-muted/30 rounded">Terça</div>
            <div className="p-2 bg-muted/30 rounded">Quarta</div>
            <div className="p-2 bg-muted/30 rounded">Quinta</div>
            <div className="p-2 bg-muted/30 rounded">Sexta</div>
            <div className="p-2 bg-muted/30 rounded">Sábado</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 h-[600px]">
            {/* Exemplo de um mês com 35 células (5 semanas) */}
            {Array.from({ length: 35 }).map((_, index) => {
              // Calcular o dia com base no índice (simulando julho de 2023)
              const day = index - 5; // Supondo que 1º de julho caia no dia 6 (índice 5)
              const isCurrentMonth = day > 0 && day <= 31;
              const isWeekend = index % 7 === 0 || index % 7 === 6; // Domingo ou sábado
              
              return (
                <div 
                  key={index} 
                  className={`
                    border rounded-md p-2 ${isCurrentMonth ? '' : 'bg-muted/20 text-muted-foreground'} 
                    ${isWeekend && isCurrentMonth ? 'bg-muted/10' : ''}
                    overflow-hidden flex flex-col
                  `}
                >
                  {/* Número do dia */}
                  <div className="text-sm font-medium mb-1">
                    {isCurrentMonth ? day : ''}
                  </div>
                  
                  {/* Eventos do dia (escalas) */}
                  {isCurrentMonth && day % 5 === 0 && (
                    <div className="text-xs bg-green-100 text-green-700 p-1 rounded mb-1 truncate">
                      Escala Produção
                    </div>
                  )}
                  
                  {isCurrentMonth && day % 7 === 3 && (
                    <div className="text-xs bg-blue-100 text-blue-700 p-1 rounded mb-1 truncate">
                      Escala Cultivo
                    </div>
                  )}
                  
                  {isCurrentMonth && day === 15 && (
                    <div className="text-xs bg-purple-100 text-purple-700 p-1 rounded mb-1 truncate">
                      Plantão Fim de Semana
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para adicionar nova escala */}
      <NovaEscalaDialog 
        open={dialogNovaEscalaAberto} 
        onOpenChange={setDialogNovaEscalaAberto} 
      />
    </div>
  );
}