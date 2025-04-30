import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  User,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Organization } from '@shared/schema';

export default function CadastroClientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("todos");

  // Função de navegação que funciona com o sistema do App.tsx
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Buscar organizações
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['/api/organizations'],
  });

  // Filtrar organizações por termo de busca e tipo
  const filteredOrganizations = Array.isArray(organizations) 
    ? organizations.filter((org: Organization) => {
        const matchesSearch = searchTerm === "" || 
                            org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (org.adminName && org.adminName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (org.email && org.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (currentTab === "todos") return matchesSearch;
        if (currentTab === "associacoes") return matchesSearch && org.type === "Associação";
        if (currentTab === "clinicas") return matchesSearch && org.type === "Clínica";
        if (currentTab === "farmacias") return matchesSearch && org.type === "Farmácia";
        return false;
      }) 
    : [];

  // Ordenar organizações por nome
  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  // Formatador de data
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Clientes Cadastrados</h1>
          <p className="text-gray-600">Gerencie e visualize todos os clientes da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download size={16} /> Exportar
          </Button>
          <Button className="gap-1.5" onClick={() => navigate('/organization-registration')}>
            <Plus size={16} /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{organizations?.length || 0}</span>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Associações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {organizations?.filter(o => o.type === 'Associação').length || 0}
              </span>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Clínicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {organizations?.filter(o => o.type === 'Clínica').length || 0}
              </span>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Farmácias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {organizations?.filter(o => o.type === 'Farmácia').length || 0}
              </span>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="text" 
            placeholder="Buscar cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter size={16} /> Filtros
        </Button>
      </div>

      <Tabs defaultValue="todos" onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="associacoes">Associações</TabsTrigger>
          <TabsTrigger value="clinicas">Clínicas</TabsTrigger>
          <TabsTrigger value="farmacias">Farmácias</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner size="lg" />
                </div>
              ) : sortedOrganizations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Data de Registro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            {org.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {org.type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <div className="flex items-center gap-1">
                              <Mail size={12} className="text-gray-400" />
                              <span>{org.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Phone size={12} className="text-gray-400" />
                              <span>{org.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{org.city || 'N/A'}{org.state ? `, ${org.state}` : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(org.createdAt)}</TableCell>
                        <TableCell>
                          {org.status === 'active' && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Ativo
                            </Badge>
                          )}
                          {org.status === 'pending' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                              Pendente
                            </Badge>
                          )}
                          {org.status === 'blocked' && (
                            <Badge variant="destructive">
                              Bloqueado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Visualizar detalhes"
                              onClick={() => navigate(`/organizations/${org.id}`)}
                            >
                              <Eye size={16} className="text-gray-500" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} className="text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => navigate(`/organizations/${org.id}/edit`)}
                                >
                                  <Edit size={14} className="mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                                >
                                  <Trash2 size={14} className="mr-2" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p>Nenhum cliente encontrado com os filtros atuais.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="associacoes" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Mesma estrutura do conteúdo 'todos', mas filtrado para associações */}
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner size="lg" />
                </div>
              ) : sortedOrganizations.length > 0 ? (
                <Table>
                  {/* Conteúdo da tabela (repetição do conteúdo da aba "todos") */}
                </Table>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p>Nenhuma associação encontrada com os filtros atuais.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinicas" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Mesma estrutura do conteúdo 'todos', mas filtrado para clínicas */}
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner size="lg" />
                </div>
              ) : sortedOrganizations.length > 0 ? (
                <Table>
                  {/* Conteúdo da tabela (repetição do conteúdo da aba "todos") */}
                </Table>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p>Nenhuma clínica encontrada com os filtros atuais.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farmacias" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Mesma estrutura do conteúdo 'todos', mas filtrado para farmácias */}
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner size="lg" />
                </div>
              ) : sortedOrganizations.length > 0 ? (
                <Table>
                  {/* Conteúdo da tabela (repetição do conteúdo da aba "todos") */}
                </Table>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p>Nenhuma farmácia encontrada com os filtros atuais.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}