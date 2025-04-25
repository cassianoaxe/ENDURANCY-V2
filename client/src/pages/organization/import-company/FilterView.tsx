import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileCheck,
  FileSearch,
  FileUp,
  Loader2,
  Package,
  Plane,
  CheckCircle
} from 'lucide-react';

// Importação do mock e funções auxiliares do dashboard
// Em um caso real, compartilharíamos essas definições em um arquivo separado
const mockImportRequests = [
  { id: 1, patientName: 'João Silva', status: 'aprovado', product: 'CBD Oil 1000mg', date: new Date(2024, 3, 15), progress: 90 },
  { id: 2, patientName: 'Maria Oliveira', status: 'em_analise', product: 'CBD Capsules 25mg', date: new Date(2024, 3, 18), progress: 30 },
  { id: 3, patientName: 'Pedro Santos', status: 'enviado_anvisa', product: 'Full Spectrum Tincture', date: new Date(2024, 3, 10), progress: 45 },
  { id: 4, patientName: 'Ana Costa', status: 'rejeitado', product: 'CBD Isolate Powder', date: new Date(2024, 3, 5), progress: 0 },
  { id: 5, patientName: 'Carlos Pereira', status: 'em_transito', product: 'THC:CBD 1:1 Oil', date: new Date(2024, 3, 2), progress: 70 },
  { id: 6, patientName: 'Luana Ferreira', status: 'entregue', product: 'CBD Oil 500mg', date: new Date(2024, 2, 25), progress: 100 },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'em_analise':
      return <FileSearch className="h-4 w-4 text-blue-500" />;
    case 'enviado_anvisa':
      return <FileUp className="h-4 w-4 text-indigo-500" />;
    case 'aprovado':
      return <FileCheck className="h-4 w-4 text-green-500" />;
    case 'rejeitado':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'em_transito':
      return <Plane className="h-4 w-4 text-orange-500" />;
    case 'entregue':
      return <CheckCircle className="h-4 w-4 text-purple-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'em_analise':
      return 'Em Análise';
    case 'enviado_anvisa':
      return 'Enviado para ANVISA';
    case 'aprovado':
      return 'Aprovado';
    case 'rejeitado':
      return 'Rejeitado';
    case 'em_transito':
      return 'Em Trânsito';
    case 'entregue':
      return 'Entregue';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'em_analise':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'enviado_anvisa':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'aprovado':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejeitado':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'em_transito':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'entregue':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

interface FilterViewProps {
  status: string;
  title: string;
  description: string;
}

export default function FilterView({ status, title, description }: FilterViewProps) {
  const [_, navigate] = useLocation();
  
  // Garantir aplicação do tema da importadora
  useEffect(() => {
    document.documentElement.classList.add('importadora-theme');
    return () => {
      document.documentElement.classList.remove('importadora-theme');
    };
  }, []);

  // Simulamos uma consulta de dados com filtragem
  const { data: filteredRequests, isLoading } = useQuery({
    queryKey: ['/api/import-requests', status],
    queryFn: async () => {
      // Em um cenário real, buscaríamos do backend com um filtro
      return new Promise(resolve => {
        setTimeout(() => {
          const filtered = mockImportRequests.filter(req => req.status === status);
          resolve(filtered);
        }, 500);
      });
    }
  });

  const handleViewRequest = (id: number) => {
    navigate(`/organization/import-company/${id}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <Button variant="outline" size="sm" asChild className="mr-4">
              <a href="/organization/import-company">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Dashboard
              </a>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-blue-700 mt-4">{title}</h1>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos com Status: {getStatusText(status)}</CardTitle>
          <CardDescription>
            Importações filtradas por {getStatusText(status).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            filteredRequests && filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {(filteredRequests as any[]).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div>
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <h4 className="font-medium">{request.patientName}</h4>
                        <p className="text-sm text-muted-foreground">{request.product}</p>
                        <div className="flex items-center mt-1 gap-2">
                          <Badge className={getStatusColor(request.status)} variant="outline">
                            {getStatusText(request.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(request.date, "dd 'de' MMMM", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={request.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground mt-1 block text-right">
                          {request.progress}% concluído
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRequest(request.id)}
                      >
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">Nenhum pedido encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Não existem pedidos com status {getStatusText(status).toLowerCase()} no momento.
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}