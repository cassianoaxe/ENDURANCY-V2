import { db } from "./db";
import { 
  certificacoesOrganizacao, 
  membrosTransparencia, 
  relatoriosFinanceirosPublicos 
} from "@shared/schema-transparencia";
import { eq, sql } from "drizzle-orm";

/**
 * Cria dados de exemplo para certificações, membros e relatórios financeiros de transparência
 */
export async function seedTransparenciaMockData() {
  // Verificar se já existem certificações
  const certificacoesExistentes = await db.select({ count: sql`count(*)` }).from(certificacoesOrganizacao);
  const membroExistentes = await db.select({ count: sql`count(*)` }).from(membrosTransparencia);
  const relatoriosExistentes = await db.select({ count: sql`count(*)` }).from(relatoriosFinanceirosPublicos);
  
  console.log(`[Transparência Mock] Verificando dados de exemplo:`);
  console.log(`  - Certificações: ${certificacoesExistentes[0].count}`);
  console.log(`  - Membros: ${membroExistentes[0].count}`);
  console.log(`  - Relatórios financeiros: ${relatoriosExistentes[0].count}`);
  
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