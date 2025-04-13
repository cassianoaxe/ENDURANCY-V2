import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle 
} from "lucide-react";

interface TarefasStatusCardProps {
  titulo: string;
  quantidade: number;
  tipo: 'total' | 'emProgresso' | 'atrasadas' | 'concluidas';
  periodo?: string;
}

export default function TarefasStatusCard({ 
  titulo, 
  quantidade, 
  tipo, 
  periodo 
}: TarefasStatusCardProps) {
  const getIcon = () => {
    switch (tipo) {
      case 'total':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'emProgresso':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'atrasadas':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'concluidas':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getText = () => {
    switch (tipo) {
      case 'total':
        return <span className="text-gray-700">{quantidade}</span>;
      case 'emProgresso':
        return <span className="text-purple-700">{quantidade}</span>;
      case 'atrasadas':
        return <span className="text-red-700">{quantidade}</span>;
      case 'concluidas':
        return <span className="text-green-700">{quantidade}</span>;
      default:
        return <span>{quantidade}</span>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            {getIcon()}
            <h3 className="ml-2 text-sm font-medium">{titulo}</h3>
            {periodo && <span className="ml-1 text-xs text-muted-foreground">({periodo})</span>}
          </div>
          <div className="text-3xl font-bold">{getText()}</div>
        </div>
      </CardContent>
    </Card>
  );
}