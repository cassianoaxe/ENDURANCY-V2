import React, { useState } from 'react';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, Copy, Facebook, Gift, GitBranch, Instagram, BarChart, Users, Twitter, Share2, Award, AlertCircle, Zap, Lightbulb, Info, Copy as CopyIcon, Mail, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAffiliate } from '@/hooks/use-affiliate';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PatientAfiliadosPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Usar o hook de afiliado para obter dados reais da API
  const { 
    affiliate, 
    pointsHistory, 
    referrals,
    rewards: availableRewards,
    materials,
    isLoadingAffiliate,
    isLoadingPoints,
    isLoadingReferrals,
    isLoadingRewards,
    isLoadingMaterials,
    redeemReward
  } = useAffiliate();
  
  // Dados temporários para uso enquanto a API é implementada
  const tempAffiliateData = {
    username: 'paciente123',
    affiliateCode: affiliate?.affiliateCode || 'CODIGO',
    referralLink: `https://example.com/registro?ref=${affiliate?.affiliateCode || 'CODIGO'}`,
    points: affiliate?.points || 0,
    level: affiliate?.level || 'beginner',
    nextLevel: affiliate?.level === 'beginner' ? 'bronze' : 
               affiliate?.level === 'bronze' ? 'silver' :
               affiliate?.level === 'silver' ? 'gold' : 
               affiliate?.level === 'gold' ? 'platinum' : 'platinum',
    pointsToNextLevel: 75,
    referrals: referrals?.length || 0,
    activeReferrals: referrals?.filter(r => r.isActive).length || 0,
    totalEarnings: `R$ ${(affiliate?.totalEarned || 0).toFixed(2)}`,
    rewardsAvailable: availableRewards?.filter(r => r.pointsCost <= (affiliate?.points || 0)).length || 0,
    pendingPoints: 25,
    history: pointsHistory ? 
      pointsHistory.map(point => ({
        date: format(new Date(point.createdAt), 'dd/MM/yyyy', { locale: ptBR }),
        activity: point.activityType === 'referral_signup' ? 'Referência cadastrada' :
                  point.activityType === 'referral_purchase' ? 'Compra da referência' :
                  point.activityType === 'bonus' ? 'Pontos bônus' : 
                  point.activityType === 'redemption' ? 'Resgate de recompensa' : 'Atividade',
        points: point.points,
        name: 'Usuário'
      })) : [],
    promotionalMaterials: materials ? 
      materials.map(material => ({
        id: material.id,
        title: material.title,
        type: material.fileType.includes('image') ? 'Imagem' : 
              material.fileType.includes('text') ? 'Texto' : 'Arquivo',
        format: material.fileType.replace('image/', '').replace('text/', '').toUpperCase(),
        size: 'Variável'
      })) : [],
    rewards: availableRewards ? 
      availableRewards.map(reward => ({
        id: reward.id,
        title: reward.name,
        points: reward.pointsCost,
        available: (affiliate?.points || 0) >= reward.pointsCost
      })) : []
  };

  // Função para copiar o link de afiliado
  const copyReferralLink = () => {
    navigator.clipboard.writeText(tempAffiliateData.referralLink);
    setCopySuccess(true);
    toast({
      title: "Link copiado!",
      description: "Link de afiliado copiado para a área de transferência.",
    });
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 3000);
  };
  
  // Função para resgatar uma recompensa
  const handleRedeemReward = (reward: any) => {
    if (affiliate && reward && reward.pointsCost <= affiliate.points) {
      redeemReward.mutate(reward.id);
    } else {
      toast({
        title: "Pontos insuficientes",
        description: `Você precisa de ${reward?.pointsCost || 0} pontos para resgatar esta recompensa.`,
      });
    }
  };
  
  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Programa de Afiliados</h1>
            <p className="text-muted-foreground">
              Indique amigos e familiares e ganhe pontos e recompensas exclusivas.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2" onClick={() => setActiveTab('promocional')}>
              <Share2 className="h-4 w-4" />
              Material Promocional
            </Button>
            <Button className="gap-2" onClick={() => setActiveTab('convites')}>
              <Users className="h-4 w-4" />
              Convidar Amigos
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="dashboard" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-1 md:grid-cols-4 h-auto">
            <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
            <TabsTrigger value="promocional">Material Promocional</TabsTrigger>
          </TabsList>
          
          {/* Tab: Visão Geral */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* Cartão de afiliado */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">Seu Link de Afiliado</CardTitle>
                  <CardDescription>
                    Compartilhe este link com seus contatos para ganhar pontos.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="px-3 font-semibold">
                  {tempAffiliateData.level}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                  <div className="w-full md:w-3/4 bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm break-all">
                    {tempAffiliateData.referralLink}
                  </div>
                  <Button 
                    className="w-full md:w-auto flex items-center gap-2" 
                    onClick={copyReferralLink}
                  >
                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copySuccess ? 'Copiado!' : 'Copiar Link'}
                  </Button>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">Seu código de afiliado: <span className="font-bold">{tempAffiliateData.affiliateCode}</span></p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Estatísticas de Pontos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Pontos</CardTitle>
                  <Gift className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tempAffiliateData.points}</div>
                  <p className="text-xs text-muted-foreground">
                    Mais {tempAffiliateData.pointsToNextLevel} pontos para o nível {tempAffiliateData.nextLevel}
                  </p>
                  <Progress value={(tempAffiliateData.points / (tempAffiliateData.points + tempAffiliateData.pointsToNextLevel)) * 100} className="h-2 mt-2" />
                </CardContent>
              </Card>
              
              {/* Estatísticas de Indicações */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Indicações</CardTitle>
                  <GitBranch className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tempAffiliateData.referrals}</div>
                  <p className="text-xs text-muted-foreground">
                    {tempAffiliateData.activeReferrals} indicações ativas
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium">Conversão:</span>
                    <Progress value={(tempAffiliateData.activeReferrals / tempAffiliateData.referrals) * 100} className="h-2 flex-1" />
                    <span className="text-xs font-medium">{Math.round((tempAffiliateData.activeReferrals / tempAffiliateData.referrals) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recompensas */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Recompensas</CardTitle>
                  <Award className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tempAffiliateData.rewardsAvailable}</div>
                  <p className="text-xs text-muted-foreground">
                    Recompensas disponíveis para resgate
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 text-xs"
                    onClick={() => setActiveTab('recompensas')}
                  >
                    Ver Recompensas
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Dicas de Afiliado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Dicas para Afiliados</CardTitle>
                <CardDescription>
                  Maximize suas indicações e ganhos com essas dicas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Compartilhe sua experiência pessoal</h4>
                    <p className="text-sm text-muted-foreground">
                      Pessoas confiam em histórias reais. Compartilhe como os produtos te ajudaram.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Use as redes sociais estrategicamente</h4>
                    <p className="text-sm text-muted-foreground">
                      Compartilhe em grupos relevantes e use nossas imagens promocionais para maior impacto.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Seja transparente sobre sua afiliação</h4>
                    <p className="text-sm text-muted-foreground">
                      Esclareça que você recebe benefícios pelas indicações, isso gera mais confiança.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividades e Pontos</CardTitle>
                <CardDescription>
                  Acompanhe seus ganhos de pontos e atividades de indicações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tempAffiliateData.history.length > 0 ? (
                    tempAffiliateData.history.map((item, index) => (
                      <div key={index}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{item.activity}</p>
                              <p className="text-sm text-muted-foreground">{item.name}</p>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                            <p className="text-sm text-muted-foreground">{item.date}</p>
                            <Badge variant="outline" className="text-green-500 bg-green-50 dark:bg-green-950">
                              +{item.points} pontos
                            </Badge>
                          </div>
                        </div>
                        {index < tempAffiliateData.history.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <Info className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-semibold">Nenhuma atividade ainda</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Comece a indicar seus amigos e familiares para ver seu histórico aqui.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pontos Pendentes</CardTitle>
                <CardDescription>
                  Pontos que serão creditados em breve com base em atividades recentes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tempAffiliateData.pendingPoints > 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <p className="font-medium">Pontos em processamento</p>
                      </div>
                      <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/50">
                        +{tempAffiliateData.pendingPoints} pontos
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Estes pontos serão creditados em até 30 dias após a confirmação das compras.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Você não tem pontos pendentes no momento.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Recompensas */}
          <TabsContent value="recompensas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recompensas Disponíveis</CardTitle>
                <CardDescription>
                  Troque seus pontos por benefícios exclusivos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tempAffiliateData.rewards.map((reward) => (
                    <div key={reward.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`bg-primary/10 p-2 rounded-full ${!reward.available && 'opacity-50'}`}>
                          <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{reward.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Necessário: {reward.points} pontos
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant={reward.available ? "default" : "outline"} 
                        disabled={!reward.available}
                        onClick={() => handleRedeemReward(reward)}
                      >
                        {reward.available 
                          ? `Resgatar (${tempAffiliateData.points}/${reward.points})` 
                          : `Pontos insuficientes (${tempAffiliateData.points}/${reward.points})`
                        }
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Como Funciona</CardTitle>
                <CardDescription>
                  Entenda como ganhar e utilizar seus pontos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h4 className="font-semibold">1. Indique Amigos</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Compartilhe seu link único com amigos e familiares.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <GitBranch className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h4 className="font-semibold">2. Acumule Pontos</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ganhe pontos quando suas indicações se cadastrarem e fizerem compras.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h4 className="font-semibold">3. Troque por Recompensas</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use seus pontos para resgatar descontos, produtos e benefícios exclusivos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Material Promocional */}
          <TabsContent value="promocional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Material Promocional</CardTitle>
                <CardDescription>
                  Utilize estes materiais para promover efetivamente seus links de afiliado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tempAffiliateData.promotionalMaterials.map((material) => (
                    <div key={material.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {material.type === 'Imagem' ? (
                          <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-full">
                            <Instagram className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        ) : (
                          <div className="bg-green-50 dark:bg-green-950 p-2 rounded-full">
                            <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold">{material.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {material.type} • {material.format} • {material.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compartilhar nas Redes Sociais</CardTitle>
                <CardDescription>
                  Compartilhe seu link diretamente nas redes sociais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem personalizada</Label>
                    <Input 
                      id="message" 
                      defaultValue="Estou tendo uma ótima experiência com os produtos da MediFlora! Use meu código para ganhar um desconto no seu primeiro pedido." 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="include-link">Incluir link de afiliado</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-link" defaultChecked />
                      <Label htmlFor="include-link">Sim, incluir meu link</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button variant="outline" className="gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <CopyIcon className="h-4 w-4" />
                    Copiar Texto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Convites */}
          <TabsContent value="convites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Convide Seus Amigos</CardTitle>
                <CardDescription>
                  Envie convites diretamente para seus contatos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do seu amigo</Label>
                      <Input id="name" placeholder="Nome completo" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email do seu amigo</Label>
                      <Input id="email" type="email" placeholder="email@exemplo.com" className="mt-1" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem personalizada (opcional)</Label>
                    <Input 
                      id="message" 
                      placeholder="Olá! Achei que você poderia se interessar por esses produtos..." 
                      className="mt-1" 
                    />
                  </div>
                  
                  <Button className="w-full">Enviar Convite</Button>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <Label>Ou compartilhe diretamente:</Label>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <Button variant="outline" className="gap-2">
                        <CopyIcon className="h-4 w-4" />
                        Copiar Link
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                        WhatsApp
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Suas Indicações</CardTitle>
                <CardDescription>
                  Acompanhe o status das suas indicações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tempAffiliateData.referrals > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>MS</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">Maria Silva</h4>
                          <p className="text-sm text-muted-foreground">
                            Registrou-se em 12/04/2025
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">Ativo</Badge>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>JP</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">João Pereira</h4>
                          <p className="text-sm text-muted-foreground">
                            Registrou-se em 28/03/2025
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">Ativo</Badge>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>CA</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">Carlos Almeida</h4>
                          <p className="text-sm text-muted-foreground">
                            Registrou-se em 15/03/2025
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-gray-500">Inativo</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhuma indicação ainda</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Comece a convidar seus amigos e acompanhe o progresso aqui.
                    </p>
                    <Button className="mt-4">Convidar Agora</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
};

export default PatientAfiliadosPage;