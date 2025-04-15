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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Info, 
  AlertCircle, 
  RotateCw, 
  ShoppingCart,
  Key,
  CheckCircle,
  ExternalLink,
  CreditCard,
  PackageOpen
} from "lucide-react";

export default function WooCommerceIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("setup");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    storeUrl: "",
    consumerKey: "",
    consumerSecret: "",
    sincronizarProdutos: true,
    sincronizarPedidos: true,
    sincronizarEstoque: true,
    notificarCliente: true,
    metodoPagamento: "stripe"
  });
  
  // Métodos de pagamento disponíveis
  const paymentMethods = [
    { id: "stripe", name: "Stripe" },
    { id: "paypal", name: "PayPal" },
    { id: "complypay", name: "ComplyPay (Gateway Próprio)" },
    { id: "pix", name: "PIX" },
    { id: "boleto", name: "Boleto Bancário" },
    { id: "transfer", name: "Transferência Bancária" }
  ];
  
  // Função para ativar a integração
  const activateIntegration = () => {
    // Validação básica
    if (!configData.storeUrl || !configData.consumerKey || !configData.consumerSecret) {
      toast({
        title: "Informações incompletas",
        description: "Preencha todos os dados de acesso à API do WooCommerce para continuar.",
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
        description: "A integração com WooCommerce foi ativada com sucesso!",
      });
      
      // Redirecionar para a página principal de integrações
      setTimeout(() => {
        window.location.href = "/organization/integracoes";
      }, 1500);
    }, 2000);
  };
  
  // Função para salvar configurações
  const saveConfiguration = () => {
    setIsSaving(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da integração foram salvas com sucesso.",
      });
    }, 1500);
  };
  
  // Função para validar URL
  const validateUrl = (url: string) => {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
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
        <h1 className="text-3xl font-bold">WooCommerce</h1>
        <Badge className="bg-gray-100 text-gray-800">
          Inativa
        </Badge>
      </div>
      <p className="text-muted-foreground">Integre sua loja online com o sistema de pagamentos</p>
      
      <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="setup">Configuração</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conectar com WooCommerce</CardTitle>
              <CardDescription>
                Configure a integração com sua loja WooCommerce
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Como obter as credenciais da API</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p className="mb-2">Para conectar sua loja WooCommerce, você precisará gerar as chaves de API:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Acesse o painel administrativo da sua loja WordPress</li>
                    <li>Navegue até WooCommerce &gt; Configurações &gt; Avançado &gt; API REST</li>
                    <li>Clique em "Adicionar chave" e defina as permissões como "Leitura/Escrita"</li>
                    <li>Copie a Chave do Consumidor e o Segredo do Consumidor</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-url">URL da Loja</Label>
                  <Input 
                    id="store-url" 
                    placeholder="https://sua-loja.com.br" 
                    value={configData.storeUrl}
                    onChange={(e) => setConfigData({...configData, storeUrl: e.target.value})}
                    className={!validateUrl(configData.storeUrl) && configData.storeUrl ? "border-red-300" : ""}
                  />
                  {!validateUrl(configData.storeUrl) && configData.storeUrl && (
                    <p className="text-xs text-red-500">URL inválida. Use o formato completo: https://sua-loja.com.br</p>
                  )}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="consumer-key">Chave do Consumidor (Consumer Key)</Label>
                    <div className="relative">
                      <Input 
                        id="consumer-key" 
                        placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                        value={configData.consumerKey}
                        onChange={(e) => setConfigData({...configData, consumerKey: e.target.value})}
                      />
                      <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="consumer-secret">Segredo do Consumidor (Consumer Secret)</Label>
                    <div className="relative">
                      <Input 
                        id="consumer-secret" 
                        type="password"
                        placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                        value={configData.consumerSecret}
                        onChange={(e) => setConfigData({...configData, consumerSecret: e.target.value})}
                      />
                      <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-sm font-medium mb-3">Opções de Sincronização</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sync-products" 
                      checked={configData.sincronizarProdutos}
                      onCheckedChange={(checked) => setConfigData({...configData, sincronizarProdutos: checked})}
                    />
                    <Label htmlFor="sync-products">Sincronizar produtos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sync-orders" 
                      checked={configData.sincronizarPedidos}
                      onCheckedChange={(checked) => setConfigData({...configData, sincronizarPedidos: checked})}
                    />
                    <Label htmlFor="sync-orders">Sincronizar pedidos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sync-inventory" 
                      checked={configData.sincronizarEstoque}
                      onCheckedChange={(checked) => setConfigData({...configData, sincronizarEstoque: checked})}
                    />
                    <Label htmlFor="sync-inventory">Sincronizar estoque</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notify-customer" 
                      checked={configData.notificarCliente}
                      onCheckedChange={(checked) => setConfigData({...configData, notificarCliente: checked})}
                    />
                    <Label htmlFor="notify-customer">Notificar cliente ao sincronizar pedidos</Label>
                  </div>
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
                <Button onClick={() => setActiveTab("products")}>
                  Próximo: Produtos
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Produtos</CardTitle>
              <CardDescription>
                Configure como os produtos serão sincronizados entre as plataformas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Importante</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  A sincronização de produtos permite manter o catálogo e estoque atualizados entre sua loja e o sistema de gestão.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="border rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Produtos WooCommerce → Endurancy</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Importa produtos da sua loja para o sistema
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="radio" id="import-all" name="import" defaultChecked />
                          <label htmlFor="import-all" className="text-sm">Importar todos os produtos</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" id="import-selected" name="import" />
                          <label htmlFor="import-selected" className="text-sm">Importar categorias selecionadas</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" id="import-manual" name="import" />
                          <label htmlFor="import-manual" className="text-sm">Importar manualmente</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <PackageOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Produtos Endurancy → WooCommerce</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Exporta produtos do sistema para sua loja
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="radio" id="export-all" name="export" defaultChecked />
                          <label htmlFor="export-all" className="text-sm">Exportar todos os produtos</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" id="export-selected" name="export" />
                          <label htmlFor="export-selected" className="text-sm">Exportar produtos selecionados</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" id="export-manual" name="export" />
                          <label htmlFor="export-manual" className="text-sm">Exportar manualmente</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Mapeamento de Campos</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-medium">Campo Endurancy</div>
                    <div className="font-medium">Campo WooCommerce</div>
                    
                    <div>Nome do Produto</div>
                    <div>Nome do Produto</div>
                    
                    <div>Descrição</div>
                    <div>Descrição</div>
                    
                    <div>Preço de Venda</div>
                    <div>Preço Regular</div>
                    
                    <div>Preço Promocional</div>
                    <div>Preço com Desconto</div>
                    
                    <div>Categoria</div>
                    <div>Categoria de Produto</div>
                    
                    <div>Código SKU</div>
                    <div>SKU</div>
                    
                    <div>Estoque</div>
                    <div>Quantidade em Estoque</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("setup")}>
                Voltar
              </Button>
              <Button onClick={() => setActiveTab("payments")}>
                Próximo: Pagamentos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Pagamentos</CardTitle>
              <CardDescription>
                Configure como os pagamentos serão processados entre as plataformas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Método de Pagamento Padrão</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Selecione o método de pagamento principal para sua loja WooCommerce
                      </p>
                      <div className="grid gap-2 mt-3 sm:grid-cols-2 lg:grid-cols-3">
                        {paymentMethods.map(method => (
                          <div 
                            key={method.id} 
                            className={`border rounded-md p-3 cursor-pointer hover:border-blue-300 transition-colors ${
                              configData.metodoPagamento === method.id ? 'border-blue-500 bg-blue-50' : ''
                            }`}
                            onClick={() => setConfigData({...configData, metodoPagamento: method.id})}
                          >
                            <div className="flex items-center gap-2">
                              {configData.metodoPagamento === method.id && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                              <span>{method.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Fluxo de Sincronização de Pedidos</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure como os status de pedidos são sincronizados entre as plataformas
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="font-medium">Status WooCommerce</div>
                      <div className="font-medium">Ação</div>
                      <div className="font-medium">Status Endurancy</div>
                      
                      <div>Pendente</div>
                      <div className="text-center">→</div>
                      <div>Aguardando Pagamento</div>
                      
                      <div>Processando</div>
                      <div className="text-center">→</div>
                      <div>Em Processamento</div>
                      
                      <div>Em Espera</div>
                      <div className="text-center">→</div>
                      <div>Aguardando Confirmação</div>
                      
                      <div>Concluído</div>
                      <div className="text-center">→</div>
                      <div>Finalizado</div>
                      
                      <div>Cancelado</div>
                      <div className="text-center">→</div>
                      <div>Cancelado</div>
                      
                      <div>Reembolsado</div>
                      <div className="text-center">→</div>
                      <div>Estornado</div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Notificações</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Enviar email ao cliente quando o status do pedido mudar</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Notificar administrador sobre novos pedidos</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Notificar sobre falhas de pagamento</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("products")}>
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
          
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://woocommerce.com/document/woocommerce-rest-api/", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Documentação WooCommerce
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => window.open("https://woo.com/products/woocommerce-api-manager/", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              API Manager WooCommerce
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}