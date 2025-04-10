import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  MessageSquare,
  Video,
  ExternalLink,
  FileText,
  BookMarked,
  User2,
  ArrowRight,
  Check,
  MessageCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";

export default function PharmacistAjuda() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  
  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);
  
  const handleSendMessage = () => {
    alert('Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.');
    setSupportMessage('');
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ajuda e Suporte</h1>
            <p className="text-gray-500">Obtenha assistência e informações • Farmácia {organizationName}</p>
          </div>
        </div>
        
        {/* Seção de Pesquisa */}
        <Card>
          <CardHeader>
            <CardTitle>Como podemos ajudar?</CardTitle>
            <CardDescription>Pesquise por tópicos ou navegue pelas categorias abaixo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar tópicos de ajuda..."
                className="pl-10 py-6 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Button variant="outline" className="h-auto py-6 justify-start flex-col items-start text-left">
                <BookMarked className="h-6 w-6 mb-2 text-blue-600" />
                <div>
                  <div className="font-semibold">Guias de Uso</div>
                  <p className="text-sm text-muted-foreground mt-1">Tutorial do sistema</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 justify-start flex-col items-start text-left">
                <FileText className="h-6 w-6 mb-2 text-green-600" />
                <div>
                  <div className="font-semibold">Documentação</div>
                  <p className="text-sm text-muted-foreground mt-1">Manuais detalhados</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 justify-start flex-col items-start text-left">
                <HelpCircle className="h-6 w-6 mb-2 text-amber-600" />
                <div>
                  <div className="font-semibold">FAQ</div>
                  <p className="text-sm text-muted-foreground mt-1">Perguntas frequentes</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 justify-start flex-col items-start text-left">
                <MessageCircle className="h-6 w-6 mb-2 text-purple-600" />
                <div>
                  <div className="font-semibold">Chat ao Vivo</div>
                  <p className="text-sm text-muted-foreground mt-1">Atendimento em tempo real</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* FAQ e Suporte */}
        <Tabs defaultValue="faq">
          <TabsList className="w-full sm:w-auto justify-start mb-4">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Perguntas Frequentes
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              Contato
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Tutoriais
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>
                  Respostas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Como aprovar uma prescrição médica?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>Para aprovar uma prescrição médica, siga os passos abaixo:</p>
                        <ol className="list-decimal ml-6 space-y-1">
                          <li>Acesse a página "Aprovar Prescrições" no menu lateral</li>
                          <li>Localize a prescrição na lista de pendentes</li>
                          <li>Clique em "Visualizar" para conferir os detalhes</li>
                          <li>Verifique se todos os medicamentos estão corretamente prescritos</li>
                          <li>Clique no botão "Aprovar" após a verificação</li>
                        </ol>
                        <p className="text-sm text-muted-foreground mt-2">
                          Nota: Somente farmacêuticos habilitados podem aprovar prescrições. 
                          A aprovação é um processo essencial para garantir a segurança do paciente.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Como registrar um novo produto no sistema?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>Para cadastrar um novo produto no sistema, siga estes passos:</p>
                        <ol className="list-decimal ml-6 space-y-1">
                          <li>Navegue até a seção "Produtos" no menu lateral</li>
                          <li>Clique no botão "Novo Produto" no canto superior direito</li>
                          <li>Preencha todos os campos obrigatórios do formulário</li>
                          <li>Adicione uma imagem do produto (se disponível)</li>
                          <li>Defina o preço, estoque e localização</li>
                          <li>Clique em "Salvar" para finalizar o cadastro</li>
                        </ol>
                        <p className="text-sm text-muted-foreground mt-2">
                          Recomendamos manter as informações dos produtos sempre atualizadas, 
                          principalmente estoque e preços.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Como gerenciar o estoque da farmácia?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>O gerenciamento de estoque pode ser feito através dos seguintes passos:</p>
                        <ol className="list-decimal ml-6 space-y-1">
                          <li>Acesse a seção "Estoque" no menu lateral</li>
                          <li>Visualize os produtos com estoque baixo na área destacada</li>
                          <li>Para atualizar o estoque, clique em "Ajustar Estoque"</li>
                          <li>Insira a nova quantidade ou adicione uma entrada/saída</li>
                          <li>Registre o motivo da alteração para manter o histórico</li>
                          <li>Confirme a operação para salvar as mudanças</li>
                        </ol>
                        <p className="text-sm text-muted-foreground mt-2">
                          O sistema alerta automaticamente quando um produto atinge o nível mínimo 
                          de estoque definido em suas configurações.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Como realizar uma venda no caixa (PDV)?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>Para realizar uma venda através do PDV:</p>
                        <ol className="list-decimal ml-6 space-y-1">
                          <li>Acesse a seção "Caixa" no menu lateral</li>
                          <li>Inicie uma nova venda clicando em "Nova Venda"</li>
                          <li>Pesquise e adicione os produtos ao carrinho</li>
                          <li>Verifique se todos os itens estão corretos</li>
                          <li>Selecione a forma de pagamento</li>
                          <li>Finalize a venda e imprima o comprovante se necessário</li>
                        </ol>
                        <p className="text-sm text-muted-foreground mt-2">
                          Para medicamentos controlados, é necessário vincular a venda a uma 
                          prescrição aprovada no sistema.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Como agendar um atendimento farmacêutico?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>Para agendar um atendimento farmacêutico:</p>
                        <ol className="list-decimal ml-6 space-y-1">
                          <li>Acesse a seção "Agenda" no menu lateral</li>
                          <li>Clique no botão "Novo Agendamento"</li>
                          <li>Selecione o paciente ou cadastre um novo</li>
                          <li>Escolha a data e horário disponíveis</li>
                          <li>Defina o tipo de atendimento (orientação, acompanhamento, etc.)</li>
                          <li>Adicione observações se necessário</li>
                          <li>Confirme o agendamento</li>
                        </ol>
                        <p className="text-sm text-muted-foreground mt-2">
                          O sistema permite enviar lembretes automáticos para o paciente 
                          sobre o agendamento.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Entre em Contato</CardTitle>
                  <CardDescription>
                    Envie uma mensagem para nossa equipe de suporte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Assunto</label>
                      <Input placeholder="Digite o assunto da sua mensagem" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mensagem</label>
                      <Textarea 
                        placeholder="Descreva detalhadamente sua dúvida ou problema..." 
                        className="min-h-[150px]"
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="attach-logs" className="rounded border-gray-300" />
                      <label htmlFor="attach-logs" className="text-sm">
                        Incluir logs do sistema para ajudar na resolução
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Tempo médio de resposta: 2 horas úteis
                  </p>
                  <Button onClick={handleSendMessage} disabled={!supportMessage.trim()}>
                    Enviar Mensagem
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-5">
                <Card>
                  <CardHeader>
                    <CardTitle>Contatos Diretos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <PhoneCall className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Suporte Técnico</p>
                        <p className="text-sm text-muted-foreground">(11) 3456-7890</p>
                        <p className="text-xs text-muted-foreground">Seg-Sex, 8h às 18h</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">E-mail de Suporte</p>
                        <p className="text-sm text-muted-foreground">suporte@endurancy.com</p>
                        <p className="text-xs text-muted-foreground">Resposta em até 24h</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Chat ao Vivo</p>
                        <p className="text-sm text-muted-foreground">Disponível no horário comercial</p>
                        <Button variant="link" className="h-auto p-0 text-xs mt-1">
                          Iniciar Chat <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Serviços</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Plataforma Endurancy</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" /> Operacional
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API de Integração</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" /> Operacional
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Notificações SMS</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" /> Operacional
                      </Badge>
                    </div>
                    
                    <Button variant="link" className="w-full mt-2 justify-center text-sm">
                      Ver status detalhado
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tutorials">
            <Card>
              <CardHeader>
                <CardTitle>Tutoriais em Vídeo</CardTitle>
                <CardDescription>
                  Aprenda a utilizar o sistema com nossos vídeos explicativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Card>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">Visão Geral do Sistema</h3>
                        <p className="text-sm text-muted-foreground mt-1">Introdução às funcionalidades</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="secondary">5:32</Badge>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ExternalLink className="h-3 w-3" /> Assistir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">Gestão de Estoque</h3>
                        <p className="text-sm text-muted-foreground mt-1">Controle completo de inventário</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="secondary">8:47</Badge>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ExternalLink className="h-3 w-3" /> Assistir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">Aprovação de Prescrições</h3>
                        <p className="text-sm text-muted-foreground mt-1">Processo completo de avaliação</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="secondary">7:15</Badge>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ExternalLink className="h-3 w-3" /> Assistir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">Operação de Caixa (PDV)</h3>
                        <p className="text-sm text-muted-foreground mt-1">Vendas e pagamentos</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="secondary">10:21</Badge>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ExternalLink className="h-3 w-3" /> Assistir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">Relatórios e Análises</h3>
                        <p className="text-sm text-muted-foreground mt-1">Interpretação de dados</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="secondary">9:03</Badge>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ExternalLink className="h-3 w-3" /> Assistir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">Gestão de Pacientes</h3>
                        <p className="text-sm text-muted-foreground mt-1">Cadastro e acompanhamento</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="secondary">6:54</Badge>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ExternalLink className="h-3 w-3" /> Assistir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Ver todos os tutoriais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}