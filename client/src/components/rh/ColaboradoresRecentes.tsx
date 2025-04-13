'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, Calendar } from "lucide-react";

export function ColaboradoresRecentes() {
  const colaboradores = [
    {
      iniciais: "MS",
      nome: "Marcos Silva",
      cargo: "Gerente de Cultivo",
      departamento: "Cultivo", 
      telefone: "98765-4321",
      email: "marcos.silva@email.com",
      dataContratacao: "14/05/2022",
      status: "Ativo"
    },
    {
      iniciais: "AP",
      nome: "Ana Pereira",
      cargo: "Especialista em Produção",
      departamento: "Produção", 
      telefone: "91234-5678",
      email: "ana.pereira@email.com",
      dataContratacao: "09/08/2022",
      status: "Ativo"
    },
    {
      iniciais: "JO",
      nome: "João Oliveira",
      cargo: "Farmacêutico",
      departamento: "Qualidade", 
      telefone: "92345-6789",
      email: "joao.oliveira@email.com",
      dataContratacao: "04/01/2023",
      status: "Ativo"
    },
    {
      iniciais: "CS",
      nome: "Clara Santos",
      cargo: "Analista de RH",
      departamento: "RH", 
      telefone: "93456-7890",
      email: "clara.santos@email.com",
      dataContratacao: "30/06/2023",
      status: "Ativo"
    }
  ];

  return (
    <div className="space-y-5">
      {colaboradores.map((colaborador, i) => (
        <div key={i} className="flex justify-between items-start border-b pb-5 last:border-0 last:pb-0">
          <div className="flex gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-primary/10 text-primary">
                {colaborador.iniciais}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{colaborador.nome}</h4>
              <p className="text-sm text-muted-foreground">{colaborador.cargo}</p>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="text-xs py-0 h-5">
                  {colaborador.departamento}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Desde: {colaborador.dataContratacao}
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center mb-1">
              <Phone className="h-3 w-3 mr-1" />
              <span className="text-xs">{colaborador.telefone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span className="text-xs">{colaborador.email}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}