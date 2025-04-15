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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Check, 
  Info, 
  AlertCircle, 
  Truck,
  RotateCw, 
  ExternalLink,
  Key,
  Package,
  FileText,
  DollarSign,
  Landmark,
  Map,
  Building,
  Upload
} from "lucide-react";

export default function MelhorEnvioIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("setup");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    token: "",
    tokenSandbox: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    ambiente: "sandbox",
    origem: {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: ""
    },
    transportadoras: {
      correios: true,
      jadlog: true,
      azulCargo: false,
      latam: false,
      loggi: false,
      mandae: false,
      buscaRapida: false
    },
    calcularFreteAutomatico: true,
    gerarEtiquetaAutomatica: false,
    servicosCorreios: {
      pac: true,
      sedex: true,
      sedex10: false,
      sedex12: false
    },
    imprimirEtiquetas: "termica", // termica, a4, naoImprimir
    registrarRastreio: true,
    maximoTentativas: "3",
    destinoFreteGratis: [] as string[], // CEPs para frete grátis
    valorMinimoFreteGratis: "200"
  });
  
  // Funções auxiliares
  const handleOrigemChange = (field: string, value: string) => {
    setConfigData({
      ...configData,
      origem: {
        ...configData.origem,
        [field]: value
      }
    });
  };
  
  const handleTransportadoraChange = (transportadora: string, checked: boolean) => {
    setConfigData({
      ...configData,
      transportadoras: {
        ...configData.transportadoras,
        [transportadora]: checked
      }
    });
  };
  
  const handleServicosCorreiosChange = (servico: string, checked: boolean) => {
    setConfigData({
      ...configData,
      servicosCorreios: {
        ...configData.servicosCorreios,
        [servico]: checked
      }
    });
  };
  
  // Função para ativar a integração
  const activateIntegration = () => {
    // Validação básica
    if (!configData.token) {
      toast({
        title: "Token não informado",
        description: "É necessário informar o token de acesso para ativar a integração.",
        variant: "destructive"
      });
      return;
    }
    
    // Validação de endereço
    if (!configData.origem.cep || !configData.origem.rua || !configData.origem.cidade || !configData.origem.estado) {
      toast({
        title: "Endereço incompleto",
        description: "É necessário informar o endereço de origem completo.",
        variant: "destructive"
      });
      return;
    }
    
    setIsActivating(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsActivating(false);
      
      toast({
        title: "Integração ativada com sucesso",
        description: "A integração com o Melhor Envio foi ativada com sucesso!"
      });
      
      // Navegamos de volta à listagem de integrações após a ativação
      setTimeout(() => {
        navigate("/organization/integracoes");
      }, 1500);
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
        description: "As configurações foram salvas com sucesso!"
      });
    }, 1500);
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
        <h1 className="text-3xl font-bold">MELHOR ENVIO</h1>
        <Badge className="bg-gray-100 text-gray-800">
          Inativa
        </Badge>
      </div>
      <p className="text-muted-foreground">Calcule fretes e gerencie envios com as principais transportadoras</p>
      
      <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="setup">Configuração</TabsTrigger>
          <TabsTrigger value="transportadoras">Transportadoras</TabsTrigger>
          <TabsTrigger value="regras">Regras de Envio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Iniciais</CardTitle>
              <CardDescription>
                Configure a integração com o Melhor Envio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Como obter o token de acesso</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p className="mb-2">Para integrar com o Melhor Envio, siga os passos abaixo:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Acesse sua conta no Melhor Envio</li>
                    <li>Vá para Configurações &gt; Tokens</li>
                    <li>Gere um novo token com permissões de Carrinho, Checkout e Etiquetas</li>
                    <li>Copie o token gerado e cole no campo abaixo</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ambiente">Ambiente</Label>
                  <RadioGroup 
                    value={configData.ambiente} 
                    onValueChange={(value) => setConfigData({...configData, ambiente: value})}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sandbox" id="ambiente-sandbox" />
                      <Label htmlFor="ambiente-sandbox">Sandbox (Teste)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="producao" id="ambiente-producao" />
                      <Label htmlFor="ambiente-producao">Produção</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Recomendamos começar com o ambiente de sandbox para testes
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="token">{configData.ambiente === 'sandbox' ? 'Token Sandbox' : 'Token de Produção'}</Label>
                  <div className="relative">
                    <Input 
                      id="token" 
                      type="password"
                      value={configData.ambiente === 'sandbox' ? configData.tokenSandbox : configData.token}
                      onChange={(e) => {
                        if (configData.ambiente === 'sandbox') {
                          setConfigData({...configData, tokenSandbox: e.target.value})
                        } else {
                          setConfigData({...configData, token: e.target.value})
                        }
                      }}
                      placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="font-mono text-xs"
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Token {configData.ambiente === 'sandbox' ? 'de sandbox' : 'de produção'} para autenticação com a API do Melhor Envio
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Endereço de Origem</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input 
                        id="cep" 
                        value={configData.origem.cep}
                        onChange={(e) => handleOrigemChange('cep', e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rua">Rua</Label>
                      <Input 
                        id="rua" 
                        value={configData.origem.rua}
                        onChange={(e) => handleOrigemChange('rua', e.target.value)}
                        placeholder="Nome da rua"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input 
                        id="numero" 
                        value={configData.origem.numero}
                        onChange={(e) => handleOrigemChange('numero', e.target.value)}
                        placeholder="123"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input 
                        id="complemento" 
                        value={configData.origem.complemento}
                        onChange={(e) => handleOrigemChange('complemento', e.target.value)}
                        placeholder="Sala, andar, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input 
                        id="bairro" 
                        value={configData.origem.bairro}
                        onChange={(e) => handleOrigemChange('bairro', e.target.value)}
                        placeholder="Nome do bairro"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input 
                        id="cidade" 
                        value={configData.origem.cidade}
                        onChange={(e) => handleOrigemChange('cidade', e.target.value)}
                        placeholder="Nome da cidade"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select 
                        value={configData.origem.estado}
                        onValueChange={(value) => handleOrigemChange('estado', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Configurações de Etiquetas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="gerar-etiqueta" 
                        checked={configData.gerarEtiquetaAutomatica}
                        onCheckedChange={(checked) => 
                          setConfigData({...configData, gerarEtiquetaAutomatica: checked as boolean})
                        }
                      />
                      <label
                        htmlFor="gerar-etiqueta"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Gerar etiqueta automaticamente após finalização do pedido
                      </label>
                    </div>
                    
                    <div className="ml-6">
                      <Label htmlFor="imprimir-etiquetas" className="text-sm">Formato de impressão</Label>
                      <RadioGroup 
                        value={configData.imprimirEtiquetas} 
                        onValueChange={(value) => setConfigData({...configData, imprimirEtiquetas: value})}
                        className="flex flex-col space-y-1 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="termica" id="imprimir-termica" />
                          <Label htmlFor="imprimir-termica">Impressora térmica</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="a4" id="imprimir-a4" />
                          <Label htmlFor="imprimir-a4">Papel A4</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="naoImprimir" id="nao-imprimir" />
                          <Label htmlFor="nao-imprimir">Não imprimir</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/organization/integracoes")}>
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveConfig} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
                <Button onClick={() => setActiveTab("transportadoras")}>
                  Próximo: Transportadoras
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="transportadoras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transportadoras</CardTitle>
              <CardDescription>
                Selecione quais transportadoras deseja utilizar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Importante</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Selecione apenas as transportadoras que você deseja oferecer aos seus clientes. Você precisa ter contrato com cada uma dessas transportadoras no Melhor Envio.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className={`border rounded-md p-4 ${configData.transportadoras.correios ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="transportadora-correios" 
                        checked={configData.transportadoras.correios}
                        onCheckedChange={(checked) => 
                          handleTransportadoraChange('correios', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="transportadora-correios"
                        className="font-medium"
                      >
                        Correios
                      </label>
                    </div>
                    {configData.transportadoras.correios && (
                      <div className="mt-4 space-y-2 pl-6">
                        <p className="text-sm font-medium mb-1">Serviços:</p>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="servico-pac" 
                            checked={configData.servicosCorreios.pac}
                            onCheckedChange={(checked) => 
                              handleServicosCorreiosChange('pac', checked as boolean)
                            }
                          />
                          <label
                            htmlFor="servico-pac"
                            className="text-sm"
                          >
                            PAC
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="servico-sedex" 
                            checked={configData.servicosCorreios.sedex}
                            onCheckedChange={(checked) => 
                              handleServicosCorreiosChange('sedex', checked as boolean)
                            }
                          />
                          <label
                            htmlFor="servico-sedex"
                            className="text-sm"
                          >
                            SEDEX
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="servico-sedex10" 
                            checked={configData.servicosCorreios.sedex10}
                            onCheckedChange={(checked) => 
                              handleServicosCorreiosChange('sedex10', checked as boolean)
                            }
                          />
                          <label
                            htmlFor="servico-sedex10"
                            className="text-sm"
                          >
                            SEDEX 10
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="servico-sedex12" 
                            checked={configData.servicosCorreios.sedex12}
                            onCheckedChange={(checked) => 
                              handleServicosCorreiosChange('sedex12', checked as boolean)
                            }
                          />
                          <label
                            htmlFor="servico-sedex12"
                            className="text-sm"
                          >
                            SEDEX 12
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`border rounded-md p-4 ${configData.transportadoras.jadlog ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="transportadora-jadlog" 
                        checked={configData.transportadoras.jadlog}
                        onCheckedChange={(checked) => 
                          handleTransportadoraChange('jadlog', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="transportadora-jadlog"
                        className="font-medium"
                      >
                        Jadlog
                      </label>
                    </div>
                    {configData.transportadoras.jadlog && (
                      <div className="mt-4 space-y-2 pl-6">
                        <p className="text-sm text-blue-700">
                          Serviços disponíveis automaticamente ao selecionar a transportadora
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className={`border rounded-md p-4 ${configData.transportadoras.azulCargo ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="transportadora-azul" 
                        checked={configData.transportadoras.azulCargo}
                        onCheckedChange={(checked) => 
                          handleTransportadoraChange('azulCargo', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="transportadora-azul"
                        className="font-medium"
                      >
                        Azul Cargo
                      </label>
                    </div>
                  </div>
                  
                  <div className={`border rounded-md p-4 ${configData.transportadoras.latam ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="transportadora-latam" 
                        checked={configData.transportadoras.latam}
                        onCheckedChange={(checked) => 
                          handleTransportadoraChange('latam', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="transportadora-latam"
                        className="font-medium"
                      >
                        LATAM Cargo
                      </label>
                    </div>
                  </div>
                  
                  <div className={`border rounded-md p-4 ${configData.transportadoras.loggi ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="transportadora-loggi" 
                        checked={configData.transportadoras.loggi}
                        onCheckedChange={(checked) => 
                          handleTransportadoraChange('loggi', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="transportadora-loggi"
                        className="font-medium"
                      >
                        Loggi
                      </label>
                    </div>
                  </div>
                  
                  <div className={`border rounded-md p-4 ${configData.transportadoras.mandae ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="transportadora-mandae" 
                        checked={configData.transportadoras.mandae}
                        onCheckedChange={(checked) => 
                          handleTransportadoraChange('mandae', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="transportadora-mandae"
                        className="font-medium"
                      >
                        Mandaê
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Configurações Adicionais</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="calcular-frete" 
                      checked={configData.calcularFreteAutomatico}
                      onCheckedChange={(checked) => 
                        setConfigData({...configData, calcularFreteAutomatico: checked as boolean})
                      }
                    />
                    <label
                      htmlFor="calcular-frete"
                      className="text-sm font-medium"
                    >
                      Calcular frete automaticamente no checkout
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="registrar-rastreio" 
                      checked={configData.registrarRastreio}
                      onCheckedChange={(checked) => 
                        setConfigData({...configData, registrarRastreio: checked as boolean})
                      }
                    />
                    <label
                      htmlFor="registrar-rastreio"
                      className="text-sm font-medium"
                    >
                      Registrar informações de rastreio automaticamente
                    </label>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="tentativas-maximo">Número máximo de tentativas de cálculo</Label>
                    <Input 
                      id="tentativas-maximo" 
                      type="number"
                      min="1"
                      max="5"
                      value={configData.maximoTentativas}
                      onChange={(e) => setConfigData({...configData, maximoTentativas: e.target.value})}
                      className="w-20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Quantas vezes o sistema tentará calcular o frete em caso de erro
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("setup")}>
                Voltar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveConfig} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
                <Button onClick={() => setActiveTab("regras")}>
                  Próximo: Regras de Envio
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="regras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Envio</CardTitle>
              <CardDescription>
                Configure regras especiais para cálculo de frete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Frete Grátis
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor-frete-gratis">Valor mínimo para frete grátis (R$)</Label>
                    <Input 
                      id="valor-frete-gratis" 
                      type="number"
                      min="0"
                      step="0.01"
                      value={configData.valorMinimoFreteGratis}
                      onChange={(e) => setConfigData({...configData, valorMinimoFreteGratis: e.target.value})}
                      className="w-36"
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor mínimo de compra para oferecer frete grátis (0 para desabilitar)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destino-frete-gratis">CEPs para frete grátis</Label>
                    <textarea 
                      id="destino-frete-gratis" 
                      rows={3} 
                      className="w-full p-2 rounded-md border" 
                      placeholder="00000-000, 11111-111, 22222-222"
                      value={configData.destinoFreteGratis.join(", ")}
                      onChange={(e) => setConfigData({...configData, destinoFreteGratis: e.target.value.split(/,\s*/).filter(Boolean)})}
                    ></textarea>
                    <p className="text-xs text-muted-foreground">
                      Lista de CEPs que terão frete grátis independente do valor (separados por vírgula)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-blue-600" />
                  Configurações de Embalagens
                </h3>
                
                <Alert className="bg-blue-50 border-blue-200 mb-4">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Embalagens Personalizadas</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Para configurar embalagens personalizadas, acesse sua conta no Melhor Envio e configure-as diretamente na plataforma. Elas serão automaticamente utilizadas na integração.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => window.open("https://melhorenvio.com.br/configuracoes/embalagens", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Configurar Embalagens no Melhor Envio
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Notas Fiscais
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="incluir-nf" defaultChecked />
                    <label
                      htmlFor="incluir-nf"
                      className="text-sm font-medium"
                    >
                      Incluir nota fiscal nos envios
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="declarar-conteudo" defaultChecked />
                    <label
                      htmlFor="declarar-conteudo"
                      className="text-sm font-medium"
                    >
                      Declarar conteúdo do pacote
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("transportadoras")}>
                Voltar
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
            </CardFooter>
          </Card>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://melhorenvio.com.br/docs/api", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Documentação Melhor Envio
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://melhorenvio.com.br/calculadora", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Calculadora de Fretes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}