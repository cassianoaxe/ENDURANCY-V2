import React from 'react';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Download, FileText, Check, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function RDC16_2014() {
  const rdc = {
    id: 1,
    title: 'Boas Práticas de Fabricação e Peticionamento de AFE/AE',
    code: 'RDC 16/2014',
    documentType: 'Resolução',
    description: 'Dispõe sobre os requisitos de Boas Práticas de Fabricação para concessão de Autorização de Funcionamento (AFE) e Autorização Especial (AE).',
    publishedDate: '2014-03-28',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2014/publicada-rdc-que-atualiza-normas-de-funcionamento-de-empresas-de-medicamentos',
    file: 'rdc16_2014.pdf',
    fullText: `
      RESOLUÇÃO RDC Nº 16, DE 28 DE MARÇO DE 2014
      
      Dispõe sobre os Critérios para Peticionamento de Autorização de Funcionamento (AFE) e Autorização Especial (AE) de Empresas.
      
      A Diretoria Colegiada da Agência Nacional de Vigilância Sanitária, no uso das atribuições que lhe conferem os incisos III e IV, do art. 15 da Lei n.º 9.782, de 26 de janeiro de 1999, o inciso II, e §§ 1° e 3° do art. 54 do Regimento Interno aprovado nos termos do Anexo I da Portaria nº 354 da ANVISA, de 11 de agosto de 2006, republicada no DOU de 21 de agosto de 2006, e suas atualizações, tendo em vista o disposto nos incisos III, do art. 2º, III e IV, do art. 7º da Lei n.º 9.782, de 1999, e o Programa de Melhoria do Processo de Regulamentação da Agência, instituído por meio da Portaria nº 422, de 16 de abril de 2008, em reunião realizada em 27 de março de 2014, adota a seguinte Resolução da Diretoria Colegiada e eu, Diretor-Presidente Substituto, determino a sua publicação:
      
      CAPÍTULO I
      DAS DISPOSIÇÕES INICIAIS
      
      Seção I
      Objetivo
      
      Art. 1º Esta Resolução tem o objetivo de estabelecer os critérios relativos à concessão, renovação, alteração, retificação de publicação, cancelamento, bem como para a interposição de recurso administrativo contra o indeferimento de pedidos relativos aos peticionamentos de Autorização de Funcionamento (AFE) e Autorização Especial (AE) de empresas e estabelecimentos que realizem as atividades elencadas na Seção III do Capítulo I com medicamentos e insumos farmacêuticos destinados a uso humano, substâncias sujeitas a controle especial, produtos para saúde, cosméticos, produtos de higiene pessoal, perfumes, saneantes e cultivo de plantas que possam originar substâncias sujeitas a controle especial.
      
      Seção II
      Definições
      
      Art. 2º Para efeitos desta Resolução são adotadas as seguintes definições:
      
      I - autoridade sanitária: Agência Nacional de Vigilância Sanitária e vigilâncias sanitárias dos Estados, do Distrito Federal e dos Municípios;
      
      II - Autorização de Funcionamento (AFE): ato de competência da Agência Nacional de Vigilância Sanitária, contendo permissão para o funcionamento de empresas ou estabelecimentos, instituições e órgãos, concedido mediante o cumprimento dos requisitos técnicos e administrativos constantes desta Resolução;
      
      III - Autorização Especial (AE): ato de competência da Agência Nacional de Vigilância Sanitária que autoriza o exercício de atividades que envolvem insumos farmacêuticos, medicamentos e substâncias sujeitas a controle especial, bem como o cultivo de plantas que possam originar substâncias sujeitas a controle especial, mediante comprovação de requisitos técnicos e administrativos específicos, constantes desta Resolução;
      
      IV - caducidade: estado ou condição da autorização que se tornou caduca, perdendo sua validade pelo decurso do prazo legal;
      
      V - cancelamento: ato que torna sem validade a Autorização de Funcionamento ou Autorização Especial concedida;
      
      VI - comércio varejista de produtos para saúde: compreende as atividades de comercialização de produtos para saúde de uso leigo, em quantidade que não exceda a normalmente destinada ao uso próprio e diretamente a pessoa física para uso pessoal ou doméstico;
      
      VII - controle especial: conjunto de normas e procedimentos impostos pela legislação específica, que estabelece mecanismos para a adoção das medidas sanitárias, administrativas e legais sobre atividades que envolvem substâncias e produtos capazes de causar dependência física ou psíquica, com o objetivo de prevenir a ocorrência de ingestão indevida, abuso e desvio de finalidade;
      
      VIII - declaração de atividades: documento assinado pelo representante legal ou seu procurador, descrevendo as atividades que a empresa ou estabelecimento pretende exercer;
      
      IX - empresa: pessoa jurídica, de direito público ou privado, que explore como objeto principal ou subsidiário as atividades discriminadas na Seção III do Capítulo I desta Resolução;
      
      X - estabelecimento: unidade que realize atividades previstas na Seção III do Capítulo I desta Resolução, inclusive as filiais;
    `,
    checklistItems: [
      { id: 1, text: "Verificar Manual de Boas Práticas de Fabricação atualizado", status: "completed" },
      { id: 2, text: "Revisar procedimentos operacionais padrão (POPs)", status: "completed" },
      { id: 3, text: "Verificar se autorização AFE está dentro da validade", status: "pending" },
      { id: 4, text: "Realizar auto-inspeção para verificar conformidade", status: "in-progress" },
      { id: 5, text: "Assegurar que colaboradores estão treinados na RDC 16/2014", status: "completed" },
      { id: 6, text: "Verificar documentação de qualificação de fornecedores", status: "pending" },
    ],
  };

  return (
    <LaboratoryLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
                {rdc.code}
              </h1>
              <Badge className="bg-green-600">{rdc.status}</Badge>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mt-1">{rdc.title}</h2>
            <p className="text-gray-600 mt-2">
              {rdc.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <FileText className="h-4 w-4" />
              <span>Publicado em {new Date(rdc.publishedDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Abrir no Visualizador
            </Button>
          </div>
        </div>

        <Tabs defaultValue="texto" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="texto">Texto Completo</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
          </TabsList>
          <TabsContent value="texto" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Texto Completo da Resolução</CardTitle>
                <CardDescription>
                  Visualize o texto integral da RDC 16/2014
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-justify whitespace-pre-line">
                  {rdc.fullText}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <a 
                  href={rdc.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  Acessar fonte oficial na Anvisa
                </a>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="checklist" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Checklist de Conformidade</CardTitle>
                <CardDescription>
                  Acompanhe os requisitos para conformidade com a RDC 16/2014
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rdc.checklistItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-start p-4 rounded-md border ${
                        item.status === 'completed' 
                          ? 'border-green-200 bg-green-50' 
                          : item.status === 'in-progress' 
                            ? 'border-amber-200 bg-amber-50' 
                            : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      ) : item.status === 'in-progress' ? (
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{item.text}</p>
                        <div className="flex items-center mt-1 text-sm">
                          <span className={`
                            ${item.status === 'completed' ? 'text-green-600' : 
                              item.status === 'in-progress' ? 'text-amber-600' : 'text-gray-500'}
                          `}>
                            {item.status === 'completed' ? 'Concluído' : 
                             item.status === 'in-progress' ? 'Em andamento' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">Atualizar Checklist</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="anotacoes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Anotações e Comentários</CardTitle>
                <CardDescription>
                  Registre observações importantes sobre a aplicação desta RDC no laboratório
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md border border-gray-200 min-h-[200px]">
                  <p className="text-gray-500 italic">
                    Ainda não há anotações para este documento. Utilize esta área para registrar
                    interpretações, dúvidas ou comentários sobre a aplicação desta regulamentação.
                  </p>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">Adicionar Anotação</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LaboratoryLayout>
  );
}