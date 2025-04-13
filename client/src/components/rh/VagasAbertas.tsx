'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Clock } from "lucide-react";

export function VagasAbertas() {
  const vagas = [
    {
      id: 1,
      titulo: "Especialista em Cultivo",
      departamento: "Cultivo",
      tipo: "CLT",
      experiencia: "3+ anos",
      candidatos: 12,
      status: "Aberta"
    },
    {
      id: 2,
      titulo: "Técnico de Laboratório",
      departamento: "Qualidade",
      tipo: "CLT",
      experiencia: "2+ anos",
      candidatos: 8,
      status: "Aberta"
    },
    {
      id: 3,
      titulo: "Farmacêutico(a)",
      departamento: "Produção",
      tipo: "CLT",
      experiencia: "3+ anos",
      candidatos: 5,
      status: "Aberta"
    }
  ];

  return (
    <div className="space-y-4">
      {vagas.map((vaga) => (
        <div 
          key={vaga.id} 
          className="rounded-lg border bg-card text-card-foreground p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{vaga.titulo}</h4>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{vaga.departamento}</span>
                <span>•</span>
                <span>{vaga.tipo}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center text-sm">
                  <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>Experiência: {vaga.experiencia}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>{vaga.candidatos} candidatos</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge className="bg-green-100 text-green-600 hover:bg-green-100 mb-3">
                {vaga.status}
              </Badge>
              <Button size="sm" variant="secondary">
                Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-center mt-4">
        <Button variant="outline" size="sm" className="w-full">
          Ver todas as 5 vagas
        </Button>
      </div>
    </div>
  );
}