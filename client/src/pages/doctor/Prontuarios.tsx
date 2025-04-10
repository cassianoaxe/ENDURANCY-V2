import React, { useState } from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { 
  FileText, 
  Search, 
  Plus, 
  Clock, 
  Calendar, 
  User,
  ClipboardCheck,
  CheckCircle,
  X
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DoctorProntuarios() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('joao');
  
  // Dados de exemplo dos pacientes
  const patients = [
    { 
      id: 'joao', 
      name: 'João Silva', 
      age: 45, 
      conditions: ['Hipertensão', 'Diabetes Tipo 2'],
      lastVisit: '20/04/2025'
    },
    { 
      id: 'maria', 
      name: 'Maria Souza', 
      age: 38, 
      conditions: ['Arritmia'],
      lastVisit: '15/04/2025'
    },
    { 
      id: 'carlos', 
      name: 'Carlos Ferreira', 
      age: 52, 
      conditions: ['Insuficiência Cardíaca', 'Hipertensão'],
      lastVisit: '22/04/2025'
    }
  ];

  // Filtragem de pacientes com base na busca
  const filteredPatients = searchQuery.trim() === '' 
    ? patients 
    : patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.conditions.some(condition => 
          condition.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

  // Simulação de prontuário médico do paciente selecionado
  const getPatientMedicalRecord = (patientId) => {
    if (patientId === 'joao') {
      return {
        personalInfo: {
          name: 'João Silva',
          dob: '10/05/1980',
          age: 45,
          gender: 'Masculino',
          bloodType: 'O+',
          height: '1,75m',
          weight: '82kg',
          profession: 'Engenheiro Civil',
          contact: '(11) 98765-4321',
          email: 'joao.silva@email.com'
        },
        medicalHistory: {
          allergies: ['Penicilina', 'Amendoim'],
          chronicConditions: ['Hipertensão Arterial', 'Diabetes Tipo 2'],
          previousSurgeries: [
            { procedure: 'Apendicectomia', date: 'Março 2010', notes: 'Sem complicações' }
          ],
          familyHistory: [
            'Pai: Diabetes Tipo 2, falecido aos 68 anos (infarto)',
            'Mãe: Hipertensão, 72 anos',
            'Irmão: Diabetes Tipo 2'
          ]
        },
        medications: [
          { name: 'Losartana', dosage: '50mg', frequency: '1x ao dia', since: 'Jan 2020', doctor: 'Dr. Roberto' },
          { name: 'Metformina', dosage: '850mg', frequency: '2x ao dia', since: 'Mar 2021', doctor: 'Dr. Roberto' }
        ],
        consultations: [
          { 
            date: '20/04/2025', 
            reason: 'Consulta de rotina',
            symptoms: 'Sem queixas específicas. Relata leve cansaço após atividades físicas intensas.',
            diagnosis: 'Hipertensão e diabetes sob controle. Cansaço provavelmente relacionado ao excesso de atividade.',
            treatment: 'Manter medicações. Recomendada moderação nas atividades físicas.',
            examRequests: ['Hemograma completo', 'Glicemia de jejum', 'Perfil lipídico'],
            followUp: 'Retorno em 3 meses com exames'
          },
          { 
            date: '10/01/2025', 
            reason: 'Dores no peito',
            symptoms: 'Dor precordial não irradiada, de média intensidade, ao realizar esforços.',
            diagnosis: 'Angina estável',
            treatment: 'Adicionado Isordil 5mg SL em caso de dor. Manter demais medicações.',
            examRequests: ['ECG', 'Teste ergométrico', 'Ecocardiograma'],
            followUp: 'Retorno em 15 dias com resultados'
          }
        ],
        exams: [
          {
            name: 'Eletrocardiograma',
            date: '12/01/2025',
            result: 'Ritmo sinusal. Sem alterações isquêmicas no repouso.',
            status: 'Normal'
          },
          {
            name: 'Teste Ergométrico',
            date: '15/01/2025',
            result: 'Prova submáxima (85% FCM). Infradesnivelamento discreto de ST em cargas elevadas. Capacidade funcional levemente reduzida.',
            status: 'Alterado'
          },
          {
            name: 'Glicemia de Jejum',
            date: '05/01/2025',
            result: '118 mg/dL (VR: < 99 mg/dL)',
            status: 'Elevado'
          },
          {
            name: 'HbA1c',
            date: '05/01/2025',
            result: '7.1% (VR: < 5.7%)',
            status: 'Elevado'
          }
        ]
      };
    } else if (patientId === 'maria') {
      return {
        personalInfo: {
          name: 'Maria Souza',
          dob: '15/06/1987',
          age: 38,
          gender: 'Feminino',
          bloodType: 'A+',
          height: '1,65m',
          weight: '68kg',
          profession: 'Advogada',
          contact: '(11) 97654-3210',
          email: 'maria.souza@email.com'
        },
        medicalHistory: {
          allergies: ['Sulfas'],
          chronicConditions: ['Arritmia (Fibrilação Atrial Paroxística)'],
          previousSurgeries: [],
          familyHistory: [
            'Mãe: Arritmia cardíaca',
            'Avô materno: Morte súbita aos 65 anos'
          ]
        },
        medications: [
          { name: 'Propafenona', dosage: '300mg', frequency: '2x ao dia', since: 'Set 2023', doctor: 'Dr. Roberto' },
          { name: 'Rivaroxabana', dosage: '20mg', frequency: '1x ao dia', since: 'Set 2023', doctor: 'Dr. Roberto' }
        ],
        consultations: [
          { 
            date: '15/04/2025', 
            reason: 'Palpitações',
            symptoms: 'Episódios de palpitações, especialmente à noite, associados a ansiedade e insônia.',
            diagnosis: 'Fibrilação atrial paroxística. Componente ansioso significativo.',
            treatment: 'Ajustada dose de Propafenona. Encaminhada à psicologia para manejo da ansiedade.',
            examRequests: ['Holter 24h', 'Ecocardiograma', 'Hormônios tireoidianos'],
            followUp: 'Retorno em 30 dias com exames'
          }
        ],
        exams: [
          {
            name: 'Holter 24h',
            date: '20/03/2025',
            result: 'Episódios de fibrilação atrial paroxística (2 episódios, duração total de 3h). FC média 82bpm.',
            status: 'Alterado'
          },
          {
            name: 'Ecocardiograma',
            date: '18/03/2025',
            result: 'Função sistólica preservada. Leve aumento de átrio esquerdo. Sem outras alterações significativas.',
            status: 'Levemente alterado'
          },
          {
            name: 'TSH',
            date: '18/03/2025',
            result: '2.1 mUI/L (VR: 0.4-4.0)',
            status: 'Normal'
          }
        ]
      };
    } else if (patientId === 'carlos') {
      return {
        personalInfo: {
          name: 'Carlos Ferreira',
          dob: '25/03/1973',
          age: 52,
          gender: 'Masculino',
          bloodType: 'B+',
          height: '1,78m',
          weight: '92kg',
          profession: 'Empresário',
          contact: '(11) 96543-2109',
          email: 'carlos.ferreira@email.com'
        },
        medicalHistory: {
          allergies: [],
          chronicConditions: ['Insuficiência Cardíaca', 'Hipertensão Arterial', 'Obesidade'],
          previousSurgeries: [
            { procedure: 'Angioplastia coronária', date: 'Julho 2022', notes: 'Stent em DA' }
          ],
          familyHistory: [
            'Pai: Infarto aos 60 anos',
            'Irmão: Hipertensão'
          ]
        },
        medications: [
          { name: 'Carvedilol', dosage: '25mg', frequency: '2x ao dia', since: 'Ago 2022', doctor: 'Dr. Roberto' },
          { name: 'Enalapril', dosage: '20mg', frequency: '2x ao dia', since: 'Ago 2022', doctor: 'Dr. Roberto' },
          { name: 'Espironolactona', dosage: '25mg', frequency: '1x ao dia', since: 'Ago 2022', doctor: 'Dr. Roberto' },
          { name: 'AAS', dosage: '100mg', frequency: '1x ao dia', since: 'Jul 2022', doctor: 'Dr. Roberto' }
        ],
        consultations: [
          { 
            date: '22/04/2025', 
            reason: 'Acompanhamento IC',
            symptoms: 'Relata melhora da dispneia. Nega edema de MMII. Mantém ortopneia leve.',
            diagnosis: 'IC com fração de ejeção reduzida, classe funcional II (NYHA), compensada.',
            treatment: 'Mantidas medicações atuais. Reforçadas orientações de restrição de sal e líquidos.',
            examRequests: ['Ecocardiograma', 'NT-proBNP', 'Função renal'],
            followUp: 'Retorno em 2 meses com exames'
          }
        ],
        exams: [
          {
            name: 'Ecocardiograma',
            date: '15/02/2025',
            result: 'FEVE 35%. Hipocinesia difusa de VE. Dilatação moderada de VE e AE. Insuficiência mitral leve a moderada.',
            status: 'Alterado'
          },
          {
            name: 'NT-proBNP',
            date: '15/02/2025',
            result: '850 pg/mL (VR: <300 pg/mL)',
            status: 'Elevado'
          },
          {
            name: 'Creatinina Sérica',
            date: '15/02/2025',
            result: '1.3 mg/dL (VR: 0.7-1.2)',
            status: 'Discretamente elevado'
          }
        ]
      };
    }
    
    return null;
  };
  
  const patientRecord = getPatientMedicalRecord(selectedPatient);

  return (
    <DoctorLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <p className="text-gray-500 text-sm">Gerenciamento de prontuários médicos</p>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Relatórios</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Novo Registro</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Adicionar novo registro</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova anotação ao prontuário do paciente.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Nova anotação adicionada");
                  // Implementar a lógica para enviar os dados
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="recordType">Tipo de registro</Label>
                      <Select defaultValue="consultation">
                        <SelectTrigger id="recordType">
                          <SelectValue placeholder="Selecione o tipo de registro" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consulta</SelectItem>
                          <SelectItem value="exam">Exame</SelectItem>
                          <SelectItem value="medication">Medicação</SelectItem>
                          <SelectItem value="allergy">Alergia</SelectItem>
                          <SelectItem value="note">Anotação geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título/Motivo</Label>
                      <Input id="title" placeholder="Ex: Consulta de rotina, Exame de sangue" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Descreva detalhes relevantes para o prontuário"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar registro</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Lista de pacientes */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pacientes</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar paciente..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${patient.id === selectedPatient ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      <p className={`font-medium ${patient.id === selectedPatient ? 'text-blue-700' : ''}`}>{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.age} anos</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.conditions.map((condition, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs py-0">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Última consulta: {patient.lastVisit}</p>
                    </div>
                  ))}
                  
                  {filteredPatients.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      Nenhum paciente encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Prontuário médico */}
          <div className="md:col-span-3">
            {patientRecord ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Prontuário: {patientRecord.personalInfo.name}</CardTitle>
                      <CardDescription>
                        {patientRecord.personalInfo.age} anos · {patientRecord.personalInfo.gender} · Tipo Sanguíneo: {patientRecord.personalInfo.bloodType}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>Exportar PDF</span>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="overview">
                    <div className="border-b px-4">
                      <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                        <TabsTrigger 
                          value="overview" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                          Visão geral
                        </TabsTrigger>
                        <TabsTrigger 
                          value="consultations" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                          Consultas
                        </TabsTrigger>
                        <TabsTrigger 
                          value="exams" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                          Exames
                        </TabsTrigger>
                        <TabsTrigger 
                          value="medications" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                          Medicações
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="overview" className="p-4 space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Informações Pessoais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="space-y-2">
                            <div className="flex">
                              <span className="w-32 text-gray-500">Nome:</span>
                              <span>{patientRecord.personalInfo.name}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-500">Data nasc.:</span>
                              <span>{patientRecord.personalInfo.dob}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-500">Gênero:</span>
                              <span>{patientRecord.personalInfo.gender}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-500">Tipo sang.:</span>
                              <span>{patientRecord.personalInfo.bloodType}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex">
                              <span className="w-32 text-gray-500">Altura:</span>
                              <span>{patientRecord.personalInfo.height}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-500">Peso:</span>
                              <span>{patientRecord.personalInfo.weight}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-500">Profissão:</span>
                              <span>{patientRecord.personalInfo.profession}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-500">Contato:</span>
                              <span>{patientRecord.personalInfo.contact}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium">Histórico Médico</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div>
                            <h4 className="font-medium text-gray-700">Condições crônicas</h4>
                            <ul className="list-disc list-inside mt-1 text-sm">
                              {patientRecord.medicalHistory.chronicConditions.map((condition, idx) => (
                                <li key={idx}>{condition}</li>
                              ))}
                            </ul>
                            
                            <h4 className="font-medium text-gray-700 mt-3">Alergias</h4>
                            <ul className="list-disc list-inside mt-1 text-sm">
                              {patientRecord.medicalHistory.allergies.length > 0 ? (
                                patientRecord.medicalHistory.allergies.map((allergy, idx) => (
                                  <li key={idx}>{allergy}</li>
                                ))
                              ) : (
                                <li>Nega alergias</li>
                              )}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-700">Cirurgias prévias</h4>
                            <ul className="list-disc list-inside mt-1 text-sm">
                              {patientRecord.medicalHistory.previousSurgeries.length > 0 ? (
                                patientRecord.medicalHistory.previousSurgeries.map((surgery, idx) => (
                                  <li key={idx}>{surgery.procedure} ({surgery.date})</li>
                                ))
                              ) : (
                                <li>Nega cirurgias prévias</li>
                              )}
                            </ul>
                            
                            <h4 className="font-medium text-gray-700 mt-3">Histórico familiar</h4>
                            <ul className="list-disc list-inside mt-1 text-sm">
                              {patientRecord.medicalHistory.familyHistory.map((history, idx) => (
                                <li key={idx}>{history}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Medicamentos Atuais</h3>
                        </div>
                        <div className="overflow-x-auto mt-2">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-2">Medicamento</th>
                                <th scope="col" className="px-4 py-2">Dosagem</th>
                                <th scope="col" className="px-4 py-2">Frequência</th>
                                <th scope="col" className="px-4 py-2">Início</th>
                                <th scope="col" className="px-4 py-2">Médico</th>
                              </tr>
                            </thead>
                            <tbody>
                              {patientRecord.medications.map((medication, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-2 font-medium">{medication.name}</td>
                                  <td className="px-4 py-2">{medication.dosage}</td>
                                  <td className="px-4 py-2">{medication.frequency}</td>
                                  <td className="px-4 py-2">{medication.since}</td>
                                  <td className="px-4 py-2">{medication.doctor}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="consultations" className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Consultas e Atendimentos</h3>
                        <Button size="sm" className="flex items-center gap-1">
                          <Plus className="h-4 w-4" />
                          <span>Nova Consulta</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {patientRecord.consultations.map((consultation, idx) => (
                          <Card key={idx} className="shadow-sm">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                    {consultation.date}
                                  </CardTitle>
                                  <CardDescription>{consultation.reason}</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">Queixas e Sintomas</h4>
                                  <p className="text-sm mt-1">{consultation.symptoms}</p>
                                  
                                  <h4 className="text-sm font-medium text-gray-700 mt-3">Diagnóstico</h4>
                                  <p className="text-sm mt-1">{consultation.diagnosis}</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">Conduta</h4>
                                  <p className="text-sm mt-1">{consultation.treatment}</p>
                                  
                                  <h4 className="text-sm font-medium text-gray-700 mt-3">Exames Solicitados</h4>
                                  <ul className="list-disc list-inside text-sm mt-1">
                                    {consultation.examRequests.map((exam, idx) => (
                                      <li key={idx}>{exam}</li>
                                    ))}
                                  </ul>
                                  
                                  <h4 className="text-sm font-medium text-gray-700 mt-3">Seguimento</h4>
                                  <p className="text-sm mt-1">{consultation.followUp}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="exams" className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Resultados de Exames</h3>
                        <Button size="sm" className="flex items-center gap-1">
                          <Plus className="h-4 w-4" />
                          <span>Adicionar Exame</span>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patientRecord.exams.map((exam, idx) => (
                          <Card key={idx} className="shadow-sm">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between">
                                <CardTitle className="text-base">{exam.name}</CardTitle>
                                <Badge 
                                  className={
                                    exam.status === 'Normal' ? 'bg-green-100 text-green-800' :
                                    exam.status === 'Alterado' ? 'bg-red-100 text-red-800' :
                                    exam.status === 'Elevado' ? 'bg-amber-100 text-amber-800' :
                                    'bg-blue-100 text-blue-800'
                                  }
                                >
                                  {exam.status}
                                </Badge>
                              </div>
                              <CardDescription>{exam.date}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <p className="text-sm">{exam.result}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="medications" className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Medicamentos</h3>
                        <Button size="sm" className="flex items-center gap-1">
                          <Plus className="h-4 w-4" />
                          <span>Adicionar Medicamento</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {patientRecord.medications.map((medication, idx) => (
                          <Card key={idx} className="shadow-sm">
                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                              <div className="mb-2 md:mb-0">
                                <h4 className="font-medium flex items-center">
                                  <ClipboardCheck className="h-4 w-4 mr-2 text-primary" />
                                  {medication.name} {medication.dosage}
                                </h4>
                                <p className="text-sm text-gray-500">{medication.frequency} · Desde {medication.since}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">Editar</Button>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">Suspender</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="text-lg font-medium mt-4">Selecione um paciente</h3>
                  <p className="text-gray-500 mt-1">
                    Escolha um paciente na lista para visualizar o prontuário
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}