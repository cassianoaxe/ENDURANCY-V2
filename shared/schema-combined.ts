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

// Combinando todos os schemas em um objeto único
export const combinedSchema = {
  ...baseSchema,
  ...hplcSchema,
  ...doctorAffiliationSchema,
  ...labEquipmentSchema
};

// Exportando todos os tipos e enums
export * from './schema';
export * from './schema-hplc';
export * from './schema-doctor-affiliation';
export * from './schema-lab-equipment';