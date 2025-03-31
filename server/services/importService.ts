/**
 * Serviço de importação de dados para o sistema
 * 
 * Este serviço gerencia a importação de dados de diferentes fontes e formatos,
 * incluindo CSV, Excel, JSON e de APIs externas.
 */

import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { db } from '../db';
import { organizations, doctors, patients, appointments, plants, users, modules, organizationModules, costCenters, financialCategories, financialTransactions, products } from '@shared/schema';
import { log } from '../vite';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { parse as parseCsv } from 'csv-parse';
import { Readable } from 'stream';

// Tipos de entidades que podem ser importadas
export type ImportEntityType = 
  | 'organizations'
  | 'users'
  | 'doctors'
  | 'patients'
  | 'appointments'
  | 'plants'
  | 'modules'
  | 'cost_centers'
  | 'financial_categories'
  | 'financial_transactions'
  | 'products';

// Formatos de arquivo de importação suportados
export type ImportFileFormat = 'csv' | 'xlsx' | 'xls' | 'json';

// Opções para a importação de dados
export interface ImportOptions {
  entityType: ImportEntityType;
  format?: ImportFileFormat;
  filePath?: string;
  apiEndpoint?: string;
  apiAuth?: {
    username: string;
    password: string;
  };
  jsonData?: string;
  onProgress?: (progress: number) => void;
  validateOnly?: boolean;
}

// Resultado da importação
export interface ImportResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ line: number; message: string }>;
  warnings: Array<{ line: number; message: string }>;
  elapsedTime: number;
  entityType: ImportEntityType;
}

// Interface para um adaptador de importação
interface ImportAdapter {
  process(options: ImportOptions): Promise<ImportResult>;
}

/**
 * Classe principal de importação que coordena o processo
 */
export class DataImporter {
  private static instance: DataImporter;
  private importHistory: Array<ImportResult & { date: Date; user: string; method: string }> = [];

  private constructor() {}

  public static getInstance(): DataImporter {
    if (!DataImporter.instance) {
      DataImporter.instance = new DataImporter();
    }
    return DataImporter.instance;
  }

  /**
   * Inicia um processo de importação
   */
  public async import(options: ImportOptions, userId: number): Promise<ImportResult> {
    const startTime = Date.now();
    log(`[Import] Iniciando importação: ${options.entityType}`, 'import');

    let adapter: ImportAdapter;
    let method: string;

    // Selecionar o adaptador apropriado com base no tipo de dados e fonte
    if (options.filePath) {
      if (!options.format) {
        // Determinar formato pelo nome do arquivo
        const ext = path.extname(options.filePath).toLowerCase();
        if (ext === '.csv') {
          options.format = 'csv';
        } else if (ext === '.xlsx') {
          options.format = 'xlsx';
        } else if (ext === '.xls') {
          options.format = 'xls';
        } else if (ext === '.json') {
          options.format = 'json';
        } else {
          throw new Error(`Formato de arquivo não suportado: ${ext}`);
        }
      }

      // Selecionar adaptador pelo formato de arquivo
      if (options.format === 'csv') {
        adapter = new CsvImportAdapter();
        method = 'Upload CSV';
      } else if (options.format === 'xlsx' || options.format === 'xls') {
        adapter = new ExcelImportAdapter();
        method = 'Upload Excel';
      } else if (options.format === 'json') {
        adapter = new JsonFileImportAdapter();
        method = 'Upload JSON';
      } else {
        throw new Error(`Formato não suportado: ${options.format}`);
      }
    } else if (options.apiEndpoint) {
      adapter = new ApiImportAdapter();
      method = 'API';
    } else if (options.jsonData) {
      adapter = new JsonDataImportAdapter();
      method = 'JSON manual';
    } else {
      throw new Error('Nenhuma fonte de dados especificada para importação');
    }

    try {
      // Executar a importação
      const result = await adapter.process(options);
      
      // Armazenar no histórico
      result.elapsedTime = Date.now() - startTime;
      this.importHistory.push({
        ...result,
        date: new Date(),
        user: `User ID: ${userId}`,
        method
      });

      log(`[Import] Importação concluída: ${options.entityType} - ${result.successCount} registros`, 'import');
      return result;
    } catch (error: any) {
      log(`[Import] Erro na importação: ${error.message}`, 'import');
      throw error;
    }
  }

  /**
   * Retorna o histórico de importações
   */
  public getImportHistory() {
    return this.importHistory;
  }
}

/**
 * Adaptador para importação de arquivos CSV
 */
class CsvImportAdapter implements ImportAdapter {
  async process(options: ImportOptions): Promise<ImportResult> {
    if (!options.filePath) {
      throw new Error('Caminho do arquivo CSV não especificado');
    }

    const result: ImportResult = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      warnings: [],
      elapsedTime: 0,
      entityType: options.entityType
    };

    try {
      // Abrir stream de leitura do arquivo
      const fileStream = fs.createReadStream(options.filePath);
      
      // Configurar parser CSV
      const parser = parseCsv({
        delimiter: ',',
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      // Processar arquivo linha por linha
      let records: any[] = [];
      
      // Usar pipeline para processar o stream
      await pipeline(
        fileStream,
        parser,
        async function* (source) {
          for await (const record of source) {
            records.push(record);
            yield record;
          }
        },
        Readable.from([]) // Consumir o stream
      );

      // Processar os registros
      result.totalRecords = records.length;
      
      // Se for apenas para validação, retornar aqui
      if (options.validateOnly) {
        return result;
      }

      // Importar os registros no banco de dados
      const processor = new EntityProcessor(options.entityType);
      const processResult = await processor.processEntities(records);
      
      result.successCount = processResult.success;
      result.errorCount = processResult.error;
      result.errors = processResult.errors;
      result.warnings = processResult.warnings;

      return result;
    } catch (error: any) {
      throw new Error(`Erro ao processar arquivo CSV: ${error.message}`);
    }
  }
}

/**
 * Adaptador para importação de arquivos Excel (XLSX/XLS)
 */
class ExcelImportAdapter implements ImportAdapter {
  async process(options: ImportOptions): Promise<ImportResult> {
    if (!options.filePath) {
      throw new Error('Caminho do arquivo Excel não especificado');
    }

    const result: ImportResult = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      warnings: [],
      elapsedTime: 0,
      entityType: options.entityType
    };

    try {
      // Ler arquivo Excel
      const workbook = XLSX.readFile(options.filePath);
      
      // Pegar primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const records = XLSX.utils.sheet_to_json(worksheet);
      
      result.totalRecords = records.length;
      
      // Se for apenas para validação, retornar aqui
      if (options.validateOnly) {
        return result;
      }

      // Importar os registros no banco de dados
      const processor = new EntityProcessor(options.entityType);
      const processResult = await processor.processEntities(records);
      
      result.successCount = processResult.success;
      result.errorCount = processResult.error;
      result.errors = processResult.errors;
      result.warnings = processResult.warnings;

      return result;
    } catch (error: any) {
      throw new Error(`Erro ao processar arquivo Excel: ${error.message}`);
    }
  }
}

/**
 * Adaptador para importação de arquivos JSON
 */
class JsonFileImportAdapter implements ImportAdapter {
  async process(options: ImportOptions): Promise<ImportResult> {
    if (!options.filePath) {
      throw new Error('Caminho do arquivo JSON não especificado');
    }

    const result: ImportResult = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      warnings: [],
      elapsedTime: 0,
      entityType: options.entityType
    };

    try {
      // Ler arquivo JSON
      const fileContent = fs.readFileSync(options.filePath, 'utf8');
      const records = JSON.parse(fileContent);
      
      // Verificar se é um array
      if (!Array.isArray(records)) {
        throw new Error('O arquivo JSON deve conter um array de registros');
      }
      
      result.totalRecords = records.length;
      
      // Se for apenas para validação, retornar aqui
      if (options.validateOnly) {
        return result;
      }

      // Importar os registros no banco de dados
      const processor = new EntityProcessor(options.entityType);
      const processResult = await processor.processEntities(records);
      
      result.successCount = processResult.success;
      result.errorCount = processResult.error;
      result.errors = processResult.errors;
      result.warnings = processResult.warnings;

      return result;
    } catch (error: any) {
      throw new Error(`Erro ao processar arquivo JSON: ${error.message}`);
    }
  }
}

/**
 * Adaptador para importação de dados JSON diretamente passados
 */
class JsonDataImportAdapter implements ImportAdapter {
  async process(options: ImportOptions): Promise<ImportResult> {
    if (!options.jsonData) {
      throw new Error('Dados JSON não especificados');
    }

    const result: ImportResult = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      warnings: [],
      elapsedTime: 0,
      entityType: options.entityType
    };

    try {
      // Processar JSON
      const records = JSON.parse(options.jsonData);
      
      // Verificar se é um array
      if (!Array.isArray(records)) {
        throw new Error('Os dados JSON devem conter um array de registros');
      }
      
      result.totalRecords = records.length;
      
      // Se for apenas para validação, retornar aqui
      if (options.validateOnly) {
        return result;
      }

      // Importar os registros no banco de dados
      const processor = new EntityProcessor(options.entityType);
      const processResult = await processor.processEntities(records);
      
      result.successCount = processResult.success;
      result.errorCount = processResult.error;
      result.errors = processResult.errors;
      result.warnings = processResult.warnings;

      return result;
    } catch (error: any) {
      throw new Error(`Erro ao processar dados JSON: ${error.message}`);
    }
  }
}

/**
 * Adaptador para importação de dados de uma API externa
 */
class ApiImportAdapter implements ImportAdapter {
  async process(options: ImportOptions): Promise<ImportResult> {
    if (!options.apiEndpoint) {
      throw new Error('Endpoint da API não especificado');
    }

    const result: ImportResult = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      warnings: [],
      elapsedTime: 0,
      entityType: options.entityType
    };

    try {
      // Configurar requisição
      const requestConfig: any = {};
      
      // Adicionar autenticação se fornecida
      if (options.apiAuth) {
        requestConfig.auth = {
          username: options.apiAuth.username,
          password: options.apiAuth.password
        };
      }
      
      // Fazer requisição para a API
      const response = await axios.get(options.apiEndpoint, requestConfig);
      
      // Verificar se a resposta contém dados e se é um array
      const records = response.data;
      if (!Array.isArray(records)) {
        throw new Error('A resposta da API deve conter um array de registros');
      }
      
      result.totalRecords = records.length;
      
      // Se for apenas para validação, retornar aqui
      if (options.validateOnly) {
        return result;
      }

      // Importar os registros no banco de dados
      const processor = new EntityProcessor(options.entityType);
      const processResult = await processor.processEntities(records);
      
      result.successCount = processResult.success;
      result.errorCount = processResult.error;
      result.errors = processResult.errors;
      result.warnings = processResult.warnings;

      return result;
    } catch (error: any) {
      // Tratar erros específicos de API
      if (error.response) {
        throw new Error(`Erro na requisição API (${error.response.status}): ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Erro de conexão com a API: sem resposta do servidor');
      } else {
        throw new Error(`Erro na importação da API: ${error.message}`);
      }
    }
  }
}

/**
 * Classe responsável por processar entidades específicas
 */
class EntityProcessor {
  private entityType: ImportEntityType;
  
  constructor(entityType: ImportEntityType) {
    this.entityType = entityType;
  }
  
  /**
   * Processa um conjunto de entidades para importação
   */
  async processEntities(entities: any[]): Promise<{
    success: number;
    error: number;
    errors: Array<{ line: number; message: string }>;
    warnings: Array<{ line: number; message: string }>;
  }> {
    const result = {
      success: 0,
      error: 0,
      errors: [] as Array<{ line: number; message: string }>,
      warnings: [] as Array<{ line: number; message: string }>
    };
    
    // Processar cada entidade de acordo com seu tipo
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const lineNumber = i + 1; // +1 para não começar do zero
      
      try {
        // Validação e normalização da entidade
        const normalizedEntity = this.normalizeEntity(entity);
        
        // Processar entidade específica
        switch (this.entityType) {
          case 'organizations':
            await this.processOrganization(normalizedEntity);
            break;
          case 'users':
            await this.processUser(normalizedEntity);
            break;
          case 'doctors':
            await this.processDoctor(normalizedEntity);
            break;
          case 'patients':
            await this.processPatient(normalizedEntity);
            break;
          case 'appointments':
            await this.processAppointment(normalizedEntity);
            break;
          case 'plants':
            await this.processPlant(normalizedEntity);
            break;
          case 'modules':
            await this.processModule(normalizedEntity);
            break;
          case 'cost_centers':
            await this.processCostCenter(normalizedEntity);
            break;
          case 'financial_categories':
            await this.processFinancialCategory(normalizedEntity);
            break;
          case 'financial_transactions':
            await this.processFinancialTransaction(normalizedEntity);
            break;
          case 'products':
            await this.processProduct(normalizedEntity);
            break;
          default:
            throw new Error(`Tipo de entidade não suportado: ${this.entityType}`);
        }
        
        result.success++;
      } catch (error: any) {
        result.error++;
        result.errors.push({
          line: lineNumber,
          message: error.message
        });
      }
    }
    
    return result;
  }
  
  /**
   * Normaliza uma entidade para o formato correto
   */
  private normalizeEntity(entity: any): any {
    // Converter chaves para camelCase ou snake_case conforme necessário
    const normalized: any = {};
    
    for (const key in entity) {
      // Remover espaços e caracteres especiais das chaves
      const normalizedKey = key.trim().replace(/\s+/g, '_').toLowerCase();
      
      // Tratar valores básicos
      let value = entity[key];
      
      // Converter strings vazias para null
      if (value === "") {
        value = null;
      }
      
      // Converter strings de data para objetos Date
      if (typeof value === 'string' && this.isDateString(value)) {
        value = new Date(value);
      }
      
      // Converter strings numéricas para números
      if (typeof value === 'string' && this.isNumericString(value)) {
        value = Number(value);
      }
      
      // Atribuir valor normalizado
      normalized[normalizedKey] = value;
    }
    
    return normalized;
  }
  
  /**
   * Verifica se uma string é uma data válida
   */
  private isDateString(str: string): boolean {
    // Formatos comuns de data
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // ISO - YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // BR - DD/MM/YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ];
    
    // Verificar se a string corresponde a algum padrão de data
    for (const pattern of datePatterns) {
      if (pattern.test(str)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Verifica se uma string é um número
   */
  private isNumericString(str: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(str);
  }
  
  /**
   * Processa uma organização para importação
   */
  private async processOrganization(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.name) {
      throw new Error('O nome da organização é obrigatório');
    }
    
    // Verificar se já existe uma organização com o mesmo nome
    const existingOrgs = await db.select({ id: organizations.id })
      .from(organizations)
      .where(({ eq }) => eq(organizations.name, entity.name))
      .limit(1);
    
    if (existingOrgs.length > 0) {
      // Atualizar organização existente
      await db.update(organizations)
        .set({
          name: entity.name,
          email: entity.email || null,
          phone: entity.phone || null,
          address: entity.address || null,
          city: entity.city || null,
          state: entity.state || null,
          zip: entity.zip || entity.zip_code || entity.postal_code || null,
          sector: entity.sector || null,
          registrationDate: entity.registration_date || entity.created_at || new Date(),
          status: entity.status || 'pending',
          planId: entity.plan_id || 1, // Plano padrão
          logo: entity.logo || null,
          website: entity.website || null,
          description: entity.description || null,
          documentIdentifier: entity.document_identifier || entity.cnpj || entity.document || null
        })
        .where(({ eq }) => eq(organizations.id, existingOrgs[0].id));
    } else {
      // Criar nova organização
      await db.insert(organizations)
        .values({
          name: entity.name,
          email: entity.email || null,
          phone: entity.phone || null,
          address: entity.address || null,
          city: entity.city || null,
          state: entity.state || null,
          zip: entity.zip || entity.zip_code || entity.postal_code || null,
          sector: entity.sector || null,
          registrationDate: entity.registration_date || entity.created_at || new Date(),
          status: entity.status || 'pending',
          planId: entity.plan_id || 1, // Plano padrão
          logo: entity.logo || null,
          website: entity.website || null,
          description: entity.description || null,
          documentIdentifier: entity.document_identifier || entity.cnpj || entity.document || null
        });
    }
  }
  
  /**
   * Processa um usuário para importação
   */
  private async processUser(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.username) {
      throw new Error('O nome de usuário é obrigatório');
    }
    
    if (!entity.password) {
      throw new Error('A senha é obrigatória');
    }
    
    // Verificar se já existe um usuário com o mesmo nome
    const existingUsers = await db.select({ id: users.id })
      .from(users)
      .where(({ eq }) => eq(users.username, entity.username))
      .limit(1);
    
    if (existingUsers.length > 0) {
      // Atualizar usuário existente
      await db.update(users)
        .set({
          name: entity.name || entity.full_name || null,
          email: entity.email || null,
          phone: entity.phone || null,
          avatar: entity.avatar || null,
          role: entity.role || 'doctor',
          organizationId: entity.organization_id || null
        })
        .where(({ eq }) => eq(users.id, existingUsers[0].id));
    } else {
      // Criar novo usuário
      await db.insert(users)
        .values({
          username: entity.username,
          password: entity.password, // Idealmente deveria ser hash
          name: entity.name || entity.full_name || null,
          email: entity.email || null,
          phone: entity.phone || null,
          avatar: entity.avatar || null,
          role: entity.role || 'doctor',
          organizationId: entity.organization_id || null
        });
    }
  }
  
  /**
   * Processa um médico para importação
   */
  private async processDoctor(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.name) {
      throw new Error('O nome do médico é obrigatório');
    }
    
    if (!entity.crm) {
      throw new Error('O CRM do médico é obrigatório');
    }
    
    if (!entity.organization_id) {
      throw new Error('O ID da organização é obrigatório');
    }
    
    // Verificar se a organização existe
    const orgExists = await db.select({ id: organizations.id })
      .from(organizations)
      .where(({ eq }) => eq(organizations.id, entity.organization_id))
      .limit(1);
    
    if (orgExists.length === 0) {
      throw new Error(`Organização com ID ${entity.organization_id} não encontrada`);
    }
    
    // Verificar se já existe um médico com o mesmo CRM
    const existingDoctors = await db.select({ id: doctors.id })
      .from(doctors)
      .where(({ eq, and }) => 
        and(
          eq(doctors.crm, entity.crm),
          eq(doctors.organizationId, entity.organization_id)
        )
      )
      .limit(1);
    
    if (existingDoctors.length > 0) {
      // Atualizar médico existente
      await db.update(doctors)
        .set({
          name: entity.name,
          specialty: entity.specialty || null,
          phone: entity.phone || null,
          email: entity.email || null,
          userId: entity.user_id || null
        })
        .where(({ eq }) => eq(doctors.id, existingDoctors[0].id));
    } else {
      // Criar novo médico
      await db.insert(doctors)
        .values({
          name: entity.name,
          crm: entity.crm,
          specialty: entity.specialty || null,
          phone: entity.phone || null,
          email: entity.email || null,
          organizationId: entity.organization_id,
          userId: entity.user_id || null
        });
    }
  }
  
  /**
   * Processa um paciente para importação
   */
  private async processPatient(entity: any) {
    // Implementação similar às outras entidades
    // Mapear campos obrigatórios
    if (!entity.name) {
      throw new Error('O nome do paciente é obrigatório');
    }
    
    if (!entity.organization_id) {
      throw new Error('O ID da organização é obrigatório');
    }
    
    // Verificar se a organização existe
    const orgExists = await db.select({ id: organizations.id })
      .from(organizations)
      .where(({ eq }) => eq(organizations.id, entity.organization_id))
      .limit(1);
    
    if (orgExists.length === 0) {
      throw new Error(`Organização com ID ${entity.organization_id} não encontrada`);
    }
    
    // Verificar se já existe um paciente com o mesmo documento
    let existingPatients: any[] = [];
    
    if (entity.document) {
      existingPatients = await db.select({ id: patients.id })
        .from(patients)
        .where(({ eq, and }) => 
          and(
            eq(patients.document, entity.document),
            eq(patients.organizationId, entity.organization_id)
          )
        )
        .limit(1);
    }
    
    if (existingPatients.length > 0) {
      // Atualizar paciente existente
      await db.update(patients)
        .set({
          name: entity.name,
          birthDate: entity.birth_date || null,
          gender: entity.gender || null,
          phone: entity.phone || null,
          email: entity.email || null,
          address: entity.address || null,
          city: entity.city || null,
          state: entity.state || null,
          userId: entity.user_id || null
        })
        .where(({ eq }) => eq(patients.id, existingPatients[0].id));
    } else {
      // Criar novo paciente
      await db.insert(patients)
        .values({
          name: entity.name,
          document: entity.document || null,
          birthDate: entity.birth_date || null,
          gender: entity.gender || null,
          phone: entity.phone || null,
          email: entity.email || null,
          address: entity.address || null,
          city: entity.city || null,
          state: entity.state || null,
          organizationId: entity.organization_id,
          userId: entity.user_id || null
        });
    }
  }
  
  /**
   * Processa uma consulta para importação
   */
  private async processAppointment(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.doctor_id) {
      throw new Error('O ID do médico é obrigatório');
    }
    
    if (!entity.patient_id) {
      throw new Error('O ID do paciente é obrigatório');
    }
    
    if (!entity.date || !entity.time) {
      throw new Error('A data e hora da consulta são obrigatórias');
    }
    
    // Verificar se o médico existe
    const doctorExists = await db.select({ id: doctors.id })
      .from(doctors)
      .where(({ eq }) => eq(doctors.id, entity.doctor_id))
      .limit(1);
    
    if (doctorExists.length === 0) {
      throw new Error(`Médico com ID ${entity.doctor_id} não encontrado`);
    }
    
    // Verificar se o paciente existe
    const patientExists = await db.select({ id: patients.id })
      .from(patients)
      .where(({ eq }) => eq(patients.id, entity.patient_id))
      .limit(1);
    
    if (patientExists.length === 0) {
      throw new Error(`Paciente com ID ${entity.patient_id} não encontrado`);
    }
    
    // Criar nova consulta (sem verificar duplicação pois consultas podem ser repetidas)
    // Combinar data e hora
    let appointmentDate: Date;
    
    if (typeof entity.date === 'string' && typeof entity.time === 'string') {
      // Combinar strings de data e hora
      appointmentDate = new Date(`${entity.date}T${entity.time}`);
    } else if (entity.date instanceof Date) {
      appointmentDate = entity.date;
    } else {
      throw new Error('Formato de data inválido');
    }
    
    await db.insert(appointments)
      .values({
        doctorId: entity.doctor_id,
        patientId: entity.patient_id,
        date: appointmentDate,
        status: entity.status || 'scheduled',
        notes: entity.notes || null,
        type: entity.type || 'consultation'
      });
  }
  
  /**
   * Processa uma planta para importação
   */
  private async processPlant(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.name) {
      throw new Error('O nome da planta é obrigatório');
    }
    
    if (!entity.organization_id) {
      throw new Error('O ID da organização é obrigatório');
    }
    
    // Verificar se a organização existe
    const orgExists = await db.select({ id: organizations.id })
      .from(organizations)
      .where(({ eq }) => eq(organizations.id, entity.organization_id))
      .limit(1);
    
    if (orgExists.length === 0) {
      throw new Error(`Organização com ID ${entity.organization_id} não encontrada`);
    }
    
    // Verificar se já existe uma planta com o mesmo nome na mesma organização
    const existingPlants = await db.select({ id: plants.id })
      .from(plants)
      .where(({ eq, and }) => 
        and(
          eq(plants.name, entity.name),
          eq(plants.organizationId, entity.organization_id)
        )
      )
      .limit(1);
    
    if (existingPlants.length > 0) {
      // Atualizar planta existente
      await db.update(plants)
        .set({
          scientificName: entity.scientific_name || null,
          description: entity.description || null,
          growType: entity.grow_type || null,
          harvestDate: entity.harvest_date || null,
          plantingDate: entity.planting_date || null,
          status: entity.status || 'active'
        })
        .where(({ eq }) => eq(plants.id, existingPlants[0].id));
    } else {
      // Criar nova planta
      await db.insert(plants)
        .values({
          name: entity.name,
          scientificName: entity.scientific_name || null,
          description: entity.description || null,
          growType: entity.grow_type || null,
          harvestDate: entity.harvest_date || null,
          plantingDate: entity.planting_date || null,
          status: entity.status || 'active',
          organizationId: entity.organization_id
        });
    }
  }
  
  /**
   * Processa um módulo para importação
   */
  private async processModule(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.name) {
      throw new Error('O nome do módulo é obrigatório');
    }
    
    // Verificar se já existe um módulo com o mesmo nome
    const existingModules = await db.select({ id: modules.id })
      .from(modules)
      .where(({ eq }) => eq(modules.name, entity.name))
      .limit(1);
    
    if (existingModules.length > 0) {
      // Atualizar módulo existente
      await db.update(modules)
        .set({
          description: entity.description || null,
          icon: entity.icon || null,
          type: entity.type || 'core',
          status: entity.status || 'active',
          price: entity.price || 99
        })
        .where(({ eq }) => eq(modules.id, existingModules[0].id));
      
      // Se tiver organizationId, adicionar à tabela de relação
      if (entity.organization_id) {
        // Verificar se a relação já existe
        const existingRelation = await db.select({ id: organizationModules.id })
          .from(organizationModules)
          .where(({ eq, and }) => 
            and(
              eq(organizationModules.moduleId, existingModules[0].id),
              eq(organizationModules.organizationId, entity.organization_id)
            )
          )
          .limit(1);
        
        if (existingRelation.length === 0) {
          // Criar nova relação
          await db.insert(organizationModules)
            .values({
              moduleId: existingModules[0].id,
              organizationId: entity.organization_id,
              active: entity.active !== undefined ? entity.active : true,
              installDate: entity.install_date || new Date()
            });
        }
      }
    } else {
      // Criar novo módulo
      const [insertedModule] = await db.insert(modules)
        .values({
          name: entity.name,
          description: entity.description || null,
          icon: entity.icon || null,
          type: entity.type || 'core',
          status: entity.status || 'active',
          price: entity.price || 99
        })
        .returning({ id: modules.id });
      
      // Se tiver organizationId, adicionar à tabela de relação
      if (entity.organization_id && insertedModule) {
        await db.insert(organizationModules)
          .values({
            moduleId: insertedModule.id,
            organizationId: entity.organization_id,
            active: entity.active !== undefined ? entity.active : true,
            installDate: entity.install_date || new Date()
          });
      }
    }
  }

  /**
   * Processa um centro de custo para importação
   */
  private async processCostCenter(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.name) {
      throw new Error('O nome do centro de custo é obrigatório');
    }
    
    if (!entity.code) {
      throw new Error('O código do centro de custo é obrigatório');
    }
    
    if (!entity.organization_id) {
      throw new Error('O ID da organização é obrigatório');
    }
    
    // Verificar se a organização existe
    const orgExists = await db.select({ id: organizations.id })
      .from(organizations)
      .where(({ eq }) => eq(organizations.id, entity.organization_id))
      .limit(1);
    
    if (orgExists.length === 0) {
      throw new Error(`Organização com ID ${entity.organization_id} não encontrada`);
    }
    
    // Verificar se já existe um centro de custo com o mesmo código na mesma organização
    const existingCenters = await db.select({ id: costCenters.id })
      .from(costCenters)
      .where(({ eq, and }) => 
        and(
          eq(costCenters.code, entity.code),
          eq(costCenters.organizationId, entity.organization_id)
        )
      )
      .limit(1);
    
    if (existingCenters.length > 0) {
      // Atualizar centro de custo existente
      await db.update(costCenters)
        .set({
          name: entity.name,
          description: entity.description || null,
          budget: entity.budget || 0,
          isActive: entity.is_active !== undefined ? entity.is_active : true,
          parentId: entity.parent_id || null
        })
        .where(({ eq }) => eq(costCenters.id, existingCenters[0].id));
    } else {
      // Criar novo centro de custo
      await db.insert(costCenters)
        .values({
          name: entity.name,
          code: entity.code,
          description: entity.description || null,
          budget: entity.budget || 0,
          isActive: entity.is_active !== undefined ? entity.is_active : true,
          parentId: entity.parent_id || null,
          organizationId: entity.organization_id
        });
    }
  }

  /**
   * Processa uma categoria financeira para importação
   */
  private async processFinancialCategory(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.name) {
      throw new Error('O nome da categoria financeira é obrigatório');
    }
    
    if (!entity.type) {
      throw new Error('O tipo da categoria financeira é obrigatório (receita/despesa)');
    }
    
    if (!entity.organization_id) {
      throw new Error('O ID da organização é obrigatório');
    }
    
    // Verificar se a organização existe
    const orgExists = await db.select({ id: organizations.id })
      .from(organizations)
      .where(({ eq }) => eq(organizations.id, entity.organization_id))
      .limit(1);
    
    if (orgExists.length === 0) {
      throw new Error(`Organização com ID ${entity.organization_id} não encontrada`);
    }
    
    // Verificar se já existe uma categoria com o mesmo nome na mesma organização
    const existingCategories = await db.select({ id: financialCategories.id })
      .from(financialCategories)
      .where(({ eq, and }) => 
        and(
          eq(financialCategories.name, entity.name),
          eq(financialCategories.organizationId, entity.organization_id)
        )
      )
      .limit(1);
    
    if (existingCategories.length > 0) {
      // Atualizar categoria existente
      await db.update(financialCategories)
        .set({
          description: entity.description || null,
          type: entity.type, // receita ou despesa
          isDefault: entity.is_default !== undefined ? entity.is_default : false
        })
        .where(({ eq }) => eq(financialCategories.id, existingCategories[0].id));
    } else {
      // Criar nova categoria
      await db.insert(financialCategories)
        .values({
          name: entity.name,
          description: entity.description || null,
          type: entity.type, // receita ou despesa
          isDefault: entity.is_default !== undefined ? entity.is_default : false,
          organizationId: entity.organization_id
        });
    }
  }

  /**
   * Processa uma transação financeira para importação
   */
  private async processFinancialTransaction(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.description) {
      throw new Error('A descrição da transação financeira é obrigatória');
    }
    
    if (!entity.type) {
      throw new Error('O tipo da transação é obrigatório (receita/despesa)');
    }
    
    if (!entity.amount) {
      throw new Error('O valor da transação é obrigatório');
    }
    
    if (!entity.due_date) {
      throw new Error('A data de vencimento é obrigatória');
    }
    
    if (!entity.organization_id) {
      throw new Error('O ID da organização é obrigatório');
    }
    
    // Verificar se a organização existe
    const orgExists = await db.select({ id: organizations.id })
      .from(organizations)
      .where(({ eq }) => eq(organizations.id, entity.organization_id))
      .limit(1);
    
    if (orgExists.length === 0) {
      throw new Error(`Organização com ID ${entity.organization_id} não encontrada`);
    }
    
    // Criar nova transação (sem verificar duplicação pois transações podem ser repetidas)
    await db.insert(financialTransactions)
      .values({
        description: entity.description,
        type: entity.type, // receita ou despesa
        category: entity.category || 'Diversos',
        amount: entity.amount,
        status: entity.status || 'pendente',
        dueDate: entity.due_date instanceof Date ? entity.due_date : new Date(entity.due_date),
        paymentDate: entity.payment_date ? (entity.payment_date instanceof Date ? entity.payment_date : new Date(entity.payment_date)) : null,
        documentNumber: entity.document_number || null,
        paymentMethod: entity.payment_method || null,
        notes: entity.notes || null,
        organizationId: entity.organization_id
      });
  }
  
  /**
   * Processa um produto para importação
   */
  private async processProduct(entity: any) {
    // Mapear campos obrigatórios
    if (!entity.name) {
      throw new Error('O nome do produto é obrigatório');
    }
    
    if (!entity.sku) {
      throw new Error('O SKU do produto é obrigatório');
    }
    
    if (!entity.description) {
      throw new Error('A descrição do produto é obrigatória');
    }
    
    if (!entity.price) {
      throw new Error('O preço do produto é obrigatório');
    }
    
    if (!entity.organization_id) {
      throw new Error('O ID da organização é obrigatório');
    }
    
    // Verificar se a organização existe
    const orgExists = await db.select({ id: organizations.id })
      .from(organizations)
      .where(({ eq }) => eq(organizations.id, entity.organization_id))
      .limit(1);
    
    if (orgExists.length === 0) {
      throw new Error(`Organização com ID ${entity.organization_id} não encontrada`);
    }
    
    // Verificar se já existe um produto com o mesmo SKU na mesma organização
    const existingProducts = await db.select({ id: products.id })
      .from(products)
      .where(({ eq, and }) => 
        and(
          eq(products.sku, entity.sku),
          eq(products.organizationId, entity.organization_id)
        )
      )
      .limit(1);
    
    if (existingProducts.length > 0) {
      // Atualizar produto existente
      await db.update(products)
        .set({
          name: entity.name,
          description: entity.description,
          price: entity.price,
          cost: entity.cost || null,
          taxRate: entity.tax_rate || null,
          stock: entity.stock || 0,
          minStock: entity.min_stock || 0,
          category: entity.category || null,
          brand: entity.brand || null,
          supplier: entity.supplier || null,
          weight: entity.weight || null,
          dimensions: entity.dimensions || null,
          imageUrl: entity.image_url || null,
          hasVariants: entity.has_variants || false,
          status: entity.status || 'ativo',
          barcode: entity.barcode || null
        })
        .where(({ eq }) => eq(products.id, existingProducts[0].id));
    } else {
      // Criar novo produto
      await db.insert(products)
        .values({
          name: entity.name,
          description: entity.description,
          sku: entity.sku,
          price: entity.price,
          cost: entity.cost || null,
          taxRate: entity.tax_rate || null,
          stock: entity.stock || 0,
          minStock: entity.min_stock || 0,
          category: entity.category || null,
          brand: entity.brand || null,
          supplier: entity.supplier || null,
          weight: entity.weight || null,
          dimensions: entity.dimensions || null,
          imageUrl: entity.image_url || null,
          hasVariants: entity.has_variants || false,
          status: entity.status || 'ativo',
          barcode: entity.barcode || null,
          organizationId: entity.organization_id
        });
    }
  }
}

// Singleton para o serviço de importação
export const importService = DataImporter.getInstance();