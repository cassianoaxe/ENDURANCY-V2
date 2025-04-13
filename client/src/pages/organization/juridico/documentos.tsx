"use client";
import React, { useState } from 'react';
import {
  Card,
  CardContent,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search, 
  FileArchive, 
  FileCog, 
  FileCheck, 
  FileWarning, 
  Download, 
  Eye
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dados fictícios para visualização
const documentos = [
  {
    id: '001',
    nome: 'Contrato Social Consolidado',
    tipo: 'Societário',
    categoria: 'Contrato',
    dataEmissao: '10/01/2022',
    dataValidade: '10/01/2027',
    status: 'Vigente',
    responsavel: 'Maria Silva',
    tamanho: '2.5 MB',
    formato: 'PDF'
  },
  {
    id: '002',
    nome: 'Procuração Geral',
    tipo: 'Representação',
    categoria: 'Procuração',
    dataEmissao: '15/03/2023',
    dataValidade: '15/03/2024',
    status: 'Vigente',
    responsavel: 'José Santos',
    tamanho: '1.8 MB',
    formato: 'PDF'
  },
  {
    id: '003',
    nome: 'Contrato de Licença',
    tipo: 'Propriedade Intelectual',
    categoria: 'Contrato',
    dataEmissao: '05/08/2022',
    dataValidade: '05/08/2025',
    status: 'Vigente',
    responsavel: 'Carlos Oliveira',
    tamanho: '3.2 MB',
    formato: 'PDF'
  },
  {
    id: '004',
    nome: 'Acordo de Confidencialidade',
    tipo: 'Proteção de Dados',
    categoria: 'Acordo',
    dataEmissao: '12/05/2021',
    dataValidade: '12/05/2023',
    status: 'Expirado',
    responsavel: 'Ana Costa',
    tamanho: '1.1 MB',
    formato: 'DOCX'
  },
  {
    id: '005',
    nome: 'Termo de Consentimento LGPD',
    tipo: 'Proteção de Dados',
    categoria: 'Termo',
    dataEmissao: '20/06/2022',
    dataValidade: 'N/A',
    status: 'Vigente',
    responsavel: 'Paulo Mendes',
    tamanho: '530 KB',
    formato: 'PDF'
  },
  {
    id: '006',
    nome: 'Contrato de Distribuição',
    tipo: 'Comercial',
    categoria: 'Contrato',
    dataEmissao: '08/11/2022',
    dataValidade: '08/11/2024',
    status: 'Vigente',
    responsavel: 'Rafael Souza',
    tamanho: '4.1 MB',
    formato: 'PDF'
  }
];

const categorias = [
  { valor: 'Todos', label: 'Todos os tipos' },
  { valor: 'Contrato', label: 'Contratos' },
  { valor: 'Procuração', label: 'Procurações' },
  { valor: 'Acordo', label: 'Acordos' },
  { valor: 'Termo', label: 'Termos' },
  { valor: 'Licença', label: 'Licenças' },
  { valor: 'Outros', label: 'Outros documentos' }
];

const status = [
  { valor: 'Todos', label: 'Todos os status' },
  { valor: 'Vigente', label: 'Vigentes' },
  { valor: 'Expirado', label: 'Expirados' },
  { valor: 'Em revisão', label: 'Em revisão' },
  { valor: 'Pendente', label: 'Pendentes' }
];

export default function DocumentosJuridicos() {
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [tabAtiva, setTabAtiva] = useState('todos');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vigente':
        return 'bg-green-100 text-green-800';
      case 'Expirado':
        return 'bg-red-100 text-red-800';
      case 'Em revisão':
        return 'bg-amber-100 text-amber-800';
      case 'Pendente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Societário':
        return <FileArchive className="h-4 w-4 mr-2" />;
      case 'Propriedade Intelectual':
        return <FileCog className="h-4 w-4 mr-2" />;
      case 'Proteção de Dados':
        return <FileCheck className="h-4 w-4 mr-2" />;
      case 'Comercial':
        return <FileWarning className="h-4 w-4 mr-2" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  const documentosFiltrados = documentos.filter(doc => {
    // Primeiro aplicar filtro de tab
    if (tabAtiva !== 'todos' && doc.tipo.toLowerCase() !== tabAtiva) {
      return false;
    }
    
    // Depois aplicar filtro de categoria
    if (filtroCategoria !== 'Todos' && doc.categoria !== filtroCategoria) {
      return false;
    }
    
    // Depois aplicar filtro de status
    if (filtroStatus !== 'Todos' && doc.status !== filtroStatus) {
      return false;
    }
    
    // Por fim, aplicar busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      return (
        doc.nome.toLowerCase().includes(termoBusca) ||
        doc.tipo.toLowerCase().includes(termoBusca) ||
        doc.categoria.toLowerCase().includes(termoBusca) ||
        doc.responsavel.toLowerCase().includes(termoBusca)
      );
    }
    
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Documentos Jurídicos</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Novo Documento</span>
        </Button>
      </div>
      
      <p className="text-gray-600 mb-8">Gerencie todos os documentos jurídicos da organização</p>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Biblioteca de Documentos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar documentos..."
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="mb-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="societário">Societário</TabsTrigger>
              <TabsTrigger value="propriedade intelectual">Propriedade Int.</TabsTrigger>
              <TabsTrigger value="proteção de dados">Proteção de Dados</TabsTrigger>
              <TabsTrigger value="comercial">Comercial</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.valor} value={cat.valor}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {status.map((s) => (
                  <SelectItem key={s.valor} value={s.valor}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data de Emissão</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentosFiltrados.length > 0 ? (
                  documentosFiltrados.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getTipoIcon(doc.tipo)}
                          <span className="font-medium">{doc.nome}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {doc.formato} · {doc.tamanho}
                        </div>
                      </TableCell>
                      <TableCell>{doc.categoria}</TableCell>
                      <TableCell>{doc.dataEmissao}</TableCell>
                      <TableCell>{doc.dataValidade}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.responsavel}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Baixar">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      Nenhum documento encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Mostrando {documentosFiltrados.length} de {documentos.length} documentos
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" disabled>Próxima</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}