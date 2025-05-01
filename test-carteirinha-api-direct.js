import { exec } from 'child_process';

// Testa a API de carteirinha diretamente usando curl
exec('curl -s -H "Accept: application/json" -X GET http://localhost:5000/api/carteirinha/verify/MEM-123-test', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o comando: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Erro no curl: ${stderr}`);
    return;
  }
  
  try {
    // Tenta fazer parse da resposta como JSON
    const response = JSON.parse(stdout);
    console.log('Resposta da API:', JSON.stringify(response, null, 2));
  } catch (e) {
    // Se não for JSON, mostra o começo da resposta para diagnóstico
    console.log('Resposta não é JSON válido. Primeiros 500 caracteres:');
    console.log(stdout.substring(0, 500) + '...');
  }
});