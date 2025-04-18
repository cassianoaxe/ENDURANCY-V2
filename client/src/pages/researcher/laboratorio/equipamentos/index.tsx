import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronRight,
  Microscope,
  AlertCircle,
  CalendarCheck,
  Calendar,
  User
} from 'lucide-react';

export default function EquipamentosList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [equipamentos, setEquipamentos] = useState<any[]>([]);

  // Exemplo de dados para simulação
  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      // Carregar dados da API
      fetch('/api/laboratorio/equipamentos')
        .then(res => {
          if (!res.ok) {
            throw new Error('Erro ao carregar equipamentos');
          }
          return res.json();
        })
        .then(data => {
          setEquipamentos(data || []);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Erro ao carregar equipamentos:', error);
          // Dados de exemplo fallback
          setEquipamentos([
            {
              id: 'HPLC-001',
              nome: 'HPLC Agilent 1260 Infinity II',
              tipo: 'HPLC',
              status: 'disponivel',
              proximaManutencao: new Date(2025, 5, 15).toISOString(),
              ultimaCalibracao: new Date(2025, 2, 15).toISOString(),
              responsavel: 'Lab Central - São Paulo'
            },
            {
              id: 'GC-003',
              nome: 'GC-MS Shimadzu GCMS-QP2020 NX',
              tipo: 'GC-MS',
              status: 'em_uso',
              proximaManutencao: new Date(2025, 6, 10).toISOString(),
              ultimaCalibracao: new Date(2025, 3, 5).toISOString(),
              responsavel: 'Lab Central - São Paulo'
            },
            {
              id: 'UPLC-002',
              nome: 'UPLC Waters Acquity',
              tipo: 'UPLC',
              status: 'manutencao',
              proximaManutencao: null,
              ultimaCalibracao: new Date(2025, 1, 10).toISOString(),
              responsavel: 'Lab Satélite - Rio de Janeiro'
            }
          ]);
          setIsLoading(false);
          toast({
            title: "Aviso",
            description: "Usando dados de demonstração",
            variant: "default"
          });
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [toast]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'disponivel': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Disponível</Badge>,
      'em_uso': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em uso</Badge>,
      'manutencao': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Em manutenção</Badge>,
      'indisponivel': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Indisponível</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (dataString: string | null) => {
    if (!dataString) return 'N/A';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Equipamentos</h1>
            <p className="text-gray-500 mt-1">Controle e monitoramento de equipamentos laboratoriais</p>
          </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setLocation('/researcher/laboratorio/agendamentos')}>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Uso
              </Button>
              <Button variant="outline" onClick={() => setLocation('/researcher/laboratorio')}>
                <ChevronRight className="h-4 w-4 mr-2" />
                Voltar para Laboratório
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Lista de Equipamentos</CardTitle>
              <CardDescription>
                Equipamentos disponíveis para análises e pesquisas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative max-w-md mb-4">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input 
                  placeholder="Buscar equipamentos..." 
                  className="pl-10" 
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : equipamentos.length > 0 ? (
                <div className="space-y-4">
                  {equipamentos
                    .filter(equip => 
                      filtro === '' || 
                      equip.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                      equip.id.toLowerCase().includes(filtro.toLowerCase()) ||
                      equip.tipo.toLowerCase().includes(filtro.toLowerCase())
                    )
                    .map((equip) => (
                      <div 
                        key={equip.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/researcher/laboratorio/equipamentos/${equip.id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900 flex items-center">
                              {equip.nome}
                              {equip.status === 'manutencao' && (
                                <AlertCircle className="h-4 w-4 text-amber-500 ml-2" />
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                              {equip.id} • {equip.tipo}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            {getStatusBadge(equip.status)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-3 text-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center text-blue-600">
                              <User className="h-4 w-4 mr-1" />
                              <span className="truncate max-w-[200px]">{equip.responsavel}</span>
                            </div>
                            <div className="flex items-center text-green-600">
                              <CalendarCheck className="h-4 w-4 mr-1" />
                              <span>Calibrado: {formatarData(equip.ultimaCalibracao)}</span>
                            </div>
                            {equip.proximaManutencao && (
                              <div className="flex items-center text-amber-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Próx. manutenção: {formatarData(equip.proximaManutencao)}</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Microscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-700 font-medium mb-1">Nenhum equipamento encontrado</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Não existem equipamentos cadastrados ou disponíveis no momento
                  </p>
                  <Button variant="outline" onClick={() => setLocation('/researcher/laboratorio')}>
                    Voltar para Laboratório
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}