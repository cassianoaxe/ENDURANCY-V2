'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { 
  Search, 
  MoreVertical, 
  FileText, 
  Trash, 
  Edit, 
  Download, 
  FilePlus, 
  FolderPlus, 
  Eye, 
  Share2 
} from "lucide-react";
import { NovoDocumentoDialog } from "@/components/rh/NovoDocumentoDialog";
import { NovaPastaDialog } from "@/components/rh/NovaPastaDialog";

export default function DocumentosRH() {
  const [abaAtual, setAbaAtual] = useState("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas_categorias");
  const [nivelFiltro, setNivelFiltro] = useState("todos_niveis");
  const [termoBusca, setTermoBusca] = useState("");
  const [dialogNovoDocumentoAberto, setDialogNovoDocumentoAberto] = useState(false);
  const [dialogNovaPastaAberto, setDialogNovaPastaAberto] = useState(false);

  // Mock de dados de documentos
  const documentos = [
    {
      id: 1,
      nome: "Política de Recursos Humanos",
      descricao: "Documento que estabelece as diretrizes...",
      categoria: "Políticas",
      tipo: "PDF",
      versao: "v2.1",
      atualizadoEm: "14/02/2023",
      atualizadoPor: "Diretoria de RH",
      acesso: "público"
    },
    {
      id: 2,
      nome: "Formulário de Avaliação de Desempenho",
      descricao: "Formulário padronizado para avaliação...",
      categoria: "Formulários",
      tipo: "DOCX",
      versao: "v1.0",
      atualizadoEm: "04/01/2023",
      atualizadoPor: "Departamento de RH",
      acesso: "restrito"
    },
    {
      id: 3,
      nome: "Manual do Colaborador",
      descricao: "Manual com todas as informações...",
      categoria: "Manuais",
      tipo: "PDF",
      versao: "v3.2",
      atualizadoEm: "09/03/2023",
      atualizadoPor: "Departamento de RH",
      acesso: "público"
    },
    {
      id: 4,
      nome: "Procedimento de Recrutamento e Seleção",
      descricao: "Procedimento detalhado para condução...",
      categoria: "Procedimentos",
      tipo: "PDF",
      versao: "v2.3",
      atualizadoEm: "19/01/2023",
      atualizadoPor: "Coordenação de RH",
      acesso: "restrito"
    },
    {
      id: 5,
      nome: "Acordo Coletivo de Trabalho 2023",
      descricao: "Acordo coletivo firmado entre a empresa...",
      categoria: "Legais",
      tipo: "PDF",
      versao: "v1.0",
      atualizadoEm: "28/02/2023",
      atualizadoPor: "Departamento Jurídico",
      acesso: "público"
    },
    {
      id: 6,
      nome: "Planilha de Cálculo de Férias",
      descricao: "Planilha para cálculo automático de...",
      categoria: "Planilhas",
      tipo: "XLSX",
      versao: "v1.2",
      atualizadoEm: "04/02/2023",
      atualizadoPor: "Departamento de RH",
      acesso: "restrito"
    },
    {
      id: 7,
      nome: "Código de Ética e Conduta",
      descricao: "Documento que estabelece os princípios...",
      categoria: "Políticas",
      tipo: "PDF",
      versao: "v2.5",
      atualizadoEm: "09/04/2023",
      atualizadoPor: "Diretoria Executiva",
      acesso: "público"
    }
  ];

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    // Filtro por aba
    if (abaAtual === "meus" && doc.atualizadoPor !== "Departamento de RH") return false;
    if (abaAtual === "favoritos") return false; // Implementação futura
    
    // Filtro por categoria
    if (categoriaFiltro && categoriaFiltro !== "todas_categorias" && doc.categoria !== categoriaFiltro) return false;
    
    // Filtro por nível de acesso
    if (nivelFiltro && nivelFiltro !== "todos_niveis" && doc.acesso !== nivelFiltro) return false;
    
    // Filtro por termo de busca
    if (termoBusca) {
      const termoLower = termoBusca.toLowerCase();
      return (
        doc.nome.toLowerCase().includes(termoLower) ||
        doc.descricao.toLowerCase().includes(termoLower) ||
        doc.categoria.toLowerCase().includes(termoLower)
      );
    }
    
    return true;
  });

  const getTipoIcone = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'DOCX':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'XLSX':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos de RH</h1>
          <p className="text-muted-foreground">
            Gerencie todos os documentos relacionados ao departamento de Recursos Humanos
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setDialogNovaPastaAberto(true)}
            className="gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Nova Pasta
          </Button>
          <Button 
            onClick={() => setDialogNovoDocumentoAberto(true)}
            className="gap-2"
          >
            <FilePlus className="h-4 w-4" />
            Novo Documento
          </Button>
        </div>
      </div>

      <Tabs value={abaAtual} onValueChange={setAbaAtual} className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos os Documentos</TabsTrigger>
          <TabsTrigger value="meus">Meus Documentos</TabsTrigger>
          <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todos" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar documentos..."
                className="pl-8"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas_categorias">Todas as categorias</SelectItem>
                <SelectItem value="Políticas">Políticas</SelectItem>
                <SelectItem value="Formulários">Formulários</SelectItem>
                <SelectItem value="Manuais">Manuais</SelectItem>
                <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                <SelectItem value="Legais">Legais</SelectItem>
                <SelectItem value="Planilhas">Planilhas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={nivelFiltro} onValueChange={setNivelFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os níveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos_niveis">Todos os níveis</SelectItem>
                <SelectItem value="público">Público</SelectItem>
                <SelectItem value="restrito">Restrito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Nome</th>
                  <th className="py-3 px-4 text-left font-medium">Categoria</th>
                  <th className="py-3 px-4 text-left font-medium">Tipo</th>
                  <th className="py-3 px-4 text-left font-medium">Versão</th>
                  <th className="py-3 px-4 text-left font-medium">Atualizado</th>
                  <th className="py-3 px-4 text-left font-medium">Acesso</th>
                  <th className="py-3 px-4 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documentosFiltrados.map((doc) => (
                  <tr key={doc.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getTipoIcone(doc.tipo)}
                        <div>
                          <p className="font-medium">{doc.nome}</p>
                          <p className="text-xs text-muted-foreground">{doc.descricao}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-muted/30 hover:bg-muted/30">
                        {doc.categoria}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{doc.tipo}</td>
                    <td className="py-3 px-4 text-sm">{doc.versao}</td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <p className="text-sm">{doc.atualizadoEm}</p>
                        <p className="text-xs text-muted-foreground">{doc.atualizadoPor}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        className={
                          doc.acesso === "público" 
                            ? "bg-green-100 text-green-600 hover:bg-green-100 border-green-200" 
                            : "bg-yellow-100 text-yellow-600 hover:bg-yellow-100 border-yellow-200"
                        }
                      >
                        {doc.acesso}
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
                            <Eye className="h-4 w-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Download className="h-4 w-4" /> Baixar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Share2 className="h-4 w-4" /> Compartilhar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 gap-2">
                            <Trash className="h-4 w-4" /> Excluir
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
        
        <TabsContent value="meus" className="space-y-4">
          {/* Conteúdo idêntico, aplicaremos o mesmo filtro */}
        </TabsContent>
        
        <TabsContent value="favoritos" className="space-y-4">
          <div className="rounded-md border text-center py-10 px-4">
            <p className="text-muted-foreground">Você ainda não marcou nenhum documento como favorito.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para adicionar novo documento */}
      <NovoDocumentoDialog 
        open={dialogNovoDocumentoAberto} 
        onOpenChange={setDialogNovoDocumentoAberto} 
      />
      
      {/* Dialog para adicionar nova pasta */}
      <NovaPastaDialog 
        open={dialogNovaPastaAberto} 
        onOpenChange={setDialogNovaPastaAberto} 
      />
    </div>
  );
}