import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from "@/lib/utils";
import { CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Organization {
  id: number;
  name: string;
  type: string;
  cnpj: string;
  email: string;
  phone: string;
  adminName: string;
  createdAt: Date;
  planName: string;
}

interface OrganizationCompletionModalProps {
  organization: Organization;
  onClose: () => void;
  onViewDashboard: () => void;
}

export function OrganizationCompletionModal({
  organization,
  onClose,
  onViewDashboard,
}: OrganizationCompletionModalProps) {
  // Criando os dados para o QR code
  const qrData = JSON.stringify({
    id: organization.id,
    name: organization.name,
    type: organization.type,
    cnpj: organization.cnpj,
    createdAt: organization.createdAt,
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Registro Concluído com Sucesso!
          </DialogTitle>
          <DialogDescription>
            Sua organização foi registrada em nossa plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          <div className="flex flex-col items-center justify-center space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold text-center">RG Digital da Organização</h3>
            <div className="border-4 border-primary rounded-lg p-2 bg-white">
              <QRCodeSVG 
                value={qrData}
                size={180}
                level="H"
                includeMargin={true}
                className="mx-auto"
              />
            </div>
            <p className="text-sm text-center text-gray-600">
              Este QR code é o RG digital da sua organização
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Detalhes da Organização</h3>
            
            <div className="space-y-3">
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
                <p className="text-sm text-gray-500">Administrador</p>
                <p className="font-medium">{organization.adminName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Plano</p>
                <p className="font-medium">{organization.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Registro</p>
                <p className="font-medium">{formatDate(organization.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle>Verifique seu email</AlertTitle>
          <AlertDescription>
            Enviamos um link de pagamento para <strong>{organization.email}</strong>. Verifique sua caixa de entrada e também sua pasta de spam.
          </AlertDescription>
        </Alert>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={() => window.location.href = '/login'}>
            Ir para Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}