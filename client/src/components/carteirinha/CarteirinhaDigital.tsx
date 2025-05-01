import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Download, Shield, Calendar } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface Member {
  id: number;
  name: string;
  cpf: string;
  profilePhoto: string | null;
  registrationDate: string;
  validUntil: string;
  membershipId: string;
  organizationId: number;
}

interface Organization {
  id: number;
  name: string;
  logo: string;
}

interface CarteirinhaDigitalProps {
  memberId?: number;
}

export default function CarteirinhaDigital({ memberId }: CarteirinhaDigitalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  
  // Define qual ID de membro usar: o fornecido via prop ou o ID do usuário atual
  const targetMemberId = memberId || (user?.role === 'patient' ? user.id : null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!targetMemberId && user?.role !== 'org_admin' && user?.role !== 'admin') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Buscar dados do membro
        const memberResponse = await apiRequest(
          `/api/members/${targetMemberId || 'me'}`, 
          { method: 'GET' }
        );
        
        const memberData = await memberResponse;
        setMember(memberData);
        
        // Buscar dados da organização
        if (memberData.organizationId) {
          const orgResponse = await apiRequest(
            `/api/organizations/${memberData.organizationId}`, 
            { method: 'GET' }
          );
          
          const orgData = await orgResponse;
          setOrganization(orgData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados da carteirinha:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da carteirinha.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [targetMemberId, user]);

  const downloadCarteirinha = () => {
    // Implementar lógica para download da carteirinha como imagem
    const carteirinhaElement = document.getElementById('carteirinha-digital');
    if (carteirinhaElement) {
      toast({
        title: 'Download iniciado',
        description: 'A carteirinha está sendo baixada como imagem.',
      });
      // Aqui implementaremos a conversão para imagem e download posteriormente
    }
  };

  const shareCarteirinha = () => {
    // Implementar lógica para compartilhar a carteirinha
    if (navigator.share) {
      navigator.share({
        title: `Carteirinha de ${member?.name}`,
        text: `Carteirinha digital de associado - ${organization?.name}`,
        url: window.location.href,
      })
      .catch((error) => {
        console.error('Erro ao compartilhar:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível compartilhar a carteirinha.',
          variant: 'destructive',
        });
      });
    } else {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta a função de compartilhamento.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!member || !organization) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-destructive mb-4">
          <Shield size={48} />
        </div>
        <h3 className="text-xl font-bold mb-2">Carteirinha não encontrada</h3>
        <p className="text-muted-foreground">
          Não foi possível encontrar os dados da carteirinha digital. Verifique se você está registrado como membro.
        </p>
      </div>
    );
  }

  // URL para a carteirinha pública
  const carteirinhaUrl = `${window.location.origin}/carteirinha/verificar/${member.membershipId}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Carteirinha Digital</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={shareCarteirinha} className="gap-1">
            <Share2 size={16} /> Compartilhar
          </Button>
          <Button onClick={downloadCarteirinha} className="gap-1">
            <Download size={16} /> Baixar
          </Button>
        </div>
      </div>
      
      <div id="carteirinha-digital" className="relative overflow-hidden">
        <Card className="w-full max-w-lg mx-auto border-2 border-primary/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 -mt-8 -mr-8 bg-primary/5 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 -mb-10 -ml-10 bg-primary/5 rounded-full"></div>
          
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border border-border">
              <img 
                src={organization.logo || '/logo-placeholder.svg'} 
                alt={`${organization.name} Logo`} 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-lg">{organization.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Carteira de Associado</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-0">
            <div className="flex items-start gap-4">
              <div className="w-1/3 aspect-square overflow-hidden rounded-md border border-border bg-muted/50 flex items-center justify-center">
                {member.profilePhoto ? (
                  <img
                    src={member.profilePhoto}
                    alt={`Foto de ${member.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    <div className="text-5xl font-bold opacity-20">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-2/3 space-y-2">
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">Associado Nº {member.membershipId}</p>
                </div>
                
                <div className="pt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">CPF: </span>
                    <span className="font-medium">
                      {member.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 text-sm mt-1">
                    <div>
                      <span className="text-muted-foreground">Cadastro: </span>
                      <span className="font-medium">
                        {new Date(member.registrationDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Validade: </span>
                      <span className="font-medium">
                        {new Date(member.validUntil).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-primary" />
                <span>
                  {new Date().toLocaleDateString('pt-BR', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex-shrink-0">
                <QRCode 
                  value={carteirinhaUrl}
                  size={80}
                  level="H"
                  renderAs="svg"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}