import React from 'react';
import { PharmacistLayout } from '@/components/layout/pharmacist/PharmacistLayout';
import { PrescriptionReview } from './components/PrescriptionReview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';

export default function PharmacistPrescriptionsPage() {
  // We could potentially fetch the pharmacist's organizations if they work for multiple
  // For now, we'll assume they can see all prescriptions they have access to
  
  return (
    <PharmacistLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Revisão de Prescrições</h1>
        
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="approved">Aprovadas</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <PrescriptionReview />
          </TabsContent>
          
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Prescrições Aprovadas</CardTitle>
                <CardDescription>Visualize todas as prescrições que você aprovou</CardDescription>
              </CardHeader>
              <CardContent>
                <PrescriptionReview />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Prescrições Rejeitadas</CardTitle>
                <CardDescription>Visualize todas as prescrições que você rejeitou</CardDescription>
              </CardHeader>
              <CardContent>
                <PrescriptionReview />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PharmacistLayout>
  );
}