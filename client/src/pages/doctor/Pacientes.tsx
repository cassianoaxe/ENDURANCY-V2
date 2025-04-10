import React, { useState } from 'react';
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
  Filter
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

// Dados de exemplo para a lista de pacientes
const patients = [
  {
    id: 1,
    name: 'Maria Oliveira',
    age: 39,
    gender: 'Feminino',
    email: 'maria.oliveira@email.com',
    phone: '(11) 98765-4321',
    lastVisit: '29/02/2024',
    nextVisit: '31/03/2024',
    conditions: ['Ansiedade', 'Insônia'],
    active: true,
    initials: 'MO'
  },
  {
    id: 2,
    name: 'João Santos',
    age: 51,
    gender: 'Masculino',
    email: 'joao.santos@email.com',
    phone: '(11) 91234-5678',
    lastVisit: '09/02/2024',
    nextVisit: '09/05/2024',
    conditions: ['Dor Crônica', 'Artrite'],
    active: true,
    initials: 'JS'
  },
  {
    id: 3,
    name: 'Ana Pereira',
    age: 34,
    gender: 'Feminino',
    email: 'ana.pereira@email.com',
    phone: '(11) 98888-7777',
    lastVisit: '19/01/2024',
    nextVisit: '19/04/2024',
    conditions: ['Epilepsia', 'Ansiedade'],
    active: true,
    initials: 'AP'
  },
  {
    id: 4,
    name: 'Carlos Mendes',
    age: 58,
    gender: 'Masculino',
    email: 'carlos.mendes@email.com',
    phone: '(11) 97777-6666',
    lastVisit: '14/12/2023',
    nextVisit: '14/03/2024',
    conditions: ['Parkinson', 'Hipertensão'],
    active: true,
    initials: 'CM'
  },
  {
    id: 5,
    name: 'Paulo Silva',
    age: 36,
    gender: 'Masculino',
    email: 'paulo.silva@email.com',
    phone: '(11) 95555-4444',
    lastVisit: '04/11/2023',
    nextVisit: 'Não agendada',
    conditions: ['TDAH', 'Insônia'],
    active: false,
    initials: 'PS'
  },
];

export default function DoctorPacientes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients);
  
  // Função para filtrar pacientes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        patient => 
          patient.name.toLowerCase().includes(query) || 
          patient.email.toLowerCase().includes(query) ||
          patient.conditions.some(condition => condition.toLowerCase().includes(query)) ||
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
      <div className="p-6">
        {/* Header section with title and buttons */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pacientes</h1>
          
          <div className="flex items-center gap-2">
            <BellRing className="text-gray-400 h-6 w-6 mr-2" />
            <div className="bg-purple-600 text-white h-10 w-10 rounded-full flex items-center justify-center">
              JS
            </div>
            <div className="text-sm">
              Dr. João Silva
            </div>
          </div>
        </div>

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
          
          {/* Patient rows */}
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
                <ConditionBadges conditions={patient.conditions} />
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
                    <DropdownMenuItem>Agendar consulta</DropdownMenuItem>
                    <DropdownMenuItem>Editar dados</DropdownMenuItem>
                    <DropdownMenuItem>Enviar mensagem</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          
          {filteredPatients.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">Nenhum paciente encontrado.</p>
            </div>
          )}
        </Card>
      </div>
    </DoctorLayout>
  );
}