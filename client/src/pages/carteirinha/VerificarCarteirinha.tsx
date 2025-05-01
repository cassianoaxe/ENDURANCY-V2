import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, BadgeCheck, Calendar, Clock, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VerificationResult {
  isValid: boolean;
  member?: {
    name: string;
    membershipId: string;
    registrationDate: string;
    validUntil: string;
    status: 'active' | 'inactive' | 'suspended';
  };
  organization?: {
    name: string;
    logo: string;
  };
  message?: string;
}

export default function VerificarCarteirinha() {
  const [, params] = useRoute('/carteirinha/verificar/:membershipId');
  const membershipId = params?.membershipId;
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyMembership = async () => {
      if (!membershipId) {
        setVerificationResult({
          isValid: false,
          message: 'Código de identificação inválido ou não fornecido.'
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Usar a nova rota da API para o módulo de carteirinha
        const response = await apiRequest(`/api/carteirinha/verify/${membershipId}`, {
          method: 'GET'
        });
        
        setVerificationResult(response);
      } catch (error) {
        console.error('Erro ao verificar carteirinha:', error);
        setVerificationResult({
          isValid: false,
          message: 'Não foi possível verificar a carteirinha. Tente novamente mais tarde.'
        });
      } finally {
        setLoading(false);
      }
    };

    verifyMembership();
  }, [membershipId]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verificando carteirinha</h2>
          <p className="text-muted-foreground">
            Aguarde enquanto verificamos a validade da carteirinha...
          </p>
        </div>
      </div>
    );
  }

  if (!verificationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-destructive">
              <AlertCircle size={48} />
            </div>
            <CardTitle className="text-xl">Erro de Verificação</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Ocorreu um erro inesperado durante a verificação. Tente novamente mais tarde.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!verificationResult.isValid || !verificationResult.member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md mx-auto border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-destructive">
              <AlertCircle size={48} />
            </div>
            <CardTitle className="text-xl">Carteirinha Inválida</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {verificationResult.message || 'A carteirinha apresentada não é válida ou não foi encontrada no sistema.'}
            </p>
            <div className="bg-destructive/10 p-4 rounded-md text-sm">
              <p className="font-medium text-destructive">
                Esta verificação não confirma associação válida.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Verificar novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // A verificação é válida e temos os dados do membro
  const { member, organization } = verificationResult;
  const isActive = member.status === 'active';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className={`w-full max-w-md mx-auto ${isActive ? 'border-green-600/30' : 'border-amber-600/30'}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-primary">
            {isActive ? <BadgeCheck size={48} /> : <Clock size={48} />}
          </div>
          <CardTitle className="text-xl mb-1">
            {isActive ? 'Carteirinha Válida' : 'Associação Pendente'}
          </CardTitle>
          {organization && (
            <div className="mt-4 flex items-center justify-center">
              {organization.logo ? (
                <img 
                  src={organization.logo} 
                  alt={`${organization.name} Logo`} 
                  className="h-10 mr-2"
                />
              ) : null}
              <span className="font-medium">{organization.name}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="font-medium text-lg">{member.name}</div>
            <div className="text-sm text-muted-foreground">
              ID: {member.membershipId}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar size={14} /> Data de Registro
              </div>
              <div className="font-medium">
                {formatDate(member.registrationDate)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar size={14} /> Validade
              </div>
              <div className="font-medium">
                {formatDate(member.validUntil)}
              </div>
            </div>
          </div>
          
          <div className={`${isActive ? 'bg-green-50' : 'bg-amber-50'} p-4 rounded-md text-sm`}>
            {isActive ? (
              <p className="font-medium text-green-700 flex items-center gap-1">
                <ShieldCheck size={16} /> Associação ativa e regular
              </p>
            ) : (
              <p className="font-medium text-amber-700 flex items-center gap-1">
                <Clock size={16} /> Associação pendente de aprovação
              </p>
            )}
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>Verificação realizada em {new Date().toLocaleString('pt-BR')}</p>
            <p>Código de verificação: {membershipId}</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-stretch gap-2">
          <div className="text-sm text-center mb-2">
            <p className="text-muted-foreground">
              Para mais informações sobre esta associação, entre em contato com a organização.
            </p>
          </div>
          
          <Button variant="outline" className="w-full gap-1">
            <FileText size={14} /> Ver informações da associação
          </Button>
          
          <Button variant="link" className="text-xs text-muted-foreground gap-1">
            <ExternalLink size={12} /> Verificar em portal.compliance.com
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}