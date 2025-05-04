import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { CMarketHeader } from '@/components/supplier/CMarketHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Building2, 
  FileText, 
  DollarSign,
  Users,
  ShieldCheck,
  Download,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Dados de exemplo para um edital de compra
const announcementData = {
  id: 101,
  title: 'Compra de 2000 frascos de reagentes químicos',
  organization: 'Associação Médica Brasileira',
  published: '01/05/2025',
  deadline: '15/05/2025',
  closeTime: '18:00',
  budget: 'R$ 15.000,00',
  status: 'Aberto para propostas',
  description: `
    A Associação Médica Brasileira está abrindo um edital para a compra de 2000 frascos de reagentes químicos para uso em laboratórios de pesquisa médica.
    
    ## Especificações técnicas:
    
    - 1000 frascos de álcool etílico 95% - 500ml
    - 500 frascos de formaldeído 37% - 1L
    - 500 frascos de xilol - 1L
    
    Os produtos devem atender às normas de qualidade estabelecidas pela ANVISA e possuir registro no Ministério da Saúde quando aplicável.
    
    ## Prazo de entrega:
    
    Os produtos devem ser entregues em até 15 dias após a aprovação da proposta.
    
    ## Critérios de seleção:
    
    A seleção da proposta vencedora será feita com base no menor preço global, desde que atendidas todas as especificações técnicas.
    
    ## Documentação necessária:
    
    - Comprovante de regularidade fiscal
    - Certificado de boas práticas de fabricação
    - Ficha técnica dos produtos
    
    A entrega deve ser feita na sede da Associação Médica Brasileira, localizada na Rua Radialista Antônio Assunção, 1500, São Paulo/SP.
  `,
  attachments: [
    { name: 'Edital_completo.pdf', size: '1.2 MB' },
    { name: 'Modelo_de_proposta.docx', size: '250 KB' },
    { name: 'Ficha_técnica_exemplo.pdf', size: '500 KB' }
  ],
  proposals: [
    // Simulação - na implementação real, isto viria do backend
    { id: 1, supplier: 'Laboratório Industrial XYZ', date: '02/05/2025', status: 'Em análise' },
    { id: 2, supplier: 'Química Brasil LTDA', date: '03/05/2025', status: 'Em análise' },
  ]
};

// Componente principal
const AnnouncementDetailPage: React.FC = () => {
  const [, params] = useRoute('/supplier/cmarket/announcement/:id');
  const announcementId = params?.id;
  const { toast } = useToast();
  
  const [proposal, setProposal] = useState({
    price: '',
    deliveryTime: '',
    description: '',
    attachments: []
  });
  
  // Simular o envio da proposta
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    if (!proposal.price || !proposal.deliveryTime || !proposal.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios para enviar sua proposta.",
        variant: "destructive"
      });
      return;
    }
    
    // Simular envio
    toast({
      title: "Proposta enviada",
      description: "Sua proposta foi enviada com sucesso e está em análise.",
    });
    
    // Limpar formulário
    setProposal({
      price: '',
      deliveryTime: '',
      description: '',
      attachments: []
    });
  };
  
  // Simular o download de um arquivo
  const handleDownloadFile = (fileName: string) => {
    toast({
      title: "Download iniciado",
      description: `O arquivo ${fileName} será baixado em instantes.`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CMarketHeader />
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{announcementData.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            <span className="flex items-center">
              <Building2 className="h-4 w-4 mr-1" /> {announcementData.organization}
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Publicado: {announcementData.published}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Prazo: {announcementData.deadline} às {announcementData.closeTime}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Edital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p>{announcementData.description}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Documentos do Edital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {announcementData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-xs text-gray-500">{file.size}</div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownloadFile(file.name)}
                      >
                        <Download className="h-4 w-4 mr-1" /> Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Edital</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-blue-600">{announcementData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Orçamento:</span>
                  <span className="font-medium">{announcementData.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Prazo final:</span>
                  <span className="font-medium">{announcementData.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Propostas recebidas:</span>
                  <span className="font-medium">{announcementData.proposals.length}</span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" /> 
                    Apenas organizações cadastradas podem enviar propostas
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheck className="h-4 w-4 mr-1" /> 
                    Processo transparente e auditável
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  Enviar proposta
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Enviar Proposta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Valor da proposta (R$)*</Label>
                    <Input 
                      id="price" 
                      type="text"
                      placeholder="0,00" 
                      value={proposal.price}
                      onChange={(e) => setProposal({...proposal, price: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">Prazo de entrega (dias)*</Label>
                    <Input 
                      id="deliveryTime" 
                      type="number" 
                      placeholder="15" 
                      value={proposal.deliveryTime}
                      onChange={(e) => setProposal({...proposal, deliveryTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição da proposta*</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Descreva os detalhes da sua proposta..." 
                      rows={4}
                      value={proposal.description}
                      onChange={(e) => setProposal({...proposal, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file">Anexos (opcional)</Label>
                    <Input id="file" type="file" multiple />
                    <p className="text-xs text-gray-500">
                      Você pode anexar documentos como proposta detalhada, catálogos, certificações, etc.
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" /> Enviar Proposta
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Informações adicionais */}
        <div className="mt-8">
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">Sobre a Organização</TabsTrigger>
              <TabsTrigger value="history">Histórico de Editais</TabsTrigger>
              <TabsTrigger value="help">Ajuda</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-3">Associação Médica Brasileira</h3>
                  <p className="text-gray-700 mb-4">
                    A Associação Médica Brasileira é uma entidade sem fins lucrativos que atua na promoção da saúde 
                    e no desenvolvimento da medicina no Brasil. Fundada em 1951, a AMB possui mais de 10.000 membros 
                    associados e desenvolve diversos projetos de pesquisa médica.
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Organização verificada
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-3">Histórico de Editais</h3>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Compra de equipamentos para laboratório</h4>
                      <div className="text-sm text-gray-500 flex justify-between mt-1">
                        <span>Data: 10/03/2025</span>
                        <span className="text-green-600">Concluído</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Aquisição de material hospitalar</h4>
                      <div className="text-sm text-gray-500 flex justify-between mt-1">
                        <span>Data: 05/01/2025</span>
                        <span className="text-green-600">Concluído</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="help">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-3">Como participar de um edital</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Leia atentamente todas as especificações e requisitos do edital</li>
                    <li>Verifique se sua organização atende a todos os critérios técnicos</li>
                    <li>Prepare uma proposta detalhada, incluindo preços, prazos e especificações</li>
                    <li>Anexe todos os documentos solicitados</li>
                    <li>Envie sua proposta antes do prazo final</li>
                  </ol>
                  <p className="mt-4 text-sm text-gray-600">
                    Em caso de dúvidas, entre em contato com nossa equipe de suporte pelo email: suporte@cmarket.com.br
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Rodapé simples */}
      <footer className="bg-gray-100 border-t py-8 px-4 mt-12">
        <div className="container mx-auto text-center text-sm text-gray-500">
          &copy; 2025 CMarket. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default AnnouncementDetailPage;