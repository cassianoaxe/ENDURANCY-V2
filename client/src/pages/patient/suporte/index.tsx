'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Clock, CornerDownRight, HelpCircle, MessageCircle, TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PatientLayout from '@/components/layout/PatientLayout';

// Schema para validação do formulário de contato
const contactSchema = z.object({
  subject: z.string().min(3, {
    message: 'O assunto deve ter pelo menos 3 caracteres',
  }),
  category: z.string({
    required_error: 'Selecione uma categoria',
  }),
  message: z.string().min(10, {
    message: 'A mensagem deve ter pelo menos 10 caracteres',
  }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function SuportePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Dados mockados de tickets para exemplo
  const tickets = [
    {
      id: 'TICKET-1423',
      subject: 'Problema com entrega do pedido #8745',
      status: 'open',
      createdAt: '2025-04-12T10:30:00',
      lastUpdate: '2025-04-15T14:22:00',
      category: 'Entrega',
      messages: [
        {
          id: 1,
          content: 'Olá, meu pedido estava previsto para ser entregue ontem, mas ainda não chegou. Podem me ajudar?',
          sender: 'user',
          time: '2025-04-12T10:30:00',
        },
        {
          id: 2,
          content: 'Olá João, verificamos aqui e seu pedido teve um atraso na transportadora. Segundo as atualizações, deve ser entregue hoje até as 18h.',
          sender: 'support',
          time: '2025-04-12T11:45:00',
          agent: {
            name: 'Maria Silva',
            avatar: '',
          },
        },
        {
          id: 3,
          content: 'Obrigado pela informação. Ficarei aguardando.',
          sender: 'user',
          time: '2025-04-12T12:10:00',
        },
        {
          id: 4,
          content: 'Ainda não recebi o pedido e já passa das 18h. Tem alguma atualização?',
          sender: 'user',
          time: '2025-04-15T09:30:00',
        },
        {
          id: 5,
          content: 'Peço desculpas pelo inconveniente. Acabei de falar com a transportadora e eles estão com atrasos na sua região. Nova previsão é para amanhã pela manhã. Como compensação, estamos adicionando um cupom de desconto de 15% para sua próxima compra.',
          sender: 'support',
          time: '2025-04-15T14:22:00',
          agent: {
            name: 'Carlos Mendes',
            avatar: '',
          },
        },
      ],
    },
    {
      id: 'TICKET-1398',
      subject: 'Dúvida sobre renovação de prescrição',
      status: 'closed',
      createdAt: '2025-04-01T15:45:00',
      lastUpdate: '2025-04-03T10:20:00',
      category: 'Prescrição',
      messages: [
        {
          id: 1,
          content: 'Preciso saber como renovar minha prescrição que vence em duas semanas.',
          sender: 'user',
          time: '2025-04-01T15:45:00',
        },
        {
          id: 2,
          content: 'Boa tarde! Para renovar sua prescrição, você pode utilizar a área "Prescrições" no seu painel e selecionar a opção "Solicitar Renovação". Seu médico será notificado automaticamente e, após aprovação, você receberá a nova prescrição digital.',
          sender: 'support',
          time: '2025-04-02T09:12:00',
          agent: {
            name: 'Ana Oliveira',
            avatar: '',
          },
        },
        {
          id: 3,
          content: 'Muito obrigado pela informação. Já encontrei a opção e solicitei a renovação.',
          sender: 'user',
          time: '2025-04-02T14:30:00',
        },
        {
          id: 4,
          content: 'Ótimo! Estamos aqui se precisar de mais alguma ajuda. Sua solicitação de renovação já está visível para seu médico.',
          sender: 'support',
          time: '2025-04-03T10:20:00',
          agent: {
            name: 'Ana Oliveira',
            avatar: '',
          },
        },
      ],
    },
  ];
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: '',
      category: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    try {
      // Simular um delay para a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui você implementaria a chamada de API para enviar a mensagem
      // await fetch('/api/support/tickets', { method: 'POST', body: JSON.stringify(data) });
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso. Responderemos em breve.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-8">Suporte</h1>
        
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
          </TabsList>
          
          {/* Aba de Contato */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Entre em Contato</CardTitle>
                <CardDescription>
                  Envie uma mensagem para nossa equipe de suporte. Responderemos o mais breve possível.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assunto</FormLabel>
                          <FormControl>
                            <Input placeholder="Descreva resumidamente o assunto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="prescription">Prescrição</SelectItem>
                              <SelectItem value="order">Pedidos</SelectItem>
                              <SelectItem value="shipping">Entrega</SelectItem>
                              <SelectItem value="products">Produtos</SelectItem>
                              <SelectItem value="payment">Pagamento</SelectItem>
                              <SelectItem value="account">Conta</SelectItem>
                              <SelectItem value="technical">Problemas Técnicos</SelectItem>
                              <SelectItem value="other">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva em detalhes como podemos ajudar" 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Sua mensagem deve conter todos os detalhes necessários para que possamos ajudar de forma eficiente.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contatos Rápidos</CardTitle>
                <CardDescription>
                  Outras formas de entrar em contato com nossa equipe
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">(11) 99999-9999</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Atendimento: Seg-Sex 9h-18h
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      FAQ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">Perguntas Frequentes</p>
                    <Button variant="link" className="p-0 h-auto mt-1">
                      Acessar FAQ
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aba de Tickets */}
          <TabsContent value="tickets" className="space-y-6">
            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                          <div className="flex items-center mt-1 space-x-2">
                            <p className="text-xs text-gray-500">
                              ID: {ticket.id}
                            </p>
                            <Badge 
                              variant={ticket.status === 'open' ? 'default' : 'secondary'}
                            >
                              {ticket.status === 'open' ? 'Aberto' : 'Fechado'}
                            </Badge>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(ticket.lastUpdate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="space-y-4 mt-4">
                        {ticket.messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`rounded-lg p-3 max-w-[80%] ${
                                message.sender === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              {message.sender === 'support' && (
                                <div className="flex items-center mb-1">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={message.agent?.avatar} />
                                    <AvatarFallback>
                                      {message.agent?.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-xs font-medium">{message.agent?.name}</p>
                                </div>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs mt-1 opacity-70 text-right">
                                {new Date(message.time).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {ticket.status === 'open' && (
                        <div className="mt-4">
                          <div className="flex items-center">
                            <CornerDownRight className="h-4 w-4 mr-2 text-gray-400" />
                            <p className="text-sm text-gray-500">Responder</p>
                          </div>
                          <div className="flex mt-2">
                            <Textarea placeholder="Digite sua resposta..." className="w-full" />
                            <Button className="ml-2">Enviar</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <p className="text-xs text-gray-500">
                        Aberto em: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      {ticket.status === 'open' && (
                        <Button variant="outline" size="sm">
                          Fechar Ticket
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum ticket encontrado</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Você ainda não criou nenhum ticket de suporte.
                  </p>
                  <Button>Criar Novo Ticket</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}