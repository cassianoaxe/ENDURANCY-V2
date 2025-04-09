import React, { useState } from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
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

// Dados mockados de afiliação para demonstração
const doctorAffiliations = [
  {
    id: 1,
    organizationId: 1,
    organizationName: "Green Leaf Farmácia",
    status: "active",
    isDefault: true,
    joinedDate: "10/03/2025",
    patientsCount: 42,
    prescriptionsCount: 128,
    logo: "🍃", // Emoji como placeholder para logo
    website: "https://greenleaf.example.com",
    address: "Av. Paulista, 1000, São Paulo, SP"
  },
  {
    id: 2,
    organizationId: 2,
    organizationName: "MediCanna Dispensário",
    status: "active",
    isDefault: false,
    joinedDate: "15/04/2025",
    patientsCount: 18,
    prescriptionsCount: 54,
    logo: "🌿", // Emoji como placeholder para logo
    website: "https://medicanna.example.com",
    address: "Rua Augusta, 500, São Paulo, SP"
  },
  {
    id: 3,
    organizationId: 3,
    organizationName: "Saúde Cannabis Center",
    status: "pending",
    isDefault: false,
    joinedDate: "01/05/2025",
    patientsCount: 0,
    prescriptionsCount: 0,
    logo: "🌱", // Emoji como placeholder para logo
    website: "https://saudecannabis.example.com",
    address: "Av. Brigadeiro Faria Lima, 2000, São Paulo, SP"
  }
];

// Lista de convites pendentes
const pendingInvitations = [
  {
    id: 101,
    organizationName: "CannaVida Farmácia",
    invitedBy: "Dr. Rafael Mendes",
    inviteDate: "28/04/2025",
    logo: "🌱"
  }
];

export default function DoctorAfiliacao() {
  const { user } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  
  const filteredAffiliations = doctorAffiliations.filter(affiliation => {
    if (activeTab === 'active') {
      return affiliation.status === 'active';
    } else if (activeTab === 'pending') {
      return affiliation.status === 'pending';
    }
    return true;
  });
  
  const handleSetDefault = (affiliationId: number) => {
    console.log("Tornando a afiliação padrão:", affiliationId);
    // Aqui você implementaria a lógica para tornar esta a afiliação padrão
  };
  
  const handleLeaveOrganization = (affiliationId: number) => {
    console.log("Deixando a organização:", affiliationId);
    // Aqui você implementaria a lógica para deixar a organização
  };
  
  const handleAcceptInvitation = (invitationId: number) => {
    console.log("Aceitando convite:", invitationId);
    // Aqui você implementaria a lógica para aceitar o convite
  };
  
  const handleRejectInvitation = (invitationId: number) => {
    console.log("Rejeitando convite:", invitationId);
    // Aqui você implementaria a lógica para rejeitar o convite
  };
  
  const handleJoinUsingCode = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tentando aderir usando o código:", inviteCode);
    // Aqui você implementaria a lógica para aderir usando o código
    setShowInviteDialog(false);
    setInviteCode('');
  };

  return (
    <DoctorLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Afiliações</h1>
            <p className="text-gray-500 text-sm">Gerencie suas conexões com farmácias e dispensários</p>
          </div>
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
            {filteredAffiliations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAffiliations.map((affiliation) => (
                  <Card key={affiliation.id} className={`${affiliation.isDefault ? 'border-primary border-2' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                            {affiliation.logo}
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
                            <DropdownMenuItem onClick={() => window.open(affiliation.website, '_blank')}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>Visitar site</span>
                            </DropdownMenuItem>
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
                      <CardDescription className="text-xs mt-2">{affiliation.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded-md">
                          <p className="text-gray-500 text-xs">Pacientes</p>
                          <p className="font-medium">{affiliation.patientsCount}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-md">
                          <p className="text-gray-500 text-xs">Prescrições</p>
                          <p className="font-medium">{affiliation.prescriptionsCount}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="text-xs text-gray-500 pt-0">
                      Afiliado desde {affiliation.joinedDate}
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
            {filteredAffiliations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAffiliations.map((affiliation) => (
                  <Card key={affiliation.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                            {affiliation.logo}
                          </div>
                          <div>
                            <CardTitle className="text-base">{affiliation.organizationName}</CardTitle>
                            <Badge className="mt-1 bg-yellow-100 text-yellow-800">Pendente</Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-xs mt-2">{affiliation.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Sua solicitação está em análise pela administração da organização.</p>
                    </CardContent>
                    <CardFooter className="text-xs text-gray-500 pt-0">
                      Solicitado em {affiliation.joinedDate}
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
            {pendingInvitations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingInvitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                            {invitation.logo}
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
      </div>
      
      {/* Diálogo para usar código de convite */}
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
              <Button type="submit">Aderir à organização</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DoctorLayout>
  );
}