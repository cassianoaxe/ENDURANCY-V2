// Arquivo para combinar todos os schemas do projeto
import { relations } from 'drizzle-orm';

// Importando os schemas principais
import * as baseSchema from './schema';

// Importando o schema de HPLC
import * as hplcSchema from './schema-hplc';

// Importando o schema de afiliação de médicos
import * as doctorAffiliationSchema from './schema-doctor-affiliation';

// Importando o schema de equipamentos de laboratório
import * as labEquipmentSchema from './schema-lab-equipment';

// Importando o schema de compras e estoque
import * as comprasSchema from './schema-compras';

// Importando o schema de tarefas
import * as tarefasSchema from './schema-tarefas';

// Importando o schema de transparência 
import * as transparenciaSchema from './schema-transparencia';

// Importando o schema de patrimônio
import * as patrimonioSchema from './schema-patrimonio';

// Importando o schema de pesquisa científica
import * as pesquisaSchema from './schema-pesquisa';

// Importando o schema do módulo social
import * as socialSchema from './schema-social';

// Importando o schema de fornecedores
import * as suppliersSchema from './schema-suppliers';

// Temporariamente removido devido a erros
// import * as financeiroSchema from './schema-financeiro';

// Combinando todos os schemas em um objeto único
export const combinedSchema = {
  ...baseSchema,
  ...hplcSchema,
  ...doctorAffiliationSchema,
  ...labEquipmentSchema,
  ...comprasSchema,
  ...tarefasSchema,
  ...transparenciaSchema,
  ...patrimonioSchema,
  ...pesquisaSchema,
  ...socialSchema,
  ...suppliersSchema
};

// Exportando todos os tipos e enums
export * from './schema';
export * from './schema-hplc';
export * from './schema-doctor-affiliation';
export * from './schema-lab-equipment';
export * from './schema-compras';
export * from './schema-tarefas';
// export * from './schema-financeiro'; // Temporariamente desabilitado devido a erros
export * from './schema-transparencia';
export * from './schema-patrimonio';
export * from './schema-pesquisa';
export * from './schema-social';
export * from './schema-suppliers';