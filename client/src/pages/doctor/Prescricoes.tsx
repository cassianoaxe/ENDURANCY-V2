import React from 'react';
import { DoctorLayout } from '@/components/layout/doctor/DoctorLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrescriptionForm } from './components/PrescriptionForm';
import { PrescriptionList } from './components/PrescriptionList';

export default function PrescricoesPage() {
  return (
    <DoctorLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Prescrições</h1>
        
        <Tabs defaultValue="historico" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="historico">Histórico de Prescrições</TabsTrigger>
            <TabsTrigger value="nova">Nova Prescrição</TabsTrigger>
          </TabsList>
          
          <TabsContent value="historico" className="space-y-4">
            <PrescriptionList />
          </TabsContent>
          
          <TabsContent value="nova">
            <PrescriptionForm />
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
}