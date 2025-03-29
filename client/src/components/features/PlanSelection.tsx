import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';
import { fetchPlans } from '@/lib/stripeClient';
import { Plan } from '@shared/schema';
import { Spinner } from '@/components/ui/spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlanSelectionProps {
  onPlanSelected: (plan: Plan) => void;
  onBack: () => void;
}

export default function PlanSelection({ onPlanSelected, onBack }: PlanSelectionProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const plansData = await fetchPlans();
        setPlans(plansData);
        
        // Select the first plan by default if there are plans
        if (plansData.length > 0) {
          setSelectedPlanId(plansData[0].id);
        }
      } catch (err) {
        console.error('Error loading plans:', err);
        setError('Não foi possível carregar os planos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    
    loadPlans();
  }, []);

  const handleContinue = () => {
    if (selectedPlanId) {
      const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
      if (selectedPlan) {
        onPlanSelected(selectedPlan);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner size="lg" className="mb-4" />
        <p>Carregando planos disponíveis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Selecione um Plano</h2>
      
      <RadioGroup
        value={selectedPlanId?.toString()}
        onValueChange={(value) => setSelectedPlanId(parseInt(value))}
        className="grid md:grid-cols-3 gap-6 mb-6"
      >
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            <RadioGroupItem
              value={plan.id.toString()}
              id={`plan-${plan.id}`}
              className="sr-only"
            />
            <label
              htmlFor={`plan-${plan.id}`}
              className={`block cursor-pointer ${
                selectedPlanId === plan.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              } h-full`}
            >
              <Card className="h-full border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">R$ {plan.price}</span>
                    <span className="text-sm font-normal">/mês</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {selectedPlanId === plan.id && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                      Selecionado
                    </div>
                  )}
                </CardFooter>
              </Card>
            </label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!selectedPlanId}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}