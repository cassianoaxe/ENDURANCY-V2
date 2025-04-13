'use client';

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Save, AlertCircle } from "lucide-react";

export default function ConfiguracoesTarefas() {
  // Estados para armazenar as configurações
  const [limiteAtivo, setLimiteAtivo] = useState<boolean>(true);
  const [limiteMensal, setLimiteMensal] = useState<number>(60);
  const [notificacoes, setNotificacoes] = useState<boolean>(true);
  const [notificacoesEmail, setNotificacoesEmail] = useState<boolean>(true);
  const [notificacoesPlataforma, setNotificacoesPlataforma] = useState<boolean>(true);
  const [diasLembrete, setDiasLembrete] = useState<string>("3");
  const [categorias, setCategorias] = useState<string[]>(['Desenvolvimento', 'Documentação', 'Bug', 'Feature']);
  const [novaCategoria, setNovaCategoria] = useState<string>("");
  const [prioridadePadrao, setPrioridadePadrao] = useState<string>("MEDIUM");

  // Função para salvar configurações
  const salvarConfiguracoes = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações do módulo de tarefas foram atualizadas com sucesso."
    });
  };

  // Função para adicionar nova categoria
  const adicionarCategoria = () => {
    if (novaCategoria.trim() === "") return;
    
    if (categorias.includes(novaCategoria)) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar categoria",
        description: "Esta categoria já existe na lista."
      });
      return;
    }
    
    setCategorias([...categorias, novaCategoria]);
    setNovaCategoria("");
    
    toast({
      title: "Categoria adicionada",
      description: `A categoria "${novaCategoria}" foi adicionada com sucesso.`
    });
  };

  // Função para remover categoria
  const removerCategoria = (categoria: string) => {
    setCategorias(categorias.filter(cat => cat !== categoria));
    
    toast({
      title: "Categoria removida",
      description: `A categoria "${categoria}" foi removida com sucesso.`
    });
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações de Tarefas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as configurações do módulo de tarefas da sua organização
            </p>
          </div>
          <Button onClick={salvarConfiguracoes} className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>

        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>

          {/* Configurações Gerais */}
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure os parâmetros básicos do módulo de tarefas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="limiteAtivo">Limite de tarefas ativo</Label>
                      <p className="text-sm text-muted-foreground">
                        Ative para limitar o número máximo de tarefas mensal
                      </p>
                    </div>
                    <Switch
                      id="limiteAtivo"
                      checked={limiteAtivo}
                      onCheckedChange={setLimiteAtivo}
                    />
                  </div>

                  {limiteAtivo && (
                    <div className="grid gap-2">
                      <Label htmlFor="limiteMensal">Limite mensal de tarefas</Label>
                      <Input
                        id="limiteMensal"
                        type="number"
                        value={limiteMensal}
                        onChange={(e) => setLimiteMensal(Number(e.target.value))}
                        placeholder="Limite mensal de tarefas"
                        min={1}
                        max={1000}
                      />
                      <p className="text-sm text-muted-foreground">
                        Seu plano atual inclui 60 tarefas por mês. Atualize seu plano para aumentar este limite.
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="grid gap-2">
                    <Label htmlFor="prioridadePadrao">Prioridade padrão</Label>
                    <Select
                      value={prioridadePadrao}
                      onValueChange={setPrioridadePadrao}
                    >
                      <SelectTrigger id="prioridadePadrao">
                        <SelectValue placeholder="Selecione a prioridade padrão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Baixa</SelectItem>
                        <SelectItem value="MEDIUM">Média</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="URGENT">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Define a prioridade padrão ao criar novas tarefas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Configure como você recebe notificações sobre tarefas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificacoes">Notificações ativas</Label>
                      <p className="text-sm text-muted-foreground">
                        Habilitar notificações para tarefas
                      </p>
                    </div>
                    <Switch
                      id="notificacoes"
                      checked={notificacoes}
                      onCheckedChange={setNotificacoes}
                    />
                  </div>

                  {notificacoes && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notificacoesEmail">Notificações por e-mail</Label>
                          <p className="text-sm text-muted-foreground">
                            Receber notificações de tarefas por e-mail
                          </p>
                        </div>
                        <Switch
                          id="notificacoesEmail"
                          checked={notificacoesEmail}
                          onCheckedChange={setNotificacoesEmail}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notificacoesPlataforma">Notificações na plataforma</Label>
                          <p className="text-sm text-muted-foreground">
                            Receber notificações dentro do sistema
                          </p>
                        </div>
                        <Switch
                          id="notificacoesPlataforma"
                          checked={notificacoesPlataforma}
                          onCheckedChange={setNotificacoesPlataforma}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="diasLembrete">Dias para lembrete de vencimento</Label>
                        <Select
                          value={diasLembrete}
                          onValueChange={setDiasLembrete}
                        >
                          <SelectTrigger id="diasLembrete">
                            <SelectValue placeholder="Selecione os dias para lembrete" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 dia antes</SelectItem>
                            <SelectItem value="2">2 dias antes</SelectItem>
                            <SelectItem value="3">3 dias antes</SelectItem>
                            <SelectItem value="5">5 dias antes</SelectItem>
                            <SelectItem value="7">7 dias antes</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Número de dias antes do vencimento para enviar lembretes
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Categorias */}
          <TabsContent value="categorias">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Categorias</CardTitle>
                <CardDescription>
                  Gerencie as categorias de tarefas disponíveis na sua organização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-end gap-2">
                    <div className="grid gap-2 flex-1">
                      <Label htmlFor="novaCategoria">Nova categoria</Label>
                      <Input
                        id="novaCategoria"
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        placeholder="Digite o nome da nova categoria"
                      />
                    </div>
                    <Button onClick={adicionarCategoria}>Adicionar</Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Categorias existentes</Label>
                    <div className="border rounded-md p-4">
                      {categorias.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma categoria cadastrada
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {categorias.map((categoria, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-2 bg-muted rounded-md"
                            >
                              <span>{categoria}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removerCategoria(categoria)}
                                className="h-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              >
                                Remover
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Avançadas */}
          <TabsContent value="avancado">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>
                  Configurações avançadas do módulo de tarefas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Atenção!</h4>
                      <p className="text-sm text-yellow-700">
                        Estas configurações podem afetar o funcionamento do módulo. 
                        Altere apenas se souber o que está fazendo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="arquivamentoAutomatico">Arquivamento automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Arquivar automaticamente tarefas concluídas após 30 dias
                      </p>
                    </div>
                    <Switch
                      id="arquivamentoAutomatico"
                      defaultChecked={true}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="historicoCompleto">Histórico completo de alterações</Label>
                      <p className="text-sm text-muted-foreground">
                        Manter registro de todas as alterações em tarefas
                      </p>
                    </div>
                    <Switch
                      id="historicoCompleto"
                      defaultChecked={true}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="permiteSubtarefas">Permitir subtarefas</Label>
                      <p className="text-sm text-muted-foreground">
                        Habilitar criação de subtarefas aninhadas
                      </p>
                    </div>
                    <Switch
                      id="permiteSubtarefas"
                      defaultChecked={false}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="prazoPadrao">Prazo padrão para tarefas (dias)</Label>
                    <Input
                      id="prazoPadrao"
                      type="number"
                      defaultValue={7}
                      min={1}
                      max={90}
                    />
                    <p className="text-sm text-muted-foreground">
                      Prazo padrão em dias para novas tarefas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}