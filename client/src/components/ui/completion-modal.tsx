import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  qrCodeData?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  footerContent?: React.ReactNode;
}

export function CompletionModal({
  open,
  onOpenChange,
  title,
  description,
  qrCodeData,
  leftContent,
  rightContent,
  primaryButtonText = 'Concluir',
  secondaryButtonText,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  footerContent,
}: CompletionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Coluna da esquerda */}
          <div className="space-y-4">
            {leftContent}
          </div>

          {/* Coluna da direita com QR Code se disponível */}
          <div className="space-y-4">
            {rightContent}
            
            {qrCodeData && (
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-white p-2 rounded-md">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}`} 
                    alt="QR Code" 
                    className="w-36 h-36"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Escaneie o código QR para validar
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {footerContent}
          
          {secondaryButtonText && (
            <Button
              variant="outline"
              onClick={onSecondaryButtonClick || (() => onOpenChange(false))}
            >
              {secondaryButtonText}
            </Button>
          )}
          
          <Button 
            onClick={onPrimaryButtonClick || (() => onOpenChange(false))}
          >
            {primaryButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}