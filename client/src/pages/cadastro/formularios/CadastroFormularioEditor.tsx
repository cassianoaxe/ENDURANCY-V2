import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Save, Eye, List, FormInput, AlignLeft, Check, CalendarDays, 
  ListChecks, FileText, File, Upload, Trash2, GripVertical, Plus, Settings2
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

// Componente para editor de formulários
export default function CadastroFormularioEditor() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("campos");
  const [formName, setFormName] = useState("Novo Formulário");
  const [formDescription, setFormDescription] = useState("Descrição do formulário");
  const [formCategory, setFormCategory] = useState("cadastro");
  const [formFields, setFormFields] = useState([
    {
      id: "campo-1",
      label: "Nome completo",
      type: "text",
      placeholder: "Digite seu nome completo",
      required: true,
      helpText: "Digite seu nome completo conforme documento oficial",
      validation: "",
      options: [],
    },
    {
      id: "campo-2",
      label: "E-mail",
      type: "email",
      placeholder: "seuemail@exemplo.com",
      required: true,
      helpText: "Este será seu e-mail de acesso ao sistema",
      validation: "email",
      options: [],
    },
    {
      id: "campo-3",
      label: "Tipo de Organização",
      type: "select",
      placeholder: "Selecione uma opção",
      required: true,
      helpText: "Selecione o tipo que melhor descreve sua organização",
      validation: "",
      options: ["Associação", "Clínica", "Farmácia", "Laboratório", "Outro"],
    }
  ]);

  const [isPublic, setIsPublic] = useState(false);
  const [useTerms, setUseTerms] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [termsText, setTermsText] = useState("Ao enviar este formulário, concordo com os termos de uso e políticas de privacidade da plataforma.");

  // Função para voltar para a listagem
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Adicionar novo campo ao formulário
  const addField = (type: string) => {
    const newField = {
      id: `campo-${formFields.length + 1}`,
      label: `Novo Campo ${formFields.length + 1}`,
      type,
      placeholder: type === "select" || type === "checkbox" ? "" : "Digite aqui",
      required: false,
      helpText: "",
      validation: "",
      options: type === "select" || type === "checkbox" ? ["Opção 1", "Opção 2"] : [],
    };
    
    setFormFields([...formFields, newField]);

    toast({
      title: "Campo adicionado",
      description: `Campo do tipo ${type} adicionado ao formulário.`,
    });
  };

  // Remover campo do formulário
  const removeField = (id: string) => {
    setFormFields(formFields.filter(field => field.id !== id));
    
    toast({
      title: "Campo removido",
      description: "Campo removido do formulário.",
      variant: "destructive",
    });
  };

  // Atualizar um campo específico
  const updateField = (id: string, field: string, value: any) => {
    setFormFields(formFields.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Reordenar campos
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFormFields(items);
  };

  // Salvar formulário
  const saveForm = () => {
    // Aqui você implementaria a lógica para salvar no backend
    
    toast({
      title: "Formulário salvo!",
      description: "Formulário salvo com sucesso.",
    });
  };

  // Gerar tipo de campo baseado no tipo
  const renderFieldEditor = (field: any, index: number) => {
    return (
      <Draggable key={field.id} draggableId={field.id} index={index}>
        {(provided) => (
          <div 
            className="mb-4 border rounded-md p-4 bg-card"
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="cursor-move p-1.5 hover:bg-muted rounded-md"
                  {...provided.dragHandleProps}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <span className="font-medium">{field.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">({field.type})</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeField(field.id)}
                title="Remover campo"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`label-${field.id}`}>Rótulo</Label>
                <Input 
                  id={`label-${field.id}`}
                  value={field.label}
                  onChange={(e) => updateField(field.id, "label", e.target.value)}
                />
              </div>
              
              {(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'date') && (
                <div>
                  <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                  <Input 
                    id={`placeholder-${field.id}`}
                    value={field.placeholder}
                    onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                  />
                </div>
              )}
              
              {field.type === 'select' && (
                <div>
                  <Label htmlFor={`options-${field.id}`}>Opções (separadas por vírgula)</Label>
                  <Input 
                    id={`options-${field.id}`}
                    value={field.options.join(',')}
                    onChange={(e) => updateField(field.id, "options", e.target.value.split(',').map(item => item.trim()))}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor={`help-${field.id}`}>Texto de ajuda</Label>
                <Input 
                  id={`help-${field.id}`}
                  value={field.helpText}
                  onChange={(e) => updateField(field.id, "helpText", e.target.value)}
                />
              </div>
              
              <div className="flex items-center h-full mt-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`required-${field.id}`}
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(field.id, "required", checked)}
                  />
                  <Label htmlFor={`required-${field.id}`}>Obrigatório</Label>
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="mr-4"
            onClick={() => navigate('/cadastro/formularios')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-1">{formName || "Editor de Formulário"}</h1>
            <p className="text-muted-foreground">{formDescription || "Configure os detalhes do seu formulário"}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Eye className="h-4 w-4" /> Visualizar
          </Button>
          <Button onClick={saveForm} className="gap-1">
            <Save className="h-4 w-4" /> Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* Configurações do formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Formulário</CardTitle>
              <CardDescription>Informações básicas e configurações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="form-name">Nome do formulário</Label>
                <Input 
                  id="form-name" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="form-description">Descrição</Label>
                <Textarea 
                  id="form-description" 
                  value={formDescription} 
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="form-category">Categoria</Label>
                <Select 
                  value={formCategory} 
                  onValueChange={setFormCategory}
                >
                  <SelectTrigger id="form-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cadastro">Cadastro</SelectItem>
                    <SelectItem value="pesquisa">Pesquisa</SelectItem>
                    <SelectItem value="avaliacao">Avaliação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is-public" className="cursor-pointer">Formulário público</Label>
                  <p className="text-xs text-muted-foreground">
                    Disponível para preenchimento sem login
                  </p>
                </div>
                <Switch 
                  id="is-public" 
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="use-terms" className="cursor-pointer">Incluir termos de uso</Label>
                  <p className="text-xs text-muted-foreground">
                    Exibir e requerer aceitação de termos
                  </p>
                </div>
                <Switch 
                  id="use-terms" 
                  checked={useTerms}
                  onCheckedChange={setUseTerms}
                />
              </div>
              
              {useTerms && (
                <div>
                  <Label htmlFor="terms-text">Texto dos termos</Label>
                  <Textarea 
                    id="terms-text" 
                    value={termsText} 
                    onChange={(e) => setTermsText(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-approval" className="cursor-pointer">Requer aprovação</Label>
                  <p className="text-xs text-muted-foreground">
                    Envios ficam pendentes até aprovação
                  </p>
                </div>
                <Switch 
                  id="require-approval" 
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Adicionar campos */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Campos</CardTitle>
              <CardDescription>Selecione o tipo de campo para adicionar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start" onClick={() => addField('text')}>
                  <FormInput className="h-4 w-4 mr-2" /> Texto
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => addField('number')}>
                  <FormInput className="h-4 w-4 mr-2" /> Número
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => addField('email')}>
                  <FormInput className="h-4 w-4 mr-2" /> Email
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => addField('date')}>
                  <CalendarDays className="h-4 w-4 mr-2" /> Data
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => addField('select')}>
                  <List className="h-4 w-4 mr-2" /> Seleção
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => addField('checkbox')}>
                  <Check className="h-4 w-4 mr-2" /> Checkbox
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => addField('textarea')}>
                  <AlignLeft className="h-4 w-4 mr-2" /> Área de texto
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => addField('file')}>
                  <Upload className="h-4 w-4 mr-2" /> Arquivo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-12 md:col-span-8">
          <Card>
            <CardHeader className="border-b">
              <Tabs defaultValue="campos" onValueChange={setCurrentTab}>
                <TabsList>
                  <TabsTrigger value="campos" className="gap-1.5">
                    <ListChecks className="h-4 w-4" /> Campos
                  </TabsTrigger>
                  <TabsTrigger value="configuracoes" className="gap-1.5">
                    <Settings2 className="h-4 w-4" /> Configurações Avançadas
                  </TabsTrigger>
                  <TabsTrigger value="emails" className="gap-1.5">
                    <FileText className="h-4 w-4" /> Notificações
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="pt-6">
              <TabsContent value="campos" className="m-0">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="campos">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {formFields.map((field, index) => renderFieldEditor(field, index))}
                        {provided.placeholder}
                        
                        {formFields.length === 0 && (
                          <div className="text-center p-8 border border-dashed rounded-md">
                            <File className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Nenhum campo adicionado</h3>
                            <p className="text-muted-foreground mb-4">
                              Adicione campos ao seu formulário usando o painel lateral.
                            </p>
                            <Button onClick={() => addField('text')} className="gap-1">
                              <Plus className="h-4 w-4" /> Adicionar Campo
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TabsContent>
              
              <TabsContent value="configuracoes" className="m-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Configurações Avançadas</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="form-success-message">Mensagem de sucesso</Label>
                      <Textarea 
                        id="form-success-message" 
                        placeholder="Formulário enviado com sucesso! Obrigado por seu cadastro."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Esta mensagem será exibida após o envio bem-sucedido do formulário.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="redirect-url">URL de redirecionamento</Label>
                      <Input 
                        id="redirect-url" 
                        placeholder="https://exemplo.com/sucesso"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Opcionalmente, redirecione o usuário para outra página após o envio.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enable-captcha" className="cursor-pointer">Ativar CAPTCHA</Label>
                        <p className="text-xs text-muted-foreground">
                          Ajuda a prevenir envios automatizados
                        </p>
                      </div>
                      <Switch id="enable-captcha" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="store-ip" className="cursor-pointer">Armazenar IP do remetente</Label>
                        <p className="text-xs text-muted-foreground">
                          Armazena o endereço IP de quem preencheu o formulário
                        </p>
                      </div>
                      <Switch id="store-ip" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="limit-submissions" className="cursor-pointer">Limitar envios</Label>
                        <p className="text-xs text-muted-foreground">
                          Limite máximo de envios por IP
                        </p>
                      </div>
                      <Switch id="limit-submissions" />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="emails" className="m-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Configurações de E-mail</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-admin" className="cursor-pointer">Notificar administradores</Label>
                        <p className="text-xs text-muted-foreground">
                          Enviar e-mail para administradores a cada novo envio
                        </p>
                      </div>
                      <Switch id="email-admin" defaultChecked />
                    </div>
                    
                    <div>
                      <Label htmlFor="admin-emails">E-mails dos administradores</Label>
                      <Input 
                        id="admin-emails" 
                        placeholder="admin@exemplo.com, gerente@exemplo.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separe múltiplos e-mails com vírgula
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-confirmation" className="cursor-pointer">E-mail de confirmação</Label>
                        <p className="text-xs text-muted-foreground">
                          Enviar e-mail de confirmação para quem preencheu o formulário
                        </p>
                      </div>
                      <Switch id="email-confirmation" defaultChecked />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmation-subject">Assunto do e-mail de confirmação</Label>
                      <Input 
                        id="confirmation-subject" 
                        placeholder="Recebemos seu cadastro!"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmation-body">Corpo do e-mail de confirmação</Label>
                      <Textarea 
                        id="confirmation-body" 
                        placeholder="Olá, {{nome}}! Recebemos seu cadastro com sucesso. Em breve entraremos em contato."
                        rows={5}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use {{campo}} para incluir valores do formulário
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="border-t p-4 flex justify-end">
              <Button onClick={saveForm} className="gap-1.5">
                <Save className="h-4 w-4" /> Salvar Formulário
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}