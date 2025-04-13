import React, { useState, useEffect } from 'react';
import { 
  Building, 
  LinkIcon, 
  Check, 
  X, 
  Plus, 
  Star, 
  StarOff,
  ExternalLink,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Definindo o tipo para as afiliações
interface DoctorAffiliation {
  id: number;
  doctorId: number;
  organizationId: number;
  organizationName: string;
  status: string;
  isDefault: boolean;
  createdAt: string;
  address?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  website?: string;
  patientsCount?: number;
  prescriptionsCount?: number;
}

// Definindo o tipo para os convites
interface Invitation {
  id: number;
  organizationName: string;
  invitedBy: string;
  inviteDate: string;
  logo?: string;
}

export default function DoctorAfiliacao() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [affiliations, setAffiliations] = useState<DoctorAffiliation[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningOrganization, setJoiningOrganization] = useState(false);
  
  // Carregar as afiliações do médico
  useEffect(() => {
    const fetchAffiliations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/doctor/organizations');
        if (!response.ok) {
          throw new Error('Falha ao carregar afiliações');
        }
        const data = await response.json();
        setAffiliations(data);
      } catch (error) {
        console.error('Erro ao carregar afiliações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar suas afiliações. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Por enquanto, estamos deixando os convites como dados mockados
    // Em um sistema real, isso seria carregado de uma API
    setInvitations([{
      id: 101,
      organizationName: "CannaVida Farmácia",
      invitedBy: "Dr. Rafael Mendes",
      inviteDate: "28/04/2025",
      logo: "🌱"
    }]);
    
    fetchAffiliations();
  }, [toast]);
  
  const filteredAffiliations = affiliations.filter((affiliation: DoctorAffiliation) => {
    if (activeTab === 'active') {
      return affiliation.status === 'active';
    } else if (activeTab === 'pending') {
      return affiliation.status === 'pending';
    }
    return true;
  });
  
  const handleSetDefault = async (affiliationId: number) => {
    try {
      const response = await fetch(`/api/doctor/organizations/${affiliationId}/set-default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao definir como padrão');
      }
      
      // Atualiza a UI: marca a afiliação escolhida como padrão e remove flag das outras
      setAffiliations(prevAffiliations => 
        prevAffiliations.map(affiliation => ({
          ...affiliation,
          isDefault: affiliation.id === affiliationId
        }))
      );
      
      toast({
        title: 'Sucesso',
        description: 'Organização definida como padrão com sucesso',
      });
    } catch (error) {
      console.error('Erro ao definir organização padrão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível definir a organização como padrão. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
  
  const handleLeaveOrganization = async (affiliationId: number) => {
    if (!confirm('Tem certeza que deseja deixar esta organização? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/doctor/organizations/${affiliationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Se o erro for devido a prescrições existentes
        if (response.status === 400) {
          const data = await response.json();
          throw new Error(data.message || 'Não é possível deixar a organização');
        }
        throw new Error('Falha ao deixar a organização');
      }
      
      // Remove a afiliação da lista
      setAffiliations(prevAffiliations => 
        prevAffiliations.filter(affiliation => affiliation.id !== affiliationId)
      );
      
      toast({
        title: 'Sucesso',
        description: 'Você deixou a organização com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao deixar organização:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deixar a organização. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAcceptInvitation = (invitationId: number) => {
    // Simulação - em um sistema real, isso seria uma chamada de API
    toast({
      title: 'Convite aceito',
      description: 'Funcionalidade ainda em implementação',
    });
    
    // Remove o convite da lista
    setInvitations(prevInvitations => 
      prevInvitations.filter(invitation => invitation.id !== invitationId)
    );
  };
  
  const handleRejectInvitation = (invitationId: number) => {
    // Simulação - em um sistema real, isso seria uma chamada de API
    toast({
      title: 'Convite recusado',
      description: 'Funcionalidade ainda em implementação',
    });
    
    // Remove o convite da lista
    setInvitations(prevInvitations => 
      prevInvitations.filter(invitation => invitation.id !== invitationId)
    );
  };
  
  const handleJoinUsingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        title: 'Código vazio',
        description: 'Por favor, insira um código de convite válido',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setJoiningOrganization(true);
      
      const response = await fetch('/api/doctor/organizations/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Falha ao aderir à organização');
      }
      
      const data = await response.json();
      
      // Atualizar a lista para incluir a nova afiliação
      const response2 = await fetch('/api/doctor/organizations');
      if (response2.ok) {
        const affiliationsData = await response2.json();
        setAffiliations(affiliationsData);
      }
      
      // Fechar o dialog e limpar o código
      setShowInviteDialog(false);
      setInviteCode('');
      
      // Mudar para a aba pendentes se a afiliação estiver pendente
      setActiveTab('pending');
      
      toast({
        title: 'Solicitação enviada',
        description: data.message || 'Sua solicitação de afiliação foi enviada com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao usar código de convite:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível processar o código de convite. Verifique se o código está correto.',
        variant: 'destructive',
      });
    } finally {
      setJoiningOrganization(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <p className="text-gray-500 text-sm">Gerencie suas conexões com farmácias e dispensários</p>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => setShowInviteDialog(true)} className="flex items-center gap-1">
            <LinkIcon className="h-4 w-4" />
            <span>Usar código de convite</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAffiliations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAffiliations.map((affiliation: DoctorAffiliation) => (
                <Card key={affiliation.id} className={`${affiliation.isDefault ? 'border-primary border-2' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                          {affiliation.organizationName?.[0]?.toUpperCase() || "🏥"}
                        </div>
                        <div>
                          <CardTitle className="text-base">{affiliation.organizationName}</CardTitle>
                          {affiliation.isDefault && (
                            <Badge className="mt-1 bg-primary/10 text-primary">Padrão</Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!affiliation.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefault(affiliation.id)}>
                              <Star className="mr-2 h-4 w-4" />
                              <span>Tornar padrão</span>
                            </DropdownMenuItem>
                          )}
                          {affiliation.website && (
                            <DropdownMenuItem onClick={() => window.open(affiliation.website, '_blank')}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>Visitar site</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleLeaveOrganization(affiliation.id)} 
                            className="text-red-600 focus:text-red-600"
                          >
                            <X className="mr-2 h-4 w-4" />
                            <span>Deixar organização</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="text-xs mt-2">
                      {affiliation.address || ''}
                      {affiliation.city && affiliation.state ? `, ${affiliation.city}, ${affiliation.state}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-gray-500 text-xs">Pacientes</p>
                        <p className="font-medium">{affiliation.patientsCount || '0'}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-gray-500 text-xs">Prescrições</p>
                        <p className="font-medium">{affiliation.prescriptionsCount || '0'}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-gray-500 pt-0">
                    Afiliado desde {new Date(affiliation.createdAt).toLocaleDateString('pt-BR')}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Building className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Você não possui afiliações ativas</p>
                <p className="text-gray-500 text-sm mt-1">Entre usando um código de convite para se afiliar a uma organização</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAffiliations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAffiliations.map((affiliation: DoctorAffiliation) => (
                <Card key={affiliation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                          {affiliation.organizationName?.[0]?.toUpperCase() || "🏥"}
                        </div>
                        <div>
                          <CardTitle className="text-base">{affiliation.organizationName}</CardTitle>
                          <Badge className="mt-1 bg-yellow-100 text-yellow-800">Pendente</Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-xs mt-2">
                      {affiliation.address || ''}
                      {affiliation.city && affiliation.state ? `, ${affiliation.city}, ${affiliation.state}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Sua solicitação está em análise pela administração da organização.</p>
                  </CardContent>
                  <CardFooter className="text-xs text-gray-500 pt-0 justify-between">
                    <span>Solicitação enviada em {new Date(affiliation.createdAt).toLocaleDateString('pt-BR')}</span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Building className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Você não possui afiliações pendentes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="invites" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invitations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invitations.map((invitation: Invitation) => (
                <Card key={invitation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                          {invitation.logo || invitation.organizationName?.[0]?.toUpperCase() || "🏥"}
                        </div>
                        <div>
                          <CardTitle className="text-base">{invitation.organizationName}</CardTitle>
                          <p className="text-xs text-gray-500">
                            Convidado por: {invitation.invitedBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Você foi convidado a se tornar um médico afiliado a esta organização.</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <p className="text-xs text-gray-500">
                      Convidado em {invitation.inviteDate}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectInvitation(invitation.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Recusar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Building className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Você não possui convites pendentes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog para usar código de convite */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Usar código de convite</DialogTitle>
            <DialogDescription>
              Insira o código de convite fornecido pela organização para se associar como médico
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinUsingCode}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="inviteCode">Código de convite</Label>
                <Input
                  id="inviteCode"
                  placeholder="XXXX-XXXX-XXXX"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={joiningOrganization}>
                {joiningOrganization ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : 'Aderir à organização'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Mostrar loading state enquanto o botão é clicado */}
      {joiningOrganization && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Processando sua solicitação...</p>
          </div>
        </div>
      )}
    </div>
  );
}