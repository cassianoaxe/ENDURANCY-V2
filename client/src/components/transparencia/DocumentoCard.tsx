import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentoCardProps {
  documento: {
    id: number;
    titulo: string;
    descricao: string | null;
    categoria: string;
    dataDocumento: string | Date;
    arquivoUrl: string;
    arquivoTipo: string;
    arquivoTamanho: string;
  };
}

const getCategoriaLabel = (categoria: string) => {
  const categorias: Record<string, string> = {
    estatuto: "Estatuto",
    ata_assembleia: "Ata de Assembleia",
    regimento_interno: "Regimento Interno",
    balanco_financeiro: "Balanço Financeiro",
    relatorio_atividades: "Relatório de Atividades",
    prestacao_contas: "Prestação de Contas",
    certificacao: "Certificação",
    declaracao_utilidade_publica: "Declaração de Utilidade Pública",
    outros: "Outros"
  };
  
  return categorias[categoria] || categoria;
};

const getCategoriaColor = (categoria: string) => {
  const cores: Record<string, string> = {
    estatuto: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    ata_assembleia: "bg-green-100 text-green-800 hover:bg-green-200",
    regimento_interno: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    balanco_financeiro: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    relatorio_atividades: "bg-teal-100 text-teal-800 hover:bg-teal-200",
    prestacao_contas: "bg-red-100 text-red-800 hover:bg-red-200",
    certificacao: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    declaracao_utilidade_publica: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    outros: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  };
  
  return cores[categoria] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

const DocumentoCard: React.FC<DocumentoCardProps> = ({ documento }) => {
  const dataFormatada = typeof documento.dataDocumento === 'string' 
    ? format(new Date(documento.dataDocumento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : format(documento.dataDocumento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const handleDownload = () => {
    window.open(documento.arquivoUrl, '_blank');
  };
  
  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{documento.titulo}</CardTitle>
            <CardDescription className="flex items-center mt-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" /> {dataFormatada}
            </CardDescription>
          </div>
          <Badge className={`ml-2 ${getCategoriaColor(documento.categoria)}`}>
            {getCategoriaLabel(documento.categoria)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {documento.descricao && (
          <p className="text-sm text-gray-700 mb-2">{documento.descricao}</p>
        )}
        <div className="flex items-center text-xs text-gray-500">
          <FileText className="w-4 h-4 mr-1" />
          <span>{documento.arquivoTipo} • {documento.arquivoTamanho}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center" 
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar documento
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentoCard;