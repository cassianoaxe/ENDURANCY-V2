"use client";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Check, 
  Info, 
  AlertCircle,
  RotateCw, 
  MessageCircle,
  Users,
  User,
  Settings,
  Bell,
  Lock,
  Copy,
  CheckCircle2,
  ExternalLink,
  Mail
} from "lucide-react";

export default function ComplyChatIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("geral");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    apiKey: "chat_complypay_xxxx_2023402340982340983240",
    webhook: "https://endurancy25.replit.app/api/webhooks/complychat",
    notificacaoEmail: true,
    notificacaoPush: true,
    notificacaoBrowser: true,
    atendimentoAutomatico: true,
    chatTriggerTempo: "15", // segundos
    chatTriggerPaginas: "3", // número de páginas
    salvarHistorico: true,
    historicoDias: "90",
    canaisAtivos: {
      site: true,
      whatsapp: false,
      telegram: false,
      facebook: false,
      instagram: false
    },
    departamentos: ["Suporte", "Vendas", "Financeiro"],
    horariosAtendimento: {
      segunda: { inicio: "08:00", fim: "18:00", ativo: true },
      terca: { inicio: "08:00", fim: "18:00", ativo: true },
      quarta: { inicio: "08:00", fim: "18:00", ativo: true },
      quinta: { inicio: "08:00", fim: "18:00", ativo: true },
      sexta: { inicio: "08:00", fim: "18:00", ativo: true },
      sabado: { inicio: "09:00", fim: "13:00", ativo: true },
      domingo: { inicio: "00:00", fim: "00:00", ativo: false }
    },
    equipeOnline: 3,
    equipeTotal: 5,
    chatbotAtivo: true,
    chatbotNome: "Assistente Virtual",
    chatbotAvatar: "https://ui-avatars.com/api/?name=Assistente+Virtual&background=0062ff&color=fff"
  });
  
  // Atendentes
  const [atendentes, setAtendentes] = useState([
    { id: 1, nome: "Ana Silva", email: "ana.silva@empresa.com", departamento: "Suporte", status: "online", avatar: "" },
    { id: 2, nome: "Carlos Santos", email: "carlos.santos@empresa.com", departamento: "Vendas", status: "online", avatar: "" },
    { id: 3, nome: "Juliana Mendes", email: "juliana.mendes@empresa.com", departamento: "Financeiro", status: "online", avatar: "" },
    { id: 4, nome: "Roberto Oliveira", email: "roberto.oliveira@empresa.com", departamento: "Suporte", status: "offline", avatar: "" },
    { id: 5, nome: "Patrícia Lima", email: "patricia.lima@empresa.com", departamento: "Vendas", status: "offline", avatar: "" }
  ]);
  
  // Estatísticas
  const [estatisticas, setEstatisticas] = useState({
    conversasHoje: 12,
    conversasSemana: 87,
    tempoMedioResposta: "2m 35s",
    satisfacaoCliente: "92%",
    taxaConversao: "23%"
  });
  
  // Função para copiar API Key
  const copyApiKey = () => {
    navigator.clipboard.writeText(configData.apiKey);
    setCopied(true);
    
    toast({
      title: "Chave de API copiada",
      description: "A chave de API foi copiada para a área de transferência."
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Função para salvar configurações
  const saveConfig = () => {
    setIsSaving(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da integração foram atualizadas com sucesso."
      });
    }, 1500);
  };
  
  // Função para desativar a integração
  const deactivateIntegration = () => {
    if (confirm("Tem certeza que deseja desativar esta integração? Seus clientes não poderão mais iniciar conversas por chat.")) {
      setIsDeactivating(true);
      
      // Simulando um atraso na API
      setTimeout(() => {
        setIsDeactivating(false);
        
        toast({
          title: "Integração desativada",
          description: "A integração com COMPLYCHAT foi desativada. Você pode reativá-la a qualquer momento."
        });
        
        setTimeout(() => {
          window.location.href = "/organization/integracoes";
        }, 1500);
      }, 2000);
    }
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = "/organization/integracoes"}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h1 className="text-3xl font-bold">COMPLYCHAT</h1>
        <Badge className="bg-green-100 text-green-800">
          Ativa
        </Badge>
      </div>
      <p className="text-muted-foreground">Integração com canal de chat para comunicação interna e externa</p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="w-full md:w-2/3">
          <CardHeader className="pb-3">
            <div className="flex justify-between">
              <div>
                <CardTitle>Dashboard de Comunicação</CardTitle>
                <CardDescription>
                  Visão geral das estatísticas e atividades de chat
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="gap-1" 
                onClick={() => window.open("https://chat.complypay.com", "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Acessar Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-1">Conversas Hoje</h3>
                  <p className="text-2xl font-bold text-blue-900">{estatisticas.conversasHoje}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-1">Tempo Médio de Resposta</h3>
                  <p className="text-2xl font-bold text-green-900">{estatisticas.tempoMedioResposta}</p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-800 mb-1">Satisfação do Cliente</h3>
                  <p className="text-2xl font-bold text-purple-900">{estatisticas.satisfacaoCliente}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="font-medium">Equipe de Atendimento</h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {atendentes.slice(0, 3).map(atendente => (
                    <div key={atendente.id} className="flex items-center gap-3 p-2 border rounded-md">
                      <Avatar>
                        <AvatarImage src={atendente.avatar} alt={atendente.nome} />
                        <AvatarFallback>{atendente.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{atendente.nome}</p>
                        <div className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${atendente.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <p className="text-xs text-muted-foreground">{atendente.departamento}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-3">
            <CardTitle>Detalhes da Integração</CardTitle>
            <CardDescription>
              Informações e chaves da API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Chave da API</Label>
                <div className="flex">
                  <Input
                    type="password"
                    value={configData.apiKey}
                    readOnly
                    className="font-mono text-xs rounded-r-none"
                  />
                  <Button 
                    variant="outline" 
                    className="rounded-l-none border-l-0" 
                    onClick={copyApiKey}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta chave é necessária para autenticar solicitações do chat
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={configData.webhook}
                  readOnly
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  URL para receber notificações de eventos do chat
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Status do Serviço</Label>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
                  <span className="text-sm">Operacional</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Canais Ativos</Label>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="bg-blue-50">Website</Badge>
                  {configData.canaisAtivos.whatsapp && <Badge variant="outline" className="bg-green-50">WhatsApp</Badge>}
                  {configData.canaisAtivos.telegram && <Badge variant="outline" className="bg-blue-50">Telegram</Badge>}
                  {configData.canaisAtivos.facebook && <Badge variant="outline" className="bg-blue-50">Facebook</Badge>}
                  {configData.canaisAtivos.instagram && <Badge variant="outline" className="bg-purple-50">Instagram</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="geral">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as principais funcionalidades do chat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="atendimento-automatico">Comportamento do Chat</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="atendimento-automatico" 
                          checked={configData.atendimentoAutomatico}
                          onCheckedChange={(checked) => 
                            setConfigData({...configData, atendimentoAutomatico: checked as boolean})
                          }
                        />
                        <label
                          htmlFor="atendimento-automatico"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Oferecer atendimento automaticamente
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="salvar-historico" 
                          checked={configData.salvarHistorico}
                          onCheckedChange={(checked) => 
                            setConfigData({...configData, salvarHistorico: checked as boolean})
                          }
                        />
                        <label
                          htmlFor="salvar-historico"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Salvar histórico de conversas
                        </label>
                      </div>
                      
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="historico-dias">Manter histórico por (dias)</Label>
                        <Input 
                          id="historico-dias" 
                          type="number" 
                          min="1" 
                          max="365" 
                          value={configData.historicoDias}
                          onChange={(e) => setConfigData({...configData, historicoDias: e.target.value})}
                          disabled={!configData.salvarHistorico}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Canais de Atendimento</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="canal-site" 
                          checked={configData.canaisAtivos.site}
                          onCheckedChange={(checked) => 
                            setConfigData({
                              ...configData, 
                              canaisAtivos: {
                                ...configData.canaisAtivos,
                                site: checked as boolean
                              }
                            })
                          }
                        />
                        <label
                          htmlFor="canal-site"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Website (Widget de Chat)
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="canal-whatsapp" 
                          checked={configData.canaisAtivos.whatsapp}
                          onCheckedChange={(checked) => 
                            setConfigData({
                              ...configData, 
                              canaisAtivos: {
                                ...configData.canaisAtivos,
                                whatsapp: checked as boolean
                              }
                            })
                          }
                        />
                        <label
                          htmlFor="canal-whatsapp"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          WhatsApp Business API
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="canal-facebook" 
                          checked={configData.canaisAtivos.facebook}
                          onCheckedChange={(checked) => 
                            setConfigData({
                              ...configData, 
                              canaisAtivos: {
                                ...configData.canaisAtivos,
                                facebook: checked as boolean
                              }
                            })
                          }
                        />
                        <label
                          htmlFor="canal-facebook"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Facebook Messenger
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="canal-instagram" 
                          checked={configData.canaisAtivos.instagram}
                          onCheckedChange={(checked) => 
                            setConfigData({
                              ...configData, 
                              canaisAtivos: {
                                ...configData.canaisAtivos,
                                instagram: checked as boolean
                              }
                            })
                          }
                        />
                        <label
                          htmlFor="canal-instagram"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Instagram Direct
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-md font-medium">Horários de Atendimento</h3>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Segunda-feira</h4>
                        <Switch 
                          checked={configData.horariosAtendimento.segunda.ativo}
                          onCheckedChange={(checked) => 
                            setConfigData({
                              ...configData, 
                              horariosAtendimento: {
                                ...configData.horariosAtendimento,
                                segunda: {
                                  ...configData.horariosAtendimento.segunda,
                                  ativo: checked
                                }
                              }
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="segunda-inicio" className="text-xs">Início</Label>
                          <Input 
                            id="segunda-inicio" 
                            type="time" 
                            value={configData.horariosAtendimento.segunda.inicio}
                            onChange={(e) => 
                              setConfigData({
                                ...configData, 
                                horariosAtendimento: {
                                  ...configData.horariosAtendimento,
                                  segunda: {
                                    ...configData.horariosAtendimento.segunda,
                                    inicio: e.target.value
                                  }
                                }
                              })
                            }
                            disabled={!configData.horariosAtendimento.segunda.ativo}
                          />
                        </div>
                        <div>
                          <Label htmlFor="segunda-fim" className="text-xs">Fim</Label>
                          <Input 
                            id="segunda-fim" 
                            type="time" 
                            value={configData.horariosAtendimento.segunda.fim}
                            onChange={(e) => 
                              setConfigData({
                                ...configData, 
                                horariosAtendimento: {
                                  ...configData.horariosAtendimento,
                                  segunda: {
                                    ...configData.horariosAtendimento.segunda,
                                    fim: e.target.value
                                  }
                                }
                              })
                            }
                            disabled={!configData.horariosAtendimento.segunda.ativo}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Terça-feira</h4>
                        <Switch 
                          checked={configData.horariosAtendimento.terca.ativo}
                          onCheckedChange={(checked) => 
                            setConfigData({
                              ...configData, 
                              horariosAtendimento: {
                                ...configData.horariosAtendimento,
                                terca: {
                                  ...configData.horariosAtendimento.terca,
                                  ativo: checked
                                }
                              }
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="terca-inicio" className="text-xs">Início</Label>
                          <Input 
                            id="terca-inicio" 
                            type="time" 
                            value={configData.horariosAtendimento.terca.inicio}
                            onChange={(e) => 
                              setConfigData({
                                ...configData, 
                                horariosAtendimento: {
                                  ...configData.horariosAtendimento,
                                  terca: {
                                    ...configData.horariosAtendimento.terca,
                                    inicio: e.target.value
                                  }
                                }
                              })
                            }
                            disabled={!configData.horariosAtendimento.terca.ativo}
                          />
                        </div>
                        <div>
                          <Label htmlFor="terca-fim" className="text-xs">Fim</Label>
                          <Input 
                            id="terca-fim" 
                            type="time" 
                            value={configData.horariosAtendimento.terca.fim}
                            onChange={(e) => 
                              setConfigData({
                                ...configData, 
                                horariosAtendimento: {
                                  ...configData.horariosAtendimento,
                                  terca: {
                                    ...configData.horariosAtendimento.terca,
                                    fim: e.target.value
                                  }
                                }
                              })
                            }
                            disabled={!configData.horariosAtendimento.terca.ativo}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Sábado</h4>
                        <Switch 
                          checked={configData.horariosAtendimento.sabado.ativo}
                          onCheckedChange={(checked) => 
                            setConfigData({
                              ...configData, 
                              horariosAtendimento: {
                                ...configData.horariosAtendimento,
                                sabado: {
                                  ...configData.horariosAtendimento.sabado,
                                  ativo: checked
                                }
                              }
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="sabado-inicio" className="text-xs">Início</Label>
                          <Input 
                            id="sabado-inicio" 
                            type="time" 
                            value={configData.horariosAtendimento.sabado.inicio}
                            onChange={(e) => 
                              setConfigData({
                                ...configData, 
                                horariosAtendimento: {
                                  ...configData.horariosAtendimento,
                                  sabado: {
                                    ...configData.horariosAtendimento.sabado,
                                    inicio: e.target.value
                                  }
                                }
                              })
                            }
                            disabled={!configData.horariosAtendimento.sabado.ativo}
                          />
                        </div>
                        <div>
                          <Label htmlFor="sabado-fim" className="text-xs">Fim</Label>
                          <Input 
                            id="sabado-fim" 
                            type="time" 
                            value={configData.horariosAtendimento.sabado.fim}
                            onChange={(e) => 
                              setConfigData({
                                ...configData, 
                                horariosAtendimento: {
                                  ...configData.horariosAtendimento,
                                  sabado: {
                                    ...configData.horariosAtendimento.sabado,
                                    fim: e.target.value
                                  }
                                }
                              })
                            }
                            disabled={!configData.horariosAtendimento.sabado.ativo}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Domingo</h4>
                        <Switch 
                          checked={configData.horariosAtendimento.domingo.ativo}
                          onCheckedChange={(checked) => 
                            setConfigData({
                              ...configData, 
                              horariosAtendimento: {
                                ...configData.horariosAtendimento,
                                domingo: {
                                  ...configData.horariosAtendimento.domingo,
                                  ativo: checked
                                }
                              }
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="domingo-inicio" className="text-xs">Início</Label>
                          <Input 
                            id="domingo-inicio" 
                            type="time" 
                            value={configData.horariosAtendimento.domingo.inicio}
                            onChange={(e) => 
                              setConfigData({
                                ...configData, 
                                horariosAtendimento: {
                                  ...configData.horariosAtendimento,
                                  domingo: {
                                    ...configData.horariosAtendimento.domingo,
                                    inicio: e.target.value
                                  }
                                }
                              })
                            }
                            disabled={!configData.horariosAtendimento.domingo.ativo}
                          />
                        </div>
                        <div>
                          <Label htmlFor="domingo-fim" className="text-xs">Fim</Label>
                          <Input 
                            id="domingo-fim" 
                            type="time" 
                            value={configData.horariosAtendimento.domingo.fim}
                            onChange={(e) => 
                              setConfigData({
                                ...configData, 
                                horariosAtendimento: {
                                  ...configData.horariosAtendimento,
                                  domingo: {
                                    ...configData.horariosAtendimento.domingo,
                                    fim: e.target.value
                                  }
                                }
                              })
                            }
                            disabled={!configData.horariosAtendimento.domingo.ativo}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-md font-medium">Gatilhos de Chat</h3>
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Gatilhos Automáticos</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Configure quando o chat deve ser oferecido automaticamente aos visitantes do seu site.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="chat-trigger-tempo">Tempo na página (segundos)</Label>
                      <Input 
                        id="chat-trigger-tempo" 
                        type="number" 
                        min="5" 
                        max="300" 
                        value={configData.chatTriggerTempo}
                        onChange={(e) => setConfigData({...configData, chatTriggerTempo: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Oferecer chat após este tempo de permanência
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="chat-trigger-paginas">Número de páginas visitadas</Label>
                      <Input 
                        id="chat-trigger-paginas" 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={configData.chatTriggerPaginas}
                        onChange={(e) => setConfigData({...configData, chatTriggerPaginas: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Oferecer chat após este número de páginas visitadas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.href = "/organization/integracoes"}>
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={deactivateIntegration} 
                  disabled={isDeactivating}
                >
                  {isDeactivating ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Desativando...
                    </>
                  ) : (
                    "Desativar"
                  )}
                </Button>
                <Button onClick={saveConfig} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Configurações"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="equipe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Equipe</CardTitle>
              <CardDescription>
                Configure os atendentes e departamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium">Atendentes ({atendentes.length})</h3>
                  <Button className="gap-1">
                    <User className="h-4 w-4" />
                    Adicionar Atendente
                  </Button>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-left p-3 font-medium">Departamento</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atendentes.map((atendente, index) => (
                        <tr key={atendente.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={atendente.avatar} alt={atendente.nome} />
                                <AvatarFallback className="text-xs">{atendente.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{atendente.nome}</p>
                                <p className="text-xs text-muted-foreground">{atendente.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{atendente.departamento}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={atendente.status === 'online' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {atendente.status === 'online' ? 'Online' : 'Offline'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium">Departamentos</h3>
                    <Button variant="outline" className="gap-1">
                      <Users className="h-4 w-4" />
                      Adicionar Departamento
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {configData.departamentos.map((depto, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{depto}</h4>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {atendentes.filter(a => a.departamento === depto).length} atendentes
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure como as notificações serão enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Sobre as Notificações</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Configure como você e sua equipe serão notificados sobre novas conversas e mensagens.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Canais de Notificação</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2 items-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">Email</h4>
                        </div>
                        <Switch 
                          checked={configData.notificacaoEmail}
                          onCheckedChange={(checked) => 
                            setConfigData({...configData, notificacaoEmail: checked})
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enviar notificações por email para a equipe
                      </p>
                      {configData.notificacaoEmail && (
                        <div className="space-y-3 mt-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="email-new-conversation" defaultChecked />
                            <label className="text-sm" htmlFor="email-new-conversation">Nova conversa</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="email-new-message" defaultChecked />
                            <label className="text-sm" htmlFor="email-new-message">Nova mensagem</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="email-missed" defaultChecked />
                            <label className="text-sm" htmlFor="email-missed">Conversa perdida</label>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2 items-center">
                          <Bell className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">Push</h4>
                        </div>
                        <Switch 
                          checked={configData.notificacaoPush}
                          onCheckedChange={(checked) => 
                            setConfigData({...configData, notificacaoPush: checked})
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enviar notificações push para dispositivos móveis
                      </p>
                      {configData.notificacaoPush && (
                        <div className="space-y-3 mt-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="push-new-conversation" defaultChecked />
                            <label className="text-sm" htmlFor="push-new-conversation">Nova conversa</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="push-new-message" defaultChecked />
                            <label className="text-sm" htmlFor="push-new-message">Nova mensagem</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="push-missed" defaultChecked />
                            <label className="text-sm" htmlFor="push-missed">Conversa perdida</label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Notificações para Clientes</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-chat-start" defaultChecked />
                      <label className="text-sm" htmlFor="notify-chat-start">
                        Notificar quando um atendente iniciar a conversa
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-chat-end" defaultChecked />
                      <label className="text-sm" htmlFor="notify-chat-end">
                        Enviar transcrição do chat por email ao finalizar conversa
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-satisfaction" defaultChecked />
                      <label className="text-sm" htmlFor="notify-satisfaction">
                        Solicitar avaliação de satisfação ao finalizar conversa
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="chatbot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Chatbot</CardTitle>
              <CardDescription>
                Configure o assistente virtual para atendimento automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <h3 className="text-md font-medium">Assistente Virtual</h3>
                    <Badge className={configData.chatbotAtivo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {configData.chatbotAtivo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <Switch 
                    checked={configData.chatbotAtivo}
                    onCheckedChange={(checked) => 
                      setConfigData({...configData, chatbotAtivo: checked})
                    }
                  />
                </div>
                
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Pré-atendimento Automatizado</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    O chatbot irá atender os clientes inicialmente, coletando informações básicas antes de transferir para um atendente humano.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="chatbot-nome">Nome do Assistente</Label>
                    <Input 
                      id="chatbot-nome" 
                      value={configData.chatbotNome}
                      onChange={(e) => setConfigData({...configData, chatbotNome: e.target.value})}
                      disabled={!configData.chatbotAtivo}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="chatbot-avatar">Avatar (URL da imagem)</Label>
                    <Input 
                      id="chatbot-avatar" 
                      value={configData.chatbotAvatar}
                      onChange={(e) => setConfigData({...configData, chatbotAvatar: e.target.value})}
                      disabled={!configData.chatbotAtivo}
                    />
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Mensagens Automatizadas</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                      <textarea 
                        id="welcome-message" 
                        rows={3} 
                        className="w-full p-2 rounded-md border" 
                        defaultValue="Olá! Sou o assistente virtual da Empresa XYZ. Como posso ajudá-lo hoje?"
                        disabled={!configData.chatbotAtivo}
                      ></textarea>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="offline-message">Mensagem Fora do Horário</Label>
                      <textarea 
                        id="offline-message" 
                        rows={3} 
                        className="w-full p-2 rounded-md border" 
                        defaultValue="No momento estamos fora do horário de atendimento. Por favor, deixe sua mensagem e entraremos em contato assim que possível."
                        disabled={!configData.chatbotAtivo}
                      ></textarea>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="transfer-message">Mensagem de Transferência</Label>
                      <textarea 
                        id="transfer-message" 
                        rows={3} 
                        className="w-full p-2 rounded-md border" 
                        defaultValue="Estou transferindo você para um de nossos atendentes. Por favor, aguarde um momento."
                        disabled={!configData.chatbotAtivo}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Perguntas Frequentes</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure respostas automáticas para as perguntas mais frequentes dos clientes
                  </p>
                  
                  <div className="space-y-3">
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">O que é o Endurancy?</h4>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Endurancy é uma plataforma completa de gestão para sua organização...
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Como posso contratar um plano?</h4>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Para contratar um plano, acesse nossa página de planos ou entre em contato...
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Horário de atendimento</h4>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Nosso horário de atendimento é de segunda a sexta, das 8h às 18h...
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button variant="outline" className="gap-1 mt-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Adicionar Nova Pergunta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}