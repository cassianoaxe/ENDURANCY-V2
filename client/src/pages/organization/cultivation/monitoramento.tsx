import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Thermometer, 
  Droplet, 
  Sun, 
  Wind, 
  AlertTriangle, 
  BarChart2, 
  RefreshCw,
  Power,
  Eye,
  Settings,
  Clock,
  Plus,
  ToggleLeft,
  ToggleRight,
  History,
  Leaf,
  Layers,
  Info
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const MonitoramentoPage = () => {
  const [selectedAmbiente, setSelectedAmbiente] = useState('todos');
  const [luzes1Ligadas, setLuzes1Ligadas] = useState(true);
  const [luzes2Ligadas, setLuzes2Ligadas] = useState(true);
  const [irrigacao1Ligada, setIrrigacao1Ligada] = useState(false);
  const [ventilacao1Ligada, setVentilacao1Ligada] = useState(true);
  const [humidificador1Ligado, setHumidificador1Ligado] = useState(false);
  
  // Dados do ambiente que seriam obtidos de sensores reais conectados
  const dadosAmbiente = {
    temperatura: 24.5,
    umidade: 65,
    luminosidade: 18500, // em lux
    co2: 825, // em ppm
    ph: 6.4, // para sistemas hidropônicos/solução nutritiva
    umidadeSolo: 78 // %
  };
  
  // Histórico de leituras para os gráficos (simulado)
  const historicoLeituras = [
    { hora: '00:00', temperatura: 22.1, umidade: 67 },
    { hora: '04:00', temperatura: 21.5, umidade: 68 },
    { hora: '08:00', temperatura: 23.2, umidade: 66 },
    { hora: '12:00', temperatura: 25.8, umidade: 63 },
    { hora: '16:00', temperatura: 24.9, umidade: 64 },
    { hora: '20:00', temperatura: 24.5, umidade: 65 }
  ];
  
  // Alertas ativos
  const alertas = [
    { 
      id: 1, 
      tipo: 'aviso', 
      mensagem: 'Umidade abaixo do ideal na Sala de Vegetação B', 
      horario: '14:35', 
      resolvido: false 
    },
    { 
      id: 2, 
      tipo: 'crítico', 
      mensagem: 'Temperatura acima do limite na Sala de Floração A', 
      horario: '13:22', 
      resolvido: false 
    },
    { 
      id: 3, 
      tipo: 'informativo', 
      mensagem: 'Manutenção do sistema de irrigação programada para amanhã', 
      horario: '09:15', 
      resolvido: true 
    }
  ];
  
  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Monitoramento e Automação</h1>
            <p className="text-gray-600 mt-1">Controle e monitoramento das condições ambientais de cultivo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <a href="/organization/cultivation" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Voltar</span>
              </a>
            </Button>
            <Button className="gap-1">
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar Dados</span>
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-700 font-medium">2 alertas ativos requerem sua atenção</span>
          </div>
          <Button variant="outline" className="bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-100">
            Ver Alertas
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="controles">Controles</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="ambiente-select">Ambiente:</Label>
              <select 
                id="ambiente-select"
                className="border rounded-md px-3 py-1 text-sm"
                value={selectedAmbiente}
                onChange={(e) => setSelectedAmbiente(e.target.value)}
              >
                <option value="todos">Todos os Ambientes</option>
                <option value="vegetacao-a">Sala de Vegetação A</option>
                <option value="vegetacao-b">Sala de Vegetação B</option>
                <option value="floracao-a">Sala de Floração A</option>
                <option value="floracao-b">Sala de Floração B</option>
                <option value="secagem">Sala de Secagem</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Última atualização: 30/04/2025 15:42</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    Temperatura
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{dadosAmbiente.temperatura}°C</div>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Faixa ideal: 20°C - 26°C</div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (dadosAmbiente.temperatura / 40) * 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    Umidade do Ar
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{dadosAmbiente.umidade}%</div>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Faixa ideal: 60% - 75%</div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${dadosAmbiente.umidade}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    Luminosidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{dadosAmbiente.luminosidade.toLocaleString()} lux</div>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Fase: Vegetativa</div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-yellow-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (dadosAmbiente.luminosidade / 50000) * 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wind className="h-5 w-5 text-green-600" />
                    CO<sub>2</sub>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{dadosAmbiente.co2} ppm</div>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Faixa ideal: 800 - 1500 ppm</div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (dadosAmbiente.co2 / 1500) * 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Temperatura (24h)</CardTitle>
                  <CardDescription>Variação de temperatura ao longo do dia</CardDescription>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-50 rounded-md border flex items-center justify-center">
                    <BarChart2 className="h-12 w-12 text-gray-300" />
                    <span className="text-gray-400 ml-2">Gráfico de Temperatura</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Equipamentos</CardTitle>
                  <CardDescription>Monitoramento de equipamentos e dispositivos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${luzes1Ligadas ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                          <Sun className={`h-5 w-5 ${luzes1Ligadas ? 'text-yellow-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium">Luzes Vegetação A</p>
                          <p className="text-xs text-gray-500">18 horas/dia (6:00 - 0:00)</p>
                        </div>
                      </div>
                      <Badge className={luzes1Ligadas ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {luzes1Ligadas ? 'Ligado' : 'Desligado'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${ventilacao1Ligada ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Wind className={`h-5 w-5 ${ventilacao1Ligada ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium">Ventilação Vegetação A</p>
                          <p className="text-xs text-gray-500">Sensor de temperatura ativado (&gt;25°C)</p>
                        </div>
                      </div>
                      <Badge className={ventilacao1Ligada ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {ventilacao1Ligada ? 'Ligado' : 'Desligado'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${irrigacao1Ligada ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Droplet className={`h-5 w-5 ${irrigacao1Ligada ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium">Irrigação Vegetação A</p>
                          <p className="text-xs text-gray-500">Programado (07:00, 15:00, 22:00)</p>
                        </div>
                      </div>
                      <Badge className={irrigacao1Ligada ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {irrigacao1Ligada ? 'Ligado' : 'Desligado'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${humidificador1Ligado ? 'bg-cyan-100' : 'bg-gray-100'}`}>
                          <Droplet className={`h-5 w-5 ${humidificador1Ligado ? 'text-cyan-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium">Umidificador Vegetação A</p>
                          <p className="text-xs text-gray-500">Sensor de umidade ativado (&lt;60%)</p>
                        </div>
                      </div>
                      <Badge className={humidificador1Ligado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {humidificador1Ligado ? 'Ligado' : 'Desligado'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* CONTROLES TAB */}
          <TabsContent value="controles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Controle de Iluminação</CardTitle>
                  <CardDescription>Gerenciamento do sistema de iluminação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${luzes1Ligadas ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <Sun className={`h-5 w-5 ${luzes1Ligadas ? 'text-yellow-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium">Luzes Vegetação A</p>
                        <p className="text-xs text-gray-500">Potência: 600W LED</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={luzes1Ligadas ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setLuzes1Ligadas(true)}
                      >
                        On
                      </Button>
                      <Button 
                        variant={!luzes1Ligadas ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLuzes1Ligadas(false)}
                      >
                        Off
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${luzes2Ligadas ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <Sun className={`h-5 w-5 ${luzes2Ligadas ? 'text-yellow-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium">Luzes Floração A</p>
                        <p className="text-xs text-gray-500">Potência: 1000W LED</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={luzes2Ligadas ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setLuzes2Ligadas(true)}
                      >
                        On
                      </Button>
                      <Button 
                        variant={!luzes2Ligadas ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLuzes2Ligadas(false)}
                      >
                        Off
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Programação de Iluminação</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="text-sm font-medium">Vegetação A: 18/6</p>
                          <p className="text-xs text-gray-500">Horário: 06:00 - 00:00</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="text-sm font-medium">Floração A: 12/12</p>
                          <p className="text-xs text-gray-500">Horário: 08:00 - 20:00</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between pt-3">
                  <p className="text-xs text-gray-500">Última modificação: 30/04/2025 13:15</p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Nova Programação
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Controle de Irrigação/Ventilação</CardTitle>
                  <CardDescription>Gerenciamento dos sistemas de irrigação e ventilação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${irrigacao1Ligada ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Droplet className={`h-5 w-5 ${irrigacao1Ligada ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium">Sistema de Irrigação</p>
                        <p className="text-xs text-gray-500">Vegetação A</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={irrigacao1Ligada ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setIrrigacao1Ligada(true)}
                      >
                        On
                      </Button>
                      <Button 
                        variant={!irrigacao1Ligada ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIrrigacao1Ligada(false)}
                      >
                        Off
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${ventilacao1Ligada ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Wind className={`h-5 w-5 ${ventilacao1Ligada ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium">Sistema de Ventilação</p>
                        <p className="text-xs text-gray-500">Vegetação A</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={ventilacao1Ligada ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setVentilacao1Ligada(true)}
                      >
                        On
                      </Button>
                      <Button 
                        variant={!ventilacao1Ligada ? "default" : "outline"}
                        size="sm"
                        onClick={() => setVentilacao1Ligada(false)}
                      >
                        Off
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${humidificador1Ligado ? 'bg-cyan-100' : 'bg-gray-100'}`}>
                        <Droplet className={`h-5 w-5 ${humidificador1Ligado ? 'text-cyan-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium">Umidificador</p>
                        <p className="text-xs text-gray-500">Vegetação A</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={humidificador1Ligado ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setHumidificador1Ligado(true)}
                      >
                        On
                      </Button>
                      <Button 
                        variant={!humidificador1Ligado ? "default" : "outline"}
                        size="sm"
                        onClick={() => setHumidificador1Ligado(false)}
                      >
                        Off
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Automação</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="text-sm font-medium">Irrigação Automática</p>
                          <p className="text-xs text-gray-500">Ativar nos horários: 07:00, 15:00, 22:00</p>
                        </div>
                        <div className="flex gap-1">
                          <Switch checked={true} onCheckedChange={() => {}} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="text-sm font-medium">Ventilação por Temperatura</p>
                          <p className="text-xs text-gray-500">Ativar quando temperatura &gt; 25°C</p>
                        </div>
                        <div className="flex gap-1">
                          <Switch checked={true} onCheckedChange={() => {}} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="text-sm font-medium">Umidificador por Umidade</p>
                          <p className="text-xs text-gray-500">Ativar quando umidade &lt; 60%</p>
                        </div>
                        <div className="flex gap-1">
                          <Switch checked={true} onCheckedChange={() => {}} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between pt-3">
                  <p className="text-xs text-gray-500">Última modificação: 30/04/2025 14:22</p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Nova Automação
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* ALERTAS TAB */}
          <TabsContent value="alertas">
            <Card>
              <CardHeader>
                <CardTitle>Alertas do Sistema</CardTitle>
                <CardDescription>Notificações e alertas de todos os ambientes</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-b">
                  <div className="flex p-4 bg-red-50">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-red-800">Temperatura acima do limite na Sala de Floração A</h3>
                        <Badge className="bg-red-100 text-red-800">Crítico</Badge>
                      </div>
                      <p className="text-sm text-red-700 mt-1">A temperatura atingiu 28.5°C, acima do limite máximo de 26°C configurado para esta sala.</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-red-600">Detectado: hoje às 13:22</span>
                        <div>
                          <Button variant="outline" size="sm" className="h-8 mr-2 border-red-300 text-red-800 hover:bg-red-100">
                            Marcar como Resolvido
                          </Button>
                          <Button size="sm" className="h-8 bg-red-600 hover:bg-red-700">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-b">
                  <div className="flex p-4 bg-yellow-50">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-yellow-800">Umidade abaixo do ideal na Sala de Vegetação B</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">Aviso</Badge>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">A umidade está em 55%, abaixo do ideal de 60% configurado para esta sala.</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-yellow-600">Detectado: hoje às 14:35</span>
                        <div>
                          <Button variant="outline" size="sm" className="h-8 mr-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                            Marcar como Resolvido
                          </Button>
                          <Button size="sm" className="h-8 bg-yellow-600 hover:bg-yellow-700">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-b">
                  <div className="flex p-4 bg-blue-50">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-blue-800">Manutenção do sistema de irrigação programada para amanhã</h3>
                        <Badge className="bg-blue-100 text-blue-800">Informativo</Badge>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">A manutenção preventiva do sistema de irrigação está programada para amanhã às 10:00.</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-blue-600">Enviado: hoje às 09:15</span>
                        <div>
                          <Button variant="outline" size="sm" className="h-8 mr-2 border-blue-300 text-blue-800 hover:bg-blue-100">
                            Dispensar
                          </Button>
                          <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-between pt-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Badge className="mr-2 bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">Todos</Badge>
                  <Badge className="mr-2 bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer">Críticos (1)</Badge>
                  <Badge className="mr-2 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 cursor-pointer">Avisos (1)</Badge>
                  <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer">Informativos (1)</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  Histórico de Alertas
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* HISTÓRICO TAB */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Leituras</CardTitle>
                <CardDescription>Dados históricos dos sensores por período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <Label htmlFor="data-inicial" className="block text-sm mb-1">Data Inicial</Label>
                      <Input type="date" id="data-inicial" defaultValue="2025-04-29" className="w-40" />
                    </div>
                    <div>
                      <Label htmlFor="data-final" className="block text-sm mb-1">Data Final</Label>
                      <Input type="date" id="data-final" defaultValue="2025-04-30" className="w-40" />
                    </div>
                    <div>
                      <Label htmlFor="sensor-tipo" className="block text-sm mb-1">Tipo de Sensor</Label>
                      <select id="sensor-tipo" className="border rounded-md px-3 py-1 text-sm w-40">
                        <option value="temperatura">Temperatura</option>
                        <option value="umidade">Umidade</option>
                        <option value="luminosidade">Luminosidade</option>
                        <option value="co2">CO2</option>
                      </select>
                    </div>
                  </div>
                  <Button>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Atualizar Dados
                  </Button>
                </div>
                
                <div className="h-80 bg-gray-50 rounded-md border flex items-center justify-center mt-4">
                  <BarChart2 className="h-12 w-12 text-gray-300" />
                  <span className="text-gray-400 ml-2">Gráfico de Histórico</span>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-base font-medium mb-3">Leituras Recentes</h3>
                  <div className="relative overflow-x-auto rounded-md border">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">Data/Hora</th>
                          <th scope="col" className="px-6 py-3">Temperatura</th>
                          <th scope="col" className="px-6 py-3">Umidade</th>
                          <th scope="col" className="px-6 py-3">Luminosidade</th>
                          <th scope="col" className="px-6 py-3">CO2</th>
                          <th scope="col" className="px-6 py-3">Ambiente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicoLeituras.map((leitura, index) => (
                          <tr key={index} className="bg-white border-b">
                            <td className="px-6 py-4">30/04/2025 {leitura.hora}</td>
                            <td className="px-6 py-4">{leitura.temperatura}°C</td>
                            <td className="px-6 py-4">{leitura.umidade}%</td>
                            <td className="px-6 py-4">18,300 lux</td>
                            <td className="px-6 py-4">820 ppm</td>
                            <td className="px-6 py-4">Vegetação A</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">Mostrando 6 de 168 registros</p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" disabled>Anterior</Button>
                      <Button variant="outline" size="sm">Próximo</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* CONFIGURAÇÕES TAB */}
          <TabsContent value="configuracoes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Ambientes</CardTitle>
                  <CardDescription>Gestão dos ambientes monitorados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sala de Vegetação A</p>
                        <p className="text-xs text-gray-500">Fase: Vegetativa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sala de Vegetação B</p>
                        <p className="text-xs text-gray-500">Fase: Vegetativa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sala de Floração A</p>
                        <p className="text-xs text-gray-500">Fase: Floração</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sala de Floração B</p>
                        <p className="text-xs text-gray-500">Fase: Floração</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between pt-3">
                  <p className="text-xs text-gray-500">4 ambientes configurados</p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Ambiente
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Alertas</CardTitle>
                  <CardDescription>Personalização de limites e notificações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border p-3 rounded-md">
                    <h3 className="font-medium mb-2">Temperatura</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Alerta de temperatura alta</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" className="w-20" defaultValue="26" />
                          <span>°C</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Alerta de temperatura baixa</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" className="w-20" defaultValue="18" />
                          <span>°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border p-3 rounded-md">
                    <h3 className="font-medium mb-2">Umidade</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Alerta de umidade alta</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" className="w-20" defaultValue="75" />
                          <span>%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Alerta de umidade baixa</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" className="w-20" defaultValue="60" />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border p-3 rounded-md">
                    <h3 className="font-medium mb-2">Métodos de Notificação</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch id="email-notifications" checked={true} onCheckedChange={() => {}} />
                          <Label htmlFor="email-notifications">Notificações por e-mail</Label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch id="sms-notifications" checked={false} onCheckedChange={() => {}} />
                          <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch id="system-notifications" checked={true} onCheckedChange={() => {}} />
                          <Label htmlFor="system-notifications">Notificações no sistema</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t pt-3">
                  <Button className="ml-auto">Salvar Configurações</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(MonitoramentoPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});