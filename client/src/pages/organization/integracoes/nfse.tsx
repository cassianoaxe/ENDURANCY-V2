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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Check, 
  FileText, 
  Info, 
  AlertCircle, 
  RotateCw, 
  Settings,
  ExternalLink,
  Key,
  Lock,
  Shield,
  Building,
  Receipt
} from "lucide-react";

export default function NFSeIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    certificadoA1: "",
    senhaCertificado: "",
    ambienteEmissao: "homologacao",
    regimeTributario: "simples_nacional",
    cnae: "6201-5/01",
    municipioEmissao: "3550308", // São Paulo
    serieNFSe: "1",
    aliquotaISS: "2.00",
    codigoTributacaoMunicipio: "620150100",
    enviarEmailAutomatico: true,
    logoPDF: null
  });
  
  // Estado para o status da integração
  const [integrationStatus, setIntegrationStatus] = useState<'inativa' | 'configuracao-pendente'>('configuracao-pendente');
  
  // Função para ativar a integração
  const activateIntegration = () => {
    setIsActivating(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsActivating(false);
      setIntegrationStatus('inativa'); // Muda para "inativa" ao invés de "ativa" porque ainda precisa validar os dados
      
      toast({
        title: "Configuração inicial concluída",
        description: "Agora você precisa validar as informações fiscais para ativar completamente a integração.",
      });
    }, 1500);
  };
  
  // Função para salvar as configurações
  const saveConfig = () => {
    setIsSaving(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do emissor de NFSe foram salvas com sucesso.",
      });
    }, 1500);
  };
  
  // Lista de municípios (simplificada)
  const municipios = [
    { codigo: "3550308", nome: "São Paulo - SP" },
    { codigo: "3304557", nome: "Rio de Janeiro - RJ" },
    { codigo: "2304400", nome: "Fortaleza - CE" },
    { codigo: "3106200", nome: "Belo Horizonte - MG" },
    { codigo: "5300108", nome: "Brasília - DF" },
    { codigo: "2927408", nome: "Salvador - BA" },
    { codigo: "4106902", nome: "Curitiba - PR" },
    { codigo: "1302603", nome: "Manaus - AM" },
    { codigo: "2611606", nome: "Recife - PE" },
    { codigo: "4314902", nome: "Porto Alegre - RS" }
  ];
  
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
        <h1 className="text-3xl font-bold">Emissor NFSe</h1>
        <Badge 
          className={
            integrationStatus === 'inativa' 
              ? "bg-gray-100 text-gray-800" 
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {integrationStatus === 'inativa' ? "Inativa" : "Configuração Pendente"}
        </Badge>
      </div>
      <p className="text-muted-foreground">Integração para emissão automática de notas fiscais de serviço</p>
      
      {integrationStatus === 'configuracao-pendente' ? (
        <Card>
          <CardHeader>
            <CardTitle>Configuração Inicial</CardTitle>
            <CardDescription>
              Configure o emissor de NFSe para começar a emitir notas fiscais de serviço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Informação</AlertTitle>
              <AlertDescription className="text-blue-700">
                Para utilizar esta integração, é necessário ter um certificado digital A1 válido e informações fiscais da sua empresa.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-6 mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="certificado-a1">Certificado Digital A1</Label>
                  <div className="flex">
                    <Input
                      id="certificado-upload"
                      type="file"
                      className="rounded-r-none"
                      accept=".pfx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setConfigData({...configData, certificadoA1: file.name});
                        }
                      }}
                    />
                    <Button variant="outline" className="rounded-l-none border-l-0">
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envie seu certificado digital no formato .pfx
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senha-certificado">Senha do Certificado</Label>
                  <div className="relative">
                    <Input 
                      id="senha-certificado" 
                      type="password" 
                      value={configData.senhaCertificado} 
                      onChange={(e) => setConfigData({...configData, senhaCertificado: e.target.value})}
                    />
                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ambiente-emissao">Ambiente de Emissão</Label>
                  <Select 
                    value={configData.ambienteEmissao}
                    onValueChange={(value) => setConfigData({...configData, ambienteEmissao: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ambiente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homologacao">Homologação (Testes)</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Recomendamos começar em homologação para testes
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regime-tributario">Regime Tributário</Label>
                  <Select 
                    value={configData.regimeTributario}
                    onValueChange={(value) => setConfigData({...configData, regimeTributario: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                      <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="lucro_real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnae">CNAE Principal</Label>
                  <Input 
                    id="cnae" 
                    value={configData.cnae} 
                    onChange={(e) => setConfigData({...configData, cnae: e.target.value})}
                    placeholder="Ex: 6201-5/01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Código da atividade econômica principal
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="municipio">Município de Emissão</Label>
                  <Select 
                    value={configData.municipioEmissao}
                    onValueChange={(value) => setConfigData({...configData, municipioEmissao: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o município" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipios.map(municipio => (
                        <SelectItem key={municipio.codigo} value={municipio.codigo}>
                          {municipio.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => window.location.href = "/organization/integracoes"}>
              Cancelar
            </Button>
            <Button onClick={activateIntegration} disabled={isActivating}>
              {isActivating ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Continuar Configuração"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        // Interface para quando o status já passou de "configuração pendente" para "inativa"
        // (precisa completar a configuração para ficar "ativa")
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Card className="w-full md:w-2/3">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Status da Integração</CardTitle>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Validação Pendente
                  </Badge>
                </div>
                <CardDescription>
                  Complete a configuração abaixo e valide as informações fiscais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Atenção</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      Para finalizar a configuração, preencha todas as informações fiscais abaixo e valide os dados com a Prefeitura.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Dados Fiscais</h3>
                          <p className="text-sm text-muted-foreground">Configure as informações fiscais da empresa</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Pendente</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Modelo de NFSe</h3>
                          <p className="text-sm text-muted-foreground">Configure o layout e campos da nota fiscal</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Pendente</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Validação na Prefeitura</h3>
                          <p className="text-sm text-muted-foreground">Verificar integração com o sistema da prefeitura</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Pendente</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="w-full md:w-1/3">
              <CardHeader className="pb-3">
                <CardTitle>Progresso da Configuração</CardTitle>
                <CardDescription>
                  Etapas para ativar a integração
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Certificado Digital</p>
                      <p className="text-xs text-muted-foreground">Certificado carregado</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dados Básicos</p>
                      <p className="text-xs text-muted-foreground">Informações iniciais configuradas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Configurações Fiscais</p>
                      <p className="text-xs text-muted-foreground">Pendente de conclusão</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Teste de Emissão</p>
                      <p className="text-xs text-muted-foreground">Não iniciado</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ativação</p>
                      <p className="text-xs text-muted-foreground">Não iniciado</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="fiscal" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="fiscal">Dados Fiscais</TabsTrigger>
              <TabsTrigger value="layout">Layout da NFSe</TabsTrigger>
              <TabsTrigger value="validation">Validação</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fiscal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Fiscais</CardTitle>
                  <CardDescription>
                    Preencha as informações necessárias para a emissão de NFSe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="serie">Série de NFSe</Label>
                        <Input 
                          id="serie" 
                          value={configData.serieNFSe} 
                          onChange={(e) => setConfigData({...configData, serieNFSe: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="aliquota">Alíquota ISS (%)</Label>
                        <Input 
                          id="aliquota" 
                          value={configData.aliquotaISS} 
                          onChange={(e) => setConfigData({...configData, aliquotaISS: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use ponto para separar decimais (ex: 2.00)
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="codigo-tributacao">Código de Tributação Municipal</Label>
                        <Input 
                          id="codigo-tributacao" 
                          value={configData.codigoTributacaoMunicipio} 
                          onChange={(e) => setConfigData({...configData, codigoTributacaoMunicipio: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground">
                          Verifique o código correto na prefeitura do seu município
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email-automatico" className="mb-2 block">Envio automático de NFSe</Label>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="email-automatico" 
                            checked={configData.enviarEmailAutomatico} 
                            onCheckedChange={(checked) => 
                              setConfigData({...configData, enviarEmailAutomatico: checked})
                            }
                          />
                          <Label htmlFor="email-automatico">
                            Enviar NFSe automaticamente por e-mail
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo-upload">Logo para NFSe (Opcional)</Label>
                      <div className="flex">
                        <Input
                          id="logo-upload"
                          type="file"
                          className="rounded-r-none"
                          accept=".png,.jpg,.jpeg"
                        />
                        <Button variant="outline" className="rounded-l-none border-l-0">
                          Upload
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        A logo será exibida no PDF da NFSe. Tamanho máximo: 1MB, formato: JPG ou PNG
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => window.location.href = "/organization/integracoes"}>
                    Cancelar
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
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Layout da NFSe</CardTitle>
                  <CardDescription>
                    Configure a aparência e campos da Nota Fiscal de Serviço
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">Personalização</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Os campos abaixo permitem personalizar o layout da NFSe dentro dos limites permitidos pela Prefeitura de seu município.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="border rounded-md p-4">
                        <h3 className="text-sm font-medium mb-2">Campos Adicionais</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="campo-obs" />
                            <Label htmlFor="campo-obs">Campo de Observações</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="campo-pedido" defaultChecked />
                            <Label htmlFor="campo-pedido">Número de Pedido/Contrato</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="campo-contato" defaultChecked />
                            <Label htmlFor="campo-contato">Contato do Cliente</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="text-sm font-medium mb-2">Informações de Contato</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="exibir-telefone" defaultChecked />
                            <Label htmlFor="exibir-telefone">Exibir Telefone</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="exibir-email" defaultChecked />
                            <Label htmlFor="exibir-email">Exibir E-mail</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="exibir-site" />
                            <Label htmlFor="exibir-site">Exibir Website</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2">Mensagem Padrão da NFSe</h3>
                      <textarea 
                        className="w-full p-2 rounded-md border" 
                        rows={4}
                        placeholder="Mensagem que aparecerá em todas as notas fiscais"
                      ></textarea>
                      <p className="text-xs text-muted-foreground mt-1">
                        Esta mensagem será adicionada automaticamente em todas as notas fiscais emitidas.
                      </p>
                    </div>
                    
                    <div className="flex justify-center p-4 border rounded-md">
                      <div className="text-center">
                        <p className="text-sm font-medium mb-2">Visualização prévia do PDF</p>
                        <Button variant="outline" className="gap-1">
                          <FileText className="h-4 w-4" />
                          Gerar Modelo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Gere um PDF de exemplo com as configurações atuais
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("fiscal")}>
                    Voltar
                  </Button>
                  <Button onClick={() => setActiveTab("validation")}>
                    Próximo: Validação
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="validation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Validação com a Prefeitura</CardTitle>
                  <CardDescription>
                    Verifique a integração com o sistema da prefeitura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-800">Atenção</AlertTitle>
                      <AlertDescription className="text-yellow-700">
                        Esta etapa verificará se sua configuração está correta e se é possível se comunicar com o webservice da prefeitura.
                        Primeiro faremos uma emissão em ambiente de homologação (teste).
                      </AlertDescription>
                    </Alert>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-md font-medium mb-4">Teste de Emissão em Homologação</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Clique no botão abaixo para realizar um teste de emissão de NFSe no ambiente de homologação (teste).
                        Este processo não gerará uma nota fiscal oficial, mas validará a configuração da integração.
                      </p>
                      <div className="flex justify-center">
                        <Button className="gap-1">
                          <FileText className="h-4 w-4" />
                          Emitir NFSe de Teste
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 bg-gray-50">
                      <h3 className="text-md font-medium mb-2">Status da Validação</h3>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-start gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 mt-0.5">
                            <span className="text-xs">1</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Validação de Certificado</p>
                            <p className="text-xs text-muted-foreground">Aguardando teste</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 mt-0.5">
                            <span className="text-xs">2</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Comunicação com Webservice</p>
                            <p className="text-xs text-muted-foreground">Aguardando teste</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 mt-0.5">
                            <span className="text-xs">3</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Validação de Dados Fiscais</p>
                            <p className="text-xs text-muted-foreground">Aguardando teste</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 mt-0.5">
                            <span className="text-xs">4</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Geração de PDF</p>
                            <p className="text-xs text-muted-foreground">Aguardando teste</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("layout")}>
                    Voltar
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = "/organization/integracoes"}>
                    Concluir Mais Tarde
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}