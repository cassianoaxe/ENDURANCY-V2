import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  ExternalLink, 
  Check, 
  X, 
  Clock, 
  Save,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Interface para domínio
interface Domain {
  id: number;
  domain: string;
  organizationId: number | null;
  organizationName: string | null;
  type: 'custom' | 'subdomain';
  status: 'pending' | 'active' | 'error';
  verificationStatus: 'verified' | 'pending' | 'failed';
  createdAt: Date;
  lastCheckedAt: Date | null;
  error?: string;
}

export default function DomainSettings() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('dominios');
  const [baseSubdomain, setBaseSubdomain] = useState('endurancy.app');
  const [enableCustomDomains, setEnableCustomDomains] = useState(true);
  const [verifyDomains, setVerifyDomains] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [subdomainPattern, setSubdomainPattern] = useState('{{name}}');
  const [domainBlacklist, setDomainBlacklist] = useState('admin,api,app,dashboard,sistema,painel');
  
  // Dados de exemplo para domínios ativos
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: 1,
      domain: 'abrace.endurancy.app',
      organizationId: 1,
      organizationName: 'Abrace',
      type: 'subdomain',
      status: 'active',
      verificationStatus: 'verified',
      createdAt: new Date(2025, 3, 15),
      lastCheckedAt: new Date(2025, 4, 10),
    },
    {
      id: 2,
      domain: 'cannabis-care.endurancy.app',
      organizationId: 2,
      organizationName: 'Cannabis Care',
      type: 'subdomain',
      status: 'active',
      verificationStatus: 'verified',
      createdAt: new Date(2025, 3, 10),
      lastCheckedAt: new Date(2025, 4, 10),
    },
    {
      id: 3,
      domain: 'cannabiscare.com.br',
      organizationId: 2,
      organizationName: 'Cannabis Care',
      type: 'custom',
      status: 'pending',
      verificationStatus: 'pending',
      createdAt: new Date(2025, 4, 5),
      lastCheckedAt: null,
    },
    {
      id: 4,
      domain: 'amme.endurancy.app',
      organizationId: 3,
      organizationName: 'Amme Medicinal',
      type: 'subdomain',
      status: 'active',
      verificationStatus: 'verified',
      createdAt: new Date(2025, 2, 20),
      lastCheckedAt: new Date(2025, 4, 10),
    },
    {
      id: 5,
      domain: 'cannativa.com.br',
      organizationId: 4,
      organizationName: 'Cannativa',
      type: 'custom',
      status: 'error',
      verificationStatus: 'failed',
      createdAt: new Date(2025, 3, 12),
      lastCheckedAt: new Date(2025, 4, 8),
      error: 'DNS A record not pointing to the correct IP address',
    }
  ]);

  // Salvar configurações
  const saveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de domínio foram atualizadas com sucesso.",
    });
  };

  // Verificar domínio
  const verifyDomain = (id: number) => {
    toast({
      title: "Verificação iniciada",
      description: "A verificação do domínio foi iniciada e levará alguns minutos.",
    });
    
    // Simulação de verificação (na implementação real, isso seria uma chamada de API)
    setTimeout(() => {
      setDomains(prev => 
        prev.map(domain => 
          domain.id === id
            ? {
                ...domain,
                status: 'active',
                verificationStatus: 'verified',
                lastCheckedAt: new Date(),
              }
            : domain
        )
      );
      
      toast({
        title: "Verificação concluída",
        description: "Domínio verificado com sucesso!",
        variant: "default",
      });
    }, 2000);
  };

  // Função para obter a classe de cor baseada no status
  const getStatusClass = (status: 'pending' | 'active' | 'error') => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'error':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return '';
    }
  };

  // Função para obter o ícone baseado no status
  const getStatusIcon = (status: 'pending' | 'active' | 'error') => {
    switch (status) {
      case 'active':
        return <Check className="h-3 w-3 mr-1" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'error':
        return <X className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configurações de Domínio</h2>
        <p className="text-muted-foreground">
          Configure como as organizações acessam seus portais através de domínios personalizados
        </p>
      </div>

      <Tabs defaultValue="dominios" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="dominios" className="gap-1.5">
            <Globe className="h-4 w-4" /> Domínios Ativos
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dominios" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domínios Registrados</CardTitle>
              <CardDescription>
                Todos os domínios atualmente registrados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domínio</TableHead>
                    <TableHead>Organização</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verificação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`https://${domain.domain}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            {domain.domain}
                            <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {domain.organizationName || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {domain.type === 'subdomain' ? 'Subdomínio' : 'Personalizado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusClass(domain.status)}
                        >
                          {getStatusIcon(domain.status)}
                          {domain.status === 'active' ? 'Ativo' : 
                           domain.status === 'pending' ? 'Pendente' : 'Erro'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {domain.error ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block">
                                  <Badge 
                                    variant="outline" 
                                    className="bg-red-50 text-red-600 border-red-200 cursor-help"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Falha
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">Erro de verificação:</p>
                                <p className="text-sm">{domain.error}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge 
                            variant="outline" 
                            className={
                              domain.verificationStatus === 'verified'
                                ? 'bg-green-50 text-green-600 border-green-200'
                                : 'bg-amber-50 text-amber-600 border-amber-200'
                            }
                          >
                            {domain.verificationStatus === 'verified' 
                              ? <Check className="h-3 w-3 mr-1" /> 
                              : <Clock className="h-3 w-3 mr-1" />}
                            {domain.verificationStatus === 'verified' ? 'Verificado' : 'Pendente'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {domain.lastCheckedAt 
                            ? new Date(domain.lastCheckedAt).toLocaleDateString('pt-BR') 
                            : 'Não verificado'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-x-2">
                          {domain.status !== 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => verifyDomain(domain.id)}
                              className="gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Verificar
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                          >
                            <Info className="h-3 w-3" />
                            Detalhes
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Exibindo {domains.length} domínios no total
              </div>
              <Button className="gap-1.5">
                <PlusCircle className="h-4 w-4" /> Adicionar Domínio
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Instruções de Verificação</CardTitle>
                <CardDescription>
                  Como configurar e verificar domínios personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Para domínios personalizados:</h3>
                  <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                    <li>Configure um registro A apontando para o IP <code className="bg-muted px-1 py-0.5 rounded">123.456.789.0</code></li>
                    <li>Adicione um registro CNAME <code className="bg-muted px-1 py-0.5 rounded">www</code> apontando para seu domínio principal</li>
                    <li>Aguarde a propagação de DNS (pode levar até 48 horas)</li>
                    <li>Clique em "Verificar" para iniciar o processo de verificação</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Para subdomínios:</h3>
                  <p className="text-sm text-muted-foreground">
                    Subdomínios <code className="bg-muted px-1 py-0.5 rounded">*.endurancy.app</code> são configurados automaticamente 
                    e não requerem verificação manual. Eles são criados durante o processo de registro da organização.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Padrões de Domínio</CardTitle>
                <CardDescription>
                  Como os subdomínios são gerados para novas organizações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Padrão atual:</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Os subdomínios são gerados usando o padrão:
                  </p>
                  <code className="block bg-muted p-2 rounded font-mono text-sm">
                    {subdomainPattern}.{baseSubdomain}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Onde <code className="bg-muted px-1 py-0.5 rounded inline">{'{{name}}'}</code> é substituído pelo nome da organização 
                    (em minúsculas, sem espaços ou caracteres especiais).
                  </p>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium mb-1">Exemplos:</h3>
                  <ul className="space-y-1 text-sm">
                    <li><span className="text-muted-foreground">Nome: </span>Cannabis Care</li>
                    <li><span className="text-muted-foreground">Subdomínio: </span>cannabis-care.endurancy.app</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Domínio</CardTitle>
              <CardDescription>
                Configure como os domínios funcionam no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="base-domain">Domínio Base</Label>
                  <Input 
                    id="base-domain" 
                    value={baseSubdomain} 
                    onChange={(e) => setBaseSubdomain(e.target.value)} 
                    placeholder="exemplo.com.br"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este é o domínio base para todos os subdomínios criados automaticamente
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subdomain-pattern">Padrão de Subdomínio</Label>
                  <Select value={subdomainPattern} onValueChange={setSubdomainPattern}>
                    <SelectTrigger id="subdomain-pattern">
                      <SelectValue placeholder="Selecione um padrão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="{{name}}">{{name}} - Nome da organização</SelectItem>
                      <SelectItem value="{{slug}}">{{slug}} - Slug da organização</SelectItem>
                      <SelectItem value="{{id}}">{{id}} - ID da organização</SelectItem>
                      <SelectItem value="org-{{id}}">org-{{id}} - Prefixo com ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Defina como os subdomínios serão gerados para novas organizações
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-custom" className="text-base">Domínios Personalizados</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que organizações usem seus próprios domínios
                    </p>
                  </div>
                  <Switch 
                    id="enable-custom" 
                    checked={enableCustomDomains} 
                    onCheckedChange={setEnableCustomDomains}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="verify-domains" className="text-base">Verificação de Domínios</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir verificação de propriedade para domínios personalizados
                    </p>
                  </div>
                  <Switch 
                    id="verify-domains" 
                    checked={verifyDomains} 
                    onCheckedChange={setVerifyDomains}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-assign" className="text-base">Atribuição Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Gerar e atribuir subdomínios automaticamente na criação da organização
                    </p>
                  </div>
                  <Switch 
                    id="auto-assign" 
                    checked={autoAssign} 
                    onCheckedChange={setAutoAssign}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="blacklist">Lista Negra de Domínios</Label>
                <Textarea 
                  id="blacklist"
                  value={domainBlacklist}
                  onChange={(e) => setDomainBlacklist(e.target.value)}
                  placeholder="admin, api, app, etc"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Lista de subdomínios reservados que não podem ser usados por organizações (separados por vírgula)
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4 flex justify-end">
              <Button onClick={saveSettings} className="gap-1.5">
                <Save className="h-4 w-4" /> Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}