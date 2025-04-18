'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Mail, Phone, User, MapPin, Calendar, Save, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PatientLayout from '@/components/layout/PatientLayout';

// Schema para validação do perfil
const profileSchema = z.object({
  name: z.string().min(3, {
    message: 'Nome deve ter pelo menos 3 caracteres',
  }),
  email: z.string().email({
    message: 'Email inválido',
  }),
  phone: z.string().min(10, {
    message: 'Número de telefone inválido',
  }),
  address: z.string().min(5, {
    message: 'Endereço deve ter pelo menos 5 caracteres',
  }),
  city: z.string().min(2, {
    message: 'Cidade deve ter pelo menos 2 caracteres',
  }),
  state: z.string().min(2, {
    message: 'Estado deve ter pelo menos 2 caracteres',
  }),
  postalCode: z.string().min(5, {
    message: 'CEP inválido',
  }),
  dob: z.string().min(1, {
    message: 'Data de nascimento é obrigatória',
  }),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dados mockados para exemplo
  const mockUserData = {
    id: 1,
    name: 'João Silva',
    email: 'paciente@email.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01234-567',
    dob: '1985-06-15',
    bio: 'Paciente em tratamento para dores crônicas desde 2023.',
    avatar: '',
    prescriptions: [
      { id: 1, date: '2023-10-15', doctor: 'Dra. Maria Santos', status: 'Ativa' },
      { id: 2, date: '2023-08-03', doctor: 'Dr. Ricardo Almeida', status: 'Expirada' },
    ],
    orders: [
      { id: 101, date: '2023-10-18', total: 'R$ 245,90', status: 'Entregue' },
      { id: 102, date: '2023-09-05', total: 'R$ 178,50', status: 'Entregue' },
      { id: 103, date: '2023-11-20', total: 'R$ 320,00', status: 'Em processamento' },
    ],
  };
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: mockUserData.name,
      email: mockUserData.email,
      phone: mockUserData.phone,
      address: mockUserData.address,
      city: mockUserData.city,
      state: mockUserData.state,
      postalCode: mockUserData.postalCode,
      dob: mockUserData.dob,
      bio: mockUserData.bio,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Simular um delay para a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui você implementaria a chamada de API para atualizar o perfil
      // await fetch('/api/profile', { method: 'PUT', body: JSON.stringify(data) });
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>
          
          {/* Aba de Dados Pessoais */}
          <TabsContent value="personal">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Foto do Perfil</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-36 w-36">
                      <AvatarImage src={mockUserData.avatar} alt={mockUserData.name} />
                      <AvatarFallback className="text-3xl">{mockUserData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      className="absolute bottom-0 right-0 rounded-full"
                      disabled={!isEditing}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-center mt-4 font-semibold text-lg">{mockUserData.name}</p>
                  <p className="text-center text-gray-500 text-sm">ID do Paciente: #{mockUserData.id}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={isEditing ? "default" : "outline"} 
                    className="w-full" 
                    onClick={toggleEdit}
                  >
                    {isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Perfil
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    {isEditing 
                      ? "Edite seus dados pessoais abaixo" 
                      : "Visualize e gerencie suas informações pessoais"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input 
                                    disabled={!isEditing || isLoading} 
                                    className="pl-10" 
                                    placeholder="Seu nome completo" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input 
                                    disabled={true} // Email não pode ser alterado
                                    className="pl-10" 
                                    placeholder="seu.email@exemplo.com" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input 
                                    disabled={!isEditing || isLoading} 
                                    className="pl-10" 
                                    placeholder="(00) 00000-0000" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dob"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Nascimento</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input 
                                    disabled={!isEditing || isLoading} 
                                    type="date" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-3">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Endereço</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input 
                                      disabled={!isEditing || isLoading} 
                                      className="pl-10" 
                                      placeholder="Rua, número, complemento" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                  <Input 
                                    disabled={!isEditing || isLoading} 
                                    placeholder="Sua cidade" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Estado</FormLabel>
                                  <FormControl>
                                    <Input 
                                      disabled={!isEditing || isLoading} 
                                      placeholder="UF" 
                                      maxLength={2}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CEP</FormLabel>
                                  <FormControl>
                                    <Input 
                                      disabled={!isEditing || isLoading} 
                                      placeholder="00000-000" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observações Médicas</FormLabel>
                            <FormControl>
                              <Textarea 
                                disabled={!isEditing || isLoading} 
                                placeholder="Informações adicionais sobre sua condição de saúde" 
                                className="resize-none h-20"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {isEditing && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={toggleEdit}
                            disabled={isLoading}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Salvando...
                              </>
                            ) : (
                              <>Salvar Alterações</>
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Aba de Prescrições */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescrições Médicas</CardTitle>
                <CardDescription>Histórico de suas prescrições médicas</CardDescription>
              </CardHeader>
              <CardContent>
                {mockUserData.prescriptions.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-4 text-sm font-medium">
                      <div className="col-span-2">ID</div>
                      <div className="col-span-3">Data</div>
                      <div className="col-span-4">Médico</div>
                      <div className="col-span-3">Status</div>
                    </div>
                    {mockUserData.prescriptions.map((prescription) => (
                      <div 
                        key={prescription.id}
                        className="grid grid-cols-12 border-t p-4 text-sm"
                      >
                        <div className="col-span-2 font-medium">#{prescription.id}</div>
                        <div className="col-span-3">{prescription.date}</div>
                        <div className="col-span-4">{prescription.doctor}</div>
                        <div className="col-span-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            prescription.status === 'Ativa' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {prescription.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Você ainda não possui prescrições médicas registradas.
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline">
                  Visualizar todas as prescrições
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Aba de Pedidos */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Meus Pedidos</CardTitle>
                <CardDescription>Histórico de seus pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                {mockUserData.orders.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-4 text-sm font-medium">
                      <div className="col-span-2">ID</div>
                      <div className="col-span-3">Data</div>
                      <div className="col-span-3">Total</div>
                      <div className="col-span-4">Status</div>
                    </div>
                    {mockUserData.orders.map((order) => (
                      <div 
                        key={order.id}
                        className="grid grid-cols-12 border-t p-4 text-sm"
                      >
                        <div className="col-span-2 font-medium">#{order.id}</div>
                        <div className="col-span-3">{order.date}</div>
                        <div className="col-span-3">{order.total}</div>
                        <div className="col-span-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === 'Entregue' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'Em processamento'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Você ainda não fez nenhum pedido.
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline">
                  Visualizar todos os pedidos
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}