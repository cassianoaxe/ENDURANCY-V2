"use client";
import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Info, 
  AlertCircle, 
  RotateCw, 
  MessageSquare,
  Users,
  Bot,
  Plus,
  BarChart,
  FileText,
  Copy,
  Check,
  BellRing,
  Smartphone,
  Zap,
  ExternalLink
} from "lucide-react";

export default function WhatsAppIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("setup");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [qrCodeReady, setQrCodeReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [copied, setCopied] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    telefone: "",
    webhookUrl: "https://endurancy25.replit.app/api/webhooks/whatsapp",
    horarioAtendimento: {
      inicio: "08:00",
      fim: "18:00",
      diasSemana: ["1", "2", "3", "4", "5"] // Dias úteis (segunda a sexta)
    },
    autorespostaForaHorario: true,
    textoForaHorario: "Olá! Obrigado por entrar em contato. Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Retornaremos seu contato no próximo dia útil.",
    respostasAutomaticas: [
      { 
        palavraChave: "preço, valor, custo", 
        resposta: "Olá! Para informações sobre preços, por favor visite nossa página de planos em https://endurancy.com/planos ou envie 'planos' para receber mais detalhes." 
      },
      { 
        palavraChave: "ajuda, suporte", 
        resposta: "Olá! Nossa equipe de suporte está pronta para ajudar. Por favor, descreva seu problema com mais detalhes para que possamos atendê-lo melhor." 
      },
      { 
        palavraChave: "horário, funcionamento", 
        resposta: "Nosso horário de atendimento é de segunda a sexta, das 8h às 18h." 
      }
    ],
    departamentos: ["Atendimento", "Suporte Técnico", "Vendas", "Financeiro"],
    notificarNovoContato: true,
    notificarMensagens: true,
    salvarHistorico: true,
    usarBotWhatsapp: false,
    telefonesAtendentes: [
      { nome: "Carlos Santos", telefone: "+5511999999999", departamento: "Vendas" },
      { nome: "Ana Silva", telefone: "+5511888888888", departamento: "Suporte Técnico" }
    ]
  });
  
  // Função para simular QR Code
  const generateQrCode = () => {
    setConnectionStatus('connecting');
    
    // Simulando um atraso para geração do QR Code
    setTimeout(() => {
      setQrCodeReady(true);
      
      toast({
        title: "QR Code gerado",
        description: "Escaneie o QR Code com seu WhatsApp para conectar."
      });
    }, 2000);
  };
  
  // Função para simular conexão
  const simulateConnection = () => {
    setConnectionStatus('connected');
    
    toast({
      title: "WhatsApp conectado",
      description: "Seu WhatsApp foi conectado com sucesso."
    });
  };
  
  // Função para copiar webhook URL
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(configData.webhookUrl);
    setCopied(true);
    
    toast({
      title: "URL copiada",
      description: "A URL do webhook foi copiada para a área de transferência."
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Função para adicionar resposta automática
  const addAutoResponse = () => {
    const newResponse = { palavraChave: "", resposta: "" };
    setConfigData({
      ...configData,
      respostasAutomaticas: [...configData.respostasAutomaticas, newResponse]
    });
  };
  
  // Função para atualizar resposta automática
  const updateAutoResponse = (index: number, field: 'palavraChave' | 'resposta', value: string) => {
    const updatedResponses = [...configData.respostasAutomaticas];
    updatedResponses[index][field] = value;
    
    setConfigData({
      ...configData,
      respostasAutomaticas: updatedResponses
    });
  };
  
  // Função para remover resposta automática
  const removeAutoResponse = (index: number) => {
    const updatedResponses = configData.respostasAutomaticas.filter((_, i) => i !== index);
    
    setConfigData({
      ...configData,
      respostasAutomaticas: updatedResponses
    });
  };
  
  // Função para adicionar atendente
  const addAttendant = () => {
    const newAttendant = { nome: "", telefone: "", departamento: configData.departamentos[0] || "" };
    setConfigData({
      ...configData,
      telefonesAtendentes: [...configData.telefonesAtendentes, newAttendant]
    });
  };
  
  // Função para atualizar atendente
  const updateAttendant = (index: number, field: 'nome' | 'telefone' | 'departamento', value: string) => {
    const updatedAttendants = [...configData.telefonesAtendentes];
    updatedAttendants[index][field] = value;
    
    setConfigData({
      ...configData,
      telefonesAtendentes: updatedAttendants
    });
  };
  
  // Função para remover atendente
  const removeAttendant = (index: number) => {
    const updatedAttendants = configData.telefonesAtendentes.filter((_, i) => i !== index);
    
    setConfigData({
      ...configData,
      telefonesAtendentes: updatedAttendants
    });
  };
  
  // Função para adicionar departamento
  const addDepartment = () => {
    setConfigData({
      ...configData,
      departamentos: [...configData.departamentos, "Novo Departamento"]
    });
  };
  
  // Função para atualizar departamento
  const updateDepartment = (index: number, value: string) => {
    const updatedDepartments = [...configData.departamentos];
    updatedDepartments[index] = value;
    
    setConfigData({
      ...configData,
      departamentos: updatedDepartments
    });
  };
  
  // Função para remover departamento
  const removeDepartment = (index: number) => {
    const updatedDepartments = configData.departamentos.filter((_, i) => i !== index);
    
    setConfigData({
      ...configData,
      departamentos: updatedDepartments
    });
  };
  
  // Função para salvar configuração
  const saveConfiguration = () => {
    setIsSaving(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram salvas com sucesso."
      });
    }, 1500);
  };
  
  // Função para ativar integração
  const activateIntegration = () => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "WhatsApp não conectado",
        description: "Você precisa conectar seu WhatsApp antes de ativar a integração.",
        variant: "destructive"
      });
      return;
    }
    
    setIsActivating(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsActivating(false);
      
      toast({
        title: "Integração ativada",
        description: "A integração com WhatsApp foi ativada com sucesso."
      });
      
      setTimeout(() => {
        navigate("/organization/integracoes");
      }, 1500);
    }, 2000);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/organization/integracoes")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h1 className="text-3xl font-bold">WHATSAPP</h1>
        <Badge className="bg-gray-100 text-gray-800">
          Inativa
        </Badge>
      </div>
      <p className="text-muted-foreground">Envie mensagens automáticas e notificações para pacientes e clientes</p>
      
      <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="setup">Configuração</TabsTrigger>
          <TabsTrigger value="respostas">Respostas Automáticas</TabsTrigger>
          <TabsTrigger value="atendentes">Atendentes</TabsTrigger>
          <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conexão com WhatsApp</CardTitle>
              <CardDescription>
                Configure a conexão com a API do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-green-50 border-green-200">
                <Zap className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">WhatsApp Business API</AlertTitle>
                <AlertDescription className="text-green-700">
                  <p className="mb-2">Esta integração utiliza a API oficial do WhatsApp Business. Para usar, você precisa:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Ter um smartphone com WhatsApp instalado e funcionando</li>
                    <li>Escanear o QR Code gerado abaixo com seu dispositivo</li>
                    <li>Confirmar a conexão com a Endurancy no seu dispositivo</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-6">
                <div className="flex flex-col items-center justify-center gap-4">
                  <h3 className="font-medium">Status da Conexão</h3>
                  
                  <Badge className={
                    connectionStatus === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : connectionStatus === 'connecting' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }>
                    {connectionStatus === 'connected' 
                      ? 'Conectado' 
                      : connectionStatus === 'connecting' 
                        ? 'Conectando...' 
                        : 'Desconectado'
                    }
                  </Badge>
                  
                  {connectionStatus !== 'connected' && (
                    <>
                      {qrCodeReady ? (
                        <div>
                          <div className="border-4 border-gray-200 rounded-md p-4 bg-white w-64 h-64 flex items-center justify-center">
                            <img 
                              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://endurancy-whatsapp-connection-42adf9" 
                              alt="QR Code para conectar WhatsApp" 
                              className="w-full h-full"
                            />
                          </div>
                          <p className="text-center text-sm mt-2 text-muted-foreground">
                            Escaneie este QR Code com seu WhatsApp
                          </p>
                          <div className="flex justify-center mt-4">
                            <Button 
                              variant="outline" 
                              className="gap-1" 
                              onClick={simulateConnection}
                            >
                              <Smartphone className="h-4 w-4" />
                              Simular Conexão
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-center text-sm text-muted-foreground">
                            Clique no botão abaixo para gerar um QR Code para conexão
                          </p>
                          <Button 
                            className="gap-1"
                            onClick={generateQrCode}
                          >
                            <Zap className="h-4 w-4" />
                            Gerar QR Code
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  
                  {connectionStatus === 'connected' && (
                    <div className="space-y-4 text-center">
                      <div className="flex items-center justify-center">
                        <Check className="h-6 w-6 text-green-600" />
                        <p className="ml-2 font-medium">WhatsApp conectado com sucesso!</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Seu WhatsApp foi conectado com sucesso. Agora você pode configurar as demais opções.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Webhook</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1" 
                      onClick={copyWebhookUrl}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copiado" : "Copiar URL"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Esta URL é usada para receber as mensagens e eventos do WhatsApp
                </p>
                <Input 
                  value={configData.webhookUrl}
                  readOnly
                  className="font-mono text-xs"
                />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Configurações de Atendimento</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="numero-whatsapp">Número de WhatsApp Principal</Label>
                  <Input 
                    id="numero-whatsapp" 
                    placeholder="+5511999999999" 
                    value={configData.telefone}
                    onChange={(e) => setConfigData({...configData, telefone: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Número principal para receber mensagens (com código do país e DDD)
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="horario-inicio">Horário de Início</Label>
                    <Input 
                      id="horario-inicio" 
                      type="time" 
                      value={configData.horarioAtendimento.inicio}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        horarioAtendimento: {
                          ...configData.horarioAtendimento,
                          inicio: e.target.value
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="horario-fim">Horário de Término</Label>
                    <Input 
                      id="horario-fim" 
                      type="time" 
                      value={configData.horarioAtendimento.fim}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        horarioAtendimento: {
                          ...configData.horarioAtendimento,
                          fim: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Dias de Atendimento</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "0", label: "Domingo" },
                      { value: "1", label: "Segunda" },
                      { value: "2", label: "Terça" },
                      { value: "3", label: "Quarta" },
                      { value: "4", label: "Quinta" },
                      { value: "5", label: "Sexta" },
                      { value: "6", label: "Sábado" }
                    ].map(day => (
                      <div 
                        key={day.value} 
                        className={`
                          px-3 py-1 rounded-full text-sm cursor-pointer 
                          ${configData.horarioAtendimento.diasSemana.includes(day.value) 
                            ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }
                        `}
                        onClick={() => {
                          const diasSemana = configData.horarioAtendimento.diasSemana.includes(day.value)
                            ? configData.horarioAtendimento.diasSemana.filter(d => d !== day.value)
                            : [...configData.horarioAtendimento.diasSemana, day.value];
                          
                          setConfigData({
                            ...configData,
                            horarioAtendimento: {
                              ...configData.horarioAtendimento,
                              diasSemana
                            }
                          });
                        }}
                      >
                        {day.label}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoresposta-fora-horario" 
                      checked={configData.autorespostaForaHorario}
                      onCheckedChange={(checked) => 
                        setConfigData({...configData, autorespostaForaHorario: checked as boolean})
                      }
                    />
                    <label
                      htmlFor="autoresposta-fora-horario"
                      className="text-sm font-medium"
                    >
                      Enviar resposta automática fora do horário de atendimento
                    </label>
                  </div>
                  
                  {configData.autorespostaForaHorario && (
                    <Textarea 
                      placeholder="Mensagem para fora do horário de atendimento" 
                      className="mt-2"
                      value={configData.textoForaHorario}
                      onChange={(e) => setConfigData({...configData, textoForaHorario: e.target.value})}
                      rows={4}
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Notificações</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notificar-novo-contato" 
                    checked={configData.notificarNovoContato}
                    onCheckedChange={(checked) => 
                      setConfigData({...configData, notificarNovoContato: checked as boolean})
                    }
                  />
                  <label
                    htmlFor="notificar-novo-contato"
                    className="text-sm font-medium"
                  >
                    Notificar atendentes sobre novos contatos
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notificar-mensagens" 
                    checked={configData.notificarMensagens}
                    onCheckedChange={(checked) => 
                      setConfigData({...configData, notificarMensagens: checked as boolean})
                    }
                  />
                  <label
                    htmlFor="notificar-mensagens"
                    className="text-sm font-medium"
                  >
                    Notificar sobre novas mensagens recebidas
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
                    className="text-sm font-medium"
                  >
                    Salvar histórico de conversas
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/organization/integracoes")}>
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveConfiguration} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
                <Button onClick={() => setActiveTab("respostas")}>
                  Próximo: Respostas Automáticas
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="respostas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Respostas Automáticas</CardTitle>
              <CardDescription>
                Configure mensagens automáticas para palavras-chave
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Como funcionam as respostas automáticas</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Configure palavras-chave que, quando presentes nas mensagens dos clientes, dispararão respostas automáticas. 
                  Separe múltiplas palavras-chave com vírgulas. O sistema irá buscar por qualquer uma das palavras na mensagem.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="usar-bot" 
                    checked={configData.usarBotWhatsapp}
                    onCheckedChange={(checked) => 
                      setConfigData({...configData, usarBotWhatsapp: checked as boolean})
                    }
                  />
                  <label
                    htmlFor="usar-bot"
                    className="text-sm font-medium"
                  >
                    Ativar respostas automáticas (chatbot)
                  </label>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    Respostas Automáticas
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={addAutoResponse}
                    disabled={!configData.usarBotWhatsapp}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Resposta
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {configData.respostasAutomaticas.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhuma resposta automática configurada
                    </div>
                  ) : (
                    configData.respostasAutomaticas.map((resposta, index) => (
                      <div key={index} className="border rounded-md p-4 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`palavra-chave-${index}`}>Palavras-chave (separadas por vírgula)</Label>
                          <Input 
                            id={`palavra-chave-${index}`} 
                            value={resposta.palavraChave}
                            onChange={(e) => updateAutoResponse(index, 'palavraChave', e.target.value)}
                            placeholder="ajuda, suporte, problema"
                            disabled={!configData.usarBotWhatsapp}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`resposta-${index}`}>Resposta automática</Label>
                          <Textarea 
                            id={`resposta-${index}`} 
                            value={resposta.resposta}
                            onChange={(e) => updateAutoResponse(index, 'resposta', e.target.value)}
                            placeholder="Olá! Como posso ajudar?"
                            rows={3}
                            disabled={!configData.usarBotWhatsapp}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeAutoResponse(index)}
                            disabled={!configData.usarBotWhatsapp}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <BellRing className="h-5 w-5 text-blue-600" />
                  Mensagens de Boas-vindas
                </h3>
                
                <div className="space-y-3">
                  <Label htmlFor="mensagem-boas-vindas">Mensagem de boas-vindas para novos contatos</Label>
                  <Textarea 
                    id="mensagem-boas-vindas" 
                    placeholder="Olá! Seja bem-vindo(a) ao atendimento da Empresa XYZ. Como posso ajudar?"
                    rows={3}
                    defaultValue="Olá! Obrigado por entrar em contato com a Endurancy. Como podemos ajudar você hoje?"
                    disabled={!configData.usarBotWhatsapp}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("setup")}>
                Voltar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveConfiguration} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
                <Button onClick={() => setActiveTab("atendentes")}>
                  Próximo: Atendentes
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="atendentes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atendentes</CardTitle>
              <CardDescription>
                Configure os atendentes que receberão as mensagens do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Importante</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Adicione os números de telefone dos atendentes que irão receber as notificações e responder às mensagens.
                  Certifique-se de que os números estejam no formato internacional (ex: +5511999999999).
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Atendentes para WhatsApp
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={addAttendant}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Atendente
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {configData.telefonesAtendentes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum atendente configurado
                    </div>
                  ) : (
                    configData.telefonesAtendentes.map((atendente, index) => (
                      <div key={index} className="border rounded-md p-4 space-y-3">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`atendente-nome-${index}`}>Nome do Atendente</Label>
                            <Input 
                              id={`atendente-nome-${index}`} 
                              value={atendente.nome}
                              onChange={(e) => updateAttendant(index, 'nome', e.target.value)}
                              placeholder="Nome completo"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`atendente-telefone-${index}`}>Número de WhatsApp</Label>
                            <Input 
                              id={`atendente-telefone-${index}`} 
                              value={atendente.telefone}
                              onChange={(e) => updateAttendant(index, 'telefone', e.target.value)}
                              placeholder="+5511999999999"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`atendente-departamento-${index}`}>Departamento</Label>
                          <Select 
                            value={atendente.departamento}
                            onValueChange={(value) => updateAttendant(index, 'departamento', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              {configData.departamentos.map((depto, i) => (
                                <SelectItem key={i} value={depto}>
                                  {depto}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeAttendant(index)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("respostas")}>
                Voltar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveConfiguration} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
                <Button onClick={() => setActiveTab("departamentos")}>
                  Próximo: Departamentos
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="departamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Departamentos</CardTitle>
              <CardDescription>
                Configure os departamentos para encaminhamento de mensagens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-blue-600" />
                    Departamentos
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={addDepartment}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Departamento
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {configData.departamentos.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum departamento configurado
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {configData.departamentos.map((depto, index) => (
                        <div key={index} className="border rounded-md p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <Input 
                              value={depto}
                              onChange={(e) => updateDepartment(index, e.target.value)}
                              className="border-0 p-0 text-sm font-medium bg-transparent"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                              onClick={() => removeDepartment(index)}
                            >
                              &times;
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {configData.telefonesAtendentes.filter(a => a.departamento === depto).length} atendentes
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Relatórios e Estatísticas
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Período de relatórios</p>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo médio de resposta</span>
                      <span className="font-medium">5 minutos</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de resolução</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Satisfação do cliente</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <Progress value={88} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("atendentes")}>
                Voltar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveConfiguration} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
                <Button onClick={activateIntegration} disabled={isActivating}>
                  {isActivating ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Ativando...
                    </>
                  ) : (
                    "Ativar Integração"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://business.whatsapp.com/products/business-platform", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              WhatsApp Business API
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://developers.facebook.com/docs/whatsapp/cloud-api/reference", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Documentação
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}