import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Award, Gift, CreditCard, Sparkles, Share2, Repeat, TrendingUp } from "lucide-react";

const ComplyPayAfiliadosPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("month");

  // Dados simulados para demonstração
  const referrals = [
    { id: 1, name: "Cliente Empresarial A", date: "01/05/2025", status: "active", type: "company", points: 500 },
    { id: 2, name: "SaaS Cliente B", date: "28/04/2025", status: "pending", type: "saas", points: 200 },
    { id: 3, name: "Distribuidor C", date: "15/04/2025", status: "active", type: "company", points: 350 },
    { id: 4, name: "Farmácia D", date: "10/04/2025", status: "inactive", type: "company", points: 0 },
    { id: 5, name: "SaaS Cliente E", date: "05/04/2025", status: "active", type: "saas", points: 600 },
  ];

  const transactions = [
    { id: 1, description: "Bônus por indicação - Cliente A", date: "01/05/2025", points: 500, type: "credit" },
    { id: 2, description: "Renovação de assinatura", date: "28/04/2025", points: 200, type: "credit" },
    { id: 3, description: "Desconto aplicado em mensalidade", date: "15/04/2025", points: 350, type: "debit" },
    { id: 4, description: "Indicação premium", date: "10/04/2025", points: 1000, type: "credit" },
    { id: 5, description: "Conversão para créditos", date: "05/04/2025", points: 600, type: "debit" },
  ];

  const rewards = [
    { id: 1, name: "Desconto de 10% na mensalidade", points: 500, category: "discount" },
    { id: 2, name: "Acesso antecipado a novos recursos", points: 800, category: "access" },
    { id: 3, name: "Suporte prioritário por 3 meses", points: 1200, category: "support" },
    { id: 4, name: "Treinamento exclusivo da equipe", points: 1500, category: "training" },
    { id: 5, name: "Consultoria de implementação", points: 2000, category: "service" },
  ];

  const filteredReferrals = statusFilter === "all" 
    ? referrals 
    : referrals.filter(ref => ref.status === statusFilter);

  const availablePointsTotal = transactions
    .reduce((acc, transaction) => {
      if (transaction.type === "credit") {
        return acc + transaction.points;
      } else {
        return acc - transaction.points;
      }
    }, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Programa de Afiliados ComplyPay</h1>
        <p className="text-muted-foreground">
          Gerencie suas indicações, acompanhe pontos e resgate benefícios exclusivos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pontos disponíveis</CardTitle>
            <CardDescription>Total acumulado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{availablePointsTotal}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Indicações ativas</CardTitle>
            <CardDescription>Clientes indicados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{referrals.filter(r => r.status === "active").length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Benefícios resgatados</CardTitle>
            <CardDescription>Total de resgates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="referrals">Minhas Indicações</TabsTrigger>
          <TabsTrigger value="transactions">Histórico de Pontos</TabsTrigger>
          <TabsTrigger value="rewards">Benefícios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como funciona</CardTitle>
              <CardDescription>
                Indique clientes para a ComplyPay e ganhe pontos para trocar por benefícios exclusivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center text-center space-y-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">1. Indique</h3>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe seu link único ou convide diretamente seus contatos para conhecer a ComplyPay.
                  </p>
                </div>
                
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center text-center space-y-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Repeat className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">2. Acumule</h3>
                  <p className="text-sm text-muted-foreground">
                    Ganhe pontos quando seus indicados se tornarem clientes e fizerem assinaturas.
                  </p>
                </div>
                
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center text-center space-y-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">3. Resgate</h3>
                  <p className="text-sm text-muted-foreground">
                    Troque seus pontos por descontos em mensalidades, recursos premium e muito mais.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Seu link de indicação</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    value="https://complypay.com.br/ref/sua-empresa123" 
                    readOnly 
                    className="flex-1"
                  />
                  <Button variant="outline">
                    Copiar Link
                  </Button>
                  <Button>
                    <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Progresso de nível</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nível atual: Prata</span>
                    <span>1500/2000 pontos para o próximo nível</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No nível Ouro você ganhará 50% mais pontos por indicação!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Nova Indicação
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map(referral => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">{referral.name}</TableCell>
                      <TableCell>{referral.date}</TableCell>
                      <TableCell>
                        {referral.type === "company" ? "Empresarial" : "SaaS"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            referral.status === "active" ? "bg-green-500" :
                            referral.status === "pending" ? "bg-yellow-500" :
                            "bg-gray-500"
                          }`}></div>
                          {referral.status === "active" ? "Ativo" :
                            referral.status === "pending" ? "Pendente" :
                            "Inativo"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{referral.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        {transaction.type === "credit" ? "Crédito" : "Débito"}
                      </TableCell>
                      <TableCell className={`text-right ${
                        transaction.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "credit" ? "+" : "-"}{transaction.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map(reward => (
              <Card key={reward.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                  <CardDescription>
                    {reward.category === "discount" ? "Desconto" :
                     reward.category === "access" ? "Acesso Exclusivo" :
                     reward.category === "support" ? "Suporte Premium" :
                     reward.category === "training" ? "Treinamento" :
                     "Serviço Especializado"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{reward.points} pontos necessários</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={availablePointsTotal >= reward.points ? "default" : "outline"}
                    disabled={availablePointsTotal < reward.points}
                    className="w-full"
                  >
                    {availablePointsTotal >= reward.points ? "Resgatar" : `Faltam ${reward.points - availablePointsTotal} pontos`}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplyPayAfiliadosPage;