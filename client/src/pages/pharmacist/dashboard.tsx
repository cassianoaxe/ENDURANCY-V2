'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Users, FileText, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function PharmacistDashboard() {
  const { user } = useAuth();
  
  // Simulando queries para os dados do dashboard
  const { data: consultasHoje, isLoading: isLoadingConsultas } = useQuery({
    queryKey: ['/api/pharmacist/consultas/hoje'],
    // Temporariamente desativada a requisição real
    queryFn: () => Promise.resolve({ total: 8, proxima: { horario: '10:30', paciente: 'Maria Silva' } }),
    enabled: !!user
  });
  
  const { data: pacientesAtivos, isLoading: isLoadingPacientes } = useQuery({
    queryKey: ['/api/pharmacist/pacientes/ativos'],
    // Temporariamente desativada a requisição real
    queryFn: () => Promise.resolve({ total: 143, novosMes: 12 }),
    enabled: !!user
  });
  
  const { data: prontuariosPendentes, isLoading: isLoadingProntuarios } = useQuery({
    queryKey: ['/api/pharmacist/prontuarios/pendentes'],
    // Temporariamente desativada a requisição real
    queryFn: () => Promise.resolve({ total: 3 }),
    enabled: !!user
  });

  // Função para obter nome do farmacêutico
  const getFarmaceuticoName = () => {
    if (!user) return 'Farmacêutico Demo';
    return user.name || 'Farmacêutico';
  };

  // Obter a especialidade atual
  const getEspecialidade = () => {
    return 'Cardiologia';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho de boas-vindas */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-medium">
            Bem-vindo(a), <span className="font-semibold">Dr(a).</span>
          </h2>
          <p className="text-muted-foreground">{getFarmaceuticoName()}</p>
        </div>
        <div className="px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {getEspecialidade()}
        </div>
      </div>

      {/* Grid de cards informativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Consultas Hoje */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Consultas Hoje
              </CardTitle>
              
              {isLoadingConsultas ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl font-bold">{consultasHoje?.total || 0}</span>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Próxima: {consultasHoje?.proxima?.horario || '--:--'} - {consultasHoje?.proxima?.paciente || 'Nenhuma'}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Pacientes Ativos */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Pacientes Ativos
              </CardTitle>
              
              {isLoadingPacientes ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl font-bold">{pacientesAtivos?.total || 0}</span>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>+{pacientesAtivos?.novosMes || 0} nos últimos 30 dias</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Prontuários Pendentes */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Prontuários Pendentes
              </CardTitle>
              
              {isLoadingProntuarios ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl font-bold">{prontuariosPendentes?.total || 0}</span>
                    <FileText className="h-8 w-8 text-amber-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Aguardando análise e elaboração</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de atividades recentes ou próximas ações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Atividades Pendentes</h3>
          <Button variant="ghost" size="sm" className="text-sm">
            Ver todas <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Validar prescrição</h4>
                    <p className="text-xs text-muted-foreground">Paciente: Carlos Oliveira</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs">
                    Prioridade Alta
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Consulta agendada</h4>
                    <p className="text-xs text-muted-foreground">Paciente: Maria Silva - Hoje, 10:30</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs">
                    Em 30 minutos
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Renovação de receita</h4>
                    <p className="text-xs text-muted-foreground">Paciente: Ana Beatriz - Vence em 3 dias</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs">
                    Programada
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}