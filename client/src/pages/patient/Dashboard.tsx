import React from 'react';
import { PatientLayout } from '@/components/layout/patient/PatientLayout';

export default function PatientDashboard() {
  return (
    <PatientLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Patient Dashboard</h1>
        <p>This is a placeholder for the patient dashboard.</p>
      </div>
    </PatientLayout>
  );
}