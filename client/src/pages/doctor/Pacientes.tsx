import React, { useState, useEffect } from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { User, Search, Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Dados de exemplo para pacientes
const mockPatients = [
  { id: 1, name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 98765-4321', lastVisit: '15/03/2025', nextVisit: '15/06/2025' },
  { id: 2, name: 'João Santos', email: 'joao@email.com', phone: '(11) 98765-1234', lastVisit: '10/03/2025', nextVisit: '10/06/2025' },
  { id: 3, name: 'Ana Oliveira', email: 'ana@email.com', phone: '(11) 91234-5678', lastVisit: '05/03/2025', nextVisit: '05/06/2025' },
];

export default function DoctorPacientes() {
  console.log('Componente DoctorPacientes sendo renderizado');
  const [patients, setPatients] = useState(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('DoctorPacientes montado');
    // Aqui poderia carregar os pacientes do servidor
    return () => {
      console.log('DoctorPacientes desmontado');
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setPatients(mockPatients);
    } else {
      const filtered = mockPatients.filter(
        patient => 
          patient.name.toLowerCase().includes(query) || 
          patient.email.toLowerCase().includes(query)
      );
      setPatients(filtered);
    }
  };

  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Pacientes</h1>
        
        {/* Barra de pesquisa */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Buscar pacientes..." 
            className="pl-10 py-2 rounded-lg border-gray-200 w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        {/* Lista de pacientes */}
        <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-5 border-b border-gray-200 py-3 px-4 bg-gray-50 text-gray-600 font-medium text-sm">
            <div>Nome</div>
            <div>Contato</div>
            <div>Última Consulta</div>
            <div>Próxima Consulta</div>
            <div>Ações</div>
          </div>
          
          {/* Linhas da tabela */}
          {patients.map(patient => (
            <div key={patient.id} className="grid grid-cols-5 border-b border-gray-100 py-3 px-4 items-center hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-700 h-8 w-8 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div>{patient.name}</div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div>{patient.email}</div>
                <div>{patient.phone}</div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                {patient.lastVisit}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                {patient.nextVisit}
              </div>
              
              <div>
                <Button variant="outline" size="sm" className="text-xs">
                  Ver detalhes
                </Button>
              </div>
            </div>
          ))}
          
          {patients.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Nenhum paciente encontrado.
            </div>
          )}
        </Card>
      </div>
    </DoctorLayout>
  );
}