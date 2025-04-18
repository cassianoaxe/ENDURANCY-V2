import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  FileText, 
  FlaskConical, 
  ChevronRight, 
  BookOpen, 
  Building, 
  Microscope, 
  FilePlus, 
  FileSearch,
  Clipboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

export default function ResearcherDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [activeStudies, setActiveStudies] = useState([]);
  const [registeredPlants, setRegisteredPlants] = useState([]);
  const [availableOrganizations, setAvailableOrganizations] = useState([]);
  
  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setActiveStudies([
        { 
          id: 1, 
          title: 'Eficácia do CBN em dores crônicas',
          status: 'em_andamento',
          progress: 45,
          lastUpdate: new Date(2025, 3, 15), // 15 de abril de 2025
          collaborators: 3,
          organization: 'Instituto Brasileira de Cannabis Medicinal',
          type: 'clinico_randomizado'
        },
        { 
          id: 2, 
          title: 'Comparação de métodos de extração de CBD',
          status: 'em_analise',
          progress: 20,
          lastUpdate: new Date(2025, 3, 10), // 10 de abril de 2025
          collaborators: 2,
          organization: 'PharmaCann Research',
          type: 'translacional'
        }
      ]);
      
      setRegisteredPlants([
        {
          id: 1,
          name: 'Cannabis sativa strain A',
          thcContent: 0.3,
          cbdContent: 18.5,
          cbnContent: 0.5,
          registeredDate: new Date(2025, 2, 5),
          status: 'approved'
        },
        {
          id: 2,
          name: 'Cannabis indica XR-2',
          thcContent: 0.2,
          cbdContent: 22.0,
          cbnContent: 0.8,
          registeredDate: new Date(2025, 3, 1),
          status: 'pending'
        }
      ]);
      
      setAvailableOrganizations([
        {
          id: 1,
          name: 'Instituto Brasileira de Cannabis Medicinal',
          type: 'research',
          logo: '/assets/orgs/ibcm-logo.png',
          collaborationStatus: 'active'
        },
        {
          id: 2,
          name: 'PharmaCann Research',
          type: 'industry',
          logo: '/assets/orgs/pharmaca-logo.png',
          collaborationStatus: 'active'
        },
        {
          id: 3,
          name: 'Associação Brasileira de Apoio Cannabis Esperança',
          type: 'association',
          logo: '/assets/orgs/abrace-logo.png',
          collaborationStatus: 'available'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getStatusBadge = (status) => {
    const statusMap = {
      'em_andamento': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em andamento</Badge>,
      'em_analise': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Em análise</Badge>,
      'aprovada': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aprovada</Badge>,
      'concluida': <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Concluída</Badge>,
      'suspensa': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Suspensa</Badge>,
      'rascunho': <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Rascunho</Badge>
    };
    
    return statusMap[status] || <Badge className="bg-gray-100 text-gray-700">Desconhecido</Badge>;
  };
  
  const getTypeLabel = (type) => {
    const typeMap = {
      'clinico_randomizado': 'Estudo Clínico Randomizado',
      'observacional_prospectivo': 'Estudo Observacional Prospectivo',
      'observacional_retrospectivo': 'Estudo Observacional Retrospectivo',
      'revisao_sistematica': 'Revisão Sistemática',
      'translacional': 'Pesquisa Translacional',
      'outro': 'Outro'
    };
    
    return typeMap[type] || 'Tipo não especificado';
  };

  return (
    <ResearcherLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Portal do Pesquisador</h1>
              <p className="text-gray-500 mt-1">Gerencie suas pesquisas científicas e colaborações</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setLocation('/researcher/estudos/novo')} className="bg-green-600 hover:bg-green-700">
                <FilePlus className="h-4 w-4 mr-2" />
                Novo Estudo
              </Button>
              <Button variant="outline" onClick={() => setLocation('/researcher/organizacoes')}>
                <Building className="h-4 w-4 mr-2" />
                Organizações
              </Button>
              <Button variant="outline" onClick={() => setLocation('/researcher/plantas')}>
                <Microscope className="h-4 w-4 mr-2" />
                Registro de Plantas
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Estudos Científicos</CardTitle>
                <CardDescription>Acompanhe o progresso das suas pesquisas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeStudies.length > 0 ? (
                  <div className="space-y-5">
                    {activeStudies.map((study) => (
                      <div key={study.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setLocation(`/researcher/estudos/${study.id}`)}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{study.title}</h3>
                            <p className="text-sm text-gray-500 mb-1">{getTypeLabel(study.type)}</p>
                            <p className="text-xs text-gray-600">
                              Organização: {study.organization} • {study.collaborators} colaboradores
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(study.status)}
                            <span className="text-xs text-gray-500">
                              Atualizado em {format(study.lastUpdate, 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progresso</span>
                            <span>{study.progress}%</span>
                          </div>
                          <Progress value={study.progress} className="h-2" />
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => setLocation('/researcher/estudos')}
                    >
                      Ver todos os estudos
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-700 font-medium mb-1">Nenhum estudo encontrado</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Você ainda não tem estudos científicos registrados.
                    </p>
                    <Button onClick={() => setLocation('/researcher/estudos/novo')}>
                      Criar primeiro estudo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Plantas Registradas</CardTitle>
                <CardDescription>Cepas catalogadas para pesquisa</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : registeredPlants.length > 0 ? (
                  <div className="space-y-3">
                    {registeredPlants.map((plant) => (
                      <div key={plant.id} className="border rounded p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">{plant.name}</h3>
                          <Badge className={`${
                            plant.status === 'approved' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {plant.status === 'approved' ? 'Aprovada' : 'Pendente'}
                          </Badge>
                        </div>
                        <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-gray-500">
                          <div>
                            <p className="font-medium">THC</p>
                            <p>{plant.thcContent}%</p>
                          </div>
                          <div>
                            <p className="font-medium">CBD</p>
                            <p>{plant.cbdContent}%</p>
                          </div>
                          <div>
                            <p className="font-medium">CBN</p>
                            <p>{plant.cbnContent}%</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Registrada em {format(plant.registeredDate, 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => setLocation('/researcher/plantas')}
                    >
                      Ver todas as plantas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FlaskConical className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-gray-700 font-medium mb-1">Nenhuma planta registrada</h3>
                    <p className="text-gray-500 text-sm mb-3">
                      Registre cepas para suas pesquisas
                    </p>
                    <Button size="sm" onClick={() => setLocation('/researcher/plantas/novo')}>
                      Registrar planta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Organizações Colaboradoras</CardTitle>
              <CardDescription>Instituições disponíveis para parcerias de pesquisa</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableOrganizations.map((org) => (
                    <div key={org.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{org.name}</h3>
                          <p className="text-xs text-gray-500 capitalize">{org.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <Badge className={
                          org.collaborationStatus === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }>
                          {org.collaborationStatus === 'active' ? 'Colaborando' : 'Disponível'}
                        </Badge>
                        
                        <Button 
                          size="sm" 
                          variant={org.collaborationStatus === 'active' ? 'outline' : 'default'}
                          onClick={() => {
                            if (org.collaborationStatus === 'active') {
                              setLocation(`/researcher/organizacoes/${org.id}`);
                            } else {
                              toast({
                                title: "Solicitação enviada",
                                description: `Solicitação de colaboração enviada para ${org.name}`,
                              });
                            }
                          }}
                        >
                          {org.collaborationStatus === 'active' ? 'Gerenciar' : 'Solicitar colaboração'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => setLocation('/researcher/organizacoes')}
              >
                Ver todas as organizações
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Próximos Eventos</CardTitle>
                <CardDescription>Congressos e encontros científicos</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="min-w-14 h-14 rounded-md bg-blue-50 flex flex-col items-center justify-center text-blue-700">
                        <span className="text-sm font-bold">23</span>
                        <span className="text-xs">Mai</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Congresso Brasileiro de Cannabis Medicinal</h3>
                        <p className="text-sm text-gray-500">São Paulo, SP - Online e Presencial</p>
                        <Badge className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-50">Evento Científico</Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="min-w-14 h-14 rounded-md bg-green-50 flex flex-col items-center justify-center text-green-700">
                        <span className="text-sm font-bold">10</span>
                        <span className="text-xs">Jun</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Workshop: Métodos de Extração Avançados</h3>
                        <p className="text-sm text-gray-500">Online via Zoom</p>
                        <Badge className="mt-2 bg-green-50 text-green-700 hover:bg-green-50">Workshop</Badge>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full text-blue-600 hover:bg-blue-50"
                      onClick={() => navigate('/researcher/eventos')}
                    >
                      Ver todos os eventos
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Relatórios e Publicações</CardTitle>
                <CardDescription>Documentação e artigos científicos</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="p-2 bg-purple-50 text-purple-700 rounded-md">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Relatório Q1: Análise de Canabinóides</h3>
                        <p className="text-xs text-gray-500">Publicado em 10/04/2025 • PDF • 1.2MB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="p-2 bg-amber-50 text-amber-700 rounded-md">
                        <Clipboard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Artigo: Terpenos e suas aplicações clínicas</h3>
                        <p className="text-xs text-gray-500">Enviado para publicação • DOCX • 895KB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="p-2 bg-indigo-50 text-indigo-700 rounded-md">
                        <BarChart className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Dados Estatísticos: Estudo CBN</h3>
                        <p className="text-xs text-gray-500">Atualizado em 18/04/2025 • XLSX • 3.4MB</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full text-blue-600 hover:bg-blue-50"
                      onClick={() => navigate('/researcher/publicacoes')}
                    >
                      Ver todos os documentos
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResearcherLayout>
  );
}