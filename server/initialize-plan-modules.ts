import { db } from "./db";
import { planModules } from "@shared/schema";

/**
 * Esta função inicializa a associação entre planos e módulos
 */
export async function initializePlanModules() {
  try {
    // Verificar se já existem associações entre planos e módulos
    const existingPlanModules = await db.select().from(planModules);
    
    if (existingPlanModules.length === 0) {
      console.log("Inicializando associações entre planos e módulos...");
      
      // Módulos básicos que estarão presentes em todos os planos
      const basicModuleIds = [4, 13, 19]; // CRM e Tarefas
      
      // Módulos do plano Freemium (id: 8)
      // Apenas os módulos básicos
      for (const moduleId of basicModuleIds) {
        await db.insert(planModules).values({
          plan_id: 8, // Freemium
          module_id: moduleId,
        });
      }
      
      // Módulos do plano Seed (id: 5)
      // Módulos básicos + financeiro + patrimônio como adicional
      const seedModuleIds = [...basicModuleIds, 16, 17]; // + Social + Transparência
      for (const moduleId of seedModuleIds) {
        await db.insert(planModules).values({
          plan_id: 5, // Seed
          module_id: moduleId,
        });
      }
      
      // Módulos do plano Grow (id: 6)
      // Todos os do Seed + cultivo e produção
      const growModuleIds = [...seedModuleIds, 2, 3, 11, 12]; // + Cultivo e Produção
      for (const moduleId of growModuleIds) {
        await db.insert(planModules).values({
          plan_id: 6, // Grow
          module_id: moduleId,
        });
      }
      
      // Módulos do plano Pro (id: 7)
      // Todos do Grow + patrimônio incluído + portal do médico
      const proModuleIds = [...growModuleIds, 21, 25]; // + Patrimônio e Portal do Médico
      for (const moduleId of proModuleIds) {
        await db.insert(planModules).values({
          plan_id: 7, // Pro
          module_id: moduleId,
        });
      }
      
      // Módulos do plano Enterprise (id: 9)
      // Todos os módulos disponíveis
      const allModuleIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
      for (const moduleId of allModuleIds) {
        await db.insert(planModules).values({
          plan_id: 9, // Enterprise
          module_id: moduleId,
        });
      }
      
      console.log("Associações entre planos e módulos criadas com sucesso!");
    } else {
      console.log(`${existingPlanModules.length} associações entre planos e módulos já existem no sistema.`);
    }
  } catch (error) {
    console.error("Erro ao inicializar associações entre planos e módulos:", error);
  }
}