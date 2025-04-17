import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, FileText, Upload, Camera, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PatientLayout from '@/components/layout/PatientLayout';

const NovaPrescricaoPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prescricao, setPrescricao] = useState({
    medico: "",
    crm: "",
    estado: "",
    dataEmissao: "",
    observacoes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      
      toast({
        title: "Arquivo selecionado",
        description: `${e.target.files[0].name} (${(e.target.files[0].size / 1024).toFixed(2)} KB)`
      });
    }
  };

  const handlePrescricaoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPrescricao(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulação de envio de dados
    try {
      // Aqui seria feita a chamada real para a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Prescrição enviada com sucesso",
        description: "Sua prescrição foi enviada para análise. Você receberá uma notificação sobre o status.",
      });
      
      // Limpar formulário
      if (activeTab === "upload") {
        setSelectedFile(null);
      } else {
        setPrescricao({
          medico: "",
          crm: "",
          estado: "",
          dataEmissao: "",
          observacoes: ""
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar prescrição",
        description: "Houve um erro ao enviar sua prescrição. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PatientLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Nova Prescrição</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Prescrição Médica</CardTitle>
                <CardDescription>
                  Envie sua prescrição médica para poder comprar produtos controlados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Enviar documento</TabsTrigger>
                    <TabsTrigger value="manual">Preencher manualmente</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                          <div className="flex flex-col items-center justify-center space-y-2 mb-4">
                            {selectedFile ? (
                              <FileText className="h-16 w-16 text-green-500" />
                            ) : (
                              <Upload className="h-16 w-16 text-gray-500" />
                            )}
                            <p className="text-sm text-gray-500 text-center">
                              {selectedFile 
                                ? `Arquivo selecionado: ${selectedFile.name}`
                                : "Arraste e solte seu arquivo aqui ou clique para selecionar"}
                            </p>
                            <p className="text-xs text-gray-400">
                              Formatos aceitos: PDF, JPG, PNG. Tamanho máximo: 5MB
                            </p>
                          </div>
                          
                          <div className="mt-2">
                            <Label htmlFor="fileUpload" className="sr-only">
                              Escolher arquivo
                            </Label>
                            <Input
                              id="fileUpload"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('fileUpload')?.click()}
                              className="mx-auto"
                            >
                              <FileUp className="h-4 w-4 mr-2" />
                              Escolher arquivo
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-full">
                            <Label htmlFor="dataEmissao">Data de emissão</Label>
                            <Input
                              id="dataEmissao"
                              name="dataEmissao"
                              type="date"
                              required
                              value={prescricao.dataEmissao}
                              onChange={handlePrescricaoChange}
                            />
                          </div>
                          <div className="w-full">
                            <Label htmlFor="observacoes">Observações (opcional)</Label>
                            <Input
                              id="observacoes"
                              name="observacoes"
                              placeholder="Qualquer informação adicional relevante"
                              value={prescricao.observacoes}
                              onChange={handlePrescricaoChange}
                            />
                          </div>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={!selectedFile || isSubmitting}>
                          {isSubmitting ? "Enviando..." : "Enviar prescrição"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="manual">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="medico">Nome do médico</Label>
                            <Input
                              id="medico"
                              name="medico"
                              placeholder="Dr. Nome Completo"
                              required
                              value={prescricao.medico}
                              onChange={handlePrescricaoChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="crm">CRM</Label>
                            <Input
                              id="crm"
                              name="crm"
                              placeholder="12345"
                              required
                              value={prescricao.crm}
                              onChange={handlePrescricaoChange}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="estado">Estado do CRM</Label>
                            <Select name="estado" onValueChange={(value) => setPrescricao(prev => ({ ...prev, estado: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AC">Acre</SelectItem>
                                <SelectItem value="AL">Alagoas</SelectItem>
                                <SelectItem value="AP">Amapá</SelectItem>
                                <SelectItem value="AM">Amazonas</SelectItem>
                                <SelectItem value="BA">Bahia</SelectItem>
                                <SelectItem value="CE">Ceará</SelectItem>
                                <SelectItem value="DF">Distrito Federal</SelectItem>
                                <SelectItem value="ES">Espírito Santo</SelectItem>
                                <SelectItem value="GO">Goiás</SelectItem>
                                <SelectItem value="MA">Maranhão</SelectItem>
                                <SelectItem value="MT">Mato Grosso</SelectItem>
                                <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                <SelectItem value="MG">Minas Gerais</SelectItem>
                                <SelectItem value="PA">Pará</SelectItem>
                                <SelectItem value="PB">Paraíba</SelectItem>
                                <SelectItem value="PR">Paraná</SelectItem>
                                <SelectItem value="PE">Pernambuco</SelectItem>
                                <SelectItem value="PI">Piauí</SelectItem>
                                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                <SelectItem value="RO">Rondônia</SelectItem>
                                <SelectItem value="RR">Roraima</SelectItem>
                                <SelectItem value="SC">Santa Catarina</SelectItem>
                                <SelectItem value="SP">São Paulo</SelectItem>
                                <SelectItem value="SE">Sergipe</SelectItem>
                                <SelectItem value="TO">Tocantins</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="dataEmissao">Data de emissão</Label>
                            <Input
                              id="dataEmissao"
                              name="dataEmissao"
                              type="date"
                              required
                              value={prescricao.dataEmissao}
                              onChange={handlePrescricaoChange}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="observacoes">Detalhes da prescrição</Label>
                          <Textarea
                            id="observacoes"
                            name="observacoes"
                            placeholder="Inclua aqui os detalhes da sua prescrição médica, incluindo produtos, dosagem, posologia e outras instruções médicas."
                            rows={6}
                            required
                            value={prescricao.observacoes}
                            onChange={handlePrescricaoChange}
                          />
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Enviando..." : "Enviar prescrição"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações importantes</CardTitle>
                <CardDescription>Orientações para envio de prescrições</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Prescrições médicas são obrigatórias para compra de produtos controlados
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Requisitos da prescrição:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Emitida por médico registrado no CRM</li>
                    <li>Conter nome completo do paciente</li>
                    <li>Data de emissão recente (máximo 30 dias)</li>
                    <li>Identificação clara do produto receitado</li>
                    <li>CRM e assinatura do médico</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Tempo de validação:</h3>
                  <p className="text-sm">
                    Sua prescrição será validada pela nossa equipe farmacêutica em até 24 horas úteis.
                    Você receberá uma notificação assim que a análise for concluída.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Dúvidas frequentes:</h3>
                  <ul className="text-sm space-y-1">
                    <li><span className="font-medium">Minha prescrição foi rejeitada. O que fazer?</span> - Entre em contato com nosso suporte para orientações.</li>
                    <li><span className="font-medium">Posso usar a mesma prescrição para múltiplas compras?</span> - Sim, dentro do período de validade da prescrição.</li>
                    <li><span className="font-medium">Quais formatos de arquivo são aceitos?</span> - Aceitamos PDF, JPG e PNG, com tamanho máximo de 5MB.</li>
                  </ul>
                </div>
                
                <Button variant="outline" className="w-full">
                  Central de ajuda
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default NovaPrescricaoPage;