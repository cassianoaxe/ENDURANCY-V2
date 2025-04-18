import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Search,
  Brain,
  Activity,
  ListFilter,
  Eye
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

interface Sintoma {
  nome: string;
  extras?: number;
}

interface TratamentoCannabis {
  tipo: string;
  eficacia: 'Alta Eficácia' | 'Eficácia Moderada' | 'Baixa Eficácia';
}

interface Doenca {
  id: number;
  nome: string;
  cid: string;
  area: string;
  descricao: string;
  sintomas: Sintoma[];
  tratamentosCannabis: TratamentoCannabis[];
}

export default function DoencasCondicoes() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [doencas, setDoencas] = useState<Doenca[]>([]);
  
  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setDoencas([
        {
          id: 1,
          nome: 'Epilepsia',
          cid: 'G40',
          area: 'neurologia',
          descricao: 'Distúrbio em que a atividade cerebral se torna anormal, causando convulsões ou períodos de comportamento e sensações incomuns.',
          sintomas: [
            { nome: 'Convulsões' },
            { nome: 'Espasmos musculares' },
            { nome: 'Perda de consciência', extras: 2 }
          ],
          tratamentosCannabis: [
            { tipo: 'CBD isolado', eficacia: 'Alta Eficácia' },
            { tipo: 'Espectro Completo', eficacia: 'Eficácia Moderada' }
          ]
        },
        {
          id: 2,
          nome: 'Dor crônica',
          cid: 'R52',
          area: 'neurologia',
          descricao: 'Dor persistente ou recorrente que dura mais que o tempo normal de cura (geralmente 3 meses). Pode ser causada por diversas condições.',
          sintomas: [
            { nome: 'Dor persistente' },
            { nome: 'Limitação de movimentos' },
            { nome: 'Rigidez muscular', extras: 3 }
          ],
          tratamentosCannabis: [
            { tipo: 'THC:CBD balanceado', eficacia: 'Alta Eficácia' },
            { tipo: 'CBD predominante', eficacia: 'Eficácia Moderada' }
          ]
        },
        {
          id: 3,
          nome: 'Esclerose Múltipla',
          cid: 'G35',
          area: 'neurologia',
          descricao: 'Doença autoimune crônica que afeta o sistema nervoso central, danificando a bainha de mielina que recobre os nervos.',
          sintomas: [
            { nome: 'Fadiga' },
            { nome: 'Dificuldade de mobilidade' },
            { nome: 'Problemas de coordenação', extras: 4 }
          ],
          tratamentosCannabis: [
            { tipo: 'THC:CBD balanceado', eficacia: 'Alta Eficácia' },
            { tipo: 'CBD predominante', eficacia: 'Eficácia Moderada' }
          ]
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getEficaciaBadge = (eficacia: 'Alta Eficácia' | 'Eficácia Moderada' | 'Baixa Eficácia') => {
    const styles = {
      'Alta Eficácia': 'bg-green-100 text-green-700',
      'Eficácia Moderada': 'bg-blue-100 text-blue-700',
      'Baixa Eficácia': 'bg-gray-100 text-gray-700'
    };
    
    return <Badge className={styles[eficacia]}>{eficacia}</Badge>;
  };

  const getAreaBadge = (area: string) => {
    return <Badge className="bg-black text-white">{area}</Badge>;
  };

  const filteredDoencas = doencas.filter(doenca => {
    const matchesSearch = doenca.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           doenca.cid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter ? doenca.area === areaFilter : true;
    
    return matchesSearch && matchesArea;
  });

  const areas = ['neurologia', 'psiquiatria', 'reumatologia', 'oncologia', 'dermatologia'];

  return (
    <ResearcherLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Doenças e Condições</h1>
              <p className="text-gray-500">Base de conhecimento sobre condições tratadas com cannabis medicinal</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setLocation('/researcher/doencas/nova')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Condição
            </Button>
          </div>

          {/* Filtros e Visualização */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou CID..."
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
              
              <Tabs defaultValue="cards" value={viewMode} onValueChange={setViewMode} className="w-[180px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                  <TabsTrigger value="table">Tabela</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Lista de Doenças */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-6 border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TabsContent value="cards" className="mt-0">
              {filteredDoencas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredDoencas.map((doenca) => (
                    <Card key={doenca.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Brain className="h-5 w-5 text-purple-500" />
                              <h3 className="text-xl font-semibold">{doenca.nome}</h3>
                            </div>
                            <p className="text-sm text-gray-500">CID: {doenca.cid}</p>
                          </div>
                          {getAreaBadge(doenca.area)}
                        </div>
                        
                        <p className="text-sm text-gray-700 mt-3 mb-4 line-clamp-3">{doenca.descricao}</p>
                        
                        <div className="mb-4">
                          <p className="font-medium text-sm mb-2">Principais Sintomas</p>
                          <div className="flex flex-wrap gap-2">
                            {doenca.sintomas.map((sintoma, index) => (
                              <div key={index} className="inline-flex gap-1">
                                <Badge variant="outline" className="border-gray-200 text-gray-700">
                                  {sintoma.nome}
                                </Badge>
                                {sintoma.extras && (
                                  <Badge variant="outline" className="border-gray-200 text-gray-500">
                                    +{sintoma.extras}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm mb-2">Tratamentos com Cannabis</p>
                          <div className="space-y-2">
                            {doenca.tratamentosCannabis.map((tratamento, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm">{tratamento.tipo}</span>
                                {getEficaciaBadge(tratamento.eficacia)}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => setLocation(`/researcher/doencas/${doenca.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  {searchTerm || areaFilter ? (
                    <>
                      <h3 className="text-gray-700 font-medium mb-1">Nenhuma condição encontrada</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Nenhum resultado corresponde aos filtros aplicados. Tente ajustar sua busca.
                      </p>
                      <Button onClick={() => {
                        setSearchTerm('');
                        setAreaFilter('');
                      }}>
                        Limpar filtros
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-gray-700 font-medium mb-1">Nenhuma condição cadastrada</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Você ainda não tem condições médicas registradas.
                      </p>
                      <Button onClick={() => setLocation('/researcher/doencas/nova')}>
                        Adicionar primeira condição
                      </Button>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="table" className="mt-0">
            {filteredDoencas.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Nome</th>
                          <th className="text-left p-4">CID</th>
                          <th className="text-left p-4">Área</th>
                          <th className="text-left p-4">Sintomas</th>
                          <th className="text-left p-4">Tratamentos</th>
                          <th className="text-left p-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDoencas.map((doenca) => (
                          <tr key={doenca.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{doenca.nome}</td>
                            <td className="p-4">{doenca.cid}</td>
                            <td className="p-4">{getAreaBadge(doenca.area)}</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {doenca.sintomas.slice(0, 2).map((sintoma, index) => (
                                  <Badge key={index} variant="outline">{sintoma.nome}</Badge>
                                ))}
                                {doenca.sintomas.length > 2 && (
                                  <Badge variant="outline">+{doenca.sintomas.length - 2}</Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              {doenca.tratamentosCannabis.map((tratamento, index) => (
                                <div key={index} className="flex items-center gap-2 mb-1">
                                  <span className="text-xs">{tratamento.tipo}</span>
                                  {getEficaciaBadge(tratamento.eficacia)}
                                </div>
                              ))}
                            </td>
                            <td className="p-4">
                              <Button 
                                size="sm" 
                                onClick={() => setLocation(`/researcher/doencas/${doenca.id}`)}
                              >
                                Ver
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                {searchTerm || areaFilter ? (
                  <>
                    <h3 className="text-gray-700 font-medium mb-1">Nenhuma condição encontrada</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Nenhum resultado corresponde aos filtros aplicados. Tente ajustar sua busca.
                    </p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setAreaFilter('');
                    }}>
                      Limpar filtros
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-gray-700 font-medium mb-1">Nenhuma condição cadastrada</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Você ainda não tem condições médicas registradas.
                    </p>
                    <Button onClick={() => setLocation('/researcher/doencas/nova')}>
                      Adicionar primeira condição
                    </Button>
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </div>
      </div>
    </ResearcherLayout>
  );
}