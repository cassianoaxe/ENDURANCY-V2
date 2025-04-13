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
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
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
import { Plus, Search, MoreVertical, FileText, Trash, Edit, UserPlus } from "lucide-react";
import { AdicionarColaboradorDialog } from "@/components/rh/AdicionarColaboradorDialog";

export default function Colaboradores() {
  const [abaPrincipal, setAbaPrincipal] = useState("ativos");
  const [dialogAdicionarAberto, setDialogAdicionarAberto] = useState(false);
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [termoBusca, setTermoBusca] = useState("");

  // Mock de dados de colaboradores
  const colaboradores = [
    {
      id: 1,
      iniciais: "MS",
      nome: "Maria Silva",
      cargo: "Farmacêutica Responsável Técnica",
      departamento: "Produção", 
      email: "maria.silva@exemplo.com",
      telefone: "(11) 99876-5432",
      dataAdmissao: "14/03/2021",
      status: "Ativo"
    },
    {
      id: 2,
      iniciais: "CO",
      nome: "Carlos Oliveira",
      cargo: "Analista de Controle de Qualidade",
      departamento: "Qualidade", 
      email: "carlos.oliveira@exemplo.com",
      telefone: "(11) 98765-4321",
      dataAdmissao: "09/01/2022",
      status: "Ativo"
    },
    {
      id: 3,
      iniciais: "PS",
      nome: "Pedro Santos",
      cargo: "Especialista em Cultivo",
      departamento: "Cultivo", 
      email: "pedro.santos@exemplo.com",
      telefone: "(19) 98765-1234",
      dataAdmissao: "14/08/2021",
      status: "Ativo"
    },
    {
      id: 4,
      iniciais: "AS",
      nome: "Ana Souza",
      cargo: "Gerente de Marketing",
      departamento: "Marketing", 
      email: "ana.souza@exemplo.com",
      telefone: "(11) 97654-3210",
      dataAdmissao: "28/02/2022",
      status: "Ativo"
    },
    {
      id: 5,
      iniciais: "RL",
      nome: "Roberto Lima",
      cargo: "Pesquisador",
      departamento: "P&D", 
      email: "roberto.lima@exemplo.com",
      telefone: "(11) 91234-5678",
      dataAdmissao: "14/06/2021",
      status: "Ativo"
    },
  ];

  // Filtrar colaboradores com base nos filtros selecionados
  const colaboradoresFiltrados = colaboradores.filter(colaborador => {
    // Filtro por departamento
    if (departamentoSelecionado && colaborador.departamento !== departamentoSelecionado) return false;
    
    // Filtro por status
    if (statusSelecionado && colaborador.status !== statusSelecionado) return false;
    
    // Filtro por termo de busca
    if (termoBusca) {
      const termoLowerCase = termoBusca.toLowerCase();
      const nomeMatch = colaborador.nome.toLowerCase().includes(termoLowerCase);
      const cargoMatch = colaborador.cargo.toLowerCase().includes(termoLowerCase);
      const departamentoMatch = colaborador.departamento.toLowerCase().includes(termoLowerCase);
      
      if (!nomeMatch && !cargoMatch && !departamentoMatch) return false;
    }
    
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground">
            Gerencie os colaboradores da sua organização
          </p>
        </div>
        <Button onClick={() => setDialogAdicionarAberto(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Colaborador
        </Button>
      </div>

      <Tabs value={abaPrincipal} onValueChange={setAbaPrincipal} className="space-y-4">
        <TabsList>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ativos" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar colaboradores..."
                className="pl-8"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            
            <Select value={departamentoSelecionado} onValueChange={setDepartamentoSelecionado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os departamentos</SelectItem>
                <SelectItem value="Produção">Produção</SelectItem>
                <SelectItem value="Qualidade">Qualidade</SelectItem>
                <SelectItem value="Cultivo">Cultivo</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="P&D">P&D</SelectItem>
                <SelectItem value="RH">RH</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusSelecionado} onValueChange={setStatusSelecionado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Férias">Férias</SelectItem>
                <SelectItem value="Licença">Licença</SelectItem>
                <SelectItem value="Afastado">Afastado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Colaborador</th>
                  <th className="py-3 px-4 text-left font-medium">Cargo</th>
                  <th className="py-3 px-4 text-left font-medium">Departamento</th>
                  <th className="py-3 px-4 text-left font-medium">Contato</th>
                  <th className="py-3 px-4 text-left font-medium">Data de Admissão</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {colaboradoresFiltrados.map((colaborador) => (
                  <tr key={colaborador.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {colaborador.iniciais}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{colaborador.nome}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{colaborador.cargo}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-muted/30 hover:bg-muted/30">
                        {colaborador.departamento}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <p className="text-sm">{colaborador.email}</p>
                        <p className="text-xs text-muted-foreground">{colaborador.telefone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{colaborador.dataAdmissao}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-green-200">
                        {colaborador.status}
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
                            <Edit className="h-4 w-4" /> Editar colaborador
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <FileText className="h-4 w-4" /> Ver documentos
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 gap-2">
                            <Trash className="h-4 w-4" /> Remover colaborador
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
        
        <TabsContent value="inativos" className="space-y-4">
          <div className="rounded-md border text-center py-10 px-4">
            <p className="text-muted-foreground">Não há colaboradores inativos no momento.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para adicionar novo colaborador */}
      <AdicionarColaboradorDialog 
        open={dialogAdicionarAberto} 
        onOpenChange={setDialogAdicionarAberto} 
      />
    </div>
  );
}