import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search,
  Filter,
  Download,
  UserPlus,
  ChevronDown,
  MoreVertical
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

interface Paciente {
  id: number;
  nome: string;
  idade: number;
  condicaoPrincipal: string;
  status: 'Ativo' | 'Inativo';
  consultas: number;
  prescricoes: number;
  ultimaAtualizacao: string;
}

export default function BancoPacientes() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [condicaoFilter, setCondicaoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  
  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setPacientes([
        {
          id: 1,
          nome: 'Maria Silva',
          idade: 42,
          condicaoPrincipal: 'Epilepsia',
          status: 'Ativo',
          consultas: 5,
          prescricoes: 3,
          ultimaAtualizacao: '21/11/2023'
        },
        {
          id: 2,
          nome: 'João Oliveira',
          idade: 58,
          condicaoPrincipal: 'Dor crônica',
          status: 'Ativo',
          consultas: 8,
          prescricoes: 5,
          ultimaAtualizacao: '17/10/2023'
        },
        {
          id: 3,
          nome: 'Ana Santos',
          idade: 35,
          condicaoPrincipal: 'Ansiedade',
          status: 'Ativo',
          consultas: 4,
          prescricoes: 2,
          ultimaAtualizacao: '30/11/2023'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: 'Ativo' | 'Inativo') => {
    const styles = {
      'Ativo': 'bg-black text-white',
      'Inativo': 'bg-gray-100 text-gray-700'
    };
    
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const getCondicaoBadge = (condicao: string) => {
    return <Badge className="bg-blue-100 text-blue-700">{condicao}</Badge>;
  };

  const filteredPacientes = pacientes.filter(paciente => {
    const matchesSearch = paciente.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondicao = condicaoFilter ? paciente.condicaoPrincipal === condicaoFilter : true;
    const matchesStatus = statusFilter ? paciente.status === statusFilter : true;
    
    return matchesSearch && matchesCondicao && matchesStatus;
  });

  const condicoes = ['Epilepsia', 'Dor crônica', 'Ansiedade', 'Esclerose múltipla', 'Parkinson'];
  const statusOptions = ['Ativo', 'Inativo'];

  return (
    <ResearcherLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Banco de Pacientes</h1>
              <p className="text-gray-500">Gerencie pacientes para pesquisas científicas</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Exportação", description: "Exportando dados de pacientes..." })}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setLocation('/researcher/pacientes/novo')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Paciente
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Select value={condicaoFilter} onValueChange={setCondicaoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as condições" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as condições</SelectItem>
                  {condicoes.map(condicao => (
                    <SelectItem key={condicao} value={condicao}>{condicao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de Pacientes */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Condição Principal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Consultas</TableHead>
                    <TableHead>Prescr.</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}>
                          <div className="animate-pulse flex items-center space-x-4">
                            <div className="h-4 bg-gray-200 rounded-full w-24"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-8"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-20"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-12"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-8"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-8"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-24"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-8"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredPacientes.length > 0 ? (
                    filteredPacientes.map((paciente) => (
                      <TableRow key={paciente.id}>
                        <TableCell className="font-medium">{paciente.nome}</TableCell>
                        <TableCell>{paciente.idade}</TableCell>
                        <TableCell>{getCondicaoBadge(paciente.condicaoPrincipal)}</TableCell>
                        <TableCell>{getStatusBadge(paciente.status)}</TableCell>
                        <TableCell>{paciente.consultas}</TableCell>
                        <TableCell>{paciente.prescricoes}</TableCell>
                        <TableCell>{paciente.ultimaAtualizacao}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/researcher/pacientes/${paciente.id}`)}>
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setLocation(`/researcher/pacientes/${paciente.id}/editar`)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => {
                                toast({
                                  title: "Confirmação necessária",
                                  description: "Esta ação excluirá permanentemente este paciente. Deseja continuar?",
                                  variant: "destructive",
                                });
                              }}>
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        {searchTerm || condicaoFilter || statusFilter ? (
                          <>
                            <p className="text-gray-700 font-medium mb-1">Nenhum paciente encontrado</p>
                            <p className="text-gray-500 text-sm mb-4">
                              Nenhum resultado corresponde aos filtros aplicados. Tente ajustar sua busca.
                            </p>
                            <Button onClick={() => {
                              setSearchTerm('');
                              setCondicaoFilter('');
                              setStatusFilter('');
                            }}>
                              Limpar filtros
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-700 font-medium mb-1">Nenhum paciente cadastrado</p>
                            <p className="text-gray-500 text-sm mb-4">
                              Você ainda não tem pacientes registrados para pesquisas.
                            </p>
                            <Button onClick={() => setLocation('/researcher/pacientes/novo')}>
                              Adicionar primeiro paciente
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Paginação */}
          {filteredPacientes.length > 0 && (
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>Mostrando 1-3 de 3 pacientes</div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </ResearcherLayout>
  );
}