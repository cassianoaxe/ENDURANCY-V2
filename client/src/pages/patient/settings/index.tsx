'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bell, Moon, Sun, Shield, Smartphone, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PatientLayout from '@/components/layout/PatientLayout';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Schema para validação das configurações
const settingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    orderUpdates: z.boolean(),
    prescriptionReminders: z.boolean(),
    marketingEmails: z.boolean(),
  }),
  theme: z.enum(['light', 'dark', 'system']),
  privacy: z.object({
    shareData: z.boolean(),
    allowResearch: z.boolean(),
    showProfile: z.boolean(),
  }),
  language: z.string(),
  contactPreference: z.enum(['email', 'sms', 'whatsapp']),
  twoFactorAuth: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Dados mockados para exemplo
  const defaultValues: SettingsFormValues = {
    notifications: {
      email: true,
      sms: true,
      push: false,
      orderUpdates: true,
      prescriptionReminders: true,
      marketingEmails: false,
    },
    theme: 'system',
    privacy: {
      shareData: false,
      allowResearch: true,
      showProfile: true,
    },
    language: 'pt-BR',
    contactPreference: 'whatsapp',
    twoFactorAuth: false,
  };
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true);
    try {
      // Simular um delay para a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui você implementaria a chamada de API para atualizar as configurações
      // await fetch('/api/settings', { method: 'PUT', body: JSON.stringify(data) });
      
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências foram salvas com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-8">Configurações</h1>
        
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              {/* Aba de Notificações */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Notificação</CardTitle>
                    <CardDescription>
                      Escolha como deseja receber notificações e atualizações.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notifications.email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Notificações por Email</FormLabel>
                            <FormDescription>
                              Receba atualizações importantes por email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="notifications.sms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Notificações por SMS</FormLabel>
                            <FormDescription>
                              Receba mensagens de texto para atualizações urgentes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="notifications.push"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Notificações Push</FormLabel>
                            <FormDescription>
                              Receba notificações push no seu dispositivo
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium mt-6 mb-4">Tipos de Notificação</h3>
                    
                    <FormField
                      control={form.control}
                      name="notifications.orderUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Atualizações de Pedidos</FormLabel>
                            <FormDescription>
                              Status do pedido, confirmações de envio, entregas
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifications.prescriptionReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Lembretes de Prescrição</FormLabel>
                            <FormDescription>
                              Lembretes sobre renovação e validade de prescrições
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifications.marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Emails de Marketing</FormLabel>
                            <FormDescription>
                              Promoções, novos produtos e atualizações do blog
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Método de Contato Preferido</CardTitle>
                    <CardDescription>
                      Escolha como prefere ser contatado para assuntos importantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="contactPreference"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um método de contato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Email</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="sms">
                                <div className="flex items-center">
                                  <Smartphone className="mr-2 h-4 w-4" />
                                  <span>SMS</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="whatsapp">
                                <div className="flex items-center">
                                  <Smartphone className="mr-2 h-4 w-4" />
                                  <span>WhatsApp</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Este será o método utilizado para contatos sobre questões de saúde e assuntos importantes.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Aba de Conta */}
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>
                      Personalize a aparência do aplicativo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tema</FormLabel>
                          <div className="flex gap-4 mt-2">
                            <FormControl>
                              <div className="grid grid-cols-3 gap-4">
                                <Button
                                  type="button"
                                  variant={field.value === 'light' ? 'default' : 'outline'}
                                  className="flex flex-col items-center gap-2 p-4"
                                  onClick={() => field.onChange('light')}
                                >
                                  <Sun className="h-5 w-5" />
                                  <span>Claro</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === 'dark' ? 'default' : 'outline'}
                                  className="flex flex-col items-center gap-2 p-4"
                                  onClick={() => field.onChange('dark')}
                                >
                                  <Moon className="h-5 w-5" />
                                  <span>Escuro</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === 'system' ? 'default' : 'outline'}
                                  className="flex flex-col items-center gap-2 p-4"
                                  onClick={() => field.onChange('system')}
                                >
                                  <div className="flex">
                                    <Sun className="h-5 w-5" />
                                    <Moon className="h-5 w-5 ml-1" />
                                  </div>
                                  <span>Sistema</span>
                                </Button>
                              </div>
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Idioma</CardTitle>
                    <CardDescription>
                      Escolha o idioma em que prefere visualizar o conteúdo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um idioma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pt-BR">
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4" />
                                  <span>Português (Brasil)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="en-US">
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4" />
                                  <span>English (US)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="es">
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4" />
                                  <span>Español</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>
                      Configure as opções de segurança da sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="twoFactorAuth"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Autenticação de Dois Fatores</FormLabel>
                            <FormDescription>
                              Adicione uma camada extra de segurança à sua conta
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-6">
                      <Button type="button" variant="outline" className="w-full">
                        Alterar Senha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Aba de Privacidade */}
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Privacidade</CardTitle>
                    <CardDescription>
                      Controle como seus dados são utilizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="privacy.shareData"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Compartilhamento de Dados</FormLabel>
                            <FormDescription>
                              Permitir o compartilhamento de dados anônimos com parceiros
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="privacy.allowResearch"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Pesquisa e Desenvolvimento</FormLabel>
                            <FormDescription>
                              Permitir o uso dos seus dados para melhoria de produtos e serviços
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="privacy.showProfile"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Visibilidade do Perfil</FormLabel>
                            <FormDescription>
                              Permitir que médicos e especialistas vejam seu perfil
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>
                      Gerencie seus dados armazenados na plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4">
                      <Button type="button" variant="outline" className="w-full">
                        <Shield className="mr-2 h-4 w-4" />
                        Download dos Meus Dados
                      </Button>
                      <Button type="button" variant="outline" className="w-full text-red-500 hover:text-red-600">
                        Solicitar Exclusão da Conta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </PatientLayout>
  );
}