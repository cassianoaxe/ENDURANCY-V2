// Componente de Calendário Financeiro
const FinancialCalendar = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário Financeiro</CardTitle>
          <CardDescription>Visualize todos os eventos financeiros importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center h-80">
            <div className="text-center">
              <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Calendário Financeiro</h3>
              <p className="text-gray-500 mt-1">O calendário financeiro será implementado em breve.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de Conciliação Bancária
const BankReconciliation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conciliação Bancária</CardTitle>
          <CardDescription>Reconcilie transações bancárias com registros financeiros internos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center h-80">
            <div className="text-center">
              <CreditCard className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Conciliação Bancária</h3>
              <p className="text-gray-500 mt-1">O sistema de conciliação bancária será implementado em breve.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de Análise com IA
const AIAnalysis = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise Financeira com IA</CardTitle>
          <CardDescription>Obtenha insights inteligentes sobre seus dados financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center h-80">
            <div className="text-center">
              <Brain className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Análise com IA</h3>
              <p className="text-gray-500 mt-1">O sistema de análise com IA será implementado em breve.</p>
              <Button variant="outline" className="mt-4">
                <Brain className="h-4 w-4 mr-2" />
                Solicitar Análise
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de Configurações Financeiras
const FinancialSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Financeiras</CardTitle>
          <CardDescription>Configure opções e preferências do módulo financeiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Categorias Financeiras</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <h4 className="font-medium">Categorias de Receitas</h4>
                  <p className="text-sm text-gray-500">Gerencie as categorias para contas a receber</p>
                  <Button variant="link" size="sm" className="px-0">
                    Gerenciar
                  </Button>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="font-medium">Categorias de Despesas</h4>
                  <p className="text-sm text-gray-500">Gerencie as categorias para contas a pagar</p>
                  <Button variant="link" size="sm" className="px-0">
                    Gerenciar
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Integrações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <h4 className="font-medium">Integração Bancária</h4>
                  <p className="text-sm text-gray-500">Conecte sua conta bancária para sincronização automática</p>
                  <Button variant="link" size="sm" className="px-0">
                    Configurar
                  </Button>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="font-medium">Contabilidade</h4>
                  <p className="text-sm text-gray-500">Integre com sistema contábil externo</p>
                  <Button variant="link" size="sm" className="px-0">
                    Configurar
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preferências</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações Financeiras</h4>
                    <p className="text-sm text-gray-500">Receba alertas sobre contas e transações</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios Automáticos</h4>
                    <p className="text-sm text-gray-500">Gere relatórios mensais automaticamente</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Visão em Dólares</h4>
                    <p className="text-sm text-gray-500">Exibir valores também em dólares (USD)</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};