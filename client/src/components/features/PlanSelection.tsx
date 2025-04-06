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
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  onClose: () => void;
}

export default function PlanSelection({ plans, onSelectPlan, onClose }: PlanSelectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrar apenas os planos Freemium, Seed, Grow e Pro
  const allowedTiers = ['free', 'seed', 'grow', 'pro'];
  const filteredPlans = plans.filter(plan => allowedTiers.includes(plan.tier));
  
  useEffect(() => {
    // Definir o plano padrão quando os planos são carregados
    if (filteredPlans.length > 0 && !selectedPlanId) {
      // Ordenar os planos por nível: Free, Seed, Grow, Pro
      const tierOrder = { free: 1, seed: 2, grow: 3, pro: 4 };
      const sortedPlans = [...filteredPlans].sort((a, b) => 
        tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder]
      );
      
      setSelectedPlanId(sortedPlans[0].id);
    }
  }, [filteredPlans, selectedPlanId]);

  const handleContinue = () => {
    if (selectedPlanId) {
      const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
      if (selectedPlan) {
        onSelectPlan(selectedPlan);
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
        onValueChange={(value) => {
          setSelectedPlanId(parseInt(value));
          // Chama automaticamente handleContinue quando o plano é selecionado
          setTimeout(() => {
            if (parseInt(value)) {
              const selectedPlan = plans.find(plan => plan.id === parseInt(value));
              if (selectedPlan) {
                onSelectPlan(selectedPlan);
              }
            }
          }, 300);
        }}
        className="grid md:grid-cols-4 gap-4 mb-6"
      >
        {filteredPlans.map((plan) => (
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
        <Button variant="outline" onClick={onClose}>
          Voltar
        </Button>
        {/* Botão de Continuar removido para evitar duplicação com o botão da tela de registro */}
      </div>
    </div>
  );
}