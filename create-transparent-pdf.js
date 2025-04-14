import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de arquivos para gerar
const files = [
  'abrace-ata-ago-2024.pdf',
  'abrace-autorizacao.pdf',
  'abrace-certificado-utilidade-publica.pdf',
  'abrace-estatuto.pdf',
  'abrace-gmp.pdf',
  'abrace-iso17025.pdf',
  'abrace-organico.pdf',
  'abrace-sustentabilidade-2023.pdf',
  'abrace-boas-praticas.pdf',
  'abrace-comite-cientifico.pdf',
  'abrace-testes-q1-2024.pdf',
  'abrace-rastreabilidade.pdf',
  'abrace-conselho-consultivo.pdf',
  'exemplo-certificado-os.pdf',
  'exemplo-certificado-cebas.pdf',
  'exemplo-certificado-iso.pdf',
  'exemplo-certificado-fgts.pdf',
  'ata-assembleia-2024.pdf',
  'ata-conselho-fiscal-t1-2024.pdf',
  'estatuto-social-2023.pdf',
  'regimento-interno.pdf'
];

// Pasta onde os arquivos serão salvos
const uploadsDir = path.join(__dirname, 'uploads', 'transparencia');

// Verifica se o diretório existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Diretório ${uploadsDir} criado.`);
}

// Conteúdo PDF básico (este não é um PDF válido, apenas um placeholder)
const pdfBasico = `%PDF-1.4
1 0 obj
<< /Type /Catalog
   /Pages 2 0 R
>>
endobj
2 0 obj
<< /Type /Pages
   /Kids [3 0 R]
   /Count 1
>>
endobj
3 0 obj
<< /Type /Page
   /Parent 2 0 R
   /Resources 4 0 R
   /MediaBox [0 0 612 792]
   /Contents 5 0 R
>>
endobj
4 0 obj
<< /Font << /F1 6 0 R >>
>>
endobj
5 0 obj
<< /Length 68 >>
stream
BT
/F1 24 Tf
100 700 Td
(Documento do Portal de Transparência) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /Helvetica
>>
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000216 00000 n
0000000257 00000 n
0000000377 00000 n
trailer
<< /Size 7
   /Root 1 0 R
>>
startxref
446
%%EOF`;

// Cria cada arquivo PDF
files.forEach(file => {
  const filePath = path.join(uploadsDir, file);
  
  try {
    fs.writeFileSync(filePath, pdfBasico);
    console.log(`Arquivo ${file} criado com sucesso em ${filePath}`);
  } catch (err) {
    console.error(`Erro ao criar o arquivo ${file}:`, err);
  }
});

console.log('Todos os arquivos PDF foram criados.');