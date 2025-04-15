import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  FileText, 
  Award, 
  Users, 
  BarChart4, 
  Info, 
  Globe,
  ExternalLink,
  Copy
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const TransparenciaTest = () => {
  const [orgId, setOrgId] = useState<string>("");
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Função para copiar link para a área de transferência
  const copyToClipboard = (url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast({
        title: "Link copiado!",
        description: "URL copiada para a área de transferência.",
        duration: 3000,
      });
    }).catch(err => {
      toast({
        title: "Erro ao copiar link",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  // Função para acessar portal de qualquer organização
  const navigateToOrgPortal = () => {
    if (orgId && !isNaN(Number(orgId))) {
      navigate(`/organization/transparencia/${orgId}`);
    } else {
      toast({
        title: "ID Inválido",
        description: "Por favor, insira um ID de organização válido (número).",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Dados das organizações de exemplo
  const orgData = [
    {
      id: 1,
      name: "Abrace",
      description: "Associação Brasileira de Apoio Cannabis Esperança",
      tabs: ["sobre", "documentos", "certificacoes", "membros", "financeiro"]
    },
    {
      id: 32,
      name: "HempMeds",
      description: "Empresa pioneira em produtos de CBD",
      tabs: ["sobre", "documentos", "certificacoes", "membros", "financeiro"]
    }
  ];
  
  // Ícones para cada aba
  const tabIcons = {
    sobre: <Info className="h-4 w-4" />,
    documentos: <FileText className="h-4 w-4" />,
    certificacoes: <Award className="h-4 w-4" />,
    membros: <Users className="h-4 w-4" />,
    financeiro: <BarChart4 className="h-4 w-4" />
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Portal de Transparência</h1>
        <p className="text-gray-500 text-center max-w-2xl mb-6">
          Ferramenta para testar e acessar o Portal de Transparência de qualquer organização.
          Este portal permite que as organizações compartilhem informações de forma pública e transparente.
        </p>
        
        <Alert className="mb-8 max-w-2xl">
          <Info className="h-4 w-4" />
          <AlertTitle>Informação</AlertTitle>
          <AlertDescription>
            O Portal de Transparência é acessível publicamente sem necessidade de login. 
            Quando incorporado no site da organização, ele permite que visitantes vejam documentos, 
            certificações, membros da diretoria e relatórios financeiros.
          </AlertDescription>
        </Alert>
        
        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle>Acessar Portal</CardTitle>
            <CardDescription>
              Digite o ID da organização para visualizar seu portal de transparência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="orgId">ID da Organização</Label>
                <Input
                  id="orgId"
                  type="number"
                  placeholder="Ex: 1"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                />
              </div>
              <Button onClick={navigateToOrgPortal}>
                Acessar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-8" />

      <h2 className="text-2xl font-bold mb-6">Portais de Exemplo</h2>
      
      <Tabs defaultValue="abrace">
        <TabsList className="mb-6">
          <TabsTrigger value="abrace">Abrace (ID: 1)</TabsTrigger>
          <TabsTrigger value="hempmeds">HempMeds (ID: 32)</TabsTrigger>
        </TabsList>
        
        {orgData.map((org) => (
          <TabsContent key={org.id} value={org.id === 1 ? "abrace" : "hempmeds"}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Portal de Transparência - {org.name}
                </CardTitle>
                <CardDescription>ID da Organização: {org.id} • {org.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Links Diretos para Abas</h3>
                    <div className="space-y-2">
                      {org.tabs.map((tab) => (
                        <div key={tab} className="flex items-center">
                          <Link href={`/organization/transparencia/${org.id}${tab === 'sobre' ? '' : `/${tab}`}`}>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start"
                              size="sm"
                            >
                              {tabIcons[tab]} 
                              <span className="ml-2 capitalize">{tab === 'sobre' ? 'Página Principal' : tab}</span>
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => copyToClipboard(`/organization/transparencia/${org.id}${tab === 'sobre' ? '' : `/${tab}`}`)}
                            className="ml-2"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Informações do Portal</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>URL Base:</strong> <code>/organization/transparencia/{org.id}</code></p>
                      <p><strong>Acesso:</strong> Público (sem necessidade de login)</p>
                      <p><strong>Abas Disponíveis:</strong> {org.tabs.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</p>
                      <p className="text-gray-500 mt-4">
                        Este link pode ser incorporado no site da organização para cumprir requisitos de transparência.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Voltar
                </Button>
                <Link href={`/organization/transparencia/${org.id}`}>
                  <Button>
                    Acessar Portal <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TransparenciaTest;