import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, Eye, CheckCircle, Clock, Search, Plus, 
  FileText, User, UserPlus, ShieldCheck, Filter
} from "lucide-react";
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function Cadastros() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("todos");

  // Buscar pacientes/associados (mock inicial)
  const { data: cadastros, isLoading } = useQuery({
    queryKey: ['/api/patients', user?.organizationId],
    enabled: !!user?.organizationId,
  });

  // Formatar data
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Dados temporários para demonstração
  const mockCadastros = [
    { id: 1, name: 'João Silva', email: 'joao@example.com', type: 'associado', status: 'ativo', createdAt: '2025-03-01', document: '123.456.789-01', phone: '(11) 98765-4321' },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', type: 'cliente', status: 'ativo', createdAt: '2025-03-05', document: '987.654.321-00', phone: '(11) 91234-5678' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@example.com', type: 'associado', status: 'pendente', createdAt: '2025-03-15', document: '111.222.333-44', phone: '(11) 92222-3333' },
    { id: 4, name: 'Ana Pereira', email: 'ana@example.com', type: 'cliente', status: 'ativo', createdAt: '2025-03-20', document: '444.555.666-77', phone: '(11) 94444-5555' },
    { id: 5, name: 'Lucas Ferreira', email: 'lucas@example.com', type: 'associado', status: 'inativo', createdAt: '2025-02-10', document: '777.888.999-00', phone: '(11) 97777-8888' },
  ];

  // Filtrar por termo de busca e tipo
  const filteredCadastros = mockCadastros.filter(cadastro => {
    const matchesSearch = searchTerm === "" || 
                       cadastro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cadastro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cadastro.document.includes(searchTerm);
    
    if (currentTab === "todos") return matchesSearch;
    if (currentTab === "associados") return matchesSearch && cadastro.type === "associado";
    if (currentTab === "clientes") return matchesSearch && cadastro.type === "cliente";
    if (currentTab === "pendentes") return matchesSearch && cadastro.status === "pendente";
    return false;
  });

  return (
    <OrganizationLayout>
      <div className="container p-6">
        <h1 className="text-2xl font-bold mb-4">Cadastros</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Gerencie seus clientes e associados em um só lugar. Visualize informações, documentos e histórico.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Total de Cadastros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{mockCadastros.length}</p>
              <p className="text-sm text-muted-foreground">
                Clientes e associados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Associados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {mockCadastros.filter(c => c.type === 'associado').length}
              </p>
              <p className="text-sm text-muted-foreground">
                Associados cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-violet-500" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {mockCadastros.filter(c => c.type === 'cliente').length}
              </p>
              <p className="text-sm text-muted-foreground">
                Clientes cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {mockCadastros.filter(c => c.status === 'pendente').length}
              </p>
              <p className="text-sm text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              type="text" 
              placeholder="Buscar por nome, email ou documento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter size={16} /> Filtros avançados
            </Button>
            <Button className="gap-1.5">
              <UserPlus size={16} /> Novo Cadastro
            </Button>
          </div>
        </div>

        <Tabs defaultValue="todos" onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="associados">Associados</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="p-0">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Spinner size="lg" />
                  </div>
                ) : filteredCadastros.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCadastros.map((cadastro) => (
                        <TableRow key={cadastro.id}>
                          <TableCell className="font-medium">{cadastro.name}</TableCell>
                          <TableCell>{cadastro.document}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{cadastro.email}</span>
                              <span className="text-gray-500 text-xs">{cadastro.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              cadastro.type === 'associado' 
                                ? "bg-blue-50 text-blue-700 border-blue-200" 
                                : "bg-violet-50 text-violet-700 border-violet-200"
                            }>
                              {cadastro.type === 'associado' ? 'Associado' : 'Cliente'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(cadastro.createdAt)}</TableCell>
                          <TableCell>
                            {cadastro.status === 'ativo' && (
                              <Badge variant="outline" className="gap-1 bg-green-50 text-green-600 border-green-200">
                                <CheckCircle size={12} /> Ativo
                              </Badge>
                            )}
                            {cadastro.status === 'pendente' && (
                              <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-600 border-yellow-200">
                                <Clock size={12} /> Pendente
                              </Badge>
                            )}
                            {cadastro.status === 'inativo' && (
                              <Badge variant="outline" className="gap-1 bg-gray-100 text-gray-600 border-gray-200">
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye size={16} /> Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileText size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-1">Nenhum cadastro encontrado</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? "Nenhum resultado para sua busca. Tente outros termos."
                        : "Você ainda não possui cadastros. Comece adicionando um novo."}
                    </p>
                    <Button className="gap-1.5">
                      <UserPlus size={16} /> Adicionar cadastro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* As outras TabsContent seriam idênticas, apenas com filtros diferentes */}
          <TabsContent value="associados" className="p-0">
            {/* Conteúdo idêntico ao "todos", mas apenas mostrando associados */}
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCadastros.map((cadastro) => (
                      <TableRow key={cadastro.id}>
                        <TableCell className="font-medium">{cadastro.name}</TableCell>
                        <TableCell>{cadastro.document}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{cadastro.email}</span>
                            <span className="text-gray-500 text-xs">{cadastro.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Associado
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(cadastro.createdAt)}</TableCell>
                        <TableCell>
                          {cadastro.status === 'ativo' && (
                            <Badge variant="outline" className="gap-1 bg-green-50 text-green-600 border-green-200">
                              <CheckCircle size={12} /> Ativo
                            </Badge>
                          )}
                          {cadastro.status === 'pendente' && (
                            <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-600 border-yellow-200">
                              <Clock size={12} /> Pendente
                            </Badge>
                          )}
                          {cadastro.status === 'inativo' && (
                            <Badge variant="outline" className="gap-1 bg-gray-100 text-gray-600 border-gray-200">
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye size={16} /> Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clientes" className="p-0">
            {/* Conteúdo com clientes */}
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCadastros.map((cadastro) => (
                      <TableRow key={cadastro.id}>
                        <TableCell className="font-medium">{cadastro.name}</TableCell>
                        <TableCell>{cadastro.document}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{cadastro.email}</span>
                            <span className="text-gray-500 text-xs">{cadastro.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                            Cliente
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(cadastro.createdAt)}</TableCell>
                        <TableCell>
                          {cadastro.status === 'ativo' && (
                            <Badge variant="outline" className="gap-1 bg-green-50 text-green-600 border-green-200">
                              <CheckCircle size={12} /> Ativo
                            </Badge>
                          )}
                          {cadastro.status === 'pendente' && (
                            <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-600 border-yellow-200">
                              <Clock size={12} /> Pendente
                            </Badge>
                          )}
                          {cadastro.status === 'inativo' && (
                            <Badge variant="outline" className="gap-1 bg-gray-100 text-gray-600 border-gray-200">
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye size={16} /> Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pendentes" className="p-0">
            {/* Conteúdo com pendentes */}
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCadastros.map((cadastro) => (
                      <TableRow key={cadastro.id}>
                        <TableCell className="font-medium">{cadastro.name}</TableCell>
                        <TableCell>{cadastro.document}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{cadastro.email}</span>
                            <span className="text-gray-500 text-xs">{cadastro.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            cadastro.type === 'associado' 
                              ? "bg-blue-50 text-blue-700 border-blue-200" 
                              : "bg-violet-50 text-violet-700 border-violet-200"
                          }>
                            {cadastro.type === 'associado' ? 'Associado' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(cadastro.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-600 border-yellow-200">
                            <Clock size={12} /> Pendente
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye size={16} /> Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}