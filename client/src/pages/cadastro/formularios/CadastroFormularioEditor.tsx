import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Save,
  ArrowLeft,
  Trash2,
  GripVertical,
  Plus,
  Settings,
  Eye,
  Undo2,
  Type,
  AlignLeft,
  CheckSquare,
  ListFilter,
  Image,
  FileUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Hash,
  CircleSlash,
  Redo2,
  MoveHorizontal,
  CreditCard,
  Copy,
} from "lucide-react";

// Tipos para os componentes do formulário
type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'image'
  | 'address'
  | 'cpf'
  | 'cnpj'
  | 'creditCard'
  | 'title'
  | 'divider'
  | 'spacer';

interface FormFieldBase {
  id: string;
  type: FieldType;
  required: boolean;
  visible: boolean;
  order: number;
}

interface TextField extends FormFieldBase {
  type: 'text';
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface TextareaField extends FormFieldBase {
  type: 'textarea';
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  rows?: number;
}

interface NumberField extends FormFieldBase {
  type: 'number';
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

interface EmailField extends FormFieldBase {
  type: 'email';
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
}

interface PhoneField extends FormFieldBase {
  type: 'phone';
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  mask?: string;
}

interface SelectField extends FormFieldBase {
  type: 'select';
  label: string;
  placeholder?: string;
  helpText?: string;
  options: {value: string, label: string}[];
  defaultValue?: string;
  multiple?: boolean;
}

interface CheckboxField extends FormFieldBase {
  type: 'checkbox';
  label: string;
  helpText?: string;
  options: {value: string, label: string}[];
  defaultValues?: string[];
}

interface RadioField extends FormFieldBase {
  type: 'radio';
  label: string;
  helpText?: string;
  options: {value: string, label: string}[];
  defaultValue?: string;
}

interface DateField extends FormFieldBase {
  type: 'date';
  label: string;
  helpText?: string;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
}

interface FileField extends FormFieldBase {
  type: 'file';
  label: string;
  helpText?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // em bytes
}

interface ImageField extends FormFieldBase {
  type: 'image';
  label: string;
  helpText?: string;
  maxSize?: number; // em bytes
  width?: number;
  height?: number;
  aspectRatio?: number;
}

interface AddressField extends FormFieldBase {
  type: 'address';
  label: string;
  helpText?: string;
  requireCep?: boolean;
  autoComplete?: boolean;
}

interface CPFField extends FormFieldBase {
  type: 'cpf';
  label: string;
  placeholder?: string;
  helpText?: string;
  validateOnBlur?: boolean;
}

interface CNPJField extends FormFieldBase {
  type: 'cnpj';
  label: string;
  placeholder?: string;
  helpText?: string;
  validateOnBlur?: boolean;
}

interface CreditCardField extends FormFieldBase {
  type: 'creditCard';
  label: string;
  helpText?: string;
}

interface TitleField extends FormFieldBase {
  type: 'title';
  content: string;
  size: 'large' | 'medium' | 'small';
}

interface DividerField extends FormFieldBase {
  type: 'divider';
  label?: string;
}

interface SpacerField extends FormFieldBase {
  type: 'spacer';
  height: number;
}

type FormField = 
  | TextField 
  | TextareaField 
  | NumberField 
  | EmailField 
  | PhoneField
  | SelectField 
  | CheckboxField 
  | RadioField 
  | DateField 
  | FileField 
  | ImageField
  | AddressField
  | CPFField
  | CNPJField
  | CreditCardField
  | TitleField
  | DividerField
  | SpacerField;

interface FormData {
  id?: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  fields: FormField[];
}

interface FormEditorProps {
  id?: number;
}

export default function CadastroFormularioEditor({ id }: FormEditorProps) {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [formHistory, setFormHistory] = useState<FormData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  // Estado do formulário inicial
  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    category: 'associacao',
    status: 'draft',
    fields: []
  });

  useEffect(() => {
    if (id) {
      // Mock: Carregar dados do formulário (substituir por chamada API real)
      if (id === 1) {
        const formData: FormData = {
          id: 1,
          name: "Cadastro de Associações",
          description: "Formulário padrão para cadastro de associações",
          category: "associacao",
          status: 'active',
          fields: [
            {
              id: "field_1",
              type: "title",
              content: "Dados Gerais da Associação",
              size: "large",
              required: false,
              visible: true,
              order: 0
            },
            {
              id: "field_2",
              type: "text",
              label: "Nome da Associação",
              placeholder: "Digite o nome completo da associação",
              helpText: "Nome oficial que aparece no CNPJ",
              required: true,
              visible: true,
              order: 1
            },
            {
              id: "field_3",
              type: "cnpj",
              label: "CNPJ",
              placeholder: "00.000.000/0000-00",
              helpText: "CNPJ válido e ativo",
              required: true,
              visible: true,
              validateOnBlur: true,
              order: 2
            },
            {
              id: "field_4",
              type: "email",
              label: "E-mail para contato",
              placeholder: "contato@associacao.org",
              helpText: "Este e-mail será usado para comunicações oficiais",
              required: true,
              visible: true,
              order: 3
            },
            {
              id: "field_5",
              type: "phone",
              label: "Telefone",
              placeholder: "(00) 00000-0000",
              required: true,
              visible: true,
              order: 4
            },
            {
              id: "field_6",
              type: "divider",
              label: "Endereço",
              required: false,
              visible: true,
              order: 5
            },
            {
              id: "field_7",
              type: "address",
              label: "Endereço Completo",
              helpText: "Endereço completo da sede da associação",
              required: true,
              visible: true,
              requireCep: true,
              autoComplete: true,
              order: 6
            },
            {
              id: "field_8",
              type: "title",
              content: "Informações Adicionais",
              size: "medium",
              required: false,
              visible: true,
              order: 7
            },
            {
              id: "field_9",
              type: "textarea",
              label: "Descrição da Associação",
              placeholder: "Descreva brevemente os objetivos e atividades da associação",
              rows: 4,
              required: true,
              visible: true,
              order: 8
            },
            {
              id: "field_10",
              type: "select",
              label: "Área de Atuação Principal",
              options: [
                { value: "saude", label: "Saúde" },
                { value: "educacao", label: "Educação" },
                { value: "social", label: "Assistência Social" },
                { value: "cultura", label: "Cultura" },
                { value: "esporte", label: "Esporte" },
                { value: "meio_ambiente", label: "Meio Ambiente" },
                { value: "ciencia", label: "Ciência e Tecnologia" },
                { value: "direitos_humanos", label: "Direitos Humanos" },
                { value: "outros", label: "Outros" }
              ],
              required: true,
              visible: true,
              order: 9
            },
            {
              id: "field_11",
              type: "file",
              label: "Estatuto da Associação",
              helpText: "Arquivo em formato PDF, máximo 5MB",
              accept: ".pdf",
              maxSize: 5 * 1024 * 1024,
              required: true,
              visible: true,
              order: 10
            },
            {
              id: "field_12",
              type: "file",
              label: "Ata de Fundação",
              helpText: "Arquivo em formato PDF, máximo 5MB",
              accept: ".pdf",
              maxSize: 5 * 1024 * 1024,
              required: true,
              visible: true,
              order: 11
            }
          ]
        };
        setForm(formData);
        // Inicializa o histórico
        setFormHistory([formData]);
        setHistoryIndex(0);
      } else {
        // Carregar outros formulários pelo ID
        toast({
          title: "Formulário não encontrado",
          description: `Não foi possível carregar o formulário com ID ${id}.`,
          variant: "destructive",
        });
      }
    } else {
      // Formulário novo, inicializa com campos padrão
      const newForm: FormData = {
        name: 'Novo Formulário',
        description: 'Descrição do formulário',
        category: 'empresa',
        status: 'draft',
        fields: [
          {
            id: "field_1",
            type: "title",
            content: "Novo Formulário",
            size: "large",
            required: false,
            visible: true,
            order: 0
          },
          {
            id: "field_2",
            type: "text",
            label: "Nome",
            placeholder: "Digite seu nome",
            required: true,
            visible: true,
            order: 1
          },
          {
            id: "field_3",
            type: "email",
            label: "E-mail",
            placeholder: "Digite seu e-mail",
            required: true,
            visible: true,
            order: 2
          }
        ]
      };
      setForm(newForm);
      // Inicializa o histórico
      setFormHistory([newForm]);
      setHistoryIndex(0);
    }
  }, [id, toast]);

  // Adicionar um novo campo ao formulário
  const addField = (type: FieldType) => {
    const newId = `field_${Date.now()}`;
    let newField: FormField;
    
    switch (type) {
      case 'text':
        newField = {
          id: newId,
          type: 'text',
          label: 'Novo Campo de Texto',
          placeholder: 'Digite aqui',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'textarea':
        newField = {
          id: newId,
          type: 'textarea',
          label: 'Novo Campo de Área de Texto',
          placeholder: 'Digite aqui',
          rows: 3,
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'number':
        newField = {
          id: newId,
          type: 'number',
          label: 'Novo Campo Numérico',
          placeholder: 'Digite um número',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'email':
        newField = {
          id: newId,
          type: 'email',
          label: 'E-mail',
          placeholder: 'exemplo@email.com',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'phone':
        newField = {
          id: newId,
          type: 'phone',
          label: 'Telefone',
          placeholder: '(00) 00000-0000',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'select':
        newField = {
          id: newId,
          type: 'select',
          label: 'Novo Campo de Seleção',
          options: [
            {value: 'opcao1', label: 'Opção 1'},
            {value: 'opcao2', label: 'Opção 2'},
            {value: 'opcao3', label: 'Opção 3'}
          ],
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'checkbox':
        newField = {
          id: newId,
          type: 'checkbox',
          label: 'Novo Campo de Checkbox',
          options: [
            {value: 'opcao1', label: 'Opção 1'},
            {value: 'opcao2', label: 'Opção 2'},
            {value: 'opcao3', label: 'Opção 3'}
          ],
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'radio':
        newField = {
          id: newId,
          type: 'radio',
          label: 'Novo Campo de Rádio',
          options: [
            {value: 'opcao1', label: 'Opção 1'},
            {value: 'opcao2', label: 'Opção 2'},
            {value: 'opcao3', label: 'Opção 3'}
          ],
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'date':
        newField = {
          id: newId,
          type: 'date',
          label: 'Data',
          placeholder: 'Selecione uma data',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'file':
        newField = {
          id: newId,
          type: 'file',
          label: 'Envio de Arquivo',
          helpText: 'Selecione um arquivo para enviar',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'image':
        newField = {
          id: newId,
          type: 'image',
          label: 'Envio de Imagem',
          helpText: 'Selecione uma imagem para enviar',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'address':
        newField = {
          id: newId,
          type: 'address',
          label: 'Endereço',
          helpText: 'Informe o endereço completo',
          required: false,
          visible: true,
          requireCep: true,
          order: form.fields.length
        };
        break;
      case 'cpf':
        newField = {
          id: newId,
          type: 'cpf',
          label: 'CPF',
          placeholder: '000.000.000-00',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'cnpj':
        newField = {
          id: newId,
          type: 'cnpj',
          label: 'CNPJ',
          placeholder: '00.000.000/0000-00',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'creditCard':
        newField = {
          id: newId,
          type: 'creditCard',
          label: 'Cartão de Crédito',
          helpText: 'Informe os dados do cartão',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'title':
        newField = {
          id: newId,
          type: 'title',
          content: 'Novo Título',
          size: 'medium',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'divider':
        newField = {
          id: newId,
          type: 'divider',
          label: 'Seção',
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      case 'spacer':
        newField = {
          id: newId,
          type: 'spacer',
          height: 20,
          required: false,
          visible: true,
          order: form.fields.length
        };
        break;
      default:
        return; // Tipo não suportado
    }
    
    const updatedForm = {
      ...form,
      fields: [...form.fields, newField]
    };
    
    // Adicionar ao histórico
    const newHistory = formHistory.slice(0, historyIndex + 1);
    newHistory.push(updatedForm);
    setFormHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setForm(updatedForm);
    setSelectedFieldId(newId);
    
    toast({
      title: "Campo adicionado",
      description: `Um novo campo do tipo ${type} foi adicionado ao formulário.`,
    });
  };

  // Remover um campo do formulário
  const removeField = (id: string) => {
    const updatedFields = form.fields.filter(field => field.id !== id);
    
    const updatedForm = {
      ...form,
      fields: updatedFields
    };
    
    // Adicionar ao histórico
    const newHistory = formHistory.slice(0, historyIndex + 1);
    newHistory.push(updatedForm);
    setFormHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setForm(updatedForm);
    setSelectedFieldId(null);
    
    toast({
      title: "Campo removido",
      description: "O campo foi removido do formulário.",
    });
  };

  // Duplicar um campo existente
  const duplicateField = (id: string) => {
    const fieldToDuplicate = form.fields.find(field => field.id === id);
    if (!fieldToDuplicate) return;
    
    const newId = `field_${Date.now()}`;
    const duplicatedField = {
      ...fieldToDuplicate,
      id: newId,
      label: fieldToDuplicate.type !== 'title' && fieldToDuplicate.type !== 'divider' && fieldToDuplicate.type !== 'spacer' 
        ? `${(fieldToDuplicate as any).label} (Cópia)` 
        : fieldToDuplicate.type === 'title' 
          ? { ...fieldToDuplicate, content: `${(fieldToDuplicate as TitleField).content} (Cópia)` }
          : fieldToDuplicate,
      order: form.fields.length
    };
    
    const updatedForm = {
      ...form,
      fields: [...form.fields, duplicatedField]
    };
    
    // Adicionar ao histórico
    const newHistory = formHistory.slice(0, historyIndex + 1);
    newHistory.push(updatedForm);
    setFormHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setForm(updatedForm);
    setSelectedFieldId(newId);
    
    toast({
      title: "Campo duplicado",
      description: "Uma cópia do campo foi adicionada ao formulário.",
    });
  };

  // Atualizar um campo existente
  const updateField = (id: string, updates: Partial<FormField>) => {
    const updatedFields = form.fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    );
    
    const updatedForm = {
      ...form,
      fields: updatedFields
    };
    
    // Adicionar ao histórico
    const newHistory = formHistory.slice(0, historyIndex + 1);
    newHistory.push(updatedForm);
    setFormHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setForm(updatedForm);
  };

  // Atualizar os metadados do formulário
  const updateFormMeta = (updates: Partial<FormData>) => {
    const updatedForm = {
      ...form,
      ...updates
    };
    
    // Adicionar ao histórico apenas se houve mudança significativa
    if (
      form.name !== updatedForm.name || 
      form.description !== updatedForm.description ||
      form.category !== updatedForm.category ||
      form.status !== updatedForm.status
    ) {
      const newHistory = formHistory.slice(0, historyIndex + 1);
      newHistory.push(updatedForm);
      setFormHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setForm(updatedForm);
  };

  // Reordenar campos após arrastar e soltar
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    if (!destination) return;
    if (destination.index === source.index) return;
    
    const reorderedFields = [...form.fields];
    const [movedField] = reorderedFields.splice(source.index, 1);
    reorderedFields.splice(destination.index, 0, movedField);
    
    // Atualizar a ordem dos campos
    const updatedFields = reorderedFields.map((field, index) => ({
      ...field,
      order: index
    }));
    
    const updatedForm = {
      ...form,
      fields: updatedFields
    };
    
    // Adicionar ao histórico
    const newHistory = formHistory.slice(0, historyIndex + 1);
    newHistory.push(updatedForm);
    setFormHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setForm(updatedForm);
  };

  // Desfazer a última ação
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setForm(formHistory[historyIndex - 1]);
      setSelectedFieldId(null);
    }
  };

  // Refazer a última ação desfeita
  const redo = () => {
    if (historyIndex < formHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setForm(formHistory[historyIndex + 1]);
      setSelectedFieldId(null);
    }
  };

  // Salvar o formulário
  const saveForm = () => {
    // Lógica para salvar o formulário (aqui seria uma chamada API)
    toast({
      title: "Formulário salvo",
      description: "O formulário foi salvo com sucesso.",
    });
    
    // Atualizar para o status "active" se estava em rascunho
    if (form.status === 'draft') {
      updateFormMeta({ status: 'active' });
    }
  };

  // Publicar o formulário
  const publishForm = () => {
    updateFormMeta({ status: 'active' });
    
    toast({
      title: "Formulário publicado",
      description: "O formulário está agora disponível para uso.",
    });
  };

  // Renderizar interface de edição para diferentes tipos de campos
  const renderFieldEditor = () => {
    if (!selectedFieldId) return null;
    
    const field = form.fields.find(f => f.id === selectedFieldId);
    if (!field) return null;
    
    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field-label">Rótulo</Label>
              <Input 
                id="field-label" 
                value={(field as TextField).label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-placeholder">Placeholder</Label>
              <Input 
                id="field-placeholder" 
                value={(field as TextField).placeholder || ''}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-helpText">Texto de Ajuda</Label>
              <Input 
                id="field-helpText" 
                value={(field as TextField).helpText || ''}
                onChange={(e) => updateField(field.id, { helpText: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-defaultValue">Valor Padrão</Label>
              <Input 
                id="field-defaultValue" 
                value={(field as TextField).defaultValue || ''}
                onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field-minLength">Comprimento Mínimo</Label>
                <Input 
                  id="field-minLength" 
                  type="number"
                  value={(field as TextField).minLength || ''}
                  onChange={(e) => updateField(field.id, { minLength: parseInt(e.target.value) || undefined })}
                />
              </div>
              
              <div>
                <Label htmlFor="field-maxLength">Comprimento Máximo</Label>
                <Input 
                  id="field-maxLength" 
                  type="number"
                  value={(field as TextField).maxLength || ''}
                  onChange={(e) => updateField(field.id, { maxLength: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="field-pattern">Padrão (Regex)</Label>
              <Input 
                id="field-pattern" 
                value={(field as TextField).pattern || ''}
                onChange={(e) => updateField(field.id, { pattern: e.target.value || undefined })}
              />
            </div>
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field-label">Rótulo</Label>
              <Input 
                id="field-label" 
                value={(field as TextareaField).label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-placeholder">Placeholder</Label>
              <Input 
                id="field-placeholder" 
                value={(field as TextareaField).placeholder || ''}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-helpText">Texto de Ajuda</Label>
              <Input 
                id="field-helpText" 
                value={(field as TextareaField).helpText || ''}
                onChange={(e) => updateField(field.id, { helpText: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-defaultValue">Valor Padrão</Label>
              <Textarea 
                id="field-defaultValue" 
                value={(field as TextareaField).defaultValue || ''}
                onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-rows">Linhas</Label>
              <Input 
                id="field-rows" 
                type="number"
                value={(field as TextareaField).rows || 3}
                onChange={(e) => updateField(field.id, { rows: parseInt(e.target.value) || 3 })}
              />
            </div>
          </div>
        );
        
      case 'select':
      case 'checkbox':
      case 'radio':
        const fieldType = field.type;
        const options = (field as SelectField | CheckboxField | RadioField).options;
        
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field-label">Rótulo</Label>
              <Input 
                id="field-label" 
                value={(field as SelectField | CheckboxField | RadioField).label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
              />
            </div>
            
            {fieldType === 'select' && (
              <div>
                <Label htmlFor="field-placeholder">Placeholder</Label>
                <Input 
                  id="field-placeholder" 
                  value={(field as SelectField).placeholder || ''}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="field-helpText">Texto de Ajuda</Label>
              <Input 
                id="field-helpText" 
                value={(field as SelectField | CheckboxField | RadioField).helpText || ''}
                onChange={(e) => updateField(field.id, { helpText: e.target.value })}
              />
            </div>
            
            {fieldType === 'select' && (
              <div className="flex items-center space-x-2">
                <Switch 
                  id="field-multiple" 
                  checked={(field as SelectField).multiple || false}
                  onCheckedChange={(checked) => updateField(field.id, { multiple: checked })}
                />
                <Label htmlFor="field-multiple">Permitir múltipla seleção</Label>
              </div>
            )}
            
            <div>
              <Label>Opções</Label>
              <div className="mt-2 space-y-2 border rounded-md p-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={option.label}
                      placeholder="Rótulo"
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].label = e.target.value;
                        updateField(field.id, { options: newOptions });
                      }}
                      className="flex-grow"
                    />
                    <Input 
                      value={option.value}
                      placeholder="Valor"
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].value = e.target.value;
                        updateField(field.id, { options: newOptions });
                      }}
                      className="w-1/3"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newOptions = options.filter((_, i) => i !== index);
                        updateField(field.id, { options: newOptions });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => {
                    const newOptions = [...options, {label: `Opção ${options.length + 1}`, value: `opcao${options.length + 1}`}];
                    updateField(field.id, { options: newOptions });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Opção
                </Button>
              </div>
            </div>
          </div>
        );

      case 'title':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field-content">Texto do Título</Label>
              <Input 
                id="field-content" 
                value={(field as TitleField).content}
                onChange={(e) => updateField(field.id, { content: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-size">Tamanho</Label>
              <Select 
                value={(field as TitleField).size}
                onValueChange={(value: 'large' | 'medium' | 'small') => updateField(field.id, { size: value })}
              >
                <SelectTrigger id="field-size">
                  <SelectValue placeholder="Selecione um tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="large">Grande</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="small">Pequeno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'divider':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field-label">Rótulo (opcional)</Label>
              <Input 
                id="field-label" 
                value={(field as DividerField).label || ''}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
              />
            </div>
          </div>
        );
        
      case 'spacer':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field-height">Altura (pixels)</Label>
              <Input 
                id="field-height" 
                type="number"
                min="5"
                max="200"
                value={(field as SpacerField).height}
                onChange={(e) => updateField(field.id, { height: parseInt(e.target.value) || 20 })}
              />
            </div>
          </div>
        );
        
      // Implementar editores para os outros tipos de campos...
      
      default:
        return (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
            O editor para este tipo de campo ainda não está implementado.
          </div>
        );
    }
  };

  // Renderizar previsualização de um campo
  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={`preview-${field.id}`}>{(field as TextField).label}</Label>
            <Input 
              id={`preview-${field.id}`} 
              placeholder={(field as TextField).placeholder}
              value={(field as TextField).defaultValue || ''}
              readOnly 
            />
            {(field as TextField).helpText && (
              <p className="text-sm text-muted-foreground">{(field as TextField).helpText}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={`preview-${field.id}`}>{(field as TextareaField).label}</Label>
            <Textarea 
              id={`preview-${field.id}`} 
              placeholder={(field as TextareaField).placeholder}
              value={(field as TextareaField).defaultValue || ''}
              rows={(field as TextareaField).rows || 3}
              readOnly 
            />
            {(field as TextareaField).helpText && (
              <p className="text-sm text-muted-foreground">{(field as TextareaField).helpText}</p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={`preview-${field.id}`}>{(field as SelectField).label}</Label>
            <Select defaultValue={(field as SelectField).defaultValue}>
              <SelectTrigger id={`preview-${field.id}`}>
                <SelectValue placeholder={(field as SelectField).placeholder || 'Selecione...'} />
              </SelectTrigger>
              <SelectContent>
                {(field as SelectField).options.map((option, index) => (
                  <SelectItem key={index} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(field as SelectField).helpText && (
              <p className="text-sm text-muted-foreground">{(field as SelectField).helpText}</p>
            )}
          </div>
        );
        
      case 'title':
        const titleField = field as TitleField;
        if (titleField.size === 'large') {
          return <h2 className="text-2xl font-bold mb-4">{titleField.content}</h2>;
        } else if (titleField.size === 'medium') {
          return <h3 className="text-xl font-bold mb-3">{titleField.content}</h3>;
        } else {
          return <h4 className="text-lg font-semibold mb-2">{titleField.content}</h4>;
        }
        
      case 'divider':
        return (
          <div className="py-2">
            <Separator className="my-2" />
            {(field as DividerField).label && (
              <p className="text-sm font-medium text-muted-foreground mt-1">{(field as DividerField).label}</p>
            )}
          </div>
        );
        
      case 'spacer':
        return <div style={{ height: `${(field as SpacerField).height}px` }} />;
        
      // Implementar previsualizações para os outros tipos de campos...
      
      default:
        return (
          <div className="p-3 border border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">
              Campo do tipo <Badge variant="outline">{field.type}</Badge>
            </p>
          </div>
        );
    }
  };

  // Obter ícone para o tipo de campo
  const getFieldTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'textarea': return <AlignLeft className="h-4 w-4" />;
      case 'number': return <Hash className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'select': return <ListFilter className="h-4 w-4" />;
      case 'checkbox': return <CheckSquare className="h-4 w-4" />;
      case 'radio': return <Circle className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'file': return <FileUp className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'address': return <MapPin className="h-4 w-4" />;
      case 'cpf':
      case 'cnpj': return <Hash className="h-4 w-4" />;
      case 'creditCard': return <CreditCard className="h-4 w-4" />;
      case 'title': return <Type className="h-4 w-4 font-bold" />;
      case 'divider': return <MoveHorizontal className="h-4 w-4" />;
      case 'spacer': return <MoveVertical className="h-4 w-4" />;
      default: return <CircleSlash className="h-4 w-4" />;
    }
  };

  // Renderizar a aplicação
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              window.history.pushState({}, '', '/cadastro/formularios');
              window.dispatchEvent(new Event('popstate'));
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{form.id ? 'Editar Formulário' : 'Novo Formulário'}</h1>
            <p className="text-gray-600">
              {form.id ? 'Faça alterações no formulário existente' : 'Crie um novo formulário personalizado'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={historyIndex <= 0}
            onClick={undo}
          >
            <Undo2 className="h-4 w-4 mr-1" /> Desfazer
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            disabled={historyIndex >= formHistory.length - 1}
            onClick={redo}
          >
            <Redo2 className="h-4 w-4 mr-1" /> Refazer
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView(activeView === 'editor' ? 'preview' : 'editor')}
          >
            {activeView === 'editor' ? (
              <><Eye className="h-4 w-4 mr-1" /> Visualizar</>
            ) : (
              <><Settings className="h-4 w-4 mr-1" /> Editar</>
            )}
          </Button>
          
          {form.status === 'draft' && (
            <Button
              onClick={publishForm}
            >
              Publicar
            </Button>
          )}
          
          <Button
            variant={form.status === 'active' ? 'default' : 'secondary'}
            onClick={saveForm}
          >
            <Save className="h-4 w-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Painel de Metadados do Formulário */}
        <Card className="col-span-12">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <Label htmlFor="form-name">Nome do Formulário</Label>
                <Input 
                  id="form-name" 
                  value={form.name}
                  onChange={(e) => updateFormMeta({ name: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="form-category">Categoria</Label>
                <Select 
                  value={form.category}
                  onValueChange={(value) => updateFormMeta({ category: value })}
                >
                  <SelectTrigger id="form-category" className="mt-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="associacao">Associação</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                    <SelectItem value="clinica">Clínica</SelectItem>
                    <SelectItem value="laboratorio">Laboratório</SelectItem>
                    <SelectItem value="pesquisa">Pesquisa</SelectItem>
                    <SelectItem value="avaliacao">Avaliação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="form-status">Status</Label>
                <div className="flex items-center h-10 mt-1">
                  <Badge variant="outline" className={
                    form.status === 'active'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : form.status === 'draft'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                  }>
                    {form.status === 'active' ? 'Ativo' : form.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                  </Badge>
                </div>
              </div>
              
              <div className="col-span-4">
                <Label htmlFor="form-description">Descrição</Label>
                <Textarea 
                  id="form-description" 
                  value={form.description}
                  onChange={(e) => updateFormMeta({ description: e.target.value })}
                  className="mt-1"
                  placeholder="Descreva o propósito deste formulário"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {activeView === 'editor' ? (
          <>
            {/* Painel do Editor */}
            <div className="col-span-8">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle>Estrutura do Formulário</CardTitle>
                  <CardDescription>Arraste os campos para reordenar</CardDescription>
                </CardHeader>
                
                <CardContent className="p-4">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="form-fields">
                      {(provided) => (
                        <div
                          className="space-y-2"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {form.fields.length === 0 ? (
                            <div className="p-8 border-2 border-dashed rounded-md text-center">
                              <p className="text-muted-foreground">
                                Adicione campos ao seu formulário usando o painel à direita
                              </p>
                            </div>
                          ) : (
                            form.fields.map((field, index) => (
                              <Draggable
                                key={field.id}
                                draggableId={field.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`border rounded-md p-3 bg-card ${selectedFieldId === field.id ? 'ring-2 ring-primary' : ''}`}
                                    onClick={() => setSelectedFieldId(field.id)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-move text-muted-foreground hover:text-foreground"
                                        >
                                          <GripVertical className="h-4 w-4" />
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                          {getFieldTypeIcon(field.type)}
                                          
                                          <span className="font-medium">
                                            {field.type === 'text' || field.type === 'textarea' || field.type === 'number' || 
                                            field.type === 'email' || field.type === 'phone' || field.type === 'select' || 
                                            field.type === 'checkbox' || field.type === 'radio' || field.type === 'date' || 
                                            field.type === 'file' || field.type === 'image' || field.type === 'address' || 
                                            field.type === 'cpf' || field.type === 'cnpj' || field.type === 'creditCard'
                                              ? (field as any).label
                                              : field.type === 'title'
                                                ? (field as TitleField).content
                                                : field.type === 'divider'
                                                  ? (field as DividerField).label || 'Separador'
                                                  : field.type === 'spacer'
                                                    ? `Espaço (${(field as SpacerField).height}px)`
                                                    : 'Campo'
                                            }
                                          </span>
                                        </div>
                                        
                                        {field.required && (
                                          <Badge variant="outline" className="text-xs bg-red-50 text-red-500 border-red-200">
                                            Obrigatório
                                          </Badge>
                                        )}
                                        
                                        {!field.visible && (
                                          <Badge variant="outline" className="text-xs">
                                            Oculto
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateField(field.id);
                                          }}
                                          title="Duplicar campo"
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                        
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeField(field.id);
                                          }}
                                          title="Remover campo"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </CardContent>
              </Card>
            </div>
            
            {/* Painel de Propriedades/Adição de Campos */}
            <div className="col-span-4">
              <Tabs defaultValue={selectedFieldId ? "properties" : "add"}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="add">Adicionar Campos</TabsTrigger>
                  <TabsTrigger value="properties" disabled={!selectedFieldId}>Propriedades</TabsTrigger>
                </TabsList>
                
                <TabsContent value="add" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle>Campos Disponíveis</CardTitle>
                      <CardDescription>Clique para adicionar ao formulário</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4">
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Básicos</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('text')}
                              >
                                <Type className="h-4 w-4 mr-2" /> Texto
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('textarea')}
                              >
                                <AlignLeft className="h-4 w-4 mr-2" /> Área de Texto
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('number')}
                              >
                                <Hash className="h-4 w-4 mr-2" /> Número
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('email')}
                              >
                                <Mail className="h-4 w-4 mr-2" /> Email
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('phone')}
                              >
                                <Phone className="h-4 w-4 mr-2" /> Telefone
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('date')}
                              >
                                <Calendar className="h-4 w-4 mr-2" /> Data
                              </Button>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Seleção</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('select')}
                              >
                                <ListFilter className="h-4 w-4 mr-2" /> Lista de Seleção
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('checkbox')}
                              >
                                <CheckSquare className="h-4 w-4 mr-2" /> Caixas de Seleção
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('radio')}
                              >
                                <Circle className="h-4 w-4 mr-2" /> Botões de Opção
                              </Button>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Arquivos</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('file')}
                              >
                                <FileUp className="h-4 w-4 mr-2" /> Arquivo
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('image')}
                              >
                                <Image className="h-4 w-4 mr-2" /> Imagem
                              </Button>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Especiais</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('address')}
                              >
                                <MapPin className="h-4 w-4 mr-2" /> Endereço
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('cpf')}
                              >
                                <Hash className="h-4 w-4 mr-2" /> CPF
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('cnpj')}
                              >
                                <Hash className="h-4 w-4 mr-2" /> CNPJ
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('creditCard')}
                              >
                                <CreditCard className="h-4 w-4 mr-2" /> Cartão de Crédito
                              </Button>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Layout</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('title')}
                              >
                                <Type className="h-4 w-4 mr-2" /> Título
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('divider')}
                              >
                                <MoveHorizontal className="h-4 w-4 mr-2" /> Separador
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addField('spacer')}
                              >
                                <MoveVertical className="h-4 w-4 mr-2" /> Espaçador
                              </Button>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="properties" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle>Propriedades do Campo</CardTitle>
                      <CardDescription>
                        {selectedFieldId 
                          ? `Editando campo do tipo ${form.fields.find(f => f.id === selectedFieldId)?.type}` 
                          : 'Selecione um campo para editar'}
                      </CardDescription>
                    </CardHeader>
                    
                    {selectedFieldId && (
                      <CardContent className="p-4">
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="space-y-4">
                            {/* Propriedades comuns */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="field-required" 
                                  checked={form.fields.find(f => f.id === selectedFieldId)?.required}
                                  onCheckedChange={(checked) => updateField(selectedFieldId, { required: checked })}
                                />
                                <Label htmlFor="field-required">Campo obrigatório</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="field-visible" 
                                  checked={form.fields.find(f => f.id === selectedFieldId)?.visible}
                                  onCheckedChange={(checked) => updateField(selectedFieldId, { visible: checked })}
                                />
                                <Label htmlFor="field-visible">Visível</Label>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            {/* Editor específico para o tipo de campo */}
                            {renderFieldEditor()}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          // Visualização do formulário
          <div className="col-span-12">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle>Pré-visualização do Formulário</CardTitle>
                <CardDescription>
                  Esta é uma pré-visualização de como o formulário será exibido para os usuários
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Título do formulário */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">{form.name}</h1>
                    <p className="text-gray-600 mt-2">{form.description}</p>
                  </div>
                  
                  {/* Campos do formulário */}
                  {form.fields.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-md text-center">
                      <p className="text-muted-foreground">
                        Este formulário ainda não possui campos
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {form.fields
                        .filter(field => field.visible)
                        .sort((a, b) => a.order - b.order)
                        .map(field => (
                          <div key={field.id} className={field.required ? 'relative' : ''}>
                            {field.required && (
                              <span className="absolute -left-4 text-red-500 font-medium">*</span>
                            )}
                            {renderFieldPreview(field)}
                          </div>
                        ))}
                    </div>
                  )}
                  
                  {/* Botão de envio */}
                  <div className="pt-6 mt-6 border-t">
                    <Button className="w-full" disabled>
                      Enviar Formulário
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      * Campos obrigatórios
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 border-t">
                <div className="w-full flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView('editor')}
                  >
                    <Settings className="h-4 w-4 mr-1" /> Voltar ao Editor
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {form.fields.filter(f => f.visible).length} campos visíveis
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {form.fields.filter(f => f.required).length} campos obrigatórios
                    </Badge>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock Circle component para representar o botão de rádio
function Circle({ className }: { className: string }) {
  return <div className={`${className} border-2 rounded-full`} />;
}

// Mock MoveVertical component
function MoveVertical({ className }: { className: string }) {
  return <div className={className}>↕️</div>;
}