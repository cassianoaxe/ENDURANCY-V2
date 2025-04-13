'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, FileText, Trash, Edit } from "lucide-react";

export function ColaboradoresTable() {
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
    }
  ];

  return (
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
          {colaboradores.map((colaborador) => (
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
  );
}