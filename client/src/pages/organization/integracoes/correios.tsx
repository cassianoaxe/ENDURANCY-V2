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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Info, 
  AlertCircle, 
  RotateCw, 
  Truck,
  ExternalLink,
  Package,
  Store,
  UploadCloud,
  Pencil,
  FileCheck,
  Printer,
  ClipboardList,
  BarChart,
  Banknote,
  FileBox,
  Mailbox
} from "lucide-react";

export default function CorreiosIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("credenciais");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    codigo: "",
    senha: "",
    cartaoPostagem: "",
    contrato: "",
    ambiente: "homologacao", // homologacao ou producao
    remetente: {
      nome: "",
      documento: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: ""
    },
    servicos: {
      pac: true,
      sedex: true,
      sedex10: false,
      sedex12: false,
      malaDireta: false,
      cartaRegistrada: false
    },
    opcoes: {
      avisoRecebimento: false,
      maoPropria: false,
      valorDeclarado: false,
      etiquetaSemConteudo: false
    },
    imprimir: {
      formatoImpressao: "A4", // A4 ou Termica
      quantidadeEtiquetas: "1", // 1 ou 2 por página
      imprimirAutomaticamente: false,
      verificarEndereco: true
    }
  });
  
  // Exemplos de serviços dos Correios
  const servicosCorreios = [
    { codigo: "04510", nome: "PAC", sigla: "PAC", valor: "R$ 25,50" },
    { codigo: "04014", nome: "SEDEX", sigla: "SEDEX", valor: "R$ 42,80" },
    { codigo: "40215", nome: "SEDEX 10", sigla: "S10", valor: "R$ 58,20" },
    { codigo: "40169", nome: "SEDEX 12", sigla: "S12", valor: "R$ 53,70" },
    { codigo: "03298", nome: "Carta Registrada", sigla: "CR", valor: "R$ 12,35" },
    { codigo: "03050", nome: "Mala Direta", sigla: "MD", valor: "R$ 19,90" }
  ];
  
  // Simulação de pedidos para rastreamento
  const pedidosRastreamento = [
    { numero: "10023", cliente: "João Silva", data: "12/04/2025", codigo: "BR987654321BR", status: "Entregue" },
    { numero: "10024", cliente: "Maria Souza", data: "13/04/2025", codigo: "BR123456789BR", status: "Em trânsito" },
    { numero: "10025", cliente: "Pedro Santos", data: "14/04/2025", codigo: "BR456789123BR", status: "Postado" },
    { numero: "10026", cliente: "Ana Oliveira", data: "14/04/2025", codigo: "BR789123456BR", status: "Aguardando postagem" }
  ];
  
  // Funções auxiliares
  const handleRemetenteChange = (field: string, value: string) => {
    setConfigData({
      ...configData,
      remetente: {
        ...configData.remetente,
        [field]: value
      }
    });
  };
  
  const handleServicosChange = (servico: string, checked: boolean) => {
    setConfigData({
      ...configData,
      servicos: {
        ...configData.servicos,
        [servico]: checked
      }
    });
  };
  
  const handleOpcoesChange = (opcao: string, checked: boolean) => {
    setConfigData({
      ...configData,
      opcoes: {
        ...configData.opcoes,
        [opcao]: checked
      }
    });
  };
  
  // Função para simular preenchimento automático
  const simularPreenchimentoAutomatico = () => {
    setConfigData({
      ...configData,
      codigo: "12345678",
      senha: "senha123",
      cartaoPostagem: "0067599079",
      contrato: "9912377182",
      remetente: {
        nome: "Empresa XYZ Ltda",
        documento: "12.345.678/0001-99",
        endereco: "Avenida Paulista",
        numero: "1000",
        complemento: "Andar 10",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01310-100"
      }
    });
    
    toast({
      title: "Dados preenchidos",
      description: "Os dados foram preenchidos automaticamente para demonstração"
    });
  };
  
  // Função para salvar configurações
  const saveConfiguration = () => {
    setIsSaving(true);
    
    // Validação básica
    if (!configData.codigo || !configData.senha) {
      toast({
        title: "Dados incompletos",
        description: "Código administrativo e senha são obrigatórios",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram salvas com sucesso"
      });
    }, 1500);
  };
  
  // Função para ativar integração
  const activateIntegration = () => {
    // Validação básica
    if (!configData.codigo || !configData.senha || !configData.contrato) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os dados obrigatórios para ativar a integração",
        variant: "destructive"
      });
      return;
    }
    
    // Validação de remetente
    if (
      !configData.remetente.nome || 
      !configData.remetente.documento || 
      !configData.remetente.endereco || 
      !configData.remetente.cep
    ) {
      toast({
        title: "Dados de remetente incompletos",
        description: "Preencha os dados do remetente para ativar a integração",
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
        description: "A integração com os Correios foi ativada com sucesso"
      });
      
      // Redirecionar para a página de integrações
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
        <h1 className="text-3xl font-bold">CORREIOS</h1>
        <Badge className="bg-gray-100 text-gray-800">
          Inativa
        </Badge>
      </div>
      <p className="text-muted-foreground">Integração com os Correios para cálculo de fretes e rastreamento</p>
      
      <Tabs defaultValue="credenciais" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="credenciais">Credenciais</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
          <TabsTrigger value="rastreamento">Rastreamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="credenciais" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credenciais dos Correios</CardTitle>
              <CardDescription>
                Configure os dados de acesso ao webservice dos Correios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Como obter credenciais</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p className="mb-2">Para utilizar os serviços de e-commerce dos Correios, você precisa:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Ter um contrato com os Correios para SEDEX, PAC ou outros serviços</li>
                    <li>Solicitar acesso ao webservice de e-commerce dos Correios</li>
                    <li>Usar o código administrativo, senha e número do cartão de postagem fornecidos</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={simularPreenchimentoAutomatico}
                >
                  <UploadCloud className="h-4 w-4" />
                  Preencher para Teste
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ambiente">Ambiente</Label>
                  <RadioGroup 
                    value={configData.ambiente} 
                    onValueChange={(value) => setConfigData({...configData, ambiente: value})}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="homologacao" id="ambiente-homologacao" />
                      <Label htmlFor="ambiente-homologacao">Homologação (Teste)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="producao" id="ambiente-producao" />
                      <Label htmlFor="ambiente-producao">Produção</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Recomendamos iniciar com o ambiente de homologação para testes
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="codigo-admin">Código Administrativo</Label>
                  <Input 
                    id="codigo-admin" 
                    value={configData.codigo}
                    onChange={(e) => setConfigData({...configData, codigo: e.target.value})}
                    placeholder="12345678"
                  />
                  <p className="text-xs text-muted-foreground">
                    Código administrativo fornecido pelos Correios
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input 
                    id="senha" 
                    type="password"
                    value={configData.senha}
                    onChange={(e) => setConfigData({...configData, senha: e.target.value})}
                    placeholder="********"
                  />
                  <p className="text-xs text-muted-foreground">
                    Senha de acesso fornecida pelos Correios
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cartao-postagem">Cartão de Postagem</Label>
                    <Input 
                      id="cartao-postagem" 
                      value={configData.cartaoPostagem}
                      onChange={(e) => setConfigData({...configData, cartaoPostagem: e.target.value})}
                      placeholder="0067599079"
                    />
                    <p className="text-xs text-muted-foreground">
                      Número do cartão de postagem
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contrato">Número do Contrato</Label>
                    <Input 
                      id="contrato" 
                      value={configData.contrato}
                      onChange={(e) => setConfigData({...configData, contrato: e.target.value})}
                      placeholder="9912377182"
                    />
                    <p className="text-xs text-muted-foreground">
                      Número do contrato com os Correios
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="font-medium">Dados do Remetente</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome/Razão Social</Label>
                    <Input 
                      id="nome" 
                      value={configData.remetente.nome}
                      onChange={(e) => handleRemetenteChange('nome', e.target.value)}
                      placeholder="Nome da Empresa Ltda."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documento">CNPJ/CPF</Label>
                    <Input 
                      id="documento" 
                      value={configData.remetente.documento}
                      onChange={(e) => handleRemetenteChange('documento', e.target.value)}
                      placeholder="12.345.678/0001-99"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input 
                      id="endereco" 
                      value={configData.remetente.endereco}
                      onChange={(e) => handleRemetenteChange('endereco', e.target.value)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input 
                      id="numero" 
                      value={configData.remetente.numero}
                      onChange={(e) => handleRemetenteChange('numero', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input 
                      id="complemento" 
                      value={configData.remetente.complemento}
                      onChange={(e) => handleRemetenteChange('complemento', e.target.value)}
                      placeholder="Sala, andar, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input 
                      id="bairro" 
                      value={configData.remetente.bairro}
                      onChange={(e) => handleRemetenteChange('bairro', e.target.value)}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input 
                      id="cidade" 
                      value={configData.remetente.cidade}
                      onChange={(e) => handleRemetenteChange('cidade', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select 
                      value={configData.remetente.estado}
                      onValueChange={(value) => handleRemetenteChange('estado', value)}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input 
                      id="cep" 
                      value={configData.remetente.cep}
                      onChange={(e) => handleRemetenteChange('cep', e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
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
                <Button onClick={() => setActiveTab("servicos")}>
                  Próximo: Serviços
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="servicos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Serviços</CardTitle>
              <CardDescription>
                Configure os serviços dos Correios que serão oferecidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Serviços Disponíveis
                </h3>
                
                <div className="space-y-4">
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Importante</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      Selecione apenas os serviços contratados junto aos Correios. Os serviços não contratados não funcionarão, mesmo que selecionados.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className={`border rounded-md p-4 ${configData.servicos.pac ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox 
                          id="servico-pac" 
                          checked={configData.servicos.pac}
                          onCheckedChange={(checked) => 
                            handleServicosChange('pac', checked as boolean)
                          }
                        />
                        <label
                          htmlFor="servico-pac"
                          className="font-medium"
                        >
                          PAC
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Serviço de entrega econômica com prazo médio de 3 a 7 dias úteis.
                      </p>
                      <Badge className="bg-blue-100 text-blue-800">Código: 04510</Badge>
                    </div>
                    
                    <div className={`border rounded-md p-4 ${configData.servicos.sedex ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox 
                          id="servico-sedex" 
                          checked={configData.servicos.sedex}
                          onCheckedChange={(checked) => 
                            handleServicosChange('sedex', checked as boolean)
                          }
                        />
                        <label
                          htmlFor="servico-sedex"
                          className="font-medium"
                        >
                          SEDEX
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Serviço de entrega expressa com prazo médio de 1 a 3 dias úteis.
                      </p>
                      <Badge className="bg-blue-100 text-blue-800">Código: 04014</Badge>
                    </div>
                    
                    <div className={`border rounded-md p-4 ${configData.servicos.sedex10 ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox 
                          id="servico-sedex10" 
                          checked={configData.servicos.sedex10}
                          onCheckedChange={(checked) => 
                            handleServicosChange('sedex10', checked as boolean)
                          }
                        />
                        <label
                          htmlFor="servico-sedex10"
                          className="font-medium"
                        >
                          SEDEX 10
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Entrega garantida até às 10h do dia útil seguinte.
                      </p>
                      <Badge className="bg-blue-100 text-blue-800">Código: 40215</Badge>
                    </div>
                    
                    <div className={`border rounded-md p-4 ${configData.servicos.sedex12 ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox 
                          id="servico-sedex12" 
                          checked={configData.servicos.sedex12}
                          onCheckedChange={(checked) => 
                            handleServicosChange('sedex12', checked as boolean)
                          }
                        />
                        <label
                          htmlFor="servico-sedex12"
                          className="font-medium"
                        >
                          SEDEX 12
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Entrega garantida até às 12h do dia útil seguinte.
                      </p>
                      <Badge className="bg-blue-100 text-blue-800">Código: 40169</Badge>
                    </div>
                    
                    <div className={`border rounded-md p-4 ${configData.servicos.malaDireta ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox 
                          id="servico-mala-direta" 
                          checked={configData.servicos.malaDireta}
                          onCheckedChange={(checked) => 
                            handleServicosChange('malaDireta', checked as boolean)
                          }
                        />
                        <label
                          htmlFor="servico-mala-direta"
                          className="font-medium"
                        >
                          Mala Direta
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Serviço para envio de impressos e catálogos.
                      </p>
                      <Badge className="bg-blue-100 text-blue-800">Código: 03050</Badge>
                    </div>
                    
                    <div className={`border rounded-md p-4 ${configData.servicos.cartaRegistrada ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox 
                          id="servico-carta-registrada" 
                          checked={configData.servicos.cartaRegistrada}
                          onCheckedChange={(checked) => 
                            handleServicosChange('cartaRegistrada', checked as boolean)
                          }
                        />
                        <label
                          htmlFor="servico-carta-registrada"
                          className="font-medium"
                        >
                          Carta Registrada
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Serviço para envio de correspondências com registro.
                      </p>
                      <Badge className="bg-blue-100 text-blue-800">Código: 03298</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-blue-600" />
                  Opções Adicionais
                </h3>
                
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="opcao-ar" 
                        checked={configData.opcoes.avisoRecebimento}
                        onCheckedChange={(checked) => 
                          handleOpcoesChange('avisoRecebimento', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="opcao-ar"
                        className="text-sm font-medium"
                      >
                        Aviso de Recebimento (AR)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="opcao-mp" 
                        checked={configData.opcoes.maoPropria}
                        onCheckedChange={(checked) => 
                          handleOpcoesChange('maoPropria', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="opcao-mp"
                        className="text-sm font-medium"
                      >
                        Mão Própria
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="opcao-vd" 
                        checked={configData.opcoes.valorDeclarado}
                        onCheckedChange={(checked) => 
                          handleOpcoesChange('valorDeclarado', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="opcao-vd"
                        className="text-sm font-medium"
                      >
                        Valor Declarado
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="opcao-esc" 
                        checked={configData.opcoes.etiquetaSemConteudo}
                        onCheckedChange={(checked) => 
                          handleOpcoesChange('etiquetaSemConteudo', checked as boolean)
                        }
                      />
                      <label
                        htmlFor="opcao-esc"
                        className="text-sm font-medium"
                      >
                        Etiqueta sem Conteúdo
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Store className="h-5 w-5 text-blue-600" />
                  Loja Virtual
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="calcular-automatico" defaultChecked />
                    <label
                      htmlFor="calcular-automatico"
                      className="text-sm font-medium"
                    >
                      Calcular frete automaticamente no checkout
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="atualizar-status" defaultChecked />
                    <label
                      htmlFor="atualizar-status"
                      className="text-sm font-medium"
                    >
                      Atualizar status do pedido com base no rastreamento
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mostrar-prazo" defaultChecked />
                    <label
                      htmlFor="mostrar-prazo"
                      className="text-sm font-medium"
                    >
                      Mostrar prazo de entrega estimado no checkout
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("credenciais")}>
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
                <Button onClick={() => setActiveTab("etiquetas")}>
                  Próximo: Etiquetas
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="etiquetas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etiquetas</CardTitle>
              <CardDescription>
                Configure a geração e impressão de etiquetas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <FileCheck className="h-5 w-5 text-blue-600" />
                  Configurações de Etiquetas
                </h3>
                
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="formato-impressao">Formato de Impressão</Label>
                      <Select 
                        value={configData.imprimir.formatoImpressao}
                        onValueChange={(value) => setConfigData({
                          ...configData, 
                          imprimir: {
                            ...configData.imprimir,
                            formatoImpressao: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">Papel A4</SelectItem>
                          <SelectItem value="Termica">Impressora Térmica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="qtd-etiquetas">Quantidade de Etiquetas por Folha</Label>
                      <Select 
                        value={configData.imprimir.quantidadeEtiquetas}
                        onValueChange={(value) => setConfigData({
                          ...configData, 
                          imprimir: {
                            ...configData.imprimir,
                            quantidadeEtiquetas: value
                          }
                        })}
                        disabled={configData.imprimir.formatoImpressao !== 'A4'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a quantidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 etiqueta por página</SelectItem>
                          <SelectItem value="2">2 etiquetas por página</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="imprimir-automaticamente" 
                        checked={configData.imprimir.imprimirAutomaticamente}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData, 
                            imprimir: {
                              ...configData.imprimir,
                              imprimirAutomaticamente: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="imprimir-automaticamente"
                        className="text-sm font-medium"
                      >
                        Imprimir etiquetas automaticamente ao gerar
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="verificar-endereco" 
                        checked={configData.imprimir.verificarEndereco}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData, 
                            imprimir: {
                              ...configData.imprimir,
                              verificarEndereco: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="verificar-endereco"
                        className="text-sm font-medium"
                      >
                        Verificar endereço antes de gerar etiqueta
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Printer className="h-5 w-5 text-blue-600" />
                  Impressão de Etiquetas
                </h3>
                
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Amostra</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      A etiqueta abaixo é apenas uma amostra do layout. Ao ativar a integração, as etiquetas serão geradas com dados reais.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-center">
                    <div className="border rounded-md p-4 bg-white shadow-sm">
                      <div className="p-4 border border-gray-300 rounded">
                        <div className="text-center mb-3">
                          <div className="font-bold text-sm mb-1">SEDEX</div>
                          <div className="text-xs">BR123456789BR</div>
                        </div>
                        
                        <div className="flex justify-between text-xs mb-3">
                          <div>
                            <strong>Remetente:</strong>
                            <div>Empresa XYZ Ltda</div>
                            <div>Av. Paulista, 1000</div>
                            <div>São Paulo - SP, 01310-100</div>
                          </div>
                          <div className="text-right">
                            <strong>Destinatário:</strong>
                            <div>João Silva</div>
                            <div>Rua ABC, 123</div>
                            <div>Rio de Janeiro - RJ, 20040-000</div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-300 pt-2 flex justify-between text-xs">
                          <div>Peso: 0,5 kg</div>
                          <div>Data: 15/04/2025</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="gap-1">
                      <Pencil className="h-4 w-4" />
                      Personalizar Etiqueta
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Lista de PLP
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  A Lista de Postagem (PLP) é o documento que acompanha as encomendas e deve ser apresentada na agência dos Correios no momento da postagem.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="gerar-plp" defaultChecked />
                    <label
                      htmlFor="gerar-plp"
                      className="text-sm font-medium"
                    >
                      Gerar PLP automaticamente
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="fechar-plp" defaultChecked />
                    <label
                      htmlFor="fechar-plp"
                      className="text-sm font-medium"
                    >
                      Fechar PLP ao fim do dia
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("servicos")}>
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
                <Button onClick={() => setActiveTab("rastreamento")}>
                  Próximo: Rastreamento
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="rastreamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rastreamento</CardTitle>
              <CardDescription>
                Configure as opções de rastreamento de encomendas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  Configurações de Rastreamento
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="atualizar-rastreio" defaultChecked />
                    <label
                      htmlFor="atualizar-rastreio"
                      className="text-sm font-medium"
                    >
                      Atualizar status de rastreamento automaticamente
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notificar-cliente" defaultChecked />
                    <label
                      htmlFor="notificar-cliente"
                      className="text-sm font-medium"
                    >
                      Notificar cliente sobre atualizações de rastreamento
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="link-rastreio" defaultChecked />
                    <label
                      htmlFor="link-rastreio"
                      className="text-sm font-medium"
                    >
                      Enviar link de rastreamento por email
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Banknote className="h-5 w-5 text-blue-600" />
                  Consulta de Preços
                </h3>
                
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <Info className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Consulta de Preços</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Esta integração permite consultar preços e prazos dos serviços dos Correios diretamente na sua loja virtual.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Sigla</TableHead>
                          <TableHead className="text-right">Valor Exemplo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {servicosCorreios.map((servico) => (
                          <TableRow key={servico.codigo}>
                            <TableCell className="font-medium">{servico.nome}</TableCell>
                            <TableCell>{servico.codigo}</TableCell>
                            <TableCell>{servico.sigla}</TableCell>
                            <TableCell className="text-right">{servico.valor}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <FileBox className="h-5 w-5 text-blue-600" />
                  Pedidos para Rastreamento
                </h3>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Código de Rastreio</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosRastreamento.map((pedido) => (
                        <TableRow key={pedido.numero}>
                          <TableCell className="font-medium">#{pedido.numero}</TableCell>
                          <TableCell>{pedido.cliente}</TableCell>
                          <TableCell>{pedido.data}</TableCell>
                          <TableCell>{pedido.codigo}</TableCell>
                          <TableCell>
                            <Badge className={
                              pedido.status === 'Entregue' 
                                ? 'bg-green-100 text-green-800' 
                                : pedido.status === 'Em trânsito' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : pedido.status === 'Postado' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }>
                              {pedido.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Os pedidos e códigos acima são apenas exemplos e estarão disponíveis após a ativação da integração.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("etiquetas")}>
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
              onClick={() => window.open("https://www.correios.com.br/enviar-e-receber/precisa-de-ajuda/manual-do-usuario", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Documentação dos Correios
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://www.correios.com.br/rastreamento", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Sistema de Rastreamento
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}