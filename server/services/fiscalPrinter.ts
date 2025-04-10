/**
 * Serviço para integração com impressoras fiscais
 * Atualmente implementado para o modelo Bematech
 */

// Interface para comandos da impressora
interface PrinterCommand {
  code: number;
  description: string;
  execute: (...args: any[]) => PrinterResponse;
}

// Interface para resposta da impressora
interface PrinterResponse {
  success: boolean;
  code: number;
  message: string;
  data?: any;
}

// Modelo para itens em impressão de cupom fiscal
interface FiscalItem {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitOfMeasure?: string;
  taxRate?: number;
}

// Modelo para dados de um cupom fiscal completo
interface FiscalReceipt {
  documentNumber: string;
  items: FiscalItem[];
  customerName?: string;
  customerDocument?: string;
  paymentMethod: string;
  totalAmount: number;
  issuedAt: Date;
}

/**
 * Simulação do driver para impressora fiscal Bematech
 * Em um ambiente real, esses métodos chamariam DLLs nativas ou APIs da impressora
 */
class BematechPrinterService {
  private printerPort: string;
  private printerModel: string;
  private connected: boolean = false;
  private serialNumber: string = 'BMP-' + Math.floor(100000 + Math.random() * 900000).toString();

  constructor(printerModel: string = 'Bematech MP-4200 TH', printerPort: string = 'COM1') {
    this.printerModel = printerModel;
    this.printerPort = printerPort;
  }

  /**
   * Inicia a conexão com a impressora
   */
  connect(): PrinterResponse {
    console.log(`[Bematech] Conectando à impressora fiscal ${this.printerModel} na porta ${this.printerPort}...`);
    
    // Simulação de conexão
    this.connected = true;

    return {
      success: true,
      code: 0,
      message: `Impressora fiscal ${this.printerModel} conectada com sucesso na porta ${this.printerPort}.`,
      data: {
        serialNumber: this.serialNumber,
        model: this.printerModel,
        port: this.printerPort
      }
    };
  }

  /**
   * Verifica o status da impressora
   */
  checkStatus(): PrinterResponse {
    if (!this.connected) {
      return { success: false, code: 1, message: 'Impressora não está conectada.' };
    }

    return {
      success: true,
      code: 0,
      message: 'Impressora pronta para uso.',
      data: {
        status: 'ready',
        paperStatus: 'ok',
        drawerStatus: 'closed'
      }
    };
  }

  /**
   * Abre a gaveta de dinheiro
   */
  openCashDrawer(): PrinterResponse {
    if (!this.connected) {
      this.connect();
    }

    console.log(`[Bematech] Abrindo gaveta de dinheiro...`);
    
    return {
      success: true,
      code: 0,
      message: 'Gaveta de dinheiro aberta com sucesso.'
    };
  }

  /**
   * Imprime um cupom fiscal
   */
  printFiscalReceipt(receipt: FiscalReceipt): PrinterResponse {
    if (!this.connected) {
      this.connect();
    }

    console.log(`[Bematech] Imprimindo cupom fiscal #${receipt.documentNumber}...`);
    console.log(`[Bematech] Cliente: ${receipt.customerName || 'Consumidor'}`);
    console.log(`[Bematech] Itens: ${receipt.items.length}`);
    console.log(`[Bematech] Total: R$ ${receipt.totalAmount.toFixed(2)}`);

    // Simulação de impressão
    const receiptText = this.formatFiscalReceiptText(receipt);
    
    return {
      success: true,
      code: 0,
      message: 'Cupom fiscal impresso com sucesso.',
      data: {
        documentNumber: receipt.documentNumber,
        timestamp: new Date(),
        serialNumber: this.serialNumber,
        text: receiptText
      }
    };
  }

  /**
   * Imprime uma NFC-e
   */
  printNFCe(receipt: FiscalReceipt): PrinterResponse {
    if (!this.connected) {
      this.connect();
    }

    console.log(`[Bematech] Imprimindo NFC-e #${receipt.documentNumber}...`);
    console.log(`[Bematech] Cliente: ${receipt.customerName || 'Consumidor'}`);
    console.log(`[Bematech] Documento: ${receipt.customerDocument || 'Não informado'}`);
    console.log(`[Bematech] Itens: ${receipt.items.length}`);
    console.log(`[Bematech] Total: R$ ${receipt.totalAmount.toFixed(2)}`);

    // Simulação de impressão
    const receiptText = this.formatNFCeText(receipt);
    
    return {
      success: true,
      code: 0,
      message: 'NFC-e impressa com sucesso.',
      data: {
        documentNumber: receipt.documentNumber,
        timestamp: new Date(),
        serialNumber: this.serialNumber,
        text: receiptText
      }
    };
  }

  /**
   * Imprime um relatório X (fechamento parcial do dia)
   */
  printXReport(): PrinterResponse {
    if (!this.connected) {
      this.connect();
    }

    console.log(`[Bematech] Imprimindo Relatório X...`);
    
    return {
      success: true,
      code: 0,
      message: 'Relatório X impresso com sucesso.',
      data: {
        timestamp: new Date(),
        serialNumber: this.serialNumber
      }
    };
  }

  /**
   * Imprime um relatório Z (fechamento do dia)
   */
  printZReport(): PrinterResponse {
    if (!this.connected) {
      this.connect();
    }

    console.log(`[Bematech] Imprimindo Relatório Z...`);
    
    return {
      success: true,
      code: 0,
      message: 'Relatório Z impresso com sucesso.',
      data: {
        timestamp: new Date(),
        serialNumber: this.serialNumber
      }
    };
  }

  /**
   * Imprime um relatório personalizado das vendas diárias
   */
  printDailySalesReport(date: Date = new Date(), totalAmount: number = 0, totalSales: number = 0): PrinterResponse {
    if (!this.connected) {
      this.connect();
    }

    const formattedDate = date.toLocaleDateString('pt-BR');
    console.log(`[Bematech] Imprimindo relatório de vendas do dia ${formattedDate}...`);
    
    const reportText = this.formatDailyReportText(date, totalAmount, totalSales);
    
    return {
      success: true,
      code: 0,
      message: 'Relatório de vendas impresso com sucesso.',
      data: {
        date: formattedDate,
        totalAmount,
        totalSales,
        timestamp: new Date(),
        text: reportText
      }
    };
  }

  /**
   * Imprime uma página de teste
   */
  printTestPage(): PrinterResponse {
    if (!this.connected) {
      this.connect();
    }

    console.log(`[Bematech] Imprimindo página de teste...`);
    
    return {
      success: true,
      code: 0,
      message: 'Página de teste impressa com sucesso.',
      data: {
        timestamp: new Date(),
        serialNumber: this.serialNumber
      }
    };
  }

  /**
   * Fecha a conexão com a impressora
   */
  disconnect(): PrinterResponse {
    console.log(`[Bematech] Desconectando da impressora...`);
    
    this.connected = false;
    
    return {
      success: true,
      code: 0,
      message: 'Impressora desconectada com sucesso.'
    };
  }

  /**
   * Formata o texto de um cupom fiscal para impressão
   */
  private formatFiscalReceiptText(receipt: FiscalReceipt): string {
    const now = receipt.issuedAt || new Date();
    const header = [
      '================================================',
      '                 CUPOM FISCAL                   ',
      '================================================',
      `Data: ${now.toLocaleDateString('pt-BR')} Hora: ${now.toLocaleTimeString('pt-BR')}`,
      `Documento Nº: ${receipt.documentNumber}`,
      `Cliente: ${receipt.customerName || 'Consumidor Final'}`,
      '------------------------------------------------',
      'Código   Descrição              Qtd   V.Unit   Total',
      '------------------------------------------------',
    ].join('\n');

    const items = receipt.items.map(item => {
      const code = item.code.padEnd(8, ' ');
      const desc = item.description.substring(0, 20).padEnd(20, ' ');
      const qty = item.quantity.toString().padStart(5, ' ');
      const unit = item.unitPrice.toFixed(2).padStart(8, ' ');
      const total = item.totalPrice.toFixed(2).padStart(8, ' ');
      return `${code} ${desc} ${qty} ${unit} ${total}`;
    }).join('\n');

    const footer = [
      '------------------------------------------------',
      `Total: R$ ${receipt.totalAmount.toFixed(2).padStart(10, ' ')}`,
      `Forma de Pagamento: ${receipt.paymentMethod}`,
      '------------------------------------------------',
      'Obrigado pela preferência!',
      `Impressora: ${this.serialNumber}`,
      '================================================',
    ].join('\n');

    return `${header}\n${items}\n${footer}`;
  }

  /**
   * Formata o texto de uma NFC-e para impressão
   */
  private formatNFCeText(receipt: FiscalReceipt): string {
    const now = receipt.issuedAt || new Date();
    const header = [
      '================================================',
      '       DOCUMENTO AUXILIAR DA NOTA FISCAL        ',
      '         CONSUMIDOR ELETRÔNICA - DANFE          ',
      '================================================',
      `Data: ${now.toLocaleDateString('pt-BR')} Hora: ${now.toLocaleTimeString('pt-BR')}`,
      `Documento Nº: ${receipt.documentNumber}`,
      `Cliente: ${receipt.customerName || 'Consumidor Final'}`,
      receipt.customerDocument ? `Documento: ${receipt.customerDocument}` : '',
      '------------------------------------------------',
      'Código   Descrição              Qtd   V.Unit   Total',
      '------------------------------------------------',
    ].join('\n');

    const items = receipt.items.map(item => {
      const code = item.code.padEnd(8, ' ');
      const desc = item.description.substring(0, 20).padEnd(20, ' ');
      const qty = item.quantity.toString().padStart(5, ' ');
      const unit = item.unitPrice.toFixed(2).padStart(8, ' ');
      const total = item.totalPrice.toFixed(2).padStart(8, ' ');
      return `${code} ${desc} ${qty} ${unit} ${total}`;
    }).join('\n');

    const footer = [
      '------------------------------------------------',
      `Total: R$ ${receipt.totalAmount.toFixed(2).padStart(10, ' ')}`,
      `Forma de Pagamento: ${receipt.paymentMethod}`,
      '------------------------------------------------',
      'Consulte pela Chave de Acesso em:',
      'http://www.nfe.fazenda.gov.br/portal',
      'Protocolo de Autorização:',
      `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      '------------------------------------------------',
      'Obrigado pela preferência!',
      `Impressora: ${this.serialNumber}`,
      '================================================',
    ].join('\n');

    return `${header}\n${items}\n${footer}`;
  }

  /**
   * Formata o texto de um relatório diário para impressão
   */
  private formatDailyReportText(date: Date, totalAmount: number, totalSales: number): string {
    const formattedDate = date.toLocaleDateString('pt-BR');
    const header = [
      '================================================',
      '             RELATÓRIO DE VENDAS                ',
      '================================================',
      `Data: ${formattedDate}`,
      `Hora: ${new Date().toLocaleTimeString('pt-BR')}`,
      '------------------------------------------------',
    ].join('\n');

    const body = [
      `Total de Vendas: ${totalSales}`,
      `Valor Total: R$ ${totalAmount.toFixed(2)}`,
      `Ticket Médio: R$ ${(totalAmount / (totalSales || 1)).toFixed(2)}`,
      '------------------------------------------------',
    ].join('\n');

    const footer = [
      'Relatório gerado automaticamente pelo sistema',
      `Impressora: ${this.serialNumber}`,
      '================================================',
    ].join('\n');

    return `${header}\n${body}\n${footer}`;
  }
}

// Exporta o serviço da impressora
export const printerService = new BematechPrinterService();
export default printerService;