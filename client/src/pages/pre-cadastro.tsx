import React, { useState } from 'react';
import { ArrowLeft, Calendar, Check, Send, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const PreCadastroPage = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    nome: '',
    email: '',
    telefone: '',
    organizacao: '',
    cargo: '',
    tipoOrganizacao: '',
    modulos: {
      // Módulos Administrativos
      admin: false,
      usuarios: false,
      tickets: false,
      
      // Módulos Financeiros
      financeiro: false,
      complypay: false,
      
      // Módulos de Pesquisa e Laboratório
      laboratorio: false,
      hplc: false,
      pesquisa: false,
      
      // Módulos de Produção e Estoque
      cultivo: false,
      producao: false,
      estoque: false,
      
      // Módulos Médicos e de Atendimento
      medico: false,
      farmacia: false,
      paciente: false,
      
      // Módulos de Gestão Organizacional
      patrimonio: false,
      transparencia: false,
      social: false,
      juridico: false,
      rh: false,
      tarefas: false,
      
      // Módulos de Comunicação e Marketing
      comunicacao: false,
      carteirinha: false,
      
      // Módulos para Fornecedores e Importações
      fornecedor: false,
      importacao: false,
      expedicao: false,
      
      // Módulos de Inteligência Artificial
      ia: false,
      mcp: false,
      
      // Módulos Regulatórios
      regulatorio: false
    },
    comentarios: '',
    aceitaTermos: false,
    interesse: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (field: string, checked: boolean) => {
    if (field.startsWith('modulos.')) {
      const moduleKey = field.split('.')[1];
      setFormState(prev => ({
        ...prev,
        modulos: {
          ...prev.modulos,
          [moduleKey]: checked
        }
      }));
    } else {
      setFormState(prev => ({ ...prev, [field]: checked }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.aceitaTermos) {
      toast({
        title: "Termos não aceitos",
        description: "Por favor, aceite os termos para continuar.",
        variant: "destructive" as const
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Enviar os dados para a API de pré-cadastro
      const response = await fetch('/api/pre-cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState)
      });
      
      if (response.ok) {
        toast({
          title: "Pré-cadastro recebido!",
          description: "Agradecemos seu interesse! Redirecionando para a página de confirmação...",
          duration: 3000,
        });
        
        // Redirecionar para a página de sucesso após 1,5 segundos
        setTimeout(() => {
          window.location.href = "/pre-cadastro-sucesso";
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao processar o pré-cadastro');
      }
      
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema ao processar seu pré-cadastro. Por favor, tente novamente.",
        variant: "destructive" as const
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2"
              onClick={() => window.location.href = "/"}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Voltar
            </Button>
          </div>
          <div className="flex items-center">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="ml-2 text-xl font-bold text-green-800">Endurancy</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 bg-green-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Pré-cadastro para o Beta do Endurancy
          </h1>
          <p className="text-lg text-green-100 max-w-3xl mx-auto mb-4">
            Seja um dos primeiros a testar a plataforma mais completa para gestão no setor medicinal cannabidiol. O programa beta será lançado em 30 de julho de 2025.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-full">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="font-medium">Lançamento oficial na Expocannabis 2025</span>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-green-800 mb-8">Formulário de Pré-cadastro</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados pessoais */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-700">Dados Pessoais</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input 
                      id="nome" 
                      name="nome" 
                      value={formState.nome} 
                      onChange={handleChange} 
                      required 
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formState.email} 
                      onChange={handleChange} 
                      required 
                      placeholder="seu.email@exemplo.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      name="telefone" 
                      value={formState.telefone} 
                      onChange={handleChange} 
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input 
                      id="cargo" 
                      name="cargo" 
                      value={formState.cargo} 
                      onChange={handleChange} 
                      placeholder="Seu cargo na organização"
                    />
                  </div>
                </div>
              </div>
              
              {/* Dados da organização */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-green-700">Dados da Organização</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="organizacao">Nome da organização *</Label>
                    <Input 
                      id="organizacao" 
                      name="organizacao" 
                      value={formState.organizacao} 
                      onChange={handleChange} 
                      required 
                      placeholder="Nome da sua organização"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipoOrganizacao">Tipo de organização *</Label>
                    <Select 
                      value={formState.tipoOrganizacao} 
                      onValueChange={(value) => handleSelectChange('tipoOrganizacao', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="associacao">Associação de pacientes</SelectItem>
                        <SelectItem value="farmacia">Farmácia magistral</SelectItem>
                        <SelectItem value="clinica">Clínica médica</SelectItem>
                        <SelectItem value="laboratorio">Laboratório</SelectItem>
                        <SelectItem value="importadora">Importadora</SelectItem>
                        <SelectItem value="cultivador">Cultivador autorizado</SelectItem>
                        <SelectItem value="pesquisa">Instituição de pesquisa</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Interesses */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-green-700">Interesses</h3>
                
                <div className="space-y-3">
                  <Label>Qual seu principal interesse na plataforma? *</Label>
                  <RadioGroup 
                    value={formState.interesse}
                    onValueChange={(value) => handleSelectChange('interesse', value)}
                    className="flex flex-col space-y-2"
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teste" id="interesse-teste" />
                      <Label htmlFor="interesse-teste" className="font-normal">Testar a plataforma durante o período beta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compra" id="interesse-compra" />
                      <Label htmlFor="interesse-compra" className="font-normal">Adquirir a plataforma após o lançamento</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="parceria" id="interesse-parceria" />
                      <Label htmlFor="interesse-parceria" className="font-normal">Estabelecer parceria</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conhecer" id="interesse-conhecer" />
                      <Label htmlFor="interesse-conhecer" className="font-normal">Apenas conhecer mais sobre o sistema</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-6 mt-6">
                  <Label className="text-base font-semibold text-green-700">Módulos de interesse (selecione todos que se aplicam)</Label>
                  
                  {/* Nota: Módulos Administrativos removidos pois são operacionais, não contratáveis */}
                  
                  {/* Módulos Financeiros */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos Financeiros</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-financeiro" 
                          checked={formState.modulos.financeiro}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.financeiro', !!checked)}
                        />
                        <Label htmlFor="modulo-financeiro" className="font-normal">Gestão Financeira</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-complypay" 
                          checked={formState.modulos.complypay}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.complypay', !!checked)}
                        />
                        <Label htmlFor="modulo-complypay" className="font-normal">ComplyPay</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Módulos de Pesquisa e Laboratório */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos de Pesquisa e Laboratório</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-laboratorio" 
                          checked={formState.modulos.laboratorio}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.laboratorio', !!checked)}
                        />
                        <Label htmlFor="modulo-laboratorio" className="font-normal">Gestão de Laboratório</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-hplc" 
                          checked={formState.modulos.hplc}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.hplc', !!checked)}
                        />
                        <Label htmlFor="modulo-hplc" className="font-normal">HPLC</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-pesquisa" 
                          checked={formState.modulos.pesquisa}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.pesquisa', !!checked)}
                        />
                        <Label htmlFor="modulo-pesquisa" className="font-normal">Pesquisa Científica</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Módulos de Produção e Estoque */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos de Produção e Estoque</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-cultivo" 
                          checked={formState.modulos.cultivo}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.cultivo', !!checked)}
                        />
                        <Label htmlFor="modulo-cultivo" className="font-normal">Cultivo</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-producao" 
                          checked={formState.modulos.producao}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.producao', !!checked)}
                        />
                        <Label htmlFor="modulo-producao" className="font-normal">Produção Industrial</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-estoque" 
                          checked={formState.modulos.estoque}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.estoque', !!checked)}
                        />
                        <Label htmlFor="modulo-estoque" className="font-normal">Estoque</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Módulos Médicos e de Atendimento */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos Médicos e de Atendimento</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-medico" 
                          checked={formState.modulos.medico}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.medico', !!checked)}
                        />
                        <Label htmlFor="modulo-medico" className="font-normal">Módulo Médico</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-farmacia" 
                          checked={formState.modulos.farmacia}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.farmacia', !!checked)}
                        />
                        <Label htmlFor="modulo-farmacia" className="font-normal">Farmácia</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-paciente" 
                          checked={formState.modulos.paciente}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.paciente', !!checked)}
                        />
                        <Label htmlFor="modulo-paciente" className="font-normal">Portal do Paciente</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Módulos de Gestão Organizacional */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos de Gestão Organizacional</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-patrimonio" 
                          checked={formState.modulos.patrimonio}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.patrimonio', !!checked)}
                        />
                        <Label htmlFor="modulo-patrimonio" className="font-normal">Patrimônio</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-transparencia" 
                          checked={formState.modulos.transparencia}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.transparencia', !!checked)}
                        />
                        <Label htmlFor="modulo-transparencia" className="font-normal">Transparência</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-social" 
                          checked={formState.modulos.social}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.social', !!checked)}
                        />
                        <Label htmlFor="modulo-social" className="font-normal">Social</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-juridico" 
                          checked={formState.modulos.juridico}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.juridico', !!checked)}
                        />
                        <Label htmlFor="modulo-juridico" className="font-normal">Jurídico</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-rh" 
                          checked={formState.modulos.rh}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.rh', !!checked)}
                        />
                        <Label htmlFor="modulo-rh" className="font-normal">Recursos Humanos</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-tarefas" 
                          checked={formState.modulos.tarefas}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.tarefas', !!checked)}
                        />
                        <Label htmlFor="modulo-tarefas" className="font-normal">Tarefas e Projetos</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Módulos de Comunicação e Marketing */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos de Comunicação e Marketing</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-comunicacao" 
                          checked={formState.modulos.comunicacao}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.comunicacao', !!checked)}
                        />
                        <Label htmlFor="modulo-comunicacao" className="font-normal">Comunicação</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-carteirinha" 
                          checked={formState.modulos.carteirinha}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.carteirinha', !!checked)}
                        />
                        <Label htmlFor="modulo-carteirinha" className="font-normal">Carteirinha de Membro</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Módulos para Fornecedores e Importações */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos para Fornecedores e Importações</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-fornecedor" 
                          checked={formState.modulos.fornecedor}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.fornecedor', !!checked)}
                        />
                        <Label htmlFor="modulo-fornecedor" className="font-normal">Portal do Fornecedor</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-importacao" 
                          checked={formState.modulos.importacao}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.importacao', !!checked)}
                        />
                        <Label htmlFor="modulo-importacao" className="font-normal">Importação</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-expedicao" 
                          checked={formState.modulos.expedicao}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.expedicao', !!checked)}
                        />
                        <Label htmlFor="modulo-expedicao" className="font-normal">Expedição</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Módulos de Inteligência Artificial */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos de Inteligência Artificial</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-ia" 
                          checked={formState.modulos.ia}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.ia', !!checked)}
                        />
                        <Label htmlFor="modulo-ia" className="font-normal">Inteligência Artificial</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-mcp" 
                          checked={formState.modulos.mcp}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.mcp', !!checked)}
                        />
                        <Label htmlFor="modulo-mcp" className="font-normal">Multi-Context Processing</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Módulos Regulatórios */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Módulos Regulatórios</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="modulo-regulatorio" 
                          checked={formState.modulos.regulatorio}
                          onCheckedChange={(checked) => handleCheckboxChange('modulos.regulatorio', !!checked)}
                        />
                        <Label htmlFor="modulo-regulatorio" className="font-normal">Conformidade Regulatória</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="comentarios">Comentários ou dúvidas adicionais</Label>
                  <Textarea 
                    id="comentarios" 
                    name="comentarios" 
                    value={formState.comentarios} 
                    onChange={handleChange} 
                    placeholder="Compartilhe outras informações ou perguntas sobre o sistema"
                    className="h-28"
                  />
                </div>
              </div>
              
              {/* Termos */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="termos" 
                    checked={formState.aceitaTermos}
                    onCheckedChange={(checked) => handleCheckboxChange('aceitaTermos', !!checked)}
                    required
                  />
                  <label
                    htmlFor="termos"
                    className="text-sm text-gray-600 leading-relaxed"
                  >
                    Concordo em receber informações sobre o lançamento do Endurancy e entendo que meus dados serão usados apenas para comunicações relacionadas ao programa beta, de acordo com a política de privacidade.
                  </label>
                </div>
              </div>
              
              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    <span>Enviar pré-cadastro</span>
                  </div>
                )}
              </Button>
              
              <p className="text-center text-sm text-gray-500">
                * Campos obrigatórios
              </p>
            </form>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-green-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-green-800 text-center mb-12">
            Benefícios do Programa Beta
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Acesso Antecipado</h3>
              <p className="text-gray-600">
                Seja um dos primeiros a explorar e utilizar a plataforma Endurancy antes do lançamento oficial.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Desconto Especial</h3>
              <p className="text-gray-600">
                Participantes do programa beta terão condições especiais e descontos exclusivos após o lançamento oficial.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Suporte Prioritário</h3>
              <p className="text-gray-600">
                Receba suporte técnico dedicado e tenha influência direta no desenvolvimento e melhorias do sistema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-green-100 py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-5 w-5 text-green-300" />
            <span className="ml-2 font-bold text-white">Endurancy</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-white/20 text-white rounded">Beta</span>
          </div>
          <p className="text-sm text-green-300">
            &copy; {new Date().getFullYear()} Endurancy. Todos os direitos reservados.
          </p>
          <p className="text-sm text-green-400 mt-2">
            <a href="/" className="hover:text-white">Voltar para a página inicial</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PreCadastroPage;