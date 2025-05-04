import express from 'express';
import { isAuthenticated } from '../auth-middleware';
import { db } from '../db';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(isAuthenticated);

// Obter categorias
router.get('/categories', async (req, res) => {
  try {
    // Categorias de exemplo - em produção viriam do banco de dados
    const categories = [
      { id: 1, name: 'Vidrarias', slug: 'vidrarias', iconName: 'Beaker' },
      { id: 2, name: 'Reagentes', slug: 'reagentes', iconName: 'Flask' },
      { id: 3, name: 'Equipamentos', slug: 'equipamentos', iconName: 'Microscope' },
      { id: 4, name: 'EPIs', slug: 'epis', iconName: 'ShieldAlert' },
      { id: 5, name: 'Livros Técnicos', slug: 'livros', iconName: 'BookOpen' },
      { id: 6, name: 'Consumíveis', slug: 'consumiveis', iconName: 'Package' },
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro interno ao buscar categorias' });
  }
});

// Obter produtos em destaque
router.get('/featured-products', async (req, res) => {
  try {
    // Produtos de exemplo - em produção viriam do banco de dados
    const products = [
      {
        id: 1,
        name: 'Frasco Coletor 1,300ml Aspiramax Omron',
        price: 114,
        installmentPrice: 19,
        image: '/images/lab-beaker.jpg',
        rating: 4.8,
        reviews: 25,
        freeShipping: true,
        categoryId: 1
      },
      {
        id: 2,
        name: 'Kit 5 Unid. Copo De Bécker Forma Baixa Em Vidro De 1000ml',
        price: 90,
        installmentPrice: 15,
        image: '/images/lab-beaker-kit.jpg',
        rating: 5.0,
        reviews: 2,
        freeShipping: true,
        categoryId: 1
      },
      {
        id: 3,
        name: 'Laboratório De Química Show Da Luna 24 Experiências',
        price: 77.97,
        installmentPrice: null,
        image: '/images/lab-kit.jpg',
        rating: 4.7,
        reviews: 60,
        freeShipping: true,
        discount: '40% OFF',
        originalPrice: 129.95,
        categoryId: 3
      },
      {
        id: 4,
        name: 'Becker Plastico 1000ml Graduado Polipropileno',
        price: 49.90,
        installmentPrice: 8.32,
        image: '/images/plastic-beaker.jpg',
        rating: 4.5,
        reviews: 18,
        freeShipping: true,
        categoryId: 1
      }
    ];
    
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    res.status(500).json({ message: 'Erro interno ao buscar produtos em destaque' });
  }
});

// Obter editais de compra
router.get('/announcements', async (req, res) => {
  try {
    // Editais de exemplo - em produção viriam do banco de dados
    const announcements = [
      {
        id: 101,
        title: 'Compra de 2000 frascos de reagentes químicos',
        organization: 'Associação Médica Brasileira',
        deadline: '15/05/2025',
        budget: 'R$ 15.000,00',
        status: 'Aberto para propostas'
      },
      {
        id: 102,
        title: 'Aquisição de equipamentos de laboratório',
        organization: 'Instituto de Pesquisa ABC',
        deadline: '22/05/2025',
        budget: 'R$ 50.000,00',
        status: 'Aberto para propostas'
      },
      {
        id: 103,
        title: 'Compra de material para análise cromatográfica',
        organization: 'Centro de Pesquisas XYZ',
        deadline: '10/05/2025',
        budget: 'R$ 8.500,00',
        status: 'Aberto para propostas'
      }
    ];
    
    res.json(announcements);
  } catch (error) {
    console.error('Erro ao buscar editais de compra:', error);
    res.status(500).json({ message: 'Erro interno ao buscar editais de compra' });
  }
});

// Obter detalhes de um edital específico
router.get('/announcements/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Simulação - em produção buscaria do banco de dados com o ID fornecido
    const announcement = {
      id: 101,
      title: 'Compra de 2000 frascos de reagentes químicos',
      organization: 'Associação Médica Brasileira',
      published: '01/05/2025',
      deadline: '15/05/2025',
      closeTime: '18:00',
      budget: 'R$ 15.000,00',
      status: 'Aberto para propostas',
      description: `
        A Associação Médica Brasileira está abrindo um edital para a compra de 2000 frascos de reagentes químicos para uso em laboratórios de pesquisa médica.
        
        ## Especificações técnicas:
        
        - 1000 frascos de álcool etílico 95% - 500ml
        - 500 frascos de formaldeído 37% - 1L
        - 500 frascos de xilol - 1L
        
        Os produtos devem atender às normas de qualidade estabelecidas pela ANVISA e possuir registro no Ministério da Saúde quando aplicável.
        
        ## Prazo de entrega:
        
        Os produtos devem ser entregues em até 15 dias após a aprovação da proposta.
        
        ## Critérios de seleção:
        
        A seleção da proposta vencedora será feita com base no menor preço global, desde que atendidas todas as especificações técnicas.
        
        ## Documentação necessária:
        
        - Comprovante de regularidade fiscal
        - Certificado de boas práticas de fabricação
        - Ficha técnica dos produtos
        
        A entrega deve ser feita na sede da Associação Médica Brasileira, localizada na Rua Radialista Antônio Assunção, 1500, São Paulo/SP.
      `,
      attachments: [
        { name: 'Edital_completo.pdf', size: '1.2 MB' },
        { name: 'Modelo_de_proposta.docx', size: '250 KB' },
        { name: 'Ficha_técnica_exemplo.pdf', size: '500 KB' }
      ],
      proposals: [
        { id: 1, supplier: 'Laboratório Industrial XYZ', date: '02/05/2025', status: 'Em análise' },
        { id: 2, supplier: 'Química Brasil LTDA', date: '03/05/2025', status: 'Em análise' },
      ]
    };
    
    // Se não encontrar o edital (em produção)
    if (id !== 101 && id !== announcement.id) {
      return res.status(404).json({ message: 'Edital não encontrado' });
    }
    
    res.json(announcement);
  } catch (error) {
    console.error('Erro ao buscar detalhes do edital:', error);
    res.status(500).json({ message: 'Erro interno ao buscar detalhes do edital' });
  }
});

// Enviar proposta para um edital
router.post('/announcements/:id/proposals', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { price, deliveryTime, description } = req.body;
    
    // Validar dados
    if (!price || !deliveryTime || !description) {
      return res.status(400).json({ message: 'Campos obrigatórios não informados' });
    }
    
    // Simulação - em produção salvaria no banco de dados
    // e retornaria o ID da proposta criada
    res.status(201).json({ 
      message: 'Proposta enviada com sucesso',
      proposalId: Math.floor(Math.random() * 1000),
      status: 'Em análise' 
    });
  } catch (error) {
    console.error('Erro ao enviar proposta:', error);
    res.status(500).json({ message: 'Erro interno ao enviar proposta' });
  }
});

// Buscar produtos
router.get('/products', async (req, res) => {
  try {
    const { query, category, page = 1, limit = 20 } = req.query;
    
    // Lógica de busca - em produção buscaria do banco de dados
    // com filtros por nome do produto e categoria
    
    // Simulação de produtos para demonstração
    const products = [
      {
        id: 1,
        name: 'Frasco Coletor 1,300ml Aspiramax Omron',
        price: 114,
        installmentPrice: 19,
        image: '/images/lab-beaker.jpg',
        rating: 4.8,
        reviews: 25,
        freeShipping: true,
        categoryId: 1
      },
      {
        id: 2,
        name: 'Kit 5 Unid. Copo De Bécker Forma Baixa Em Vidro De 1000ml',
        price: 90,
        installmentPrice: 15,
        image: '/images/lab-beaker-kit.jpg',
        rating: 5.0,
        reviews: 2,
        freeShipping: true,
        categoryId: 1
      },
      // mais produtos...
    ];
    
    res.json({
      products,
      totalItems: products.length,
      totalPages: 1,
      currentPage: 1
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro interno ao buscar produtos' });
  }
});

// Obter detalhes de um produto
router.get('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Lógica de busca - em produção buscaria do banco de dados com base no ID
    
    // Simulação - produto exemplo para demonstração
    const product = {
      id: 1,
      name: 'Frasco Coletor 1,300ml Aspiramax Omron',
      description: 'Frasco coletor para uso em aspiradores de secreção, com capacidade de 1,300ml. Compatível com equipamentos Aspiramax e Omron.',
      price: 114,
      installmentPrice: 19,
      installments: 6,
      image: '/images/lab-beaker.jpg',
      images: [
        '/images/lab-beaker.jpg',
        '/images/lab-beaker-side.jpg',
        '/images/lab-beaker-top.jpg'
      ],
      rating: 4.8,
      reviews: 25,
      freeShipping: true,
      stock: 50,
      categoryId: 1,
      categoryName: 'Vidrarias',
      seller: {
        id: 5,
        name: 'Medical Supplies Inc.',
        rating: 4.7,
        sales: 324,
        joinedDate: '2023-09-15'
      },
      specifications: [
        { name: 'Material', value: 'Vidro borossilicato' },
        { name: 'Capacidade', value: '1,300ml' },
        { name: 'Graduação', value: 'Sim' },
        { name: 'Autoclavável', value: 'Sim' },
        { name: 'Dimensões', value: '15cm x 10cm' },
        { name: 'Peso', value: '350g' }
      ]
    };
    
    // Se não encontrar o produto
    if (id !== 1 && id !== product.id) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar detalhes do produto:', error);
    res.status(500).json({ message: 'Erro interno ao buscar detalhes do produto' });
  }
});

// Adicionar ao carrinho
router.post('/cart/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validar dados
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Produto e quantidade são obrigatórios' });
    }
    
    // Simulação - em produção adicionaria ao carrinho no banco de dados
    res.status(201).json({ 
      message: 'Produto adicionado ao carrinho',
      cartItemId: Math.floor(Math.random() * 1000),
      totalItems: 1
    });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar ao carrinho' });
  }
});

// Obter carrinho
router.get('/cart', async (req, res) => {
  try {
    // Simulação - em produção buscaria do banco de dados
    const cart = {
      items: [
        {
          id: 1,
          productId: 1,
          name: 'Frasco Coletor 1,300ml Aspiramax Omron',
          price: 114,
          quantity: 2,
          image: '/images/lab-beaker.jpg'
        }
      ],
      subtotal: 228,
      shipping: 0,
      total: 228
    };
    
    res.json(cart);
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ message: 'Erro interno ao buscar carrinho' });
  }
});

// Exportar como default
export default router;