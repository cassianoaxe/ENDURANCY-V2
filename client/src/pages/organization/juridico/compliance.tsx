"use client";
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  FileText, 
  User, 
  BookOpen, 
  LineChart,
  Search,
  Plus,
  Calendar
} from "lucide-react";

// Dados fictícios para visualização
const areasCompliance = [
  {
    id: '001',
    nome: 'Regulatório ANVISA',
    status: 'Conforme',
    progresso: 92,
    ultimaAuditoria: '15/06/2023',
    proximaAuditoria: '15/12/2023',
    responsavel: 'Maria Silva',
    riscos: 'Baixo'
  },
  {
    id: '002',
    nome: 'Proteção de Dados (LGPD)',
    status: 'Parcialmente Conforme',
    progresso: 78,
    ultimaAuditoria: '10/07/2023',
    proximaAuditoria: '10/10/2023',
    responsavel: 'João Santos',
    riscos: 'Médio'
  },
  {
    id: '003',
    nome: 'Trabalhista',
    status: 'Conforme',
    progresso: 95,
    ultimaAuditoria: '20/05/2023',
    proximaAuditoria: '20/11/2023',
    responsavel: 'Ana Costa',
    riscos: 'Baixo'
  },
  {
    id: '004',
    nome: 'Tributário',
    status: 'Monitoramento',
    progresso: 85,
    ultimaAuditoria: '05/08/2023',
    proximaAuditoria: '05/11/2023',
    responsavel: 'Carlos Oliveira',
    riscos: 'Médio'
  },
  {
    id: '005',
    nome: 'Anticorrupção',
    status: 'Conforme',
    progresso: 100,
    ultimaAuditoria: '30/07/2023',
    proximaAuditoria: '30/01/2024',
    responsavel: 'Lúcia Mendes',
    riscos: 'Baixo'
  },
  {
    id: '006',
    nome: 'Ambiental',
    status: 'Não Conforme',
    progresso: 45,
    ultimaAuditoria: '25/06/2023',
    proximaAuditoria: '25/08/2023',
    responsavel: 'Paulo Ribeiro',
    riscos: 'Alto'
  }
];

const treinamentos = [
  {
    id: '001',
    nome: 'Código de Conduta',
    dataInicio: '10/01/2023',
    dataFim: '31/01/2023',
    status: 'Concluído',
    participantes: 25,
    aprovados: 23,
    media: 8.7
  },
  {
    id: '002',
    nome: 'LGPD na Prática',
    dataInicio: '15/03/2023',
    dataFim: '05/04/2023',
    status: 'Concluído',
    participantes: 30,
    aprovados: 28,
    media: 9.2
  },
  {
    id: '003',
    nome: 'Prevenção à Lavagem de Dinheiro',
    dataInicio: '10/05/2023',
    dataFim: '31/05/2023',
    status: 'Concluído',
    participantes: 20,
    aprovados: 18,
    media: 8.5
  },
  {
    id: '004',
    nome: 'Segurança da Informação',
    dataInicio: '05/07/2023',
    dataFim: '25/07/2023',
    status: 'Em Andamento',
    participantes: 35,
    aprovados: 0,
    media: 0
  },
  {
    id: '005',
    nome: 'Normas Regulatórias ANVISA',
    dataInicio: '01/09/2023',
    dataFim: '30/09/2023',
    status: 'Agendado',
    participantes: 0,
    aprovados: 0,
    media: 0
  }
];

const politicas = [
  {
    id: '001',
    nome: 'Política de Segurança da Informação',
    versao: '2.1',
    publicacao: '10/01/2023',
    revisao: '10/01/2024',
    status: 'Ativa'
  },
  {
    id: '002',
    nome: 'Política de Privacidade e Proteção de Dados',
    versao: '3.0',
    publicacao: '15/03/2023',
    revisao: '15/03/2024',
    status: 'Ativa'
  },
  {
    id: '003',
    nome: 'Código de Ética e Conduta',
    versao: '1.5',
    publicacao: '01/02/2022',
    revisao: '01/02/2023',
    status: 'Em Revisão'
  },
  {
    id: '004',
    nome: 'Política Anticorrupção',
    versao: '2.0',
    publicacao: '05/05/2023',
    revisao: '05/05/2024',
    status: 'Ativa'
  },
  {
    id: '005',
    nome: 'Política de Gestão de Terceiros',
    versao: '1.0',
    publicacao: '20/06/2023',
    revisao: '20/06/2024',
    status: 'Ativa'
  }
];

export default function Compliance() {
  const [tabAtiva, setTabAtiva] = useState('areas');
  const [busca, setBusca] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Conforme':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Parcialmente Conforme':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'Monitoramento':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Não Conforme':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusCor = (status: string) => {
    switch (status) {
      case 'Conforme':
        return 'bg-green-100 text-green-800';
      case 'Parcialmente Conforme':
        return 'bg-amber-100 text-amber-800';
      case 'Monitoramento':
        return 'bg-blue-100 text-blue-800';
      case 'Não Conforme':
        return 'bg-red-100 text-red-800';
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Agendado':
        return 'bg-purple-100 text-purple-800';
      case 'Ativa':
        return 'bg-green-100 text-green-800';
      case 'Em Revisão':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiscoCor = (risco: string) => {
    switch (risco) {
      case 'Baixo':
        return 'bg-green-100 text-green-800';
      case 'Médio':
        return 'bg-amber-100 text-amber-800';
      case 'Alto':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressoCor = (progresso: number) => {
    if (progresso >= 90) return 'bg-green-500';
    if (progresso >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Filtrar dados conforme busca
  const areasFiltradas = areasCompliance.filter(area => 
    busca ? area.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );
  
  const treinamentosFiltrados = treinamentos.filter(treinamento => 
    busca ? treinamento.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );
  
  const politicasFiltradas = politicas.filter(politica => 
    busca ? politica.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Compliance</h1>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>
      
      <p className="text-gray-600 mb-8">Gerencie o programa de compliance e conformidade da organização</p>
      
      {/* Cartões com estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Índice de Conformidade</p>
                <p className="text-3xl font-bold mt-1">82,5%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full h-12 w-12 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={82.5} className="h-2 mt-4" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Políticas Ativas</p>
                <p className="text-3xl font-bold mt-1">12</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full h-12 w-12 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-green-600">+2 nos últimos 30 dias</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Treinamentos Concluídos</p>
                <p className="text-3xl font-bold mt-1">85%</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full h-12 w-12 flex items-center justify-center">
                <User className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <Progress value={85} className="h-2 mt-4" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Próxima Auditoria</p>
                <p className="text-3xl font-bold mt-1">12</p>
                <p className="text-xs text-gray-500 mt-1">dias</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full h-12 w-12 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs para diferentes seções */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle>Gestão de Compliance</CardTitle>
          <CardDescription>
            Acompanhe as atividades de conformidade, políticas e treinamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="areas" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Áreas de Compliance
              </TabsTrigger>
              <TabsTrigger value="treinamentos" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Treinamentos
              </TabsTrigger>
              <TabsTrigger value="politicas" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Políticas e Normas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="areas" className="p-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Área</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Última Auditoria</TableHead>
                      <TableHead>Próxima Auditoria</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Riscos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areasFiltradas.map((area) => (
                      <TableRow key={area.id}>
                        <TableCell className="font-medium">{area.nome}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(area.status)}
                            <Badge variant="outline" className={getStatusCor(area.status)}>
                              {area.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full flex items-center gap-2">
                            <Progress 
                              value={area.progresso} 
                              className={`h-2 flex-grow ${getProgressoCor(area.progresso)}`} 
                            />
                            <span className="text-xs font-medium">{area.progresso}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{area.ultimaAuditoria}</TableCell>
                        <TableCell>{area.proximaAuditoria}</TableCell>
                        <TableCell>{area.responsavel}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRiscoCor(area.riscos)}>
                            {area.riscos}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Área
                </Button>
                <Button variant="default">Relatório Completo</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="treinamentos" className="p-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Treinamento</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Participantes</TableHead>
                      <TableHead>Aprovados</TableHead>
                      <TableHead>Média</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treinamentosFiltrados.map((treinamento) => (
                      <TableRow key={treinamento.id}>
                        <TableCell className="font-medium">{treinamento.nome}</TableCell>
                        <TableCell>{treinamento.dataInicio} a {treinamento.dataFim}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusCor(treinamento.status)}>
                            {treinamento.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{treinamento.participantes}</TableCell>
                        <TableCell>{treinamento.aprovados}</TableCell>
                        <TableCell>
                          {treinamento.status === 'Concluído' 
                            ? <span className="font-medium">{treinamento.media}</span>
                            : <span className="text-gray-500">-</span>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Treinamento
                </Button>
                <Button variant="default">Relatório de Treinamentos</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="politicas" className="p-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Política</TableHead>
                      <TableHead>Versão</TableHead>
                      <TableHead>Data de Publicação</TableHead>
                      <TableHead>Próxima Revisão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {politicasFiltradas.map((politica) => (
                      <TableRow key={politica.id}>
                        <TableCell className="font-medium">{politica.nome}</TableCell>
                        <TableCell>{politica.versao}</TableCell>
                        <TableCell>{politica.publicacao}</TableCell>
                        <TableCell>{politica.revisao}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusCor(politica.status)}>
                            {politica.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">Visualizar</Button>
                            <Button variant="ghost" size="sm">Editar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Política
                </Button>
                <Button variant="default">Biblioteca de Políticas</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}