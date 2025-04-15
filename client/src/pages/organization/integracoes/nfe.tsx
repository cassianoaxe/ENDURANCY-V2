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
  Info, 
  AlertCircle, 
  RotateCw, 
  Upload,
  Key,
  PencilRuler,
  Lock,
  Building2,
  ServerCog,
  FileText,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  FileBarChart,
  CheckCircle,
  Truck,
  ClipboardList
} from "lucide-react";

export default function NFeIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("certificado");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    certificado: {
      arquivo: null as File | null,
      nomeArquivo: "",
      senha: "",
      dataValidade: "",
      tipoCertificado: "A1", // A1 ou A3
    },
    ambiente: "homologacao", // homologacao ou producao
    empresa: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      endereco: {
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        codigoMunicipio: "",
      },
      regime: "normal", // normal, simples, simei
      cnae: "",
    },
    email: {
      notificarCliente: true,
      copiaEmpresa: true,
      emailPadrao: "",
      assuntoPadrao: "Nota Fiscal Eletrônica - [NUMERO_NF]",
      textoPadrao: "Prezado cliente,\n\nSegue em anexo a Nota Fiscal Eletrônica referente à sua compra.\n\nAtenciosamente,\n[EMPRESA]",
    },
    comportamento: {
      emitirAutomaticamente: false,
      considerarFreteNF: true,
      gerarDanfe: true,
      modeloImpressao: "normal", // normal, simplificado, etiqueta
      salvarPasta: true,
      pastaArmazenamento: "/documentos/nfe",
    },
    impostos: {
      icms: {
        aliquotaBase: "18.00",
        aliquotaST: "0.00",
        cst: "00", // 00, 10, 20, 30, 40, 41, 50, 51, 60, 70, 90
        csosn: "101", // 101, 102, 103, 201, 202, 203, 300, 400, 500, 900 (para Simples)
      },
      pis: {
        aliquota: "0.65",
        cst: "01", // 01, 02, 03, 04, 05, 06, 07, 08, 09
      },
      cofins: {
        aliquota: "3.00",
        cst: "01", // 01, 02, 03, 04, 05, 06, 07, 08, 09
      },
      ipi: {
        aliquota: "0.00",
        cst: "99", // 00, 01, 02, 03, 04, 05, 49, 50, 99
      },
    },
    series: {
      serie: "1",
      proxNumero: "1",
    },
    tecnico: {
      timeout: "30",
      tentativasReenvio: "3",
      validarSchema: true,
      salvarXML: true,
      pastaXML: "/documentos/xml",
    }
  });
  
  // Função para simular upload de certificado
  const handleCertificadoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      setConfigData({
        ...configData,
        certificado: {
          ...configData.certificado,
          arquivo: file,
          nomeArquivo: file.name,
          // Simulando uma data de validade (1 ano a partir de hoje)
          dataValidade: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        }
      });
      
      toast({
        title: "Certificado carregado",
        description: `O certificado ${file.name} foi carregado com sucesso.`
      });
    }
  };
  
  // Função para salvar configurações
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
    // Validação básica
    if (!configData.certificado.nomeArquivo || !configData.certificado.senha) {
      toast({
        title: "Certificado não configurado",
        description: "É necessário configurar o certificado digital para ativar a integração.",
        variant: "destructive"
      });
      return;
    }
    
    // Validação de empresa
    if (!configData.empresa.cnpj || !configData.empresa.razaoSocial) {
      toast({
        title: "Dados da empresa incompletos",
        description: "Os dados básicos da empresa são obrigatórios para ativar a integração.",
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
        description: "A integração com NFe foi ativada com sucesso."
      });
      
      // Redirecionamento para a lista de integrações
      setTimeout(() => {
        window.location.href = "/organization/integracoes";
      }, 1500);
    }, 2000);
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
        <h1 className="text-3xl font-bold">Emissor NFe</h1>
        <Badge className="bg-gray-100 text-gray-800">
          Inativa
        </Badge>
      </div>
      <p className="text-muted-foreground">Integração para emissão automática de notas fiscais eletrônicas</p>
      
      {/* Indicador de progresso */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ 
            width: activeTab === 'certificado' ? '20%' : 
                  activeTab === 'empresa' ? '40%' : 
                  activeTab === 'impostos' ? '60%' : 
                  activeTab === 'comportamento' ? '80%' : '100%' 
          }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Certificado</span>
        <span>Empresa</span>
        <span>Impostos</span>
        <span>Comportamento</span>
        <span>Envio</span>
      </div>
      
      <Tabs defaultValue="certificado" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="certificado">Certificado</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="impostos">Impostos</TabsTrigger>
          <TabsTrigger value="comportamento">Comportamento</TabsTrigger>
          <TabsTrigger value="envio">Envio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="certificado" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificado Digital</CardTitle>
              <CardDescription>
                Configuração do certificado digital para emissão de NFe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Sobre Certificados Digitais</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p className="mb-2">Para emitir NFe, você precisa de um certificado digital válido tipo A1 ou A3 no padrão ICP-Brasil. Certifique-se que:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>O certificado está dentro do prazo de validade</li>
                    <li>Foi emitido para o CNPJ da empresa emitente</li>
                    <li>Possui permissão para assinar documentos fiscais</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  Upload do Certificado
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipo-certificado">Tipo de Certificado</Label>
                    <RadioGroup 
                      value={configData.certificado.tipoCertificado} 
                      onValueChange={(value) => setConfigData({
                        ...configData, 
                        certificado: {
                          ...configData.certificado,
                          tipoCertificado: value
                        }
                      })}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A1" id="tipo-a1" />
                        <Label htmlFor="tipo-a1">A1 (Arquivo Digital)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A3" id="tipo-a3" />
                        <Label htmlFor="tipo-a3">A3 (Token/Cartão)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {configData.certificado.tipoCertificado === 'A1' ? (
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="certificado-upload">Arquivo do Certificado (.pfx)</Label>
                        <div className="flex">
                          <Input
                            id="certificado-upload"
                            type="file"
                            className="rounded-r-none"
                            accept=".pfx,.p12"
                            onChange={handleCertificadoUpload}
                          />
                          <Button variant="outline" className="rounded-l-none border-l-0">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Selecione o arquivo do certificado digital no formato .pfx ou .p12
                        </p>
                      </div>
                      
                      {configData.certificado.nomeArquivo && (
                        <div className="bg-green-50 p-3 rounded-md border border-green-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800">Certificado carregado</p>
                              <p className="text-sm text-green-700">{configData.certificado.nomeArquivo}</p>
                            </div>
                          </div>
                          {configData.certificado.dataValidade && (
                            <p className="text-sm text-green-700 mt-2">
                              Válido até: {new Date(configData.certificado.dataValidade).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="senha-certificado">Senha do Certificado</Label>
                        <div className="relative">
                          <Input 
                            id="senha-certificado" 
                            type="password"
                            value={configData.certificado.senha}
                            onChange={(e) => setConfigData({
                              ...configData, 
                              certificado: {
                                ...configData.certificado,
                                senha: e.target.value
                              }
                            })}
                            placeholder="Digite a senha do certificado"
                          />
                          <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          A senha será armazenada com segurança e usada apenas para acessar o certificado
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Configuração A3</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                          Para utilizar certificados A3 (Token/Cartão), é necessário instalar os drivers apropriados e configurar o acesso ao dispositivo no servidor.
                          Por favor, entre em contato com o suporte para configuração.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label htmlFor="token-serial">Número de Série do Token</Label>
                        <Input 
                          id="token-serial" 
                          placeholder="Digite o número de série do token"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senha-token">Senha do Token</Label>
                        <div className="relative">
                          <Input 
                            id="senha-token" 
                            type="password"
                            placeholder="Digite a senha do token"
                          />
                          <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <ServerCog className="h-5 w-5 text-blue-600" />
                  Ambiente
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ambiente">Ambiente de Emissão</Label>
                    <RadioGroup 
                      value={configData.ambiente} 
                      onValueChange={(value) => setConfigData({...configData, ambiente: value})}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="homologacao" id="ambiente-homologacao" />
                        <Label htmlFor="ambiente-homologacao">Homologação (Testes)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="producao" id="ambiente-producao" />
                        <Label htmlFor="ambiente-producao">Produção</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      Recomendamos iniciar pelo ambiente de homologação para testes
                    </p>
                  </div>
                  
                  <Alert className={
                    configData.ambiente === 'homologacao' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-red-50 border-red-200'
                  }>
                    <Info className={`h-4 w-4 ${configData.ambiente === 'homologacao' ? 'text-blue-600' : 'text-red-600'}`} />
                    <AlertTitle className={configData.ambiente === 'homologacao' ? 'text-blue-800' : 'text-red-800'}>
                      {configData.ambiente === 'homologacao' ? 'Ambiente de Homologação' : 'Ambiente de Produção'}
                    </AlertTitle>
                    <AlertDescription className={configData.ambiente === 'homologacao' ? 'text-blue-700' : 'text-red-700'}>
                      {configData.ambiente === 'homologacao' 
                        ? 'No ambiente de homologação, as notas fiscais emitidas não têm valor fiscal e são identificadas com a frase "EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO".'
                        : 'No ambiente de produção, as notas fiscais emitidas têm valor fiscal real e geram obrigações tributárias para a empresa.'}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.href = "/organization/integracoes"}>
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
                <Button onClick={() => setActiveTab("empresa")}>
                  Próximo: Empresa
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="empresa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações da empresa emitente das notas fiscais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Identificação
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="razao-social">Razão Social</Label>
                    <Input 
                      id="razao-social" 
                      value={configData.empresa.razaoSocial}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          razaoSocial: e.target.value
                        }
                      })}
                      placeholder="Razão Social da Empresa"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                    <Input 
                      id="nome-fantasia" 
                      value={configData.empresa.nomeFantasia}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          nomeFantasia: e.target.value
                        }
                      })}
                      placeholder="Nome Fantasia (se houver)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input 
                      id="cnpj" 
                      value={configData.empresa.cnpj}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          cnpj: e.target.value
                        }
                      })}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inscricao-estadual">Inscrição Estadual</Label>
                    <Input 
                      id="inscricao-estadual" 
                      value={configData.empresa.inscricaoEstadual}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          inscricaoEstadual: e.target.value
                        }
                      })}
                      placeholder="Inscrição Estadual"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inscricao-municipal">Inscrição Municipal</Label>
                    <Input 
                      id="inscricao-municipal" 
                      value={configData.empresa.inscricaoMunicipal}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          inscricaoMunicipal: e.target.value
                        }
                      })}
                      placeholder="Inscrição Municipal (se houver)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regime-tributario">Regime Tributário</Label>
                    <Select 
                      value={configData.empresa.regime}
                      onValueChange={(value) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          regime: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o regime tributário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Lucro Real/Presumido</SelectItem>
                        <SelectItem value="simples">Simples Nacional</SelectItem>
                        <SelectItem value="simei">MEI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnae">CNAE Principal</Label>
                    <Input 
                      id="cnae" 
                      value={configData.empresa.cnae}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          cnae: e.target.value
                        }
                      })}
                      placeholder="0000-0/00"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <PencilRuler className="h-5 w-5 text-blue-600" />
                  Endereço
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input 
                      id="logradouro" 
                      value={configData.empresa.endereco.logradouro}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          endereco: {
                            ...configData.empresa.endereco,
                            logradouro: e.target.value
                          }
                        }
                      })}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input 
                      id="numero" 
                      value={configData.empresa.endereco.numero}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          endereco: {
                            ...configData.empresa.endereco,
                            numero: e.target.value
                          }
                        }
                      })}
                      placeholder="123"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input 
                      id="complemento" 
                      value={configData.empresa.endereco.complemento}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          endereco: {
                            ...configData.empresa.endereco,
                            complemento: e.target.value
                          }
                        }
                      })}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input 
                      id="bairro" 
                      value={configData.empresa.endereco.bairro}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          endereco: {
                            ...configData.empresa.endereco,
                            bairro: e.target.value
                          }
                        }
                      })}
                      placeholder="Bairro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input 
                      id="cep" 
                      value={configData.empresa.endereco.cep}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          endereco: {
                            ...configData.empresa.endereco,
                            cep: e.target.value
                          }
                        }
                      })}
                      placeholder="00000-000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input 
                      id="cidade" 
                      value={configData.empresa.endereco.cidade}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          endereco: {
                            ...configData.empresa.endereco,
                            cidade: e.target.value
                          }
                        }
                      })}
                      placeholder="Cidade"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select 
                      value={configData.empresa.endereco.estado}
                      onValueChange={(value) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          endereco: {
                            ...configData.empresa.endereco,
                            estado: value
                          }
                        }
                      })}
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
                    <Label htmlFor="codigo-municipio">Código do Município (IBGE)</Label>
                    <Input 
                      id="codigo-municipio" 
                      value={configData.empresa.endereco.codigoMunicipio}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        empresa: {
                          ...configData.empresa,
                          endereco: {
                            ...configData.empresa.endereco,
                            codigoMunicipio: e.target.value
                          }
                        }
                      })}
                      placeholder="0000000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Código do município conforme tabela do IBGE
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Numeração
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="serie">Série</Label>
                    <Input 
                      id="serie" 
                      value={configData.series.serie}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        series: {
                          ...configData.series,
                          serie: e.target.value
                        }
                      })}
                      placeholder="1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Série do documento fiscal (geralmente 1)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prox-numero">Próximo Número</Label>
                    <Input 
                      id="prox-numero" 
                      value={configData.series.proxNumero}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        series: {
                          ...configData.series,
                          proxNumero: e.target.value
                        }
                      })}
                      placeholder="1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Próximo número de NF a ser emitida
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("certificado")}>
                <ArrowLeft className="mr-1 h-4 w-4" />
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
                <Button onClick={() => setActiveTab("impostos")}>
                  Próximo: Impostos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="impostos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Impostos</CardTitle>
              <CardDescription>
                Definições fiscais e tributárias para emissão de NFe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Importante</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  As configurações fiscais devem refletir corretamente o regime tributário da sua empresa e as operações realizadas.
                  Recomendamos consultar seu contador antes de definir estas configurações.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <FileBarChart className="h-5 w-5 text-blue-600" />
                  ICMS
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {configData.empresa.regime === 'normal' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cst-icms">CST ICMS</Label>
                        <Select 
                          value={configData.impostos.icms.cst}
                          onValueChange={(value) => setConfigData({
                            ...configData, 
                            impostos: {
                              ...configData.impostos,
                              icms: {
                                ...configData.impostos.icms,
                                cst: value
                              }
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o CST" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="00">00 - Tributada integralmente</SelectItem>
                            <SelectItem value="10">10 - Tributada com cobrança de ICMS por ST</SelectItem>
                            <SelectItem value="20">20 - Com redução de base de cálculo</SelectItem>
                            <SelectItem value="30">30 - Isenta ou não tributada com cobrança de ICMS por ST</SelectItem>
                            <SelectItem value="40">40 - Isenta</SelectItem>
                            <SelectItem value="41">41 - Não tributada</SelectItem>
                            <SelectItem value="50">50 - Suspensão</SelectItem>
                            <SelectItem value="51">51 - Diferimento</SelectItem>
                            <SelectItem value="60">60 - ICMS cobrado anteriormente por ST</SelectItem>
                            <SelectItem value="70">70 - Com redução de base de cálculo e cobrança de ICMS por ST</SelectItem>
                            <SelectItem value="90">90 - Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="csosn-icms">CSOSN</Label>
                        <Select 
                          value={configData.impostos.icms.csosn}
                          onValueChange={(value) => setConfigData({
                            ...configData, 
                            impostos: {
                              ...configData.impostos,
                              icms: {
                                ...configData.impostos.icms,
                                csosn: value
                              }
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o CSOSN" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="101">101 - Tributada pelo Simples com permissão de crédito</SelectItem>
                            <SelectItem value="102">102 - Tributada pelo Simples sem permissão de crédito</SelectItem>
                            <SelectItem value="103">103 - Isenção do ICMS no Simples para faixa de receita bruta</SelectItem>
                            <SelectItem value="201">201 - Tributada pelo Simples com permissão de crédito e com cobrança do ICMS por ST</SelectItem>
                            <SelectItem value="202">202 - Tributada pelo Simples sem permissão de crédito e com cobrança do ICMS por ST</SelectItem>
                            <SelectItem value="203">203 - Isenção do ICMS no Simples para faixa de receita bruta e com cobrança do ICMS por ST</SelectItem>
                            <SelectItem value="300">300 - Imune</SelectItem>
                            <SelectItem value="400">400 - Não tributada pelo Simples Nacional</SelectItem>
                            <SelectItem value="500">500 - ICMS cobrado anteriormente por ST ou antecipação</SelectItem>
                            <SelectItem value="900">900 - Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="aliquota-icms">Alíquota ICMS (%)</Label>
                    <Input 
                      id="aliquota-icms" 
                      value={configData.impostos.icms.aliquotaBase}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        impostos: {
                          ...configData.impostos,
                          icms: {
                            ...configData.impostos.icms,
                            aliquotaBase: e.target.value
                          }
                        }
                      })}
                      placeholder="18.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aliquota-st">Alíquota ICMS ST (%)</Label>
                    <Input 
                      id="aliquota-st" 
                      value={configData.impostos.icms.aliquotaST}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        impostos: {
                          ...configData.impostos,
                          icms: {
                            ...configData.impostos.icms,
                            aliquotaST: e.target.value
                          }
                        }
                      })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Aplicável apenas para operações com substituição tributária
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border rounded-md p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <FileBarChart className="h-5 w-5 text-blue-600" />
                    PIS/COFINS
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cst-pis">CST PIS</Label>
                      <Select 
                        value={configData.impostos.pis.cst}
                        onValueChange={(value) => setConfigData({
                          ...configData, 
                          impostos: {
                            ...configData.impostos,
                            pis: {
                              ...configData.impostos.pis,
                              cst: value
                            }
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o CST" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">01 - Operação Tributável - Base de Cálculo = Valor da Operação</SelectItem>
                          <SelectItem value="02">02 - Operação Tributável - Base de Cálculo = Valor da Operação (Alíquota Diferenciada)</SelectItem>
                          <SelectItem value="03">03 - Operação Tributável - Base de Cálculo = Quantidade Vendida × Alíquota por Unidade de Produto</SelectItem>
                          <SelectItem value="04">04 - Operação Tributável - Tributação Monofásica</SelectItem>
                          <SelectItem value="05">05 - Operação Tributável - Substituição Tributária</SelectItem>
                          <SelectItem value="06">06 - Operação Tributável - Alíquota Zero</SelectItem>
                          <SelectItem value="07">07 - Operação Isenta da Contribuição</SelectItem>
                          <SelectItem value="08">08 - Operação sem Incidência da Contribuição</SelectItem>
                          <SelectItem value="09">09 - Operação com Suspensão da Contribuição</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="aliquota-pis">Alíquota PIS (%)</Label>
                      <Input 
                        id="aliquota-pis" 
                        value={configData.impostos.pis.aliquota}
                        onChange={(e) => setConfigData({
                          ...configData, 
                          impostos: {
                            ...configData.impostos,
                            pis: {
                              ...configData.impostos.pis,
                              aliquota: e.target.value
                            }
                          }
                        })}
                        placeholder="0.65"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cst-cofins">CST COFINS</Label>
                      <Select 
                        value={configData.impostos.cofins.cst}
                        onValueChange={(value) => setConfigData({
                          ...configData, 
                          impostos: {
                            ...configData.impostos,
                            cofins: {
                              ...configData.impostos.cofins,
                              cst: value
                            }
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o CST" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">01 - Operação Tributável - Base de Cálculo = Valor da Operação</SelectItem>
                          <SelectItem value="02">02 - Operação Tributável - Base de Cálculo = Valor da Operação (Alíquota Diferenciada)</SelectItem>
                          <SelectItem value="03">03 - Operação Tributável - Base de Cálculo = Quantidade Vendida × Alíquota por Unidade de Produto</SelectItem>
                          <SelectItem value="04">04 - Operação Tributável - Tributação Monofásica</SelectItem>
                          <SelectItem value="05">05 - Operação Tributável - Substituição Tributária</SelectItem>
                          <SelectItem value="06">06 - Operação Tributável - Alíquota Zero</SelectItem>
                          <SelectItem value="07">07 - Operação Isenta da Contribuição</SelectItem>
                          <SelectItem value="08">08 - Operação sem Incidência da Contribuição</SelectItem>
                          <SelectItem value="09">09 - Operação com Suspensão da Contribuição</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="aliquota-cofins">Alíquota COFINS (%)</Label>
                      <Input 
                        id="aliquota-cofins" 
                        value={configData.impostos.cofins.aliquota}
                        onChange={(e) => setConfigData({
                          ...configData, 
                          impostos: {
                            ...configData.impostos,
                            cofins: {
                              ...configData.impostos.cofins,
                              aliquota: e.target.value
                            }
                          }
                        })}
                        placeholder="3.00"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <FileBarChart className="h-5 w-5 text-blue-600" />
                    IPI
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cst-ipi">CST IPI</Label>
                      <Select 
                        value={configData.impostos.ipi.cst}
                        onValueChange={(value) => setConfigData({
                          ...configData, 
                          impostos: {
                            ...configData.impostos,
                            ipi: {
                              ...configData.impostos.ipi,
                              cst: value
                            }
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o CST" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="00">00 - Entrada com Recuperação de Crédito</SelectItem>
                          <SelectItem value="01">01 - Entrada Tributada com Alíquota Zero</SelectItem>
                          <SelectItem value="02">02 - Entrada Isenta</SelectItem>
                          <SelectItem value="03">03 - Entrada Não-Tributada</SelectItem>
                          <SelectItem value="04">04 - Entrada Imune</SelectItem>
                          <SelectItem value="05">05 - Entrada com Suspensão</SelectItem>
                          <SelectItem value="49">49 - Outras Entradas</SelectItem>
                          <SelectItem value="50">50 - Saída Tributada</SelectItem>
                          <SelectItem value="51">51 - Saída Tributável com Alíquota Zero</SelectItem>
                          <SelectItem value="52">52 - Saída Isenta</SelectItem>
                          <SelectItem value="53">53 - Saída Não-Tributada</SelectItem>
                          <SelectItem value="54">54 - Saída Imune</SelectItem>
                          <SelectItem value="55">55 - Saída com Suspensão</SelectItem>
                          <SelectItem value="99">99 - Outras Saídas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="aliquota-ipi">Alíquota IPI (%)</Label>
                      <Input 
                        id="aliquota-ipi" 
                        value={configData.impostos.ipi.aliquota}
                        onChange={(e) => setConfigData({
                          ...configData, 
                          impostos: {
                            ...configData.impostos,
                            ipi: {
                              ...configData.impostos.ipi,
                              aliquota: e.target.value
                            }
                          }
                        })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700 text-xs">
                        O IPI é aplicável apenas para empresas do regime normal
                        que trabalham com produtos industrializados.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("empresa")}>
                <ArrowLeft className="mr-1 h-4 w-4" />
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
                <Button onClick={() => setActiveTab("comportamento")}>
                  Próximo: Comportamento
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="comportamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comportamento</CardTitle>
              <CardDescription>
                Configure o comportamento de emissão e armazenamento das notas fiscais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Emissão de NFe
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="emitir-automaticamente" 
                      checked={configData.comportamento.emitirAutomaticamente}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          comportamento: {
                            ...configData.comportamento,
                            emitirAutomaticamente: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="emitir-automaticamente"
                      className="text-sm font-medium"
                    >
                      Emitir NFe automaticamente ao concluir pedido
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="considerar-frete" 
                      checked={configData.comportamento.considerarFreteNF}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          comportamento: {
                            ...configData.comportamento,
                            considerarFreteNF: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="considerar-frete"
                      className="text-sm font-medium"
                    >
                      Incluir valor do frete na NFe
                    </label>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Transportadora</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Os dados de transportadora serão preenchidos automaticamente com base nas informações do pedido.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  DANFE (Documento Auxiliar da NFe)
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="gerar-danfe" 
                      checked={configData.comportamento.gerarDanfe}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          comportamento: {
                            ...configData.comportamento,
                            gerarDanfe: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="gerar-danfe"
                      className="text-sm font-medium"
                    >
                      Gerar DANFE automaticamente
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="modelo-impressao">Modelo de Impressão</Label>
                    <Select 
                      value={configData.comportamento.modeloImpressao}
                      onValueChange={(value) => setConfigData({
                        ...configData, 
                        comportamento: {
                          ...configData.comportamento,
                          modeloImpressao: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal (PDF A4)</SelectItem>
                        <SelectItem value="simplificado">Simplificado</SelectItem>
                        <SelectItem value="etiqueta">Etiqueta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="salvar-pasta" 
                      checked={configData.comportamento.salvarPasta}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          comportamento: {
                            ...configData.comportamento,
                            salvarPasta: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="salvar-pasta"
                      className="text-sm font-medium"
                    >
                      Salvar DANFE em pasta
                    </label>
                  </div>
                  
                  {configData.comportamento.salvarPasta && (
                    <div className="space-y-2">
                      <Label htmlFor="pasta-armazenamento">Pasta de Armazenamento</Label>
                      <Input 
                        id="pasta-armazenamento" 
                        value={configData.comportamento.pastaArmazenamento}
                        onChange={(e) => setConfigData({
                          ...configData, 
                          comportamento: {
                            ...configData.comportamento,
                            pastaArmazenamento: e.target.value
                          }
                        })}
                        placeholder="/documentos/nfe"
                      />
                      <p className="text-xs text-muted-foreground">
                        Caminho relativo para armazenamento dos PDFs
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <ServerCog className="h-5 w-5 text-blue-600" />
                  Configurações Técnicas
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout de Conexão (segundos)</Label>
                    <Input 
                      id="timeout" 
                      type="number"
                      min="10"
                      max="120"
                      value={configData.tecnico.timeout}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        tecnico: {
                          ...configData.tecnico,
                          timeout: e.target.value
                        }
                      })}
                      placeholder="30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tentativas">Tentativas de Reenvio</Label>
                    <Input 
                      id="tentativas" 
                      type="number"
                      min="1"
                      max="5"
                      value={configData.tecnico.tentativasReenvio}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        tecnico: {
                          ...configData.tecnico,
                          tentativasReenvio: e.target.value
                        }
                      })}
                      placeholder="3"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="validar-schema" 
                        checked={configData.tecnico.validarSchema}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData,
                            tecnico: {
                              ...configData.tecnico,
                              validarSchema: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="validar-schema"
                        className="text-sm font-medium"
                      >
                        Validar schema XML antes do envio
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="salvar-xml" 
                        checked={configData.tecnico.salvarXML}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData,
                            tecnico: {
                              ...configData.tecnico,
                              salvarXML: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="salvar-xml"
                        className="text-sm font-medium"
                      >
                        Salvar XML original
                      </label>
                    </div>
                    
                    {configData.tecnico.salvarXML && (
                      <div className="space-y-2 mt-2">
                        <Label htmlFor="pasta-xml">Pasta para XMLs</Label>
                        <Input 
                          id="pasta-xml" 
                          value={configData.tecnico.pastaXML}
                          onChange={(e) => setConfigData({
                            ...configData, 
                            tecnico: {
                              ...configData.tecnico,
                              pastaXML: e.target.value
                            }
                          })}
                          placeholder="/documentos/xml"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("impostos")}>
                <ArrowLeft className="mr-1 h-4 w-4" />
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
                <Button onClick={() => setActiveTab("envio")}>
                  Próximo: Envio
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="envio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Envio de NFe</CardTitle>
              <CardDescription>
                Configure as opções de envio e notificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4">Notificação por E-mail</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notificar-cliente" 
                      checked={configData.email.notificarCliente}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          email: {
                            ...configData.email,
                            notificarCliente: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="notificar-cliente"
                      className="text-sm font-medium"
                    >
                      Enviar NFe por e-mail para o cliente
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="copia-empresa" 
                      checked={configData.email.copiaEmpresa}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          email: {
                            ...configData.email,
                            copiaEmpresa: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="copia-empresa"
                      className="text-sm font-medium"
                    >
                      Enviar cópia para e-mail da empresa
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-padrao">E-mail padrão da empresa (cópia)</Label>
                    <Input 
                      id="email-padrao" 
                      type="email"
                      value={configData.email.emailPadrao}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        email: {
                          ...configData.email,
                          emailPadrao: e.target.value
                        }
                      })}
                      placeholder="financeiro@empresa.com.br"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assunto-email">Assunto do E-mail</Label>
                    <Input 
                      id="assunto-email" 
                      value={configData.email.assuntoPadrao}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        email: {
                          ...configData.email,
                          assuntoPadrao: e.target.value
                        }
                      })}
                      placeholder="Nota Fiscal Eletrônica - [NUMERO_NF]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use [NUMERO_NF] para incluir o número da nota fiscal
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="texto-email">Texto do E-mail</Label>
                    <textarea 
                      id="texto-email" 
                      rows={5} 
                      className="w-full p-2 border rounded-md" 
                      value={configData.email.textoPadrao}
                      onChange={(e) => setConfigData({
                        ...configData, 
                        email: {
                          ...configData.email,
                          textoPadrao: e.target.value
                        }
                      })}
                      placeholder="Prezado cliente,

Segue em anexo a Nota Fiscal Eletrônica referente à sua compra.

Atenciosamente,
[EMPRESA]"
                    ></textarea>
                    <p className="text-xs text-muted-foreground">
                      Use [EMPRESA] para incluir o nome da empresa, [NUMERO_NF] para o número da nota
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Configuração Concluída</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Todas as etapas de configuração da integração com NFe foram preenchidas.
                    Você pode agora ativar a integração ou fazer ajustes em qualquer uma das configurações anteriores.
                  </AlertDescription>
                </Alert>
                
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 font-medium">Resumo da Configuração</div>
                  <div className="grid grid-cols-2 gap-2 p-4">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Ambiente</p>
                      <p className="font-medium">
                        {configData.ambiente === 'homologacao' ? 'Homologação (Testes)' : 'Produção'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Certificado</p>
                      <p className="font-medium">
                        {configData.certificado.tipoCertificado === 'A1' ? 'A1 (Arquivo Digital)' : 'A3 (Token/Cartão)'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Empresa</p>
                      <p className="font-medium">{configData.empresa.razaoSocial || "Não configurado"}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">CNPJ</p>
                      <p className="font-medium">{configData.empresa.cnpj || "Não configurado"}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Regime Tributário</p>
                      <p className="font-medium">
                        {configData.empresa.regime === 'normal' 
                          ? 'Lucro Real/Presumido' 
                          : configData.empresa.regime === 'simples' 
                            ? 'Simples Nacional' 
                            : 'MEI'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Série</p>
                      <p className="font-medium">{configData.series.serie}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("comportamento")}>
                <ArrowLeft className="mr-1 h-4 w-4" />
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
                    "Salvar Configurações"
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
              onClick={() => window.open("https://www.nfe.fazenda.gov.br", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Portal NFe SEFAZ
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://www.gov.br/nfce/pt-br", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Documentação NFe
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}