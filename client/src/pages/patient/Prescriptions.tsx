import React from 'react';
import { PatientLayout } from '@/components/layout/patient/PatientLayout';
import { PatientPrescriptionList } from './components/PatientPrescriptionList';

export default function PatientPrescriptionsPage() {
  return (
    <PatientLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Minhas Prescrições</h1>
        <PatientPrescriptionList />
      </div>
    </PatientLayout>
  );
}