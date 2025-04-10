import React from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';

export default function DoctorPacientes() {
  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Pacientes</h1>
        <p>A lista de pacientes está sendo carregada...</p>
      </div>
    </DoctorLayout>
  );
}