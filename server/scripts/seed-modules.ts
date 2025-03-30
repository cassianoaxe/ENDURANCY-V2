import { db } from "../db";
import { modules, modulePlans } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Lista de módulos baseada na imagem fornecida
const modulesList = [
  {
    name: "Módulo Compras",
    type: "compras" as const,
    description: "Gerencie compras, fornecedores e estoque com eficiência.",
    iconName: "shopping-cart",
    isActive: true
  },
  {
    name: "Cultivo",
    type: "cultivo" as const,
    description: "Controle e monitore plantações, colheitas e ciclos de cultivo.",
    iconName: "leaf",
    isActive: true
  },
  {
    name: "Produção",
    type: "producao" as const,
    description: "Gerencie processos produtivos, maquinário e controle de qualidade.",
    iconName: "bar-chart",
    isActive: true
  },
  {
    name: "CRM",
    type: "crm" as const,
    description: "Gerencie relacionamento com clientes, vendas e oportunidades.",
    iconName: "heart",
    isActive: true
  },
  {
    name: "RH",
    type: "rh" as const,
    description: "Administre colaboradores, recrutamento e treinamentos.",
    iconName: "briefcase",
    isActive: true
  },
  {
    name: "Jurídico",
    type: "juridico" as const,
    description: "Gerencie contratos, processos e obrigações legais.",
    iconName: "scale",
    isActive: true
  },
  {
    name: "Social",
    type: "social" as const,
    description: "Gerencie programas sociais, doações e impacto comunitário.",
    iconName: "heart",
    isActive: true
  },
  {
    name: "Transparência",
    type: "transparencia" as const,
    description: "Mantenha transparência em operações e prestação de contas.",
    iconName: "eye",
    isActive: true
  },
  {
    name: "Inteligência Artificial",
    type: "inteligencia_artificial" as const,
    description: "Utilize IA para análise de dados e automação de processos.",
    iconName: "cpu",
    isActive: true
  }
];

// Função para gerar planos para cada módulo
async function createModuleWithPlans(moduleData: typeof modulesList[0]) {
  try {
    // Verificar se o módulo já existe
    const existingModules = await db.select().from(modules).where(eq(modules.type, moduleData.type));
    
    let moduleId: number;
    
    if (existingModules.length > 0) {
      // Se já existe, usar o ID existente
      console.log(`Módulo ${moduleData.name} já existe, atualizando dados...`);
      const [updatedModule] = await db
        .update(modules)
        .set(moduleData)
        .where(eq(modules.type, moduleData.type))
        .returning();
      moduleId = updatedModule.id;
    } else {
      // Criar novo módulo
      console.log(`Criando módulo ${moduleData.name}...`);
      const [newModule] = await db
        .insert(modules)
        .values(moduleData)
        .returning();
      moduleId = newModule.id;
    }
    
    // Criar os três planos para o módulo (Básico, Profissional, Empresarial)
    const plansData = [
      {
        moduleId,
        name: "Básico",
        description: `Plano básico para o módulo ${moduleData.name}`,
        price: "99.90",
        billingCycle: "monthly",
        features: ["Recursos essenciais", "Suporte básico", "1 GB de armazenamento"],
        maxUsers: 3,
        isPopular: false,
        isActive: true
      },
      {
        moduleId,
        name: "Profissional",
        description: `Plano profissional para o módulo ${moduleData.name} com mais recursos`,
        price: "249.90",
        billingCycle: "monthly",
        features: [
          "Todos os recursos do plano Básico",
          "Relatórios avançados",
          "10 GB de armazenamento",
          "Suporte prioritário"
        ],
        maxUsers: 10,
        isPopular: true,
        isActive: true
      },
      {
        moduleId,
        name: "Empresarial",
        description: `Plano empresarial completo para o módulo ${moduleData.name}`,
        price: "599.90",
        billingCycle: "monthly",
        features: [
          "Todos os recursos do plano Profissional",
          "API para integrações",
          "50 GB de armazenamento",
          "Suporte 24/7",
          "Treinamento personalizado"
        ],
        maxUsers: 30,
        isPopular: false,
        isActive: true
      }
    ];
    
    // Verificar e criar/atualizar planos
    for (const planData of plansData) {
      const existingPlans = await db
        .select()
        .from(modulePlans)
        .where(
          and(
            eq(modulePlans.moduleId, moduleId),
            eq(modulePlans.name, planData.name)
          )
        );
      
      if (existingPlans.length > 0) {
        console.log(`Plano ${planData.name} para o módulo ${moduleData.name} já existe, atualizando...`);
        await db
          .update(modulePlans)
          .set(planData)
          .where(eq(modulePlans.id, existingPlans[0].id));
      } else {
        console.log(`Criando plano ${planData.name} para o módulo ${moduleData.name}...`);
        await db
          .insert(modulePlans)
          .values(planData);
      }
    }
    
    console.log(`Módulo ${moduleData.name} e seus planos criados/atualizados com sucesso!`);
  } catch (error) {
    console.error(`Erro ao criar/atualizar módulo ${moduleData.name}:`, error);
  }
}

// Função principal para executar o seed
async function seedModules() {
  console.log("Iniciando seed de módulos e planos...");
  
  for (const moduleData of modulesList) {
    await createModuleWithPlans(moduleData);
  }
  
  console.log("Seed de módulos e planos concluído!");
}

// Executar o seed
seedModules()
  .then(() => {
    console.log("Processo finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro durante o processo de seed:", error);
    process.exit(1);
  });