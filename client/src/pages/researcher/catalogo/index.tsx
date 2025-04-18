import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FilePlus, 
  FileSearch,
  Search,
  Filter,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash
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
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

interface CatalogoPesquisaProps {
  id: number;
  titulo: string;
  area: string;
  descricao: string;
  status: 'Em Andamento' | 'Em Análise' | 'Aprovada';
  dataInicio: string;
  participantes: number;
  responsavel: string;
}

export default function CatalogoPesquisas() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pesquisas, setPesquisas] = useState<CatalogoPesquisaProps[]>([]);
  
  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setPesquisas([
        {
          id: 1,
          titulo: 'Eficácia do CBD no tratamento da epilepsia refratária',
          area: 'Neurologia',
          descricao: 'Estudo clínico randomizado sobre os efeitos do CBD em pacientes com epilepsia refratária.',
          status: 'Em Andamento',
          dataInicio: '14/01/2024',
          participantes: 45,
          responsavel: 'Dra. Maria Silva'
        },
        {
          id: 2,
          titulo: 'Efeitos da cannabis em pacientes com dor crônica',
          area: 'Neurologia',
          descricao: 'Avaliação dos efeitos analgésicos em pacientes com dor crônica de diferentes origens.',
          status: 'Em Análise',
          dataInicio: '03/02/2024',
          participantes: 32,
          responsavel: 'Dr. Carlos Mendes'
        },
        {
          id: 3,
          titulo: 'Cannabis medicinal no tratamento de ansiedade',
          area: 'Psiquiatria',
          descricao: 'Avaliação dos efeitos ansiolíticos em pacientes com transtornos de ansiedade.',
          status: 'Aprovada',
          dataInicio: '10/12/2023',
          participantes: 60,
          responsavel: 'Dra. Juliana Santos'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: 'Em Andamento' | 'Em Análise' | 'Aprovada') => {
    const styles = {
      'Em Andamento': 'bg-black text-white',
      'Em Análise': 'bg-amber-100 text-amber-700',
      'Aprovada': 'bg-green-100 text-green-700'
    };
    
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const filteredPesquisas = pesquisas.filter(pesquisa => {
    const matchesSearch = pesquisa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pesquisa.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter ? pesquisa.area === areaFilter : true;
    const matchesStatus = statusFilter ? pesquisa.status === statusFilter : true;
    
    return matchesSearch && matchesArea && matchesStatus;
  });

  const areas = ['Neurologia', 'Psiquiatria', 'Oncologia', 'Reumatologia', 'Pediatria'];
  const statusOptions = ['Em Andamento', 'Em Análise', 'Aprovada'];

  return (
    <ResearcherLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Catálogo de Pesquisas</h1>
              <p className="text-gray-500">Explore todas as pesquisas científicas</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setLocation('/researcher/nova-pesquisa')}>
              <FilePlus className="h-4 w-4 mr-2" />
              Nova Pesquisa
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar pesquisas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as Áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as Áreas</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
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

          {/* Lista de Pesquisas */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-6 border">
                  <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-full mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded-full w-1/5"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPesquisas.length > 0 ? (
            <div className="space-y-4">
              {filteredPesquisas.map((pesquisa) => (
                <Card key={pesquisa.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h2 className="text-xl font-semibold">{pesquisa.titulo}</h2>
                          <p className="text-gray-500 text-sm">Área: {pesquisa.area}</p>
                        </div>
                        {getStatusBadge(pesquisa.status)}
                      </div>
                      <p className="text-gray-700 mb-4">{pesquisa.descricao}</p>
                      <div className="flex flex-wrap gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center mr-6">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Início: {pesquisa.dataInicio}</span>
                        </div>
                        <div className="flex items-center mr-6">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{pesquisa.participantes} participantes</span>
                        </div>
                        <div className="flex items-center">
                          <span>Responsável: {pesquisa.responsavel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex border-t divide-x">
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-none py-3 text-blue-600"
                        onClick={() => setLocation(`/researcher/catalogo/${pesquisa.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-none py-3 text-amber-600"
                        onClick={() => setLocation(`/researcher/catalogo/${pesquisa.id}/editar`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-none py-3 text-red-600"
                        onClick={() => {
                          toast({
                            title: "Confirmação necessária",
                            description: "Esta ação excluirá permanentemente a pesquisa. Deseja continuar?",
                            variant: "destructive",
                          });
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <FileSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              {searchTerm || areaFilter || statusFilter ? (
                <>
                  <h3 className="text-gray-700 font-medium mb-1">Nenhuma pesquisa encontrada</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Nenhum resultado corresponde aos filtros aplicados. Tente ajustar sua busca.
                  </p>
                  <Button onClick={() => {
                    setSearchTerm('');
                    setAreaFilter('');
                    setStatusFilter('');
                  }}>
                    Limpar filtros
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-gray-700 font-medium mb-1">Nenhuma pesquisa cadastrada</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Você ainda não tem pesquisas científicas registradas.
                  </p>
                  <Button onClick={() => setLocation('/researcher/nova-pesquisa')}>
                    Criar primeira pesquisa
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ResearcherLayout>
  );
}