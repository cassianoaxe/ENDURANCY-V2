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
  ShoppingBag,
  Store,
  Key,
  ExternalLink,
  Package,
  Wallet,
  Truck,
  LinkIcon,
  Settings,
  Clock,
  ArrowDownUp,
  ShoppingCart,
  Users,
  Percent,
  BarChart
} from "lucide-react";

export default function ShopifyIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("setup");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    loja: {
      nome: "",
      url: "",
      apiKey: "",
      apiSecret: "",
      accessToken: "",
      apiVersion: "2024-01",
    },
    sincronizacao: {
      produtos: true,
      pedidos: true,
      clientes: true,
      inventario: true,
      precos: true,
      categorias: true,
      imagens: true,
      intervalo: "15", // minutos
      ultimaSincronizacao: "",
    },
    mapeamento: {
      produtoPrincipal: "sku", // sku, id, gtin
      variacaoPrincipal: "tamanho", // tamanho, cor, material, etc.
      categoriaPrincipal: "colecao", // colecao, tipo, tag
    },
    pedidos: {
      statusPadrao: "processing", // pending, processing, shipped, delivered, cancelled
      notificarCliente: true,
      gerarNotaFiscal: false,
      cancelarPedidoInventarioInsuficiente: false,
      atualizarRastreio: true,
    },
    webhooks: {
      novoPedido: true,
      atualizacaoPedido: true,
      novoProduto: true,
      atualizacaoProduto: true,
      estoqueInsuficiente: true,
      devolucao: true,
      urlCallback: "https://endurancy25.replit.app/api/webhooks/shopify",
    },
    opcoes: {
      importarPedidosAntigos: false,
      diasImportacao: "30",
      importarProdutosInativos: false,
      exportarProdutosInativos: false,
      exportarVariacoes: true,
    }
  });
  
  // Lista de status de pedidos do Shopify
  const pedidosStatus = [
    { valor: "pending", nome: "Pendente", descricao: "Pedido recebido, aguardando processamento" },
    { valor: "processing", nome: "Em processamento", descricao: "Pedido sendo processado" },
    { valor: "shipped", nome: "Enviado", descricao: "Pedido enviado ao cliente" },
    { valor: "delivered", nome: "Entregue", descricao: "Pedido entregue ao cliente" },
    { valor: "cancelled", nome: "Cancelado", descricao: "Pedido cancelado" }
  ];
  
  // Produtos de exemplo
  const produtosExemplo = [
    { id: 1, nome: "Camiseta Lisa", sku: "CAM001", preco: "R$ 79,90", estoque: 25, status: "Ativo" },
    { id: 2, nome: "Calça Jeans", sku: "CJ002", preco: "R$ 149,90", estoque: 18, status: "Ativo" },
    { id: 3, nome: "Jaqueta Inverno", sku: "JQ003", preco: "R$ 229,90", estoque: 7, status: "Ativo" },
    { id: 4, nome: "Bermuda Casual", sku: "BM004", preco: "R$ 99,90", estoque: 0, status: "Esgotado" }
  ];
  
  // Função para salvar configurações
  const saveConfiguration = () => {
    setIsSaving(true);
    
    // Validação básica
    if (activeTab === 'setup' && (!configData.loja.url || !configData.loja.apiKey || !configData.loja.apiSecret)) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios da loja.",
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
        description: "As configurações foram salvas com sucesso."
      });
    }, 1500);
  };
  
  // Função para ativar integração
  const activateIntegration = () => {
    // Validação básica
    if (!configData.loja.url || !configData.loja.apiKey || !configData.loja.apiSecret) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os dados da API do Shopify para ativar a integração.",
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
        description: "A integração com Shopify foi ativada com sucesso."
      });
      
      // Redirecionamento para a lista de integrações
      setTimeout(() => {
        navigate("/organization/integracoes");
      }, 1500);
    }, 2000);
  };
  
  // Função para formatar URLs da loja
  const formatStoreUrl = (url: string) => {
    if (!url) return url;
    
    // Remove https:// e http:// prefixes e .myshopify.com suffix para normalização
    let normalizedUrl = url.replace(/^https?:\/\//, '').replace(/\.myshopify\.com\/?$/, '');
    
    // Adiciona .myshopify.com se não estiver presente
    if (!normalizedUrl.includes('.myshopify.com') && !normalizedUrl.includes('.')) {
      normalizedUrl = `${normalizedUrl}.myshopify.com`;
    }
    
    // Adiciona https:// prefix
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return `https://${normalizedUrl}`;
    }
    
    return url;
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
        <h1 className="text-3xl font-bold">Shopify</h1>
        <Badge className="bg-gray-100 text-gray-800">
          Inativa
        </Badge>
      </div>
      <p className="text-muted-foreground">Integração com a plataforma Shopify para gerenciamento de e-commerce</p>
      
      <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="setup">Configuração</TabsTrigger>
          <TabsTrigger value="mapeamento">Mapeamento</TabsTrigger>
          <TabsTrigger value="sincronizacao">Sincronização</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Loja Shopify</CardTitle>
              <CardDescription>
                Configure as credenciais para conexão com sua loja no Shopify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Como obter as credenciais</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p className="mb-2">Para integrar com o Shopify, você precisa criar um aplicativo privado:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Acesse o painel de administração da sua loja Shopify</li>
                    <li>Vá até Configurações → Apps e canais → Desenvolver apps</li>
                    <li>Clique em "Criar um app"</li>
                    <li>Configure as permissões necessárias (produtos, pedidos, clientes, etc.)</li>
                    <li>Copie as chaves de API e token de acesso</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-loja">Nome da Loja</Label>
                  <Input 
                    id="nome-loja" 
                    value={configData.loja.nome}
                    onChange={(e) => setConfigData({
                      ...configData,
                      loja: {
                        ...configData.loja,
                        nome: e.target.value
                      }
                    })}
                    placeholder="Minha Loja"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url-loja">URL da Loja</Label>
                  <div className="relative">
                    <Input 
                      id="url-loja" 
                      value={configData.loja.url}
                      onChange={(e) => setConfigData({
                        ...configData,
                        loja: {
                          ...configData.loja,
                          url: formatStoreUrl(e.target.value)
                        }
                      })}
                      placeholder="minha-loja.myshopify.com"
                    />
                    <Store className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    URL da sua loja Shopify (ex: minha-loja.myshopify.com)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="relative">
                    <Input 
                      id="api-key" 
                      value={configData.loja.apiKey}
                      onChange={(e) => setConfigData({
                        ...configData,
                        loja: {
                          ...configData.loja,
                          apiKey: e.target.value
                        }
                      })}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-secret">API Secret Key</Label>
                  <div className="relative">
                    <Input 
                      id="api-secret" 
                      type="password"
                      value={configData.loja.apiSecret}
                      onChange={(e) => setConfigData({
                        ...configData,
                        loja: {
                          ...configData.loja,
                          apiSecret: e.target.value
                        }
                      })}
                      placeholder="shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="access-token">Access Token</Label>
                  <div className="relative">
                    <Input 
                      id="access-token" 
                      type="password"
                      value={configData.loja.accessToken}
                      onChange={(e) => setConfigData({
                        ...configData,
                        loja: {
                          ...configData.loja,
                          accessToken: e.target.value
                        }
                      })}
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O Access Token é necessário para acessar a API Admin do Shopify
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-version">Versão da API</Label>
                  <Select 
                    value={configData.loja.apiVersion}
                    onValueChange={(value) => setConfigData({
                      ...configData,
                      loja: {
                        ...configData.loja,
                        apiVersion: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a versão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-01">2024-01 (Mais recente)</SelectItem>
                      <SelectItem value="2023-10">2023-10</SelectItem>
                      <SelectItem value="2023-07">2023-07</SelectItem>
                      <SelectItem value="2023-04">2023-04</SelectItem>
                      <SelectItem value="2023-01">2023-01</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Recomendamos usar a versão mais recente da API
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => window.open("https://shopify.dev/docs/api", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Documentação da API
                </Button>
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
                <Button onClick={() => setActiveTab("mapeamento")}>
                  Próximo: Mapeamento
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapeamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento de Dados</CardTitle>
              <CardDescription>
                Configure como os dados serão mapeados entre o Shopify e o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Importante</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  O mapeamento correto é essencial para garantir que os produtos, pedidos e clientes sejam sincronizados adequadamente entre as plataformas.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Produtos
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="produto-principal">Identificador Principal de Produto</Label>
                    <Select 
                      value={configData.mapeamento.produtoPrincipal}
                      onValueChange={(value) => setConfigData({
                        ...configData,
                        mapeamento: {
                          ...configData.mapeamento,
                          produtoPrincipal: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o identificador" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sku">SKU</SelectItem>
                        <SelectItem value="id">ID</SelectItem>
                        <SelectItem value="gtin">GTIN/EAN/UPC</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Campo usado para identificar produtos entre os sistemas
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="variacao-principal">Atributo Principal de Variação</Label>
                    <Select 
                      value={configData.mapeamento.variacaoPrincipal}
                      onValueChange={(value) => setConfigData({
                        ...configData,
                        mapeamento: {
                          ...configData.mapeamento,
                          variacaoPrincipal: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o atributo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tamanho">Tamanho</SelectItem>
                        <SelectItem value="cor">Cor</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="estilo">Estilo</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Atributo principal usado nas variações de produtos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categoria-principal">Agrupamento de Categorias</Label>
                    <Select 
                      value={configData.mapeamento.categoriaPrincipal}
                      onValueChange={(value) => setConfigData({
                        ...configData,
                        mapeamento: {
                          ...configData.mapeamento,
                          categoriaPrincipal: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o agrupamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colecao">Coleções</SelectItem>
                        <SelectItem value="tipo">Tipo de Produto</SelectItem>
                        <SelectItem value="tag">Tags</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Como as categorias do Shopify serão mapeadas no sistema
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  Campos Personalizados
                </h3>
                
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campo Shopify</TableHead>
                          <TableHead>Campo no Sistema</TableHead>
                          <TableHead>Sincronização</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Título</TableCell>
                          <TableCell>Nome do Produto</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Ambas direções</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>SEO Title</TableCell>
                          <TableCell>Meta Título</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Ambas direções</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Compare at price</TableCell>
                          <TableCell>Preço Original</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">Shopify → Sistema</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Barcode</TableCell>
                          <TableCell>GTIN/EAN</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Ambas direções</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700 text-sm">
                      Este mapeamento define como os dados são sincronizados. O mapeamento completo pode ser personalizado sob demanda.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Status de Pedido
                </h3>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status no Shopify</TableHead>
                        <TableHead>Status no Sistema</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Pending</TableCell>
                        <TableCell>Aguardando Processamento</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Processing</TableCell>
                        <TableCell>Em Processamento</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Fulfilled</TableCell>
                        <TableCell>Enviado</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Delivered</TableCell>
                        <TableCell>Entregue</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cancelled</TableCell>
                        <TableCell>Cancelado</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Refunded</TableCell>
                        <TableCell>Reembolsado</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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
                <Button onClick={() => setActiveTab("sincronizacao")}>
                  Próximo: Sincronização
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sincronizacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sincronização</CardTitle>
              <CardDescription>
                Configure quais dados serão sincronizados e a frequência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <ArrowDownUp className="h-5 w-5 text-blue-600" />
                  Itens a Sincronizar
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sync-produtos" 
                      checked={configData.sincronizacao.produtos}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          sincronizacao: {
                            ...configData.sincronizacao,
                            produtos: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="sync-produtos"
                      className="text-sm font-medium"
                    >
                      Produtos
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sync-pedidos" 
                      checked={configData.sincronizacao.pedidos}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          sincronizacao: {
                            ...configData.sincronizacao,
                            pedidos: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="sync-pedidos"
                      className="text-sm font-medium"
                    >
                      Pedidos
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sync-clientes" 
                      checked={configData.sincronizacao.clientes}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          sincronizacao: {
                            ...configData.sincronizacao,
                            clientes: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="sync-clientes"
                      className="text-sm font-medium"
                    >
                      Clientes
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sync-inventario" 
                      checked={configData.sincronizacao.inventario}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          sincronizacao: {
                            ...configData.sincronizacao,
                            inventario: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="sync-inventario"
                      className="text-sm font-medium"
                    >
                      Inventário
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sync-precos" 
                      checked={configData.sincronizacao.precos}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          sincronizacao: {
                            ...configData.sincronizacao,
                            precos: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="sync-precos"
                      className="text-sm font-medium"
                    >
                      Preços
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sync-categorias" 
                      checked={configData.sincronizacao.categorias}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          sincronizacao: {
                            ...configData.sincronizacao,
                            categorias: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="sync-categorias"
                      className="text-sm font-medium"
                    >
                      Categorias/Coleções
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sync-imagens" 
                      checked={configData.sincronizacao.imagens}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          sincronizacao: {
                            ...configData.sincronizacao,
                            imagens: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="sync-imagens"
                      className="text-sm font-medium"
                    >
                      Imagens de Produtos
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Programação
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="intervalo-sync">Intervalo de Sincronização (minutos)</Label>
                    <Select 
                      value={configData.sincronizacao.intervalo}
                      onValueChange={(value) => setConfigData({
                        ...configData,
                        sincronizacao: {
                          ...configData.sincronizacao,
                          intervalo: value
                        }
                      })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Selecione o intervalo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutos</SelectItem>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="360">6 horas</SelectItem>
                        <SelectItem value="720">12 horas</SelectItem>
                        <SelectItem value="1440">24 horas</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Frequência com que os dados serão sincronizados automaticamente
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="importar-pedidos-antigos" 
                      checked={configData.opcoes.importarPedidosAntigos}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          opcoes: {
                            ...configData.opcoes,
                            importarPedidosAntigos: checked as boolean
                          }
                        })
                      }
                    />
                    <div>
                      <label
                        htmlFor="importar-pedidos-antigos"
                        className="text-sm font-medium"
                      >
                        Importar pedidos anteriores à integração
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Se ativado, os pedidos anteriores à integração serão importados
                      </p>
                    </div>
                  </div>
                  
                  {configData.opcoes.importarPedidosAntigos && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="dias-importacao">Período de importação (dias)</Label>
                      <Select 
                        value={configData.opcoes.diasImportacao}
                        onValueChange={(value) => setConfigData({
                          ...configData,
                          opcoes: {
                            ...configData.opcoes,
                            diasImportacao: value
                          }
                        })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 dias</SelectItem>
                          <SelectItem value="15">15 dias</SelectItem>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="60">60 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                          <SelectItem value="180">6 meses</SelectItem>
                          <SelectItem value="365">1 ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="importar-produtos-inativos" 
                      checked={configData.opcoes.importarProdutosInativos}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          opcoes: {
                            ...configData.opcoes,
                            importarProdutosInativos: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="importar-produtos-inativos"
                      className="text-sm font-medium"
                    >
                      Importar produtos inativos/arquivados
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="exportar-produtos-inativos" 
                      checked={configData.opcoes.exportarProdutosInativos}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          opcoes: {
                            ...configData.opcoes,
                            exportarProdutosInativos: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="exportar-produtos-inativos"
                      className="text-sm font-medium"
                    >
                      Exportar produtos inativos
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                  Produtos para Sincronização
                </h3>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtosExemplo.map(produto => (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium">{produto.nome}</TableCell>
                          <TableCell>{produto.sku}</TableCell>
                          <TableCell>{produto.preco}</TableCell>
                          <TableCell>{produto.estoque}</TableCell>
                          <TableCell>
                            <Badge className={
                              produto.status === 'Ativo' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }>
                              {produto.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => {
                      toast({
                        title: "Sincronização iniciada",
                        description: "A sincronização inicial de produtos foi iniciada."
                      });
                    }}
                  >
                    <ArrowDownUp className="h-4 w-4" />
                    Sincronizar Produtos Agora
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("mapeamento")}>
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
                <Button onClick={() => setActiveTab("pedidos")}>
                  Próximo: Pedidos
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="pedidos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pedidos</CardTitle>
              <CardDescription>
                Configure como os pedidos serão processados e gerenciados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Processamento de Pedidos
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status-padrao">Status Padrão para Novos Pedidos</Label>
                    <Select 
                      value={configData.pedidos.statusPadrao}
                      onValueChange={(value) => setConfigData({
                        ...configData,
                        pedidos: {
                          ...configData.pedidos,
                          statusPadrao: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {pedidosStatus.map(status => (
                          <SelectItem key={status.valor} value={status.valor}>
                            {status.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Status inicial dos pedidos importados do Shopify
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notificar-cliente" 
                      checked={configData.pedidos.notificarCliente}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          pedidos: {
                            ...configData.pedidos,
                            notificarCliente: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="notificar-cliente"
                      className="text-sm font-medium"
                    >
                      Notificar cliente sobre alterações de status
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="gerar-nf" 
                      checked={configData.pedidos.gerarNotaFiscal}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          pedidos: {
                            ...configData.pedidos,
                            gerarNotaFiscal: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="gerar-nf"
                      className="text-sm font-medium"
                    >
                      Gerar nota fiscal automaticamente
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cancelar-estoque-insuficiente" 
                      checked={configData.pedidos.cancelarPedidoInventarioInsuficiente}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          pedidos: {
                            ...configData.pedidos,
                            cancelarPedidoInventarioInsuficiente: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="cancelar-estoque-insuficiente"
                      className="text-sm font-medium"
                    >
                      Cancelar pedido automaticamente caso estoque seja insuficiente
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="atualizar-rastreio" 
                      checked={configData.pedidos.atualizarRastreio}
                      onCheckedChange={(checked) => 
                        setConfigData({
                          ...configData,
                          pedidos: {
                            ...configData.pedidos,
                            atualizarRastreio: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="atualizar-rastreio"
                      className="text-sm font-medium"
                    >
                      Atualizar código de rastreamento no Shopify
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Clientes
                </h3>
                
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Importação de Clientes</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Os dados de clientes serão importados automaticamente a partir dos pedidos recebidos.
                      Os seguintes campos serão sincronizados: nome, e-mail, telefone e endereços.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="criar-cliente-automatico" defaultChecked />
                    <label
                      htmlFor="criar-cliente-automatico"
                      className="text-sm font-medium"
                    >
                      Criar cliente automaticamente ao receber um novo pedido
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="atualizar-cliente-existente" defaultChecked />
                    <label
                      htmlFor="atualizar-cliente-existente"
                      className="text-sm font-medium"
                    >
                      Atualizar dados de cliente existente ao receber um novo pedido
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5 text-blue-600" />
                  Descontos e Cupons
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="importar-cupons" defaultChecked />
                    <label
                      htmlFor="importar-cupons"
                      className="text-sm font-medium"
                    >
                      Importar descontos e cupons aplicados nos pedidos
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="desconto-linha" defaultChecked />
                    <label
                      htmlFor="desconto-linha"
                      className="text-sm font-medium"
                    >
                      Aplicar descontos de linha em cada produto individualmente
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="desconto-pedido" defaultChecked />
                    <label
                      htmlFor="desconto-pedido"
                      className="text-sm font-medium"
                    >
                      Aplicar descontos de pedido como um item separado
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("sincronizacao")}>
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
                <Button onClick={() => setActiveTab("webhooks")}>
                  Próximo: Webhooks
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks e Integrações Avançadas</CardTitle>
              <CardDescription>
                Configure webhooks para manter os sistemas sincronizados em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Sobre Webhooks</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p className="mb-2">Os webhooks permitem que o Shopify notifique o sistema em tempo real quando eventos ocorrem, como:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Novos pedidos</li>
                    <li>Atualizações de pedidos</li>
                    <li>Alterações de produtos</li>
                    <li>Atualizações de estoque</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                  Configuração de Webhooks
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL de Callback</Label>
                    <Input 
                      id="webhook-url" 
                      value={configData.webhooks.urlCallback}
                      onChange={(e) => setConfigData({
                        ...configData,
                        webhooks: {
                          ...configData.webhooks,
                          urlCallback: e.target.value
                        }
                      })}
                      placeholder="https://seu-site.com/api/webhooks/shopify"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL que receberá as notificações do Shopify
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="webhook-novo-pedido" 
                        checked={configData.webhooks.novoPedido}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData,
                            webhooks: {
                              ...configData.webhooks,
                              novoPedido: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="webhook-novo-pedido"
                        className="text-sm font-medium"
                      >
                        Novo pedido
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="webhook-atualizacao-pedido" 
                        checked={configData.webhooks.atualizacaoPedido}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData,
                            webhooks: {
                              ...configData.webhooks,
                              atualizacaoPedido: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="webhook-atualizacao-pedido"
                        className="text-sm font-medium"
                      >
                        Atualização de pedido
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="webhook-novo-produto" 
                        checked={configData.webhooks.novoProduto}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData,
                            webhooks: {
                              ...configData.webhooks,
                              novoProduto: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="webhook-novo-produto"
                        className="text-sm font-medium"
                      >
                        Novo produto
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="webhook-atualizacao-produto" 
                        checked={configData.webhooks.atualizacaoProduto}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData,
                            webhooks: {
                              ...configData.webhooks,
                              atualizacaoProduto: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="webhook-atualizacao-produto"
                        className="text-sm font-medium"
                      >
                        Atualização de produto
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="webhook-estoque-insuficiente" 
                        checked={configData.webhooks.estoqueInsuficiente}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData,
                            webhooks: {
                              ...configData.webhooks,
                              estoqueInsuficiente: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="webhook-estoque-insuficiente"
                        className="text-sm font-medium"
                      >
                        Estoque insuficiente
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="webhook-devolucao" 
                        checked={configData.webhooks.devolucao}
                        onCheckedChange={(checked) => 
                          setConfigData({
                            ...configData,
                            webhooks: {
                              ...configData.webhooks,
                              devolucao: checked as boolean
                            }
                          })
                        }
                      />
                      <label
                        htmlFor="webhook-devolucao"
                        className="text-sm font-medium"
                      >
                        Devolução/Reembolso
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Configurações Avançadas
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sincronizacao-inventario">Sincronização de Inventário</Label>
                    <RadioGroup id="sincronizacao-inventario" defaultValue="bidirecional">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bidirecional" id="bi-direcional" />
                        <Label htmlFor="bi-direcional">Bidirecional (alterações em ambos os sistemas são sincronizadas)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="shopify-to-system" id="shopify-to-system" />
                        <Label htmlFor="shopify-to-system">Apenas do Shopify para o sistema</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system-to-shopify" id="system-to-shopify" />
                        <Label htmlFor="system-to-shopify">Apenas do sistema para o Shopify</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="verificar-erros" defaultChecked />
                    <label
                      htmlFor="verificar-erros"
                      className="text-sm font-medium"
                    >
                      Verificar erros de sincronização e notificar administradores
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="log-atividade" defaultChecked />
                    <label
                      htmlFor="log-atividade"
                      className="text-sm font-medium"
                    >
                      Registrar log de atividades da integração
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  Status e Diagnóstico
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <p className="text-green-800 flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      A configuração de integração está pronta para ativação
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Após ativar a integração, o sistema começará a sincronizar dados entre o Shopify e a plataforma 
                    Endurancy. As primeiras sincronizações podem levar mais tempo dependendo do volume de dados.
                  </p>
                  
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Recomendação</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      Recomendamos realizar a primeira sincronização fora do horário comercial para evitar impactos no desempenho da sua loja.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("pedidos")}>
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
              onClick={() => window.open("https://shopify.dev/docs/api/admin-rest", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              API REST do Shopify
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://shopify.dev/docs/api/admin-graphql", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              API GraphQL do Shopify
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}