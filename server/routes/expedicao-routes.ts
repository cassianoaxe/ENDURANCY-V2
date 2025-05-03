import express, { Express } from 'express';
import { db } from '../db';
import { format, subDays, subMonths, subWeeks, subYears } from 'date-fns';

const router = express.Router();

export function registerExpedicaoRoutes(app: Express) {
  app.use(router);
  console.log("Rotas do módulo de expedição registradas com sucesso");
  return router;
}

// Endpoint para obter dados de expedição por estado
router.get('/api/expedicao/envios-por-estado/:period', async (req, res) => {
  try {
    console.log('Recebida requisição para /api/expedicao/envios-por-estado/:period', { 
      params: req.params,
      headers: req.headers['user-agent']
    });
    
    // O período pode ser 'daily', 'weekly', 'monthly' ou 'yearly'
    const period = req.params.period || 'monthly';
    console.log('Período selecionado:', period);
    
    // Em uma implementação real, aqui você buscaria os dados do banco
    // Simulando dados para desenvolvimento
    const states = [
      { id: 'SP', name: 'São Paulo', value: Math.floor(Math.random() * 1000) + 800 },
      { id: 'RJ', name: 'Rio de Janeiro', value: Math.floor(Math.random() * 400) + 600 },
      { id: 'MG', name: 'Minas Gerais', value: Math.floor(Math.random() * 300) + 400 },
      { id: 'BA', name: 'Bahia', value: Math.floor(Math.random() * 200) + 300 },
      { id: 'RS', name: 'Rio Grande do Sul', value: Math.floor(Math.random() * 150) + 250 },
      { id: 'PR', name: 'Paraná', value: Math.floor(Math.random() * 150) + 250 },
      { id: 'PE', name: 'Pernambuco', value: Math.floor(Math.random() * 100) + 200 },
      { id: 'CE', name: 'Ceará', value: Math.floor(Math.random() * 100) + 180 },
      { id: 'SC', name: 'Santa Catarina', value: Math.floor(Math.random() * 80) + 180 },
      { id: 'GO', name: 'Goiás', value: Math.floor(Math.random() * 80) + 160 },
      { id: 'PA', name: 'Pará', value: Math.floor(Math.random() * 60) + 140 },
      { id: 'MA', name: 'Maranhão', value: Math.floor(Math.random() * 50) + 120 },
      { id: 'DF', name: 'Distrito Federal', value: Math.floor(Math.random() * 50) + 110 },
      { id: 'ES', name: 'Espírito Santo', value: Math.floor(Math.random() * 50) + 100 },
      { id: 'PB', name: 'Paraíba', value: Math.floor(Math.random() * 40) + 90 },
      { id: 'AM', name: 'Amazonas', value: Math.floor(Math.random() * 40) + 80 },
      { id: 'RN', name: 'Rio Grande do Norte', value: Math.floor(Math.random() * 30) + 80 },
      { id: 'MT', name: 'Mato Grosso', value: Math.floor(Math.random() * 30) + 70 },
      { id: 'AL', name: 'Alagoas', value: Math.floor(Math.random() * 30) + 70 },
      { id: 'PI', name: 'Piauí', value: Math.floor(Math.random() * 20) + 60 },
      { id: 'MS', name: 'Mato Grosso do Sul', value: Math.floor(Math.random() * 20) + 50 },
      { id: 'SE', name: 'Sergipe', value: Math.floor(Math.random() * 20) + 40 },
      { id: 'RO', name: 'Rondônia', value: Math.floor(Math.random() * 15) + 40 },
      { id: 'TO', name: 'Tocantins', value: Math.floor(Math.random() * 15) + 30 },
      { id: 'AC', name: 'Acre', value: Math.floor(Math.random() * 10) + 20 },
      { id: 'AP', name: 'Amapá', value: Math.floor(Math.random() * 10) + 15 },
      { id: 'RR', name: 'Roraima', value: Math.floor(Math.random() * 10) + 10 }
    ];
    
    // Definir explicitamente o cabeçalho de conteúdo como JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(states);
  } catch (error) {
    console.error('Erro ao buscar dados de expedição por estado:', error);
    res.status(500).json({ error: 'Erro ao buscar dados de expedição' });
  }
});

// Endpoint para obter estatísticas de expedição
router.get('/api/expedicao/shipment-stats', async (req, res) => {
  try {
    // O período pode ser 'daily', 'weekly', 'monthly' ou 'yearly'
    const period = req.query.period as string || 'monthly';
    
    // Obter a data de referência com base no período
    const today = new Date();
    let startDate: Date;
    let labelFormat: string;
    let dataPoints: number;
    
    switch (period) {
      case 'daily':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        labelFormat = 'HH';
        dataPoints = 10;
        break;
      case 'weekly':
        startDate = subDays(today, 7);
        labelFormat = 'EEE';
        dataPoints = 7;
        break;
      case 'monthly':
        startDate = subMonths(today, 1);
        labelFormat = 'dd/MM';
        dataPoints = 15;
        break;
      case 'yearly':
        startDate = subYears(today, 1);
        labelFormat = 'MMM';
        dataPoints = 12;
        break;
      default:
        startDate = subMonths(today, 1);
        labelFormat = 'dd/MM';
        dataPoints = 15;
    }
    
    // Gerar dados de exemplo para o gráfico de barras
    const shipmentsByDay = [];
    for (let i = 0; i < dataPoints; i++) {
      let date: Date;
      let name: string;
      
      if (period === 'daily') {
        date = new Date(startDate);
        date.setHours(startDate.getHours() + i);
        name = format(date, labelFormat) + 'h';
      } else if (period === 'weekly') {
        date = subDays(today, 6 - i);
        name = format(date, labelFormat);
      } else if (period === 'monthly') {
        date = subDays(today, 14 - i);
        name = format(date, labelFormat);
      } else {
        date = new Date(today.getFullYear(), i, 1);
        name = format(date, labelFormat);
      }
      
      const enviados = Math.floor(Math.random() * 40) + 10;
      const entregues = Math.floor(Math.random() * enviados);
      
      shipmentsByDay.push({
        name,
        enviados,
        entregues
      });
    }
    
    // Dados do gráfico de pizza para status dos envios
    const totalEnviados = shipmentsByDay.reduce((sum, day) => sum + day.enviados, 0);
    const totalEntregues = shipmentsByDay.reduce((sum, day) => sum + day.entregues, 0);
    const emTransito = Math.floor(totalEnviados * 0.3);
    const pendentes = Math.floor(totalEnviados * 0.15);
    const atrasados = totalEnviados - totalEntregues - emTransito - pendentes;
    
    const shipmentsByStatus = [
      { name: 'Entregue', value: totalEntregues, color: '#4CAF50' },
      { name: 'Em trânsito', value: emTransito, color: '#2196F3' },
      { name: 'Pendente', value: pendentes, color: '#FFC107' },
      { name: 'Atrasado', value: atrasados, color: '#F44336' }
    ];
    
    // Calcular estatísticas gerais
    const totalShipments = totalEnviados;
    const completedShipments = totalEntregues;
    const inProgressShipments = totalShipments - completedShipments;
    const averageDeliveryTime = Number((Math.random() * 2 + 2).toFixed(1)); // Entre 2 e 4 dias
    
    // Retornar estatísticas
    // Definir explicitamente o cabeçalho de conteúdo como JSON
    res.setHeader('Content-Type', 'application/json');
    res.json({
      shipmentsByDay,
      shipmentsByStatus,
      totalShipments,
      completedShipments,
      inProgressShipments,
      averageDeliveryTime
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de expedição:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de expedição' });
  }
});

// Endpoint para obter dados da jornada de um envio específico
router.get('/api/expedicao/shipment-journey/:id?', async (req, res) => {
  try {
    // O id do envio é opcional - se não fornecido, retorna um envio de exemplo
    const shipmentId = req.params.id;
    console.log('Recebida requisição para /api/expedicao/shipment-journey', { 
      params: req.params,
      headers: req.headers['user-agent']
    });
    
    // Em uma implementação real, aqui você buscaria os dados do banco
    // Simulando dados para desenvolvimento
    const mockShipment = {
      id: shipmentId ? parseInt(shipmentId) : 1,
      tracking_code: 'BR564897654321',
      origin: {
        city: 'São Paulo',
        state: 'SP',
        coordinates: [-30, 15]
      },
      destination: {
        city: 'Rio de Janeiro',
        state: 'RJ',
        coordinates: [15, 10]
      },
      steps: [
        {
          id: 1,
          type: 'pickup',
          location: {
            city: 'São Paulo',
            state: 'SP',
            coordinates: [-30, 15]
          },
          timestamp: '2025-05-01T08:30:00',
          description: 'Pacote coletado em São Paulo',
          status: 'completed'
        },
        {
          id: 2,
          type: 'transit',
          location: {
            city: 'Em trânsito',
            state: 'SP',
            coordinates: [-15, 13]
          },
          timestamp: '2025-05-01T14:20:00',
          description: 'Em trânsito para centro de distribuição',
          status: 'completed'
        },
        {
          id: 3,
          type: 'warehouse',
          location: {
            city: 'Resende',
            state: 'RJ',
            coordinates: [0, 12]
          },
          timestamp: '2025-05-02T07:15:00',
          description: 'Chegou ao centro de distribuição em Resende',
          status: 'in_progress'
        },
        {
          id: 4,
          type: 'transit',
          location: {
            city: 'Em trânsito',
            state: 'RJ',
            coordinates: [10, 10]
          },
          timestamp: '2025-05-02T16:45:00',
          description: 'Em trânsito para o destino final',
          status: 'upcoming'
        },
        {
          id: 5,
          type: 'delivery',
          location: {
            city: 'Rio de Janeiro',
            state: 'RJ',
            coordinates: [15, 10]
          },
          timestamp: '2025-05-03T10:00:00',
          description: 'Entrega prevista no Rio de Janeiro',
          status: 'upcoming'
        }
      ],
      status: 'in_transit',
      estimated_delivery: '2025-05-03T10:00:00'
    };
    
    // Definir explicitamente o cabeçalho de conteúdo como JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(mockShipment);
  } catch (error) {
    console.error('Erro ao buscar dados da jornada de envio:', error);
    res.status(500).json({ error: 'Erro ao buscar dados da jornada de envio' });
  }
});

export default router;