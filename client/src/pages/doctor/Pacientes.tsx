import React, { useState } from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { 
  Search, 
  Plus,
  FileText, 
  Calendar,
  MoreHorizontal,
  Filter,
  Download
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Dados de exemplo para a lista de pacientes
const patients = [
  {
    id: 1,
    name: 'João Silva',
    age: 45,
    gender: 'Masculino',
    phone: '(11) 98765-4321',
    lastVisit: '20/04/2025',
    nextVisit: '05/05/2025',
    condition: 'Hipertensão',
    status: 'Em tratamento'
  },
  {
    id: 2,
    name: 'Maria Souza',
    age: 38,
    gender: 'Feminino',
    phone: '(11) 97654-3210',
    lastVisit: '15/04/2025',
    nextVisit: '15/05/2025',
    condition: 'Diabetes',
    status: 'Em tratamento'
  },
  {
    id: 3,
    name: 'Carlos Ferreira',
    age: 52,
    gender: 'Masculino',
    phone: '(11) 96543-2109',
    lastVisit: '25/04/2025',
    nextVisit: '25/05/2025',
    condition: 'Arritmia',
    status: 'Monitoramento'
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    age: 29,
    gender: 'Feminino',
    phone: '(11) 95432-1098',
    lastVisit: '10/04/2025',
    nextVisit: 'Não agendada',
    condition: 'Check-up',
    status: 'Concluído'
  },
  {
    id: 5,
    name: 'Roberto Santos',
    age: 61,
    gender: 'Masculino',
    phone: '(11) 94321-0987',
    lastVisit: '05/04/2025',
    nextVisit: '10/05/2025',
    condition: 'Pós-cirúrgico',
    status: 'Recuperação'
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
          patient.condition.toLowerCase().includes(query) ||
          patient.status.toLowerCase().includes(query)
      );
      setFilteredPatients(filtered);
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-gray-500 text-sm">Gerencie sua lista de pacientes</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Novo Paciente</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">Lista de Pacientes</CardTitle>
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar paciente..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Condição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Consulta</TableHead>
                    <TableHead>Próxima Consulta</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map(patient => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age} anos</TableCell>
                      <TableCell>{patient.condition}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            patient.status === 'Em tratamento' ? 'bg-blue-100 text-blue-800' :
                            patient.status === 'Monitoramento' ? 'bg-purple-100 text-purple-800' :
                            patient.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                            'bg-amber-100 text-amber-800'
                          }
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>{patient.nextVisit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Ver prontuário">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Agendar consulta">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Editar dados</DropdownMenuItem>
                              <DropdownMenuItem>Histórico completo</DropdownMenuItem>
                              <DropdownMenuItem>Enviar mensagem</DropdownMenuItem>
                              <DropdownMenuItem>Adicionar observação</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredPatients.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">Nenhum paciente encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}