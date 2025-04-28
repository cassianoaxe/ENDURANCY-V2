import React, { useState } from 'react';
import { ScrollText, BookOpen, Check, ExternalLink, ArrowLeft, Info, CheckCircle, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RDC658_2022() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<string>('');
  const [requisitosCumpridos, setRequisitosCumpridos] = useState<{[key: string]: boolean}>({});
  
  // Função para lidar com a alteração de estado dos checkboxes
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setRequisitosCumpridos(prev => ({
      ...prev,
      [id]: checked
    }));
    
    toast({
      title: checked ? "Requisito marcado como cumprido" : "Requisito desmarcado",
      description: `O requisito foi ${checked ? 'marcado como cumprido' : 'desmarcado'}.`,
      variant: checked ? "default" : "destructive",
    });
  };
  
  // Salvar notas
  const handleSaveNotes = () => {
    toast({
      title: "Anotações salvas",
      description: "Suas anotações sobre a RDC 658/2022 foram salvas com sucesso.",
    });
  };
  
  // Calcular progresso
  const calcularProgresso = () => {
    const total = requisitosList.length;
    const cumpridos = Object.values(requisitosCumpridos).filter(Boolean).length;
    return Math.round((cumpridos / total) * 100);
  };
  
  // Lista de requisitos principais da RDC 658/2022
  const requisitosList = [
    { id: 'req1', texto: 'Sistema de Qualidade Farmacêutica documentado e eficaz' },
    { id: 'req2', texto: 'Instalações e equipamentos qualificados e adequados' },
    { id: 'req3', texto: 'Procedimentos para prevenção de contaminação cruzada' },
    { id: 'req4', texto: 'Validação de todos os processos e métodos analíticos' },
    { id: 'req5', texto: 'Sistema para gerenciamento de mudanças' },
    { id: 'req6', texto: 'Programa de qualificação de fornecedores' },
    { id: 'req7', texto: 'Controle de materiais e insumos documentado' },
    { id: 'req8', texto: 'Processos de produção padronizados e documentados' },
    { id: 'req9', texto: 'Validação de processos de esterilização (quando aplicável)' },
    { id: 'req10', texto: 'Programa de estabilidade para produtos registrados' },
    { id: 'req11', texto: 'Sistema de tratamento de desvios e não conformidades' },
    { id: 'req12', texto: 'Investigação de resultados fora de especificação' },
    { id: 'req13', texto: 'Programa de auto-inspeções periódicas' },
    { id: 'req14', texto: 'Treinamento e qualificação do pessoal' },
    { id: 'req15', texto: 'Controle de documentação e registros' },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-start gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => window.location.href = '/laboratory/regulatorio'}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
              RDC 658/2022
            </h1>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Vigente</Badge>
          </div>
          <p className="text-gray-600">
            Boas Práticas de Fabricação de Medicamentos
          </p>
        </div>
      </div>

      <Tabs defaultValue="texto">
        <TabsList className="mb-4">
          <TabsTrigger value="texto">
            <BookOpen className="h-4 w-4 mr-2" />
            Texto Completo
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <Check className="h-4 w-4 mr-2" />
            Checklist de Conformidade
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="texto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Texto Integral da RDC 658/2022</span>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2022/rdc-658-atualiza-boas-praticas-de-fabricacao-de-medicamentos" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver no site da ANVISA
                  </a>
                </Button>
              </CardTitle>
              <CardDescription>
                Resolução da Diretoria Colegiada - RDC Nº 658, de 30 de março de 2022
              </CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none text-justify">
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-700">Publicação</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Publicada no DOU em 31/03/2022, com vigência a partir de 01/10/2022.
                </AlertDescription>
              </Alert>
              
              <h2>Disposições Gerais</h2>
              <p>
                A RDC 658/2022 é uma atualização importante na regulamentação das Boas Práticas de Fabricação (BPF) 
                de medicamentos no Brasil, alinhando as normas brasileiras aos padrões internacionais estabelecidos pelo
                Esquema de Cooperação em Inspeção Farmacêutica (PIC/S).
              </p>
              
              <p>
                Esta resolução substitui a anterior RDC 301/2019 e incorpora diversos avanços tecnológicos e conceitos modernos de 
                gestão da qualidade farmacêutica, inclusive elementos do ICH Q10 (Sistema de Qualidade Farmacêutica).
              </p>
              
              <h2>Principais Atualizações</h2>
              <ul>
                <li>Incorporação de conceitos de gerenciamento de risco nas operações farmacêuticas;</li>
                <li>Fortalecimento dos requisitos para a prevenção de contaminação cruzada;</li>
                <li>Implementação de controles mais rigorosos para a garantia da integridade de dados;</li>
                <li>Novas diretrizes para a validação de processos contínuos;</li>
                <li>Requisitos específicos para o monitoramento contínuo de processos;</li>
                <li>Orientações para a implementação de tecnologias analíticas de processo (PAT);</li>
                <li>Inclusão de Revisão Periódica de Produto como elemento formal do Sistema de Qualidade;</li>
                <li>Atualização dos requisitos de qualificação de fornecedores e auditoria da cadeia de suprimentos.</li>
              </ul>
              
              <h2>Sistema de Qualidade Farmacêutica (SQF)</h2>
              <p>
                A RDC reforça a necessidade de um Sistema de Qualidade Farmacêutica robusto, que deve integrar as Boas Práticas 
                de Fabricação e o Gerenciamento de Risco da Qualidade. Este sistema deve garantir que:
              </p>
              
              <ol>
                <li>A realização do produto seja alcançada por meio de processos projetados para consistentemente atender às especificações;</li>
                <li>As responsabilidades gerenciais sejam claramente especificadas;</li>
                <li>Exista controle sobre aquisição e uso de materiais;</li>
                <li>Os controles necessários durante a fabricação e liberação de produtos sejam realizados;</li>
                <li>Os processos produtivos estejam em estado de controle;</li>
                <li>Exista um processo para gerenciamento de desvios e não conformidades;</li>
                <li>A melhoria contínua seja facilitada através de implementação de melhorias apropriadas.</li>
              </ol>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Textarea 
                placeholder="Adicione suas anotações sobre esta RDC aqui..." 
                className="min-h-24"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={handleSaveNotes} className="mt-2 ml-auto">
                Salvar Anotações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Conformidade com a RDC 658/2022</CardTitle>
              <CardDescription>
                Verifique os requisitos que seu laboratório atende atualmente
              </CardDescription>
              
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${calcularProgresso()}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Progresso: {calcularProgresso()}% dos requisitos atendidos
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requisitosList.map((requisito) => (
                  <div key={requisito.id} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-md hover:bg-gray-50">
                    <Checkbox 
                      id={requisito.id} 
                      checked={!!requisitosCumpridos[requisito.id]}
                      onCheckedChange={(checked) => handleCheckboxChange(requisito.id, checked === true)}
                    />
                    <div className="space-y-1">
                      <label 
                        htmlFor={requisito.id} 
                        className="font-medium text-sm cursor-pointer"
                      >
                        {requisito.texto}
                      </label>
                      {requisitosCumpridos[requisito.id] && (
                        <p className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Requisito atendido
                        </p>
                      )}
                      {requisitosCumpridos[requisito.id] === false && (
                        <p className="text-xs text-red-600 flex items-center">
                          <CircleAlert className="h-3 w-3 mr-1" /> Requisito não atendido
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setRequisitosCumpridos({})}
              >
                Limpar Checklist
              </Button>
              <Button 
                onClick={() => {
                  toast({
                    title: "Checklist salvo",
                    description: `Progresso atual: ${calcularProgresso()}% dos requisitos atendidos.`,
                  });
                }}
              >
                Salvar Progresso
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}