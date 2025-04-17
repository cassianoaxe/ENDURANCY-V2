'use client';

import React, { useState } from 'react';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, Upload, Check, AlertCircle, Loader2, 
  Calendar, User, FileCheck, Stethoscope, Info, 
  HelpCircle, FileSymlink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const NovaPrescricaoPage: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    doctor: '',
    specialization: '',
    condition: '',
    notes: '',
    files: [] as File[],
    uploadProgress: 0,
    terms: false
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Dados simulados
  const doctors = [
    { id: 1, name: 'Dr. Antônio Silva', specialization: 'Neurologia' },
    { id: 2, name: 'Dra. Maria Oliveira', specialization: 'Clínica Médica' },
    { id: 3, name: 'Dr. João Santos', specialization: 'Psiquiatria' }
  ];
  
  const conditions = [
    'Dor crônica',
    'Ansiedade',
    'Insônia',
    'Epilepsia',
    'Esclerose Múltipla',
    'Doença de Parkinson',
    'Artrite',
    'Fibromialgia',
    'Síndrome do Intestino Irritável',
    'Alzheimer',
    'Outro (especificar nas observações)'
  ];
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Allow up to 3 files
      if (formData.files.length + e.target.files.length > 3) {
        toast({
          title: "Limite de arquivos excedido",
          description: "Você pode enviar no máximo 3 arquivos.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 5MB each)
      const files = Array.from(e.target.files);
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: "Arquivo(s) muito grande(s)",
          description: "Cada arquivo deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setFormData({
        ...formData,
        files: [...formData.files, ...files]
      });
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...formData.files];
    newFiles.splice(index, 1);
    setFormData({
      ...formData,
      files: newFiles
    });
  };
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const isStepComplete = () => {
    if (step === 1) {
      return formData.doctor && formData.specialization && formData.condition;
    } else if (step === 2) {
      return formData.files.length > 0;
    } else if (step === 3) {
      return formData.terms;
    }
    return false;
  };
  
  const nextStep = () => {
    if (isStepComplete()) {
      setStep(step + 1);
    } else {
      toast({
        title: "Formulário incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = () => {
    if (!formData.terms) {
      toast({
        title: "Termos não aceitos",
        description: "Você precisa aceitar os termos para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simular upload com progresso
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      
      setFormData(prev => ({
        ...prev,
        uploadProgress: progress
      }));
      
      if (progress >= 100) {
        clearInterval(interval);
        
        setTimeout(() => {
          setIsSubmitting(false);
          setSuccess(true);
          setFormData(prev => ({
            ...prev,
            uploadProgress: 0
          }));
          
          toast({
            title: "Prescrição enviada com sucesso",
            description: "Seu pedido foi recebido e será analisado por nossa equipe médica.",
          });
        }, 500);
      }
    }, 150);
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const navigateHome = () => {
    window.location.href = '/patient';
  };
  
  const navigateToPrescricoes = () => {
    window.location.href = '/patient/prescricoes';
  };
  
  return (
    <PatientLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Nova Prescrição</h1>
            <p className="text-gray-600 mt-2">
              Envie uma prescrição médica para avaliação e aprovação
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 space-x-2">
            <Button 
              variant="outline" 
              onClick={navigateToPrescricoes}
            >
              <FileSymlink className="mr-2 h-4 w-4" />
              Minhas Prescrições
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Como funciona
            </Button>
          </div>
        </div>
        
        {/* Passos do processo */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-center justify-between text-sm font-medium">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                </div>
                <span className="mt-1">Informações</span>
              </div>
              
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {step > 2 ? <Check className="h-5 w-5" /> : "2"}
                </div>
                <span className="mt-1">Documentos</span>
              </div>
              
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {step > 3 ? <Check className="h-5 w-5" /> : "3"}
                </div>
                <span className="mt-1">Revisão</span>
              </div>
              
              <div className={`flex flex-col items-center ${success ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${success ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {success ? <Check className="h-5 w-5" /> : "4"}
                </div>
                <span className="mt-1">Concluído</span>
              </div>
            </div>
            
            {/* Linha de progresso */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: success ? '100%' : `${Math.max(0, ((step - 1) / 3) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {success ? (
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto my-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Prescrição Enviada com Sucesso!</CardTitle>
              <CardDescription className="text-lg">
                Recebemos sua prescrição e ela está em análise
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 pt-4">
              <p className="text-gray-600">
                Nossa equipe médica irá analisar sua prescrição e documentação.
                Você receberá uma notificação sobre o resultado da análise em até 48 horas úteis.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4 text-left border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium flex items-center mb-2">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  Próximos passos
                </h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-2">
                  <li>Nossa equipe médica analisará sua prescrição</li>
                  <li>Você receberá uma notificação quando a análise for concluída</li>
                  <li>Após aprovação, você poderá realizar seus pedidos</li>
                  <li>Suas prescrições ficam disponíveis na seção "Minhas Prescrições"</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4 justify-center">
              <Button variant="outline" onClick={navigateHome}>
                Voltar ao Início
              </Button>
              <Button onClick={navigateToPrescricoes}>
                Minhas Prescrições
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              {step === 1 && (
                <>
                  <CardTitle>Informações Médicas</CardTitle>
                  <CardDescription>
                    Forneça detalhes sobre seu médico e condição médica
                  </CardDescription>
                </>
              )}
              
              {step === 2 && (
                <>
                  <CardTitle>Documentação</CardTitle>
                  <CardDescription>
                    Envie sua prescrição médica e documentos de suporte
                  </CardDescription>
                </>
              )}
              
              {step === 3 && (
                <>
                  <CardTitle>Revisão e Confirmação</CardTitle>
                  <CardDescription>
                    Revise suas informações e confirme o envio
                  </CardDescription>
                </>
              )}
            </CardHeader>
            
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Médico Prescritor *</Label>
                      <Select 
                        value={formData.doctor} 
                        onValueChange={(value) => {
                          const doctor = doctors.find(d => d.id.toString() === value);
                          handleInputChange('doctor', value);
                          if (doctor) {
                            handleInputChange('specialization', doctor.specialization);
                          }
                        }}
                      >
                        <SelectTrigger id="doctor">
                          <SelectValue placeholder="Selecione o médico" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Especialidade *</Label>
                      <Input 
                        id="specialization" 
                        value={formData.specialization} 
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        placeholder="Especialidade médica"
                        disabled={!!formData.doctor}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condição Médica *</Label>
                    <Select 
                      value={formData.condition} 
                      onValueChange={(value) => handleInputChange('condition', value)}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Selecione sua condição" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações Adicionais</Label>
                    <Textarea 
                      id="notes" 
                      value={formData.notes} 
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Compartilhe detalhes adicionais sobre seu histórico ou condição que possam ser relevantes"
                      rows={4}
                    />
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="prescription">Prescrição Médica *</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <div className="space-y-2">
                        <Upload className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="text-sm font-medium">
                          Arraste ou clique para enviar
                        </p>
                        <p className="text-xs text-gray-500">
                          Formatos aceitos: PDF, JPG, PNG (máx. 5MB por arquivo)
                        </p>
                        <Input 
                          id="prescription" 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          multiple
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('prescription')?.click()}
                          className="mt-2"
                        >
                          Selecionar Arquivos
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {formData.files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Arquivos Enviados</h4>
                      <div className="space-y-2">
                        {formData.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-500 mr-3" />
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px] md:max-w-[300px]">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-100 dark:border-amber-900 space-y-2">
                    <h4 className="font-medium flex items-center">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                      Documentos Necessários
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-7 list-disc">
                      <li>Prescrição médica assinada e datada (obrigatório)</li>
                      <li>Laudo ou relatório médico (recomendado)</li>
                      <li>Exames que comprovem sua condição (opcional)</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6">
                  <h4 className="font-medium text-lg">Resumo da Solicitação</h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Médico Prescritor</p>
                        <p className="font-medium">
                          {formData.doctor ? doctors.find(d => d.id.toString() === formData.doctor)?.name : ''}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Especialidade</p>
                        <p className="font-medium">{formData.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Condição Médica</p>
                      <p className="font-medium">{formData.condition}</p>
                    </div>
                    
                    {formData.notes && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Observações Adicionais</p>
                        <p className="text-sm">{formData.notes}</p>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Documentos Enviados</p>
                      <div className="space-y-1">
                        {formData.files.map((file, index) => (
                          <div key={index} className="flex items-center">
                            <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                            <p className="text-sm">{file.name} ({formatFileSize(file.size)})</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-4">
                    <div className="flex items-start space-x-3">
                      <input 
                        type="checkbox" 
                        id="terms" 
                        className="mt-1"
                        checked={formData.terms}
                        onChange={(e) => handleInputChange('terms', e.target.checked)}
                      />
                      <div>
                        <label htmlFor="terms" className="font-medium">
                          Termos e Condições *
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Declaro que as informações fornecidas são verdadeiras e estou ciente de que o envio de documentos falsos ou adulterados constitui crime. Autorizo a validação da prescrição junto ao médico, se necessário, e consinto com o armazenamento e processamento dos meus dados médicos conforme a política de privacidade.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={navigateHome}
                >
                  Cancelar
                </Button>
              )}
              
              {step < 3 ? (
                <Button 
                  onClick={nextStep}
                  disabled={!isStepComplete()}
                >
                  Continuar
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.terms}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando... {formData.uploadProgress}%
                    </>
                  ) : (
                    'Enviar Prescrição'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
        
        {/* Card de informações adicionais */}
        {!success && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FileCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Documentação</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sua prescrição deve ser legível, atual (emitida nos últimos 6 meses) e incluir informações completas 
                      sobre a posologia e o CRM do médico.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Prazo de Análise</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sua prescrição será analisada em até 2 dias úteis. Você receberá uma notificação assim que a 
                      análise for concluída.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Privacidade</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Seus dados médicos são tratados com o mais alto nível de confidencialidade, seguindo
                      rigorosos protocolos de segurança e conformidade com a LGPD.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Stethoscope className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Consulta Médica</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Não oferecemos prescrições médicas. Se você não possui uma, recomendamos agendar uma consulta 
                      com um médico especializado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Modal de informações sobre o processo */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Como Funciona o Processo de Prescrição</DialogTitle>
            <DialogDescription>
              Entenda como funciona o processo de envio e aprovação de prescrições
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Envio da Prescrição</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Preencha o formulário com as informações do seu médico e condição médica, e envie a prescrição 
                      juntamente com qualquer documentação de suporte.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Análise Médica</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nossa equipe médica especializada analisa sua prescrição, verificando sua autenticidade, validade 
                      e adequação ao tratamento.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Aprovação</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Se aprovada, sua prescrição ficará disponível para uso e você poderá realizar pedidos de produtos 
                      com base nela.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Pedidos e Renovação</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Você pode realizar pedidos enquanto sua prescrição estiver válida. Recomendamos renovar sua prescrição 
                      um mês antes do vencimento.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 border-l border-gray-200 dark:border-gray-700 pl-8">
                <h3 className="font-medium text-lg">Dúvidas Frequentes</h3>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Quanto tempo leva para analisar minha prescrição?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Em geral, a análise é concluída em até 2 dias úteis.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Quais documentos são necessários?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    É obrigatória a prescrição médica com CRM, assinatura, data e posologia. Laudos e exames 
                    complementares ajudam na análise.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Minha prescrição foi recusada, o que fazer?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Você receberá instruções específicas sobre o motivo da recusa e como proceder. 
                    Normalmente, é necessário obter uma nova prescrição com as informações corretas.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Por quanto tempo minha prescrição é válida?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    As prescrições têm validade de 6 meses a partir da data de aprovação no sistema.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Posso alterar minha dosagem depois de aprovada?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Não. Qualquer alteração na dosagem requer uma nova prescrição médica.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PatientLayout>
  );
};

export default NovaPrescricaoPage;