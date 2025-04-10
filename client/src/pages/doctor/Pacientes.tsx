import React, { useState, useEffect } from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { 
  Search, 
  Plus,
  Eye,
  MoreHorizontal,
  Mail,
  Calendar,
  Clock,
  Download,
  ArrowUpDown,
  BellRing,
  Filter,
  Loader2
} from 'lucide-react';
import { 
  Card
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Tipo para os dados do paciente vindo da API
interface PatientFromApi {
  id: number;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string | null;
  cpf: string;
  address: string | null;
  organizationId: number;
  createdAt: string;
}

// Tipo para o paciente processado para exibição
interface ProcessedPatient {
  id: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextVisit: string;
  conditions: string[];
  active: boolean;
  initials: string;
}

// Função para calcular a idade a partir da data de nascimento
function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Função para obter as iniciais do nome
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function DoctorPacientes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrgId, setActiveOrgId] = useState<number | null>(null);
  const { toast } = useToast();

  // Definir tipos para as organizações
  interface DoctorOrganization {
    id: number;
    doctorId: number;
    organizationId: number;
    organizationName: string;
    status: string;
    isDefault: boolean;
    createdAt: string;
    address?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    website?: string;
  }

  // Buscar as organizações do médico para obter a organização ativa
  const { 
    data: doctorOrganizations = [], 
    isLoading: orgLoading 
  } = useQuery({
    queryKey: ['/api/doctor/organizations'] as const,
  }) as { data: DoctorOrganization[], isLoading: boolean };

  // Efeito para processar os dados de organizações quando disponíveis
  useEffect(() => {
    if (doctorOrganizations.length > 0) {
      // Encontrar a organização padrão ou usar a primeira ativa
      const defaultOrg = doctorOrganizations.find((org: DoctorOrganization) => org.isDefault) || 
                          doctorOrganizations.find((org: DoctorOrganization) => org.status === 'active');
      if (defaultOrg) {
        setActiveOrgId(defaultOrg.organizationId);
      }
    }
  }, [doctorOrganizations]);

  // Efeito para mensagem de erro se não houver organizações
  useEffect(() => {
    if (doctorOrganizations.length === 0 && !orgLoading) {
      toast({
        title: "Sem organizações associadas",
        description: "Você não possui organizações associadas à sua conta.",
        variant: "destructive"
      });
    }
  }, [doctorOrganizations, orgLoading, toast]);

  // Buscar pacientes da organização ativa
  const { 
    data: patientsData = [], 
    isLoading: patientsLoading,
    error: patientsError
  } = useQuery({
    queryKey: ['/api/doctor/organizations', activeOrgId, 'patients'] as const,
    enabled: activeOrgId !== null,
  }) as { data: PatientFromApi[], isLoading: boolean, error: Error | null };

  // Efeito para mostrar erro se a busca de pacientes falhar
  useEffect(() => {
    if (patientsError) {
      toast({
        title: "Erro ao carregar pacientes",
        description: "Não foi possível obter a lista de pacientes.",
        variant: "destructive"
      });
    }
  }, [patientsError, toast]);

  // Processar os dados dos pacientes
  const processedPatients: ProcessedPatient[] = React.useMemo(() => {
    if (!patientsData || !Array.isArray(patientsData) || patientsData.length === 0) {
      return [];
    }
    
    return patientsData.map((patient: PatientFromApi) => {
      try {
        // Calcular a idade
        const age = calculateAge(patient.dateOfBirth);
        
        // Obter iniciais do nome
        const initials = getInitials(patient.name);
        
        // Por enquanto, usar valores simulados para alguns campos que não temos na API
        return {
          id: patient.id,
          name: patient.name,
          age,
          gender: patient.gender,
          email: patient.email,
          phone: patient.phone || "Não informado",
          lastVisit: "Não disponível", // Quando tivermos o histórico de consultas, atualizar
          nextVisit: "Não agendada", // Quando tivermos agendamento, atualizar
          conditions: [], // Quando tivermos condições médicas, atualizar
          active: true, // Por padrão, considerar ativo
          initials
        };
      } catch (error) {
        console.error("Erro ao processar dados do paciente:", error, patient);
        // Retornar um paciente com dados mínimos para evitar quebrar a interface
        return {
          id: patient.id || 0,
          name: patient.name || "Nome indisponível",
          age: 0,
          gender: patient.gender || "Não informado",
          email: patient.email || "Email indisponível",
          phone: "Não informado",
          lastVisit: "Não disponível",
          nextVisit: "Não agendada",
          conditions: [],
          active: true,
          initials: "??"
        };
      }
    });
  }, [patientsData]);

  // Estado filtrado
  const [filteredPatients, setFilteredPatients] = useState<ProcessedPatient[]>(processedPatients);

  // Atualizar os pacientes filtrados quando os dados brutos mudarem
  useEffect(() => {
    if (processedPatients.length > 0) {
      if (searchQuery.trim() === '') {
        setFilteredPatients(processedPatients);
      } else {
        filterPatients(searchQuery);
      }
    }
  }, [processedPatients]);
  
  // Função para filtrar pacientes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterPatients(query);
  };
  
  // Função auxiliar para filtrar pacientes
  const filterPatients = (query: string) => {
    if (query.trim() === '') {
      setFilteredPatients(processedPatients);
    } else {
      const filtered = processedPatients.filter(
        patient => 
          patient.name.toLowerCase().includes(query) || 
          patient.email.toLowerCase().includes(query) ||
          (patient.conditions && patient.conditions.some(condition => 
            condition.toLowerCase().includes(query)
          )) ||
          patient.gender.toLowerCase().includes(query)
      );
      setFilteredPatients(filtered);
    }
  };

  // Function to render patient initials
  const PatientInitials = ({ initials, active }: { initials: string, active: boolean }) => (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white
      ${active ? 'bg-violet-500' : 'bg-gray-400'}`}>
      {initials}
    </div>
  );

  // Function to render patient conditions as badges
  const ConditionBadges = ({ conditions }: { conditions: string[] }) => (
    <div className="flex flex-wrap gap-1 mt-1">
      {conditions.map((condition, idx) => (
        <Badge key={idx} variant="outline" className="rounded-full text-xs py-0.5 px-2 bg-gray-100">
          {condition}
        </Badge>
      ))}
    </div>
  );

  // Function to render email with icon
  const EmailDisplay = ({ email }: { email: string }) => (
    <div className="flex items-center text-gray-500 text-sm">
      <Mail className="h-4 w-4 mr-1" />
      {email}
    </div>
  );

  // Function to render phone with icon
  const PhoneDisplay = ({ phone }: { phone: string }) => (
    <div className="flex items-center text-gray-500 text-sm">
      <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.9 20C10.1 20.1 3.5 13.5 3 4.9C3 4.4 3.4 4 3.9 4H7.5C7.9 4 8.3 4.3 8.4 4.7C8.6 5.5 8.9 6.3 9.2 7C9.4 7.4 9.3 7.9 9 8.2L7.5 9.7C8.3 11.1 9.5 12.3 11 13.1L12.5 11.6C12.8 11.3 13.3 11.2 13.7 11.4C14.4 11.7 15.2 12 16 12.2C16.4 12.3 16.7 12.7 16.7 13.1V16.8C16.7 17.3 16.3 17.7 15.8 17.7C15.2 17.7 14.6 17.8 13.9 17.8C13.3 17.8 12.7 17.9 12.1 17.9" 
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {phone}
    </div>
  );

  // Function to render date with icon
  const DateDisplay = ({ date, icon }: { date: string; icon: React.ReactNode }) => (
    <div className="flex items-center text-gray-500 text-sm">
      {icon}
      {date}
    </div>
  );

  // Column headers for patient list
  const columnHeaders = [
    { label: 'Paciente', sortable: true },
    { label: 'Contato', sortable: false },
    { label: 'Última Consulta', sortable: true },
    { label: 'Próxima Consulta', sortable: true },
    { label: 'Condições', sortable: false },
    { label: 'Ações', sortable: false },
  ];

  return (
    <DoctorLayout>
      <div>
        {/* Search and action buttons */}
        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Buscar pacientes..." 
              className="pl-10 py-6 rounded-lg border-gray-200 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex gap-2 justify-between">
            <Button variant="outline" className="flex items-center gap-2 border-gray-200">
              <Download className="h-5 w-5" />
              <span>Importar</span>
            </Button>
            
            <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="h-5 w-5" />
              <span>Novo Paciente</span>
            </Button>
          </div>
        </div>
        
        {/* Patients list */}
        <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          {/* Table headers */}
          <div className="grid grid-cols-6 border-b border-gray-200 py-4 px-6 text-gray-600 font-medium text-sm">
            {columnHeaders.map((header, idx) => (
              <div key={idx} className={`flex items-center gap-1 ${idx === 5 ? 'justify-end' : ''}`}>
                {header.label}
                {header.sortable && (
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
          
          {/* Estado de carregamento */}
          {(orgLoading || patientsLoading) && (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
              <p className="text-gray-500">Carregando pacientes...</p>
            </div>
          )}

          {/* Nenhuma organização */}
          {!orgLoading && !activeOrgId && (
            <div className="py-16 flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-2">Você não possui organizações ativas.</p>
              <p className="text-gray-500">Associe-se a uma organização para visualizar pacientes.</p>
            </div>
          )}
          
          {/* Nenhum paciente na organização */}
          {!orgLoading && !patientsLoading && activeOrgId && processedPatients.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center">
              <p className="text-gray-500">Nenhum paciente cadastrado nesta organização.</p>
            </div>
          )}
          
          {/* Lista de pacientes */}
          {!orgLoading && !patientsLoading && filteredPatients.length > 0 && (
            <>
              {filteredPatients.map(patient => (
                <div key={patient.id} className="grid grid-cols-6 border-b border-gray-100 py-4 px-6 items-center hover:bg-gray-50">
                  {/* Patient info */}
                  <div className="flex items-center gap-3">
                    <PatientInitials initials={patient.initials} active={patient.active} />
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-gray-500 text-sm">{patient.age} anos • {patient.gender}</div>
                      {!patient.active && (
                        <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-200">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Contact info */}
                  <div>
                    <EmailDisplay email={patient.email} />
                    <PhoneDisplay phone={patient.phone} />
                  </div>
                  
                  {/* Last appointment */}
                  <div>
                    <DateDisplay 
                      date={patient.lastVisit} 
                      icon={<Calendar className="h-4 w-4 mr-1 text-gray-400" />} 
                    />
                  </div>
                  
                  {/* Next appointment */}
                  <div>
                    {patient.nextVisit === 'Não agendada' ? (
                      <span className="text-gray-400 text-sm">Não agendada</span>
                    ) : (
                      <DateDisplay 
                        date={patient.nextVisit} 
                        icon={<Clock className="h-4 w-4 mr-1 text-gray-400" />} 
                      />
                    )}
                  </div>
                  
                  {/* Conditions */}
                  <div>
                    {patient.conditions.length > 0 ? (
                      <ConditionBadges conditions={patient.conditions} />
                    ) : (
                      <span className="text-gray-400 text-sm">Nenhuma condição registrada</span>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-5 w-5 text-gray-500" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver prontuário</DropdownMenuItem>
                        <DropdownMenuItem>Nova prescrição</DropdownMenuItem>
                        <DropdownMenuItem>Agendar consulta</DropdownMenuItem>
                        <DropdownMenuItem>Editar dados</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Busca sem resultados */}
          {!orgLoading && !patientsLoading && processedPatients.length > 0 && filteredPatients.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">Nenhum paciente encontrado para a busca "{searchQuery}".</p>
            </div>
          )}
        </Card>
      </div>
    </DoctorLayout>
  );
}