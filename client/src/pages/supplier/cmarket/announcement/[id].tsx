import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { CMarketHeader } from '@/components/supplier/CMarketHeader';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  FileText, 
  Users, 
  Building, 
  DollarSign,
  Share2, 
  Eye, 
  MessageSquare,
  Mail,
  Phone,
  AlertCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";

interface ProposalFormValues {
  price: number;
  description: string;
  deliveryTime?: number;
  termsAccepted: boolean;
  message?: string;
}

const AnnouncementDetailsPage: React.FC = () => {
  const [_, params] = useRoute('/supplier/cmarket/announcement/:id');
  const announcementId = params?.id;
  const { toast } = useToast();
  const { user } = useAuth();
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);

  // Carregar dados do anúncio e da organização
  const { data: announcementData, isLoading } = useQuery({
    queryKey: [`/api/cmarket/announcements/${announcementId}`],
    enabled: !!announcementId
  });

  // Carregar propostas (apenas se for o criador do anúncio ou a proposta for do usuário atual)
  const { data: proposalsData, isLoading: loadingProposals } = useQuery({
    queryKey: [`/api/cmarket/announcements/${announcementId}/proposals`],
    enabled: !!announcementId && !!user
  });

  // Formulário de proposta
  const form = useForm<ProposalFormValues>({
    defaultValues: {
      price: 0,
      description: '',
      deliveryTime: undefined,
      termsAccepted: false,
      message: ''
    }
  });

  // Mutação para enviar uma proposta
  const submitProposalMutation = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      return apiRequest('POST', `/api/cmarket/announcements/${announcementId}/proposals`, {
        ...data,
        announcementId: Number(announcementId)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Proposta enviada com sucesso',
        description: 'Sua proposta foi enviada ao solicitante.',
        variant: 'success'
      });
      setProposalDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/cmarket/announcements/${announcementId}/proposals`] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar proposta',
        description: error.message || 'Ocorreu um erro ao enviar sua proposta. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  const onSubmitProposal = (data: ProposalFormValues) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para enviar uma proposta.',
        variant: 'destructive'
      });
      return;
    }
    
    submitProposalMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CMarketHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/supplier/cmarket">
              <Button variant="ghost" className="gap-1">
                <ArrowLeft size={16} />
                Voltar
              </Button>
            </Link>
            <Skeleton className="h-6 w-32" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!announcementData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CMarketHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-md mx-auto">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Anúncio não encontrado</h2>
            <p className="text-gray-600 mb-6">
              O anúncio que você está procurando não existe ou foi removido.
            </p>
            <Link href="/supplier/cmarket">
              <Button>Voltar para o Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const announcement = announcementData.announcement;
  const organization = announcementData.organization;
  const creator = announcementData.creator;
  const isMyAnnouncement = user?.id === announcement.creatorId;
  const proposals = proposalsData?.proposals || [];
  
  // Formatações de data
  const createDate = new Date(announcement.createdAt);
  const formattedCreateDate = format(createDate, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  const timeAgo = formatDistanceToNow(createDate, { addSuffix: true, locale: ptBR });
  
  let expirationDate = null;
  let formattedExpirationDate = null;
  if (announcement.expirationDate) {
    expirationDate = new Date(announcement.expirationDate);
    formattedExpirationDate = format(expirationDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }

  // Determinar se o anúncio ainda está aberto
  const isOpen = announcement.status === 'open';
  const statusColor = isOpen ? 'success' : 'secondary';
  const statusText = isOpen ? 'Aberto' : 'Fechado';
  
  // Verificar se o usuário já fez uma proposta
  const userProposal = user ? proposals.find((p: any) => p.vendorId === user.id) : null;
  const canMakeProposal = isOpen && !!user && !isMyAnnouncement && !userProposal;

  return (
    <div className="min-h-screen bg-gray-50">
      <CMarketHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header com navegação e status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-2">
            <Link href="/supplier/cmarket">
              <Button variant="ghost" className="gap-1">
                <ArrowLeft size={16} />
                Voltar
              </Button>
            </Link>
            <Badge variant={statusColor}>{statusText}</Badge>
            {announcement.categoryId && (
              <Badge variant="outline" className="gap-1">
                <Tag size={14} />
                {announcement.category?.name || 'Categoria'}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 size={14} />
              Compartilhar
            </Button>
            {canMakeProposal && (
              <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Enviar Proposta</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Enviar Proposta</DialogTitle>
                    <DialogDescription>
                      Preencha os detalhes da sua proposta para o anúncio "{announcement.title}".
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitProposal)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="price"
                        rules={{
                          required: "O preço é obrigatório",
                          min: { value: 1, message: "O preço deve ser maior que zero" }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor da proposta (R$)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0,00"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="deliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prazo de entrega (dias)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ex: 30"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Em quantos dias você consegue entregar após a confirmação
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        rules={{ required: "A descrição da proposta é obrigatória" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição da proposta*</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descreva sua proposta detalhadamente, incluindo itens, quantidades, especificações e outras informações relevantes..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem adicional</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Alguma mensagem adicional para o solicitante?"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="termsAccepted"
                        rules={{ required: "Você deve aceitar os termos para enviar uma proposta" }}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Aceito os termos e condições do marketplace
                              </FormLabel>
                              <FormDescription>
                                Ao enviar uma proposta, você concorda com os termos de uso e política de privacidade do CMarket.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setProposalDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={submitProposalMutation.isPending}>
                          {submitProposalMutation.isPending ? "Enviando..." : "Enviar Proposta"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Detalhes do Anúncio */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <h1 className="text-2xl font-bold">{announcement.title}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span title={formattedCreateDate}>{timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{announcement.viewCount || 0} visualizações</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{proposals.length} propostas</span>
                  </div>
                  {expirationDate && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span title={formattedExpirationDate}>
                        Expira em {formatDistanceToNow(expirationDate, { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{announcement.description}</p>
                  
                  {announcement.details && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Detalhes adicionais</h3>
                      <p className="whitespace-pre-line">{announcement.details}</p>
                    </div>
                  )}
                  
                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Anexos</h3>
                      <div className="flex flex-wrap gap-2">
                        {announcement.attachments.map((attachment: any, index: number) => (
                          <a 
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            <FileText size={16} />
                            <span className="text-sm">{attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {announcement.budget && (
                    <div className="mt-6 bg-green-50 p-4 rounded-md border border-green-100">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-green-600" />
                        <h3 className="text-lg font-medium text-green-800">Orçamento estimado</h3>
                      </div>
                      <p className="text-xl font-bold text-green-700 mt-1">
                        R$ {announcement.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Seção de Propostas (apenas para o criador do anúncio ou usuário que fez propostas) */}
            {user && (isMyAnnouncement || userProposal) && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare size={18} />
                    Propostas
                    <Badge className="ml-2">{proposals.length}</Badge>
                  </h2>
                </CardHeader>
                
                <CardContent>
                  {loadingProposals ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="ml-auto">
                              <Skeleton className="h-5 w-20" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : proposals.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma proposta ainda</h3>
                      <p className="text-gray-500">
                        {isMyAnnouncement 
                          ? 'Seu anúncio ainda não recebeu propostas.' 
                          : 'Você ainda não enviou uma proposta para este anúncio.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {proposals.map((proposal: any) => {
                        const isMyProposal = user?.id === proposal.vendorId;
                        const vendor = proposal.vendor;
                        const canSeeDetails = isMyAnnouncement || isMyProposal;
                        
                        return (
                          <div key={proposal.id} className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={vendor.organization?.logo || ''} />
                                  <AvatarFallback>
                                    <Building size={16} />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{vendor.organization?.name || 'Fornecedor'}</h4>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(proposal.createdAt), "dd/MM/yyyy, HH:mm")}
                                  </p>
                                </div>
                              </div>
                              
                              <Badge variant={proposal.status === 'accepted' ? 'success' : 'secondary'}>
                                {proposal.status === 'pending' && 'Pendente'}
                                {proposal.status === 'accepted' && 'Aceita'}
                                {proposal.status === 'rejected' && 'Rejeitada'}
                              </Badge>
                            </div>
                            
                            <div className="p-4">
                              {canSeeDetails ? (
                                <>
                                  <div className="flex justify-between mb-3">
                                    <div>
                                      <span className="text-sm font-medium">Valor proposto:</span>
                                      <span className="text-lg font-bold text-green-700 ml-2">
                                        R$ {proposal.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    
                                    {proposal.deliveryTime && (
                                      <div>
                                        <span className="text-sm font-medium">Prazo de entrega:</span>
                                        <span className="font-medium ml-2">
                                          {proposal.deliveryTime} dias
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <Accordion type="single" collapsible>
                                    <AccordionItem value="description">
                                      <AccordionTrigger className="text-sm font-medium">
                                        Descrição da proposta
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <p className="whitespace-pre-line text-sm">
                                          {proposal.description}
                                        </p>
                                      </AccordionContent>
                                    </AccordionItem>
                                    
                                    {proposal.message && (
                                      <AccordionItem value="message">
                                        <AccordionTrigger className="text-sm font-medium">
                                          Mensagem adicional
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <p className="whitespace-pre-line text-sm">
                                            {proposal.message}
                                          </p>
                                        </AccordionContent>
                                      </AccordionItem>
                                    )}
                                  </Accordion>
                                  
                                  {isMyAnnouncement && proposal.status === 'pending' && (
                                    <div className="flex justify-end gap-2 mt-4">
                                      <Button variant="outline" size="sm">
                                        Rejeitar
                                      </Button>
                                      <Button size="sm">
                                        Aceitar Proposta
                                      </Button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-6">
                                  <Lock size={24} className="text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">
                                    Detalhes disponíveis apenas para o criador do anúncio ou fornecedor.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Coluna Lateral - Info da Organização e Contato */}
          <div>
            {/* Card da Organização */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-bold">Organização Solicitante</h2>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={organization.logo || ''} alt={organization.name} />
                    <AvatarFallback>
                      <Building size={20} />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium">{organization.name}</h3>
                    <p className="text-sm text-gray-500">{organization.type || 'Organização'}</p>
                  </div>
                </div>
                
                {organization.description && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-1">Sobre a organização</h4>
                    <p className="text-sm text-gray-600">{organization.description}</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full gap-2">
                    <Building size={16} />
                    Ver perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Card de Contato */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold">Contato</h2>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={creator.profilePhoto || ''} alt={creator.name} />
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium">{creator.name}</h3>
                    <p className="text-sm text-gray-500">{creator.role}</p>
                  </div>
                </div>
                
                {creator.email && (
                  <a href={`mailto:${creator.email}`} className="flex items-center gap-2 py-2 text-sm">
                    <Mail size={16} />
                    {creator.email}
                  </a>
                )}
                
                {creator.phoneNumber && (
                  <a href={`tel:${creator.phoneNumber}`} className="flex items-center gap-2 py-2 text-sm">
                    <Phone size={16} />
                    {creator.phoneNumber}
                  </a>
                )}
                
                {canMakeProposal ? (
                  <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4">Enviar Proposta</Button>
                    </DialogTrigger>
                  </Dialog>
                ) : (
                  userProposal ? (
                    <div className="bg-blue-50 rounded-md p-3 mt-4 text-sm text-blue-700 flex items-center gap-2">
                      <Check size={18} className="text-blue-600" />
                      Você já enviou uma proposta para este anúncio
                    </div>
                  ) : !isOpen ? (
                    <div className="bg-gray-100 rounded-md p-3 mt-4 text-sm text-gray-600 flex items-center gap-2">
                      <AlertCircle size={18} />
                      Este anúncio está fechado para novas propostas
                    </div>
                  ) : !user ? (
                    <div className="bg-yellow-50 rounded-md p-3 mt-4 text-sm text-yellow-700 flex items-center gap-2">
                      <AlertCircle size={18} className="text-yellow-600" />
                      Faça login para enviar uma proposta
                    </div>
                  ) : null
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnnouncementDetailsPage;