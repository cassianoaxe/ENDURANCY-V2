import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Shield, Building, User, Mail, Phone, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OrganizationCompletionModalProps {
  organization: {
    id: number;
    name: string;
    type: string;
    cnpj: string;
    email: string;
    phone: string;
    adminName: string;
    createdAt: Date;
    planName: string;
  };
  onClose: () => void;
  onViewDashboard?: () => void;
}

const OrganizationCompletionModal: React.FC<OrganizationCompletionModalProps> = ({
  organization,
  onClose,
  onViewDashboard
}) => {
  // Gerar QR code com informações básicas da organização (respeitando LGPD)
  // Inclui apenas informações públicas ou necessárias para identificação
  const qrData = JSON.stringify({
    id: organization.id,
    name: organization.name,
    type: organization.type,
    createdAt: organization.createdAt
  });

  // ID de verificação formatado para exibição
  const verificationId = `ORG-${organization.id.toString().padStart(5, '0')}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-green-50 py-8 border-b border-green-100">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold text-green-800">
            Registro Concluído
          </CardTitle>
          <CardDescription className="text-center text-green-700 mt-2">
            A organização {organization.name} foi registrada com sucesso!
          </CardDescription>
        </div>

        <CardContent className="grid md:grid-cols-5 gap-6 p-6">
          <div className="md:col-span-3 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Dados da Organização
              </h3>
              
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{organization.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-medium">{organization.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CNPJ</p>
                  <p className="font-medium">{organization.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plano</p>
                  <p className="font-medium">{organization.planName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Administrador</p>
                  <p className="font-medium">{organization.adminName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-sm truncate">{organization.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{organization.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Registro</p>
                  <p className="font-medium">{formatDate(organization.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Próximos Passos
              </h3>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li className="flex items-start gap-2 mt-1">
                  <Mail className="h-4 w-4 text-primary mt-0.5" />
                  <span>Verifique seu email para o link de pagamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span>Efetue o pagamento do plano escolhido</span>
                </li>
                <li className="flex items-start gap-2">
                  <User className="h-4 w-4 text-primary mt-0.5" />
                  <span>Receba suas credenciais de acesso após a confirmação</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                  <span>Acesse o sistema e configure sua organização</span>
                </li>
              </ul>
              
              <div className="flex items-center gap-2 mt-4 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                <Mail className="h-4 w-4" />
                <p className="text-sm">
                  <strong>Importante:</strong> Verifique também sua pasta de SPAM ou lixo eletrônico!
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 flex flex-col items-center space-y-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col items-center">
              <QRCodeSVG 
                value={qrData}
                size={180}
                includeMargin={true}
                level="H"
              />
              <p className="text-center text-sm text-gray-500 mt-2">
                Código de Verificação
              </p>
              <p className="text-center font-mono text-lg font-bold text-primary">
                {verificationId}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg w-full text-center">
              <p className="text-sm text-gray-600">
                Este é o QR Code de identificação da sua organização. Ele será usado para verificação e acesso aos recursos do sistema.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-3 p-6 pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {onViewDashboard && (
            <Button onClick={onViewDashboard} className="flex items-center gap-2">
              Ver Detalhes
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrganizationCompletionModal;