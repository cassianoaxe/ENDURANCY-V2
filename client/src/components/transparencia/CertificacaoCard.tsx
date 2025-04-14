import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Clock, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CertificacaoCardProps {
  certificacao: {
    id: number;
    nome: string;
    descricao: string | null;
    entidadeEmissora: string;
    tipo: string;
    dataEmissao: string | Date;
    dataValidade: string | Date | null;
    arquivoUrl: string | null;
    urlVerificacao: string | null;
    status: string;
  };
}

const getTipoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    certificado_qualidade: "Certificado de Qualidade",
    certificado_sustentabilidade: "Certificado de Sustentabilidade",
    certificado_conformidade: "Certificado de Conformidade",
    titulo_utilidade_publica: "Título de Utilidade Pública",
    acreditacao: "Acreditação",
    iso: "Certificado ISO",
    premio: "Prêmio",
    selo: "Selo",
    outros: "Outros"
  };
  
  return tipos[tipo] || tipo;
};

const getTipoColor = (tipo: string) => {
  const cores: Record<string, string> = {
    certificado_qualidade: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    certificado_sustentabilidade: "bg-green-100 text-green-800 hover:bg-green-200",
    certificado_conformidade: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    titulo_utilidade_publica: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    acreditacao: "bg-teal-100 text-teal-800 hover:bg-teal-200",
    iso: "bg-red-100 text-red-800 hover:bg-red-200",
    premio: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    selo: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    outros: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  };
  
  return cores[tipo] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

const CertificacaoCard: React.FC<CertificacaoCardProps> = ({ certificacao }) => {
  const dataEmissaoFormatada = typeof certificacao.dataEmissao === 'string' 
    ? format(new Date(certificacao.dataEmissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : format(certificacao.dataEmissao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const dataValidadeFormatada = certificacao.dataValidade 
    ? (typeof certificacao.dataValidade === 'string' 
      ? format(new Date(certificacao.dataValidade), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : format(certificacao.dataValidade, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }))
    : null;
  
  const handleDownload = () => {
    if (certificacao.arquivoUrl) {
      window.open(certificacao.arquivoUrl, '_blank');
    }
  };
  
  const handleVerificar = () => {
    if (certificacao.urlVerificacao) {
      window.open(certificacao.urlVerificacao, '_blank');
    }
  };
  
  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{certificacao.nome}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              Emitido por: {certificacao.entidadeEmissora}
            </CardDescription>
          </div>
          <Badge className={`ml-2 ${getTipoColor(certificacao.tipo)}`}>
            {getTipoLabel(certificacao.tipo)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {certificacao.descricao && (
          <p className="text-sm text-gray-700 mb-3">{certificacao.descricao}</p>
        )}
        
        <div className="flex flex-col space-y-1 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Emitido em: {dataEmissaoFormatada}</span>
          </div>
          
          {dataValidadeFormatada && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Válido até: {dataValidadeFormatada}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-1">
        {certificacao.arquivoUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 flex items-center justify-center" 
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar
          </Button>
        )}
        
        {certificacao.urlVerificacao && (
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 flex items-center justify-center" 
            onClick={handleVerificar}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Verificar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CertificacaoCard;