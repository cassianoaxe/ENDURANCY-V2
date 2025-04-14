import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MembroCardProps {
  membro: {
    id: number;
    nome: string;
    cargo: string;
    tipo: string;
    email: string | null;
    telefone: string | null;
    biografia: string | null;
    dataIngresso: string | Date;
    status: boolean;
    fotoUrl: string | null;
  };
}

const getTipoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    diretoria: "Diretoria",
    conselho_administrativo: "Conselho Administrativo",
    conselho_fiscal: "Conselho Fiscal",
    conselho_consultivo: "Conselho Consultivo",
    associado_fundador: "Associado Fundador",
    associado_efetivo: "Associado Efetivo",
    associado_honorario: "Associado Honorário",
    colaborador: "Colaborador",
    voluntario: "Voluntário",
    outros: "Outros"
  };
  
  return tipos[tipo] || tipo;
};

const getTipoColor = (tipo: string) => {
  const cores: Record<string, string> = {
    diretoria: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    conselho_administrativo: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    conselho_fiscal: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    conselho_consultivo: "bg-violet-100 text-violet-800 hover:bg-violet-200",
    associado_fundador: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    associado_efetivo: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    associado_honorario: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    colaborador: "bg-teal-100 text-teal-800 hover:bg-teal-200",
    voluntario: "bg-green-100 text-green-800 hover:bg-green-200",
    outros: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  };
  
  return cores[tipo] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .filter((_, index, array) => index === 0 || index === array.length - 1)
    .join('')
    .toUpperCase();
};

const MembroCard: React.FC<MembroCardProps> = ({ membro }) => {
  const dataIngressoFormatada = typeof membro.dataIngresso === 'string' 
    ? format(new Date(membro.dataIngresso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : format(membro.dataIngresso, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  // Função para gerar uma cor de fundo baseada no nome
  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    
    // Use a soma dos códigos ASCII das letras do nome como seed
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[seed % colors.length];
  };
  
  // Gera cor do avatar baseada no nome
  const avatarColor = getBackgroundColor(membro.nome);
  
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Avatar className="h-12 w-12">
          {membro.fotoUrl ? (
            <AvatarImage src={membro.fotoUrl} alt={membro.nome} />
          ) : (
            <AvatarFallback className={`${avatarColor} text-white`}>
              {getInitials(membro.nome)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{membro.nome}</CardTitle>
            <Badge className={`ml-2 ${getTipoColor(membro.tipo)}`}>
              {getTipoLabel(membro.tipo)}
            </Badge>
          </div>
          <CardDescription className="text-sm font-medium">{membro.cargo}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {membro.biografia && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-3">{membro.biografia}</p>
        )}
        
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          <span>Membro desde {dataIngressoFormatada}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembroCard;