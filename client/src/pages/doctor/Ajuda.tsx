import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  HelpCircle, 
  Search, 
  Play, 
  FileText, 
  MessageSquare, 
  Phone, 
  Mail, 
  Book, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Ajuda() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para o formulário de contato
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: '',
    message: '',
    attachments: null as FileList | null
  });
  
  // Perguntas frequentes
  const faqs = [
    {
      id: 1,
      question: "Como registrar um novo paciente?",
      answer: "Para registrar um novo paciente, acesse a seção 'Pacientes' no menu lateral e clique em 'Adicionar Paciente'. Preencha os dados necessários incluindo nome completo, data de nascimento, CPF e informações de contato. Após preencher o formulário, clique em 'Salvar' para concluir o registro."
    },
    {
      id: 2,
      question: "Como criar uma nova prescrição?",
      answer: "Para criar uma nova prescrição, navegue até a página 'Prescrições' e clique em 'Nova Prescrição'. Selecione o paciente na lista, adicione os produtos recomendados, especifique as dosagens e instruções de uso. Você também pode adicionar notas adicionais antes de finalizar a prescrição clicando em 'Emitir Prescrição'."
    },
    {
      id: 3,
      question: "Como gerenciar minha agenda de consultas?",
      answer: "Para gerenciar sua agenda, acesse a seção 'Agenda' no menu lateral. Você pode visualizar, adicionar, editar ou cancelar consultas. Para adicionar uma nova consulta, clique em 'Nova Consulta', selecione o paciente, data, horário e tipo de consulta. Para editar ou cancelar, clique diretamente na consulta agendada."
    },
    {
      id: 4,
      question: "Como me afiliar a uma nova organização?",
      answer: "Para se afiliar a uma nova organização, acesse a página 'Afiliação' e clique em 'Solicitar Nova Afiliação'. Preencha os dados da organização, incluindo o código de convite (se necessário). A solicitação será enviada para aprovação do administrador da organização. Você receberá uma notificação quando sua solicitação for processada."
    },
    {
      id: 5,
      question: "Como acessar os prontuários dos pacientes?",
      answer: "Para acessar os prontuários, vá até a seção 'Prontuários' no menu lateral. Você pode pesquisar pacientes pelo nome ou CPF. Ao encontrar o paciente desejado, clique em 'Ver Prontuário' para acessar o histórico completo, incluindo consultas anteriores, prescrições e observações clínicas."
    },
    {
      id: 6,
      question: "O que fazer quando uma prescrição é rejeitada?",
      answer: "Quando uma prescrição é rejeitada, você receberá uma notificação com o motivo da rejeição. Acesse a seção 'Prescrições', localize a prescrição rejeitada e clique em 'Editar'. Faça as correções necessárias de acordo com o feedback recebido e reenvie para nova avaliação clicando em 'Reenviar Prescrição'."
    }
  ];
  
  // Tutoriais em vídeo
  const videoTutorials = [
    {
      id: 1,
      title: "Introdução ao Portal do Médico",
      duration: "3:45",
      thumbnail: "tutorial-intro.jpg",
      description: "Visão geral das principais funcionalidades do portal médico Endurancy."
    },
    {
      id: 2,
      title: "Gerenciando Pacientes",
      duration: "5:12",
      thumbnail: "tutorial-patients.jpg",
      description: "Como cadastrar, editar e gerenciar informações de pacientes."
    },
    {
      id: 3,
      title: "Criando Prescrições Eficientes",
      duration: "7:08",
      thumbnail: "tutorial-prescriptions.jpg",
      description: "Guia completo sobre como criar e gerenciar prescrições de cannabis medicinal."
    },
    {
      id: 4,
      title: "Utilizando o Calendário e Agenda",
      duration: "4:30",
      thumbnail: "tutorial-calendar.jpg",
      description: "Como maximizar a produtividade utilizando o sistema de agendamento."
    },
    {
      id: 5,
      title: "Gerenciando Múltiplas Afiliações",
      duration: "6:15",
      thumbnail: "tutorial-affiliations.jpg",
      description: "Como trabalhar eficientemente com múltiplas organizações no sistema."
    }
  ];
  
  // Documentação
  const documentation = [
    {
      id: 1,
      title: "Manual do Usuário - Portal Médico",
      type: "PDF",
      lastUpdated: "15/03/2025",
      description: "Guia completo com todas as funcionalidades do portal médico."
    },
    {
      id: 2,
      title: "Guia de Prescrições e Protocolos",
      type: "PDF",
      lastUpdated: "02/04/2025",
      description: "Diretrizes e melhores práticas para prescrição de cannabis medicinal."
    },
    {
      id: 3,
      title: "Regulamentações e Conformidade Legal",
      type: "PDF",
      lastUpdated: "10/03/2025",
      description: "Informações sobre regulamentações relacionadas à prescrição de cannabis medicinal."
    },
    {
      id: 4,
      title: "Integração com Sistemas Externos",
      type: "PDF",
      lastUpdated: "22/03/2025",
      description: "Como integrar o portal com outros sistemas de prontuário eletrônico."
    }
  ];
  
  // Filtra os FAQs com base na pesquisa
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filtra os vídeos tutoriais com base na pesquisa
  const filteredVideos = videoTutorials.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filtra a documentação com base na pesquisa
  const filteredDocs = documentation.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setContactForm(prev => ({
        ...prev,
        attachments: e.target.files
      }));
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setContactForm(prev => ({
      ...prev,
      category: value
    }));
  };
  
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!contactForm.subject.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o assunto da sua solicitação.",
        variant: "destructive"
      });
      return;
    }
    
    if (!contactForm.category) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione uma categoria para sua solicitação.",
        variant: "destructive"
      });
      return;
    }
    
    if (!contactForm.message.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva sua solicitação ou problema.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulação de envio do formulário de contato
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Solicitação enviada com sucesso",
        description: "Nossa equipe de suporte entrará em contato em breve.",
        duration: 5000,
      });
      
      // Resetar formulário
      setContactForm({
        subject: '',
        category: '',
        message: '',
        attachments: null as FileList | null
      });
      
      // Resetar o input de arquivo
      const fileInput = document.getElementById('attachments') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ajuda e Suporte</h1>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input 
          type="search" 
          placeholder="Pesquisar nas perguntas frequentes, tutoriais e documentação..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="faqs" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Perguntas Frequentes
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Play className="h-4 w-4" />
            Tutoriais em Vídeo
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentação
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Suporte Técnico
          </TabsTrigger>
        </TabsList>
        
        {/* Perguntas Frequentes */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>
                Respostas para as dúvidas mais comuns sobre o portal médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <HelpCircle className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500">Nenhuma pergunta encontrada com os termos pesquisados.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-4 text-sm text-gray-500">
              Não encontrou o que procurava? Entre em contato com nosso suporte na aba "Suporte Técnico".
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tutoriais em Vídeo */}
        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Tutoriais em Vídeo</CardTitle>
              <CardDescription>
                Aprenda a utilizar todas as funcionalidades do portal médico através de tutoriais em vídeo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video) => (
                    <Card key={video.id} className="overflow-hidden border">
                      <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
                        <Play className="h-10 w-10 text-primary/70" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-1">{video.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{video.description}</p>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{video.duration}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
                        <Button className="w-full" variant="outline" size="sm">
                          Assistir Tutorial
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                    <Play className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">Nenhum tutorial encontrado com os termos pesquisados.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documentação */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentação</CardTitle>
              <CardDescription>
                Manuais, guias e documentos de referência para o portal médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-100 text-red-700 p-2 rounded">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-gray-500 mb-1">{doc.description}</p>
                          <div className="flex items-center text-xs text-gray-400">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded mr-2">
                              {doc.type}
                            </span>
                            <span>Atualizado em {doc.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Book className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">Nenhum documento encontrado com os termos pesquisados.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Suporte Técnico */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contato e Suporte Técnico</CardTitle>
              <CardDescription>
                Entre em contato com nossa equipe de suporte para solucionar problemas ou enviar sugestões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto</Label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        placeholder="Descreva brevemente seu problema ou solicitação"
                        value={contactForm.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={contactForm.category} 
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Problema Técnico</SelectItem>
                          <SelectItem value="account">Conta e Acesso</SelectItem>
                          <SelectItem value="prescriptions">Prescrições</SelectItem>
                          <SelectItem value="patients">Gerenciamento de Pacientes</SelectItem>
                          <SelectItem value="affiliations">Afiliações</SelectItem>
                          <SelectItem value="payments">Pagamentos</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Detalhes</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        placeholder="Descreva detalhadamente seu problema ou solicitação"
                        rows={6}
                        value={contactForm.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="attachments">Anexos (opcional)</Label>
                      <Input 
                        id="attachments" 
                        type="file" 
                        onChange={handleFileChange}
                        multiple
                      />
                      <p className="text-xs text-gray-500">
                        Você pode anexar imagens ou documentos para ajudar a ilustrar seu problema. 
                        Tamanho máximo: 10MB por arquivo.
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                    </Button>
                  </form>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Suporte por Telefone
                    </h3>
                    <p className="text-sm mb-2">
                      Nossa equipe está disponível de segunda a sexta, das 8h às 18h.
                    </p>
                    <p className="font-medium">0800 123 4567</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email de Suporte
                    </h3>
                    <p className="text-sm mb-2">
                      Envie um email diretamente para nossa equipe.
                    </p>
                    <p className="font-medium">suporte@endurancy.com</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Horário de Atendimento
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>Segunda a Sexta: 8h às 18h</p>
                      <p>Sábado: 9h às 13h</p>
                      <p>Domingo e Feriados: Fechado</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-primary/5 mt-6">
                    <h4 className="font-medium mb-2">Tempo médio de resposta</h4>
                    <p className="text-sm">
                      Respondemos a maioria das solicitações em até 24 horas úteis. 
                      Problemas críticos são priorizados.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}