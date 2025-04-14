import { db } from "./db";
import { 
  certificacoesOrganizacao, 
  membrosTransparencia, 
  relatoriosFinanceirosPublicos,
  documentosTransparencia
} from "@shared/schema-transparencia";
import { eq, sql } from "drizzle-orm";

/**
 * Cria dados de exemplo para certificações, membros e relatórios financeiros de transparência
 */
export async function seedTransparenciaMockData() {
  // Verificar se já existem certificações e outros dados
  const certificacoesExistentes = await db.select({ count: sql`count(*)` }).from(certificacoesOrganizacao);
  const membroExistentes = await db.select({ count: sql`count(*)` }).from(membrosTransparencia);
  const relatoriosExistentes = await db.select({ count: sql`count(*)` }).from(relatoriosFinanceirosPublicos);
  const documentosExistentes = await db.select({ count: sql`count(*)` }).from(documentosTransparencia);
  
  console.log(`[Transparência Mock] Verificando dados de exemplo:`);
  console.log(`  - Certificações: ${certificacoesExistentes[0].count}`);
  console.log(`  - Membros: ${membroExistentes[0].count}`);
  console.log(`  - Relatórios financeiros: ${relatoriosExistentes[0].count}`);
  console.log(`  - Documentos: ${documentosExistentes[0].count}`);
  
  let dadosCriados = false;
  
  // Verificar se precisamos criar certificações de exemplo
  if (parseInt(certificacoesExistentes[0].count as string) < 5) {
    console.log("[Transparência Mock] Criando certificações de exemplo...");
    await criarCertificacoesExemplo();
    dadosCriados = true;
  }
  
  // Verificar se precisamos criar membros de exemplo
  if (parseInt(membroExistentes[0].count as string) < 8) {
    console.log("[Transparência Mock] Criando membros de exemplo...");
    await criarMembrosExemplo();
    dadosCriados = true;
  }
  
  // Verificar se precisamos criar relatórios financeiros de exemplo
  if (parseInt(relatoriosExistentes[0].count as string) < 3) {
    console.log("[Transparência Mock] Criando relatórios financeiros de exemplo...");
    await criarRelatoriosFinanceirosExemplo();
    dadosCriados = true;
  }
  
  // Verificar se precisamos criar documentos de exemplo
  if (parseInt(documentosExistentes[0].count as string) < 8) {
    console.log("[Transparência Mock] Criando documentos de exemplo...");
    await criarDocumentosExemplo();
    dadosCriados = true;
  }
  
  // Verificar se existem dados para a organização "abrace" (ID 1) - tipo associacao
  const certAbrace = await db.select({ count: sql`count(*)` }).from(certificacoesOrganizacao).where(eq(certificacoesOrganizacao.organizacaoId, 1));
  const docAbrace = await db.select({ count: sql`count(*)` }).from(documentosTransparencia).where(eq(documentosTransparencia.organizacaoId, 1));
  
  console.log(`[Transparência Mock] Verificando dados para organização "abrace" (ID 1):`);
  console.log(`  - Certificações: ${certAbrace[0].count}`);
  console.log(`  - Documentos: ${docAbrace[0].count}`);
  
  if (parseInt(certAbrace[0].count as string) === 0 || parseInt(docAbrace[0].count as string) === 0) {
    console.log("[Transparência Mock] Criando dados para organização abrace...");
    await criarDadosAbrace();
    dadosCriados = true;
  }
  
  if (dadosCriados) {
    console.log("[Transparência Mock] Dados de exemplo criados com sucesso!");
  } else {
    console.log("[Transparência Mock] Dados de exemplo já existem, pulando criação.");
  }
}

/**
 * Criar certificações de exemplo para a organização de demonstração
 * Usar ID da organização 1 (organização de exemplo)
 */
async function criarCertificacoesExemplo() {
  const organizacaoId = 1; // ID da organização de exemplo
  const adminUserId = 1; // ID do usuário administrador
  
  const certificacoes = [
    {
      titulo: "Certificado de Utilidade Pública Municipal",
      descricao: "Reconhecimento da prefeitura pelo trabalho social realizado na comunidade",
      tipo: "governanca" as const,
      entidadeCertificadora: "Prefeitura Municipal",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2023-03-15"),
      dataValidade: new Date("2025-03-15"),
      visibilidade: "publico" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/exemplo-certificado.pdf"
    },
    {
      titulo: "Certificado de Organização Social (OS)",
      descricao: "Qualificação como Organização Social conferida pelo Governo Estadual",
      tipo: "regulatorio" as const,
      entidadeCertificadora: "Governo do Estado",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2022-08-10"),
      dataValidade: new Date("2027-08-10"),
      visibilidade: "publico" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/exemplo-certificado-os.pdf"
    },
    {
      titulo: "CEBAS - Certificado de Entidade Beneficente de Assistência Social",
      descricao: "Certificação que permite isenção de contribuições para a seguridade social",
      tipo: "governanca" as const,
      entidadeCertificadora: "Ministério da Cidadania",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2021-11-20"),
      dataValidade: new Date("2024-11-20"),
      visibilidade: "publico" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/exemplo-certificado-cebas.pdf"
    },
    {
      titulo: "ISO 9001 - Sistema de Gestão de Qualidade",
      descricao: "Certificação internacional de qualidade para procedimentos administrativos",
      tipo: "qualidade" as const,
      entidadeCertificadora: "Bureau Veritas",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2023-01-05"),
      dataValidade: new Date("2026-01-05"),
      visibilidade: "publico" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/exemplo-certificado-iso.pdf"
    },
    {
      titulo: "Certificado de Regularidade do FGTS",
      descricao: "Documento que comprova a regularidade da instituição perante o FGTS",
      tipo: "financeiro" as const,
      entidadeCertificadora: "Caixa Econômica Federal",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2023-05-12"),
      dataValidade: new Date("2024-05-12"),
      visibilidade: "privado" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/exemplo-certificado-fgts.pdf"
    }
  ];
  
  // Inserir certificações
  for (const certificacao of certificacoes) {
    await db.insert(certificacoesOrganizacao).values([certificacao]);
    console.log(`[Transparência Mock] Certificação criada: ${certificacao.titulo}`);
  }
}

/**
 * Criar membros de exemplo para a organização de demonstração
 * Usar ID da organização 1 (organização de exemplo)
 */
async function criarMembrosExemplo() {
  const organizacaoId = 1; // ID da organização de exemplo
  const adminUserId = 1; // ID do usuário administrador
  
  const membros = [
    {
      nome: "Ana Oliveira",
      email: "ana.oliveira@exemplo.org",
      tipo: "diretoria" as const,
      cargo: "presidente",
      organizacaoId,
      dataIngresso: new Date("2018-03-15"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Carlos Mendes",
      email: "carlos.mendes@exemplo.org",
      tipo: "diretoria" as const,
      cargo: "vice_presidente",
      organizacaoId,
      dataIngresso: new Date("2018-03-15"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Mariana Silva",
      email: "mariana.silva@exemplo.org",
      tipo: "diretoria" as const,
      cargo: "diretor_financeiro",
      organizacaoId,
      dataIngresso: new Date("2019-01-10"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Pedro Santos",
      email: "pedro.santos@exemplo.org",
      tipo: "conselho" as const,
      cargo: "conselheiro",
      organizacaoId,
      dataIngresso: new Date("2020-04-20"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Juliana Almeida",
      email: "juliana.almeida@exemplo.org",
      tipo: "conselho" as const,
      cargo: "conselheiro",
      organizacaoId,
      dataIngresso: new Date("2020-04-20"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Lucas Ferreira",
      email: "lucas.ferreira@exemplo.org",
      tipo: "conselho" as const,
      cargo: "conselheiro",
      organizacaoId,
      dataIngresso: new Date("2020-04-20"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Roberta Gomes",
      email: "roberta.gomes@exemplo.org",
      tipo: "diretoria" as const,
      cargo: "secretario",
      organizacaoId,
      dataIngresso: new Date("2019-06-10"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Fernando Costa",
      email: "fernando.costa@exemplo.org",
      tipo: "diretoria" as const,
      cargo: "tesoureiro",
      organizacaoId,
      dataIngresso: new Date("2021-02-15"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    }
  ];
  
  // Inserir membros
  for (const membro of membros) {
    await db.insert(membrosTransparencia).values([membro]);
    console.log(`[Transparência Mock] Membro criado: ${membro.nome} (${membro.cargo})`);
  }
}

/**
 * Criar relatórios financeiros de exemplo para a organização de demonstração
 */
async function criarRelatoriosFinanceirosExemplo() {
  const organizacaoId = 1; // ID da organização de exemplo
  const adminUserId = 1; // ID do usuário administrador
  
  // Dados de exemplo para os relatórios anuais
  const relatorios = [
    {
      ano: 2023,
      mes: null, // Relatório anual não tem mês específico
      organizacaoId,
      receitaTotal: 1250000, // R$ 1.250.000,00
      despesaTotal: 1180000, // R$ 1.180.000,00
      saldo: 70000,
      receitasPorCategoria: JSON.stringify({
        "Doações PF": 350000,
        "Doações PJ": 480000,
        "Editais e convênios": 320000,
        "Eventos": 100000
      }),
      despesasPorCategoria: JSON.stringify({
        "Pessoal": 680000,
        "Administrativo": 150000,
        "Projetos": 250000,
        "Marketing": 100000
      }),
      receitasMensais: JSON.stringify({
        "Jan": 95000, "Fev": 85000, "Mar": 110000, "Abr": 95000, 
        "Mai": 105000, "Jun": 120000, "Jul": 90000, "Ago": 115000, 
        "Set": 108000, "Out": 102000, "Nov": 125000, "Dez": 100000
      }),
      despesasMensais: JSON.stringify({
        "Jan": 92000, "Fev": 88000, "Mar": 105000, "Abr": 90000, 
        "Mai": 98000, "Jun": 112000, "Jul": 95000, "Ago": 102000, 
        "Set": 100000, "Out": 99000, "Nov": 115000, "Dez": 84000
      }),
      visibilidade: "publico" as const,
      publicado: true,
      criadoPor: adminUserId
    },
    {
      ano: 2022,
      mes: null,
      organizacaoId,
      receitaTotal: 980000,
      despesaTotal: 950000,
      saldo: 30000,
      receitasPorCategoria: JSON.stringify({
        "Doações PF": 280000,
        "Doações PJ": 350000,
        "Editais e convênios": 250000,
        "Eventos": 100000
      }),
      despesasPorCategoria: JSON.stringify({
        "Pessoal": 550000,
        "Administrativo": 120000,
        "Projetos": 200000,
        "Marketing": 80000
      }),
      receitasMensais: JSON.stringify({
        "Jan": 75000, "Fev": 70000, "Mar": 85000, "Abr": 80000, 
        "Mai": 90000, "Jun": 92000, "Jul": 75000, "Ago": 85000, 
        "Set": 82000, "Out": 78000, "Nov": 95000, "Dez": 73000
      }),
      despesasMensais: JSON.stringify({
        "Jan": 72000, "Fev": 68000, "Mar": 82000, "Abr": 77000, 
        "Mai": 86000, "Jun": 88000, "Jul": 80000, "Ago": 83000, 
        "Set": 80000, "Out": 76000, "Nov": 90000, "Dez": 68000
      }),
      visibilidade: "publico" as const,
      publicado: true,
      criadoPor: adminUserId
    },
    // Relatório trimestral recente
    {
      ano: 2024,
      mes: 3, // Primeiro trimestre (janeiro-março)
      organizacaoId,
      receitaTotal: 320000,
      despesaTotal: 290000,
      saldo: 30000,
      receitasPorCategoria: JSON.stringify({
        "Doações PF": 95000,
        "Doações PJ": 125000,
        "Editais e convênios": 80000,
        "Eventos": 20000
      }),
      despesasPorCategoria: JSON.stringify({
        "Pessoal": 170000,
        "Administrativo": 40000,
        "Projetos": 60000,
        "Marketing": 20000
      }),
      receitasMensais: JSON.stringify({
        "Jan": 105000, "Fev": 95000, "Mar": 120000
      }),
      despesasMensais: JSON.stringify({
        "Jan": 98000, "Fev": 90000, "Mar": 102000
      }),
      visibilidade: "publico" as const,
      publicado: true,
      criadoPor: adminUserId
    }
  ];
  
  // Inserir relatórios financeiros
  for (const relatorio of relatorios) {
    await db.insert(relatoriosFinanceirosPublicos).values([relatorio]);
    console.log(`[Transparência Mock] Relatório financeiro criado: ${relatorio.ano}${relatorio.mes ? ` (Trimestre ${relatorio.mes})` : ''}`);
  }
}

/**
 * Criar documentos de exemplo para a organização de demonstração
 * Inclui atas de reuniões, assembleias, relatórios e outros documentos importantes
 */
async function criarDocumentosExemplo() {
  const organizacaoId = 1; // ID da organização de exemplo
  const adminUserId = 1; // ID do usuário administrador
  
  const documentos = [
    {
      titulo: "Ata da Assembleia Geral Ordinária 2024",
      descricao: "Registro da Assembleia Geral Ordinária realizada em 15 de março de 2024 com a presença de todos os associados.",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/ata-assembleia-2024.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "1.2 MB",
      visibilidade: "publico" as const,
      tags: "assembleia, governança, deliberações",
      dataDocumento: new Date("2024-03-15"),
      criadoPor: adminUserId
    },
    {
      titulo: "Ata da Reunião do Conselho Fiscal - 1º Trimestre 2024",
      descricao: "Documentação da reunião do Conselho Fiscal para análise das contas do primeiro trimestre de 2024.",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/ata-conselho-fiscal-t1-2024.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "850 KB",
      visibilidade: "publico" as const,
      tags: "conselho fiscal, prestação de contas, governança",
      dataDocumento: new Date("2024-04-10"),
      criadoPor: adminUserId
    },
    {
      titulo: "Estatuto Social Atualizado",
      descricao: "Versão atual do Estatuto Social da organização com as alterações aprovadas na Assembleia de 2023.",
      categoria: "legal" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/estatuto-social-2023.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "2.1 MB",
      visibilidade: "publico" as const,
      tags: "estatuto, legal, regimento",
      dataDocumento: new Date("2023-04-20"),
      criadoPor: adminUserId
    },
    {
      titulo: "Regimento Interno",
      descricao: "Regimento Interno da organização que estabelece as normas de funcionamento operacional.",
      categoria: "legal" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/regimento-interno.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "1.8 MB",
      visibilidade: "publico" as const,
      tags: "regimento, normas, procedimentos",
      dataDocumento: new Date("2023-05-15"),
      criadoPor: adminUserId
    },
    {
      titulo: "Ata de Eleição da Diretoria Atual",
      descricao: "Registro do processo eleitoral e resultado da eleição da diretoria para o biênio 2023-2025.",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/ata-eleicao-diretoria-2023.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "1.5 MB",
      visibilidade: "publico" as const,
      tags: "eleição, diretoria, governança",
      dataDocumento: new Date("2023-03-30"),
      criadoPor: adminUserId
    },
    {
      titulo: "Plano de Atividades 2024",
      descricao: "Documento estratégico contendo o planejamento de atividades e projetos para o ano de 2024.",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/plano-atividades-2024.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "3.2 MB",
      visibilidade: "publico" as const,
      tags: "planejamento, estratégia, projetos",
      dataDocumento: new Date("2024-01-15"),
      criadoPor: adminUserId
    },
    {
      titulo: "Relatório Anual de Atividades 2023",
      descricao: "Relatório detalhado de todas as atividades realizadas pela organização durante o ano de 2023.",
      categoria: "relatorios" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/relatorio-atividades-2023.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "4.5 MB",
      visibilidade: "publico" as const,
      tags: "relatório, atividades, resultados",
      dataDocumento: new Date("2024-02-10"),
      criadoPor: adminUserId
    },
    {
      titulo: "Ata da Assembleia Extraordinária - Alteração Estatutária",
      descricao: "Registro da Assembleia Geral Extraordinária realizada para aprovação de alterações no Estatuto Social.",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/ata-assembleia-extraordinaria-2023.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "1.3 MB",
      visibilidade: "publico" as const,
      tags: "assembleia, estatuto, alteração",
      dataDocumento: new Date("2023-04-05"),
      criadoPor: adminUserId
    }
  ];
  
  // Inserir documentos
  for (const documento of documentos) {
    await db.insert(documentosTransparencia).values([documento]);
    console.log(`[Transparência Mock] Documento criado: ${documento.titulo}`);
  }
}

/**
 * Criar dados específicos para a organização "abrace" (ID 1)
 * Organização tipo associacao para portal de transparência
 */
async function criarDadosAbrace() {
  const organizacaoId = 1; // ID da organização abrace (tipo associacao)
  const adminUserId = 1; // ID do usuário administrador
  
  // Certificações específicas para associação Abrace
  const certificacoes = [
    {
      titulo: "Certificado de Boas Práticas de Fabricação (GMP)",
      descricao: "Certificação que atesta as boas práticas de fabricação de produtos à base de cannabis medicinal",
      tipo: "gmp" as const,
      entidadeCertificadora: "ANVISA",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2023-05-15"),
      dataValidade: new Date("2025-05-15"),
      visibilidade: "publico" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/hempmeds-gmp.pdf"
    },
    {
      titulo: "Certificado de Cultivo Orgânico",
      descricao: "Certificação de produção orgânica sem uso de pesticidas e outros componentes químicos",
      tipo: "organico" as const,
      entidadeCertificadora: "IBD Certificações",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2022-11-10"),
      dataValidade: new Date("2024-11-10"),
      visibilidade: "publico" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/hempmeds-organico.pdf"
    },
    {
      titulo: "Autorização Especial para Cultivo e Manipulação",
      descricao: "Autorização para cultivo, extração e manipulação de plantas de cannabis para fins medicinais",
      tipo: "regulatorio" as const,
      entidadeCertificadora: "ANVISA",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2023-01-20"),
      dataValidade: new Date("2028-01-20"),
      visibilidade: "publico" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/hempmeds-autorizacao.pdf"
    },
    {
      titulo: "ISO 17025 - Acreditação de Laboratório",
      descricao: "Acreditação internacional para laboratórios de análise e controle de qualidade",
      tipo: "qualidade" as const,
      entidadeCertificadora: "INMETRO",
      organizacaoId,
      status: "ativo" as const,
      dataEmissao: new Date("2022-09-05"),
      dataValidade: new Date("2025-09-05"),
      visibilidade: "publico" as const,
      criadoPor: adminUserId,
      arquivoUrl: "/uploads/transparencia/hempmeds-iso17025.pdf"
    }
  ];
  
  // Documentos específicos para associação Abrace
  const documentos = [
    {
      titulo: "Estatuto Social - Associação Abrace",
      descricao: "Documento que estabelece as regras fundamentais de funcionamento da associação",
      categoria: "legal" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/hempmeds-estatuto.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "2.3 MB",
      visibilidade: "publico" as const,
      tags: "estatuto, governança, legal",
      dataDocumento: new Date("2022-02-15"),
      criadoPor: adminUserId
    },
    {
      titulo: "Ata da Assembleia Geral Ordinária 2024",
      descricao: "Registro da Assembleia Geral Ordinária da Associação Abrace realizada em janeiro de 2024",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/hempmeds-ata-ago-2024.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "1.5 MB",
      visibilidade: "publico" as const,
      tags: "assembleia, deliberações, governança",
      dataDocumento: new Date("2024-01-30"),
      criadoPor: adminUserId
    },
    {
      titulo: "Relatório de Sustentabilidade 2023",
      descricao: "Relatório detalhado das práticas sustentáveis e ações socioambientais realizadas em 2023",
      categoria: "relatorios" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/hempmeds-sustentabilidade-2023.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "5.2 MB",
      visibilidade: "publico" as const,
      tags: "sustentabilidade, meio ambiente, responsabilidade social",
      dataDocumento: new Date("2024-02-28"),
      criadoPor: adminUserId
    },
    {
      titulo: "Política de Boas Práticas Agrícolas",
      descricao: "Documento detalhando os protocolos e práticas de cultivo sustentável da cannabis",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/hempmeds-boas-praticas.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "3.8 MB",
      visibilidade: "publico" as const,
      tags: "cultivo, agricultura, procedimentos",
      dataDocumento: new Date("2023-07-15"),
      criadoPor: adminUserId
    },
    {
      titulo: "Ata da Reunião do Comitê Científico",
      descricao: "Registro das deliberações do Comitê Científico sobre pesquisas e desenvolvimento de produtos",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/hempmeds-comite-cientifico.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "2.1 MB",
      visibilidade: "publico" as const,
      tags: "pesquisa, ciência, desenvolvimento",
      dataDocumento: new Date("2024-03-10"),
      criadoPor: adminUserId
    },
    {
      titulo: "Relatório de Testes de Qualidade Q1 2024",
      descricao: "Resultados dos testes de qualidade e pureza realizados no primeiro trimestre de 2024",
      categoria: "relatorios" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/hempmeds-testes-q1-2024.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "4.3 MB",
      visibilidade: "publico" as const,
      tags: "qualidade, testes, laboratório",
      dataDocumento: new Date("2024-04-05"),
      criadoPor: adminUserId
    },
    {
      titulo: "Protocolo de Rastreabilidade de Produto",
      descricao: "Documentação detalhada do sistema de rastreabilidade do plantio até o produto final",
      categoria: "legal" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/hempmeds-rastreabilidade.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "3.7 MB",
      visibilidade: "publico" as const,
      tags: "rastreabilidade, qualidade, procedimentos",
      dataDocumento: new Date("2023-09-20"),
      criadoPor: adminUserId
    },
    {
      titulo: "Ata de Constituição do Conselho Consultivo",
      descricao: "Registro da formação do Conselho Consultivo com especialistas em cannabis medicinal",
      categoria: "governanca" as const,
      organizacaoId,
      arquivoUrl: "/uploads/transparencia/hempmeds-conselho-consultivo.pdf",
      arquivoTipo: "application/pdf",
      arquivoTamanho: "1.6 MB",
      visibilidade: "publico" as const,
      tags: "conselho, governança, gestão",
      dataDocumento: new Date("2023-05-12"),
      criadoPor: adminUserId
    }
  ];
  
  // Inserir certificações para Abrace
  for (const certificacao of certificacoes) {
    await db.insert(certificacoesOrganizacao).values([certificacao]);
    console.log(`[Transparência Mock] [Abrace] Certificação criada: ${certificacao.titulo}`);
  }
  
  // Inserir documentos para Abrace
  for (const documento of documentos) {
    await db.insert(documentosTransparencia).values([documento]);
    console.log(`[Transparência Mock] [Abrace] Documento criado: ${documento.titulo}`);
  }
  
  // Dados de exemplo para relatórios financeiros da Abrace
  const relatorios = [
    {
      ano: 2023,
      mes: null, // Relatório anual
      organizacaoId,
      receitaTotal: 3750000, // R$ 3.750.000,00
      despesaTotal: 3250000, // R$ 3.250.000,00
      saldo: 500000,
      receitasPorCategoria: JSON.stringify({
        "Produtos Medicinais": 2600000,
        "Produtos Cosméticos": 850000,
        "Consultoria": 300000
      }),
      despesasPorCategoria: JSON.stringify({
        "Pessoal": 1200000,
        "Produção": 1000000,
        "P&D": 450000,
        "Administrativo": 350000,
        "Marketing": 250000
      }),
      receitasMensais: JSON.stringify({
        "Jan": 290000, "Fev": 280000, "Mar": 310000, "Abr": 295000, 
        "Mai": 325000, "Jun": 340000, "Jul": 300000, "Ago": 330000, 
        "Set": 315000, "Out": 320000, "Nov": 350000, "Dez": 295000
      }),
      despesasMensais: JSON.stringify({
        "Jan": 265000, "Fev": 255000, "Mar": 270000, "Abr": 260000, 
        "Mai": 280000, "Jun": 290000, "Jul": 265000, "Ago": 275000, 
        "Set": 270000, "Out": 275000, "Nov": 285000, "Dez": 260000
      }),
      visibilidade: "publico" as const,
      publicado: true,
      criadoPor: adminUserId
    },
    {
      ano: 2024,
      mes: 3, // Primeiro trimestre
      organizacaoId,
      receitaTotal: 1050000,
      despesaTotal: 920000,
      saldo: 130000,
      receitasPorCategoria: JSON.stringify({
        "Produtos Medicinais": 720000,
        "Produtos Cosméticos": 230000,
        "Consultoria": 100000
      }),
      despesasPorCategoria: JSON.stringify({
        "Pessoal": 340000,
        "Produção": 280000,
        "P&D": 120000,
        "Administrativo": 100000,
        "Marketing": 80000
      }),
      receitasMensais: JSON.stringify({
        "Jan": 335000, "Fev": 340000, "Mar": 375000
      }),
      despesasMensais: JSON.stringify({
        "Jan": 300000, "Fev": 305000, "Mar": 315000
      }),
      visibilidade: "publico" as const,
      publicado: true,
      criadoPor: adminUserId
    }
  ];
  
  // Inserir relatórios financeiros
  for (const relatorio of relatorios) {
    await db.insert(relatoriosFinanceirosPublicos).values([relatorio]);
    console.log(`[Transparência Mock] [Abrace] Relatório financeiro criado: ${relatorio.ano}${relatorio.mes ? ` (Trimestre ${relatorio.mes})` : ''}`);
  }
  
  // Membros da organização Abrace
  const membros = [
    {
      nome: "Marina Rodrigues",
      email: "marina.rodrigues@abrace.org.br",
      tipo: "diretoria" as const,
      cargo: "presidente",
      organizacaoId,
      dataIngresso: new Date("2020-01-15"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Rafael Oliveira",
      email: "rafael.oliveira@hempmeds.com.br",
      tipo: "diretoria" as const,
      cargo: "diretor_pesquisa",
      organizacaoId,
      dataIngresso: new Date("2020-03-10"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Carla Souza",
      email: "carla.souza@hempmeds.com.br",
      tipo: "diretoria" as const,
      cargo: "diretor_financeiro",
      organizacaoId,
      dataIngresso: new Date("2021-02-05"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Paulo Martins",
      email: "paulo.martins@hempmeds.com.br",
      tipo: "diretoria" as const,
      cargo: "diretor_operacoes",
      organizacaoId,
      dataIngresso: new Date("2020-06-15"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Dra. Lúcia Carvalho",
      email: "lucia.carvalho@hempmeds.com.br",
      tipo: "conselho" as const,
      cargo: "conselheiro_cientifico",
      organizacaoId,
      dataIngresso: new Date("2021-05-20"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    },
    {
      nome: "Dr. Ricardo Almeida",
      email: "ricardo.almeida@hempmeds.com.br",
      tipo: "conselho" as const,
      cargo: "conselheiro_cientifico",
      organizacaoId,
      dataIngresso: new Date("2021-05-20"),
      status: true,
      visibilidade: "publico" as const,
      criadoPor: adminUserId
    }
  ];
  
  // Inserir membros
  for (const membro of membros) {
    await db.insert(membrosTransparencia).values([membro]);
    console.log(`[Transparência Mock] [Abrace] Membro criado: ${membro.nome} (${membro.cargo})`);
  }
}