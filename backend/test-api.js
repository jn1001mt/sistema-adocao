/**
 * test-api.js - Script de teste automatizado dos fluxos e regras de negócio
 */

const http = require('http');

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 INICIANDO TESTES AUTOMATIZADOS DO SISTEMA DE ADOÇÃO');
  console.log('========================================================\n');

  try {
    // 1. Dashboard Estatísticas
    console.log('▶ Teste 1: Consultar estatísticas do dashboard...');
    const stats1 = await apiRequest('GET', '/animais/estatisticas');
    console.log('  Status:', stats1.status, '| Dados:', stats1.data);
    if (stats1.status !== 200) throw new Error('Falha ao obter estatísticas');

    // 2. Cadastrar novo animal
    console.log('\n▶ Teste 2: Cadastrar novo animal (POST /animais)...');
    const novoAnimalPayload = {
      nome: 'Paçoca',
      especie: 'Cachorro',
      raca: 'Vira-lata Caramelo',
      idade: 2,
      porte: 'Médio'
    };
    const cadAnimal = await apiRequest('POST', '/animais', novoAnimalPayload);
    console.log('  Status:', cadAnimal.status, '| Retorno:', cadAnimal.data);
    if (cadAnimal.status !== 201 || cadAnimal.data.status !== 'Disponível') {
      throw new Error('Falha ao cadastrar animal');
    }
    const idAnimalCadastrado = cadAnimal.data.id;
    console.log(`  ✓ Animal cadastrado com ID ${idAnimalCadastrado} e status 'Disponível'`);

    // 3. Consultar animal por ID
    console.log(`\n▶ Teste 3: Consultar animal por ID (GET /animais/${idAnimalCadastrado})...`);
    const buscaAnimal = await apiRequest('GET', `/animais/${idAnimalCadastrado}`);
    console.log('  Status:', buscaAnimal.status, '| Nome:', buscaAnimal.data.nome);
    if (buscaAnimal.status !== 200 || buscaAnimal.data.nome !== 'Paçoca') {
      throw new Error('Falha ao buscar animal por ID');
    }

    // 4. Editar animal
    console.log(`\n▶ Teste 4: Editar animal (PUT /animais/${idAnimalCadastrado})...`);
    const updatePayload = {
      nome: 'Paçoca Dourado',
      especie: 'Cachorro',
      raca: 'SRD Especial',
      idade: 3,
      porte: 'Médio'
    };
    const updateAnimal = await apiRequest('PUT', `/animais/${idAnimalCadastrado}`, updatePayload);
    console.log('  Status:', updateAnimal.status, '| Nome Atualizado:', updateAnimal.data.nome);
    if (updateAnimal.status !== 200 || updateAnimal.data.nome !== 'Paçoca Dourado') {
      throw new Error('Falha ao atualizar animal');
    }

    // 5. Testar exclusão com confirmação
    console.log('\n▶ Teste 5: Cadastrar animal temporário para teste de exclusão...');
    const tempAnimal = await apiRequest('POST', '/animais', {
      nome: 'Animal Teste Exclusao',
      especie: 'Gato',
      raca: 'SRD',
      idade: 1,
      porte: 'Pequeno'
    });
    const idTemp = tempAnimal.data.id;
    console.log(`  Animal temporário criado: ID ${idTemp}`);
    console.log(`  Removendo animal temporário (DELETE /animais/${idTemp})...`);
    const delTemp = await apiRequest('DELETE', `/animais/${idTemp}`);
    console.log('  Status:', delTemp.status, '| Mensagem:', delTemp.data.mensagem);
    if (delTemp.status !== 200) throw new Error('Falha ao excluir animal');

    // 6. Registrar Adoção do animal Paçoca
    console.log(`\n▶ Teste 6: Registrar adoção para Paçoca (POST /adocoes)...`);
    const adocaoPayload = {
      nome_adotante: 'Juliana Fernandes',
      telefone: '(83) 98765-4321',
      email: 'juliana@exemplo.com',
      id_animal: idAnimalCadastrado
    };
    const regAdocao = await apiRequest('POST', '/adocoes', adocaoPayload);
    console.log('  Status:', regAdocao.status, '| Resposta:', regAdocao.data);
    if (regAdocao.status !== 201) throw new Error('Falha ao registrar adoção');

    // 7. Verificar se status do animal mudou automaticamente para Adotado
    console.log(`\n▶ Teste 7: Verificar se o status de Paçoca mudou para 'Adotado'...`);
    const verifAnimal = await apiRequest('GET', `/animais/${idAnimalCadastrado}`);
    console.log('  Status Atual do Animal:', verifAnimal.data.status);
    if (verifAnimal.data.status !== 'Adotado') {
      throw new Error('Status do animal deveria ser Adotado');
    }
    console.log('  ✓ Status alterado com sucesso para Adotado!');

    // 8. Impedir adoção duplicada (animal já adotado)
    console.log('\n▶ Teste 8: Tentar adotar novamente o mesmo animal (deve falhar)...');
    const adocaoDuplicada = await apiRequest('POST', '/adocoes', {
      nome_adotante: 'Outra Pessoa',
      telefone: '(83) 91111-2222',
      email: 'outro@exemplo.com',
      id_animal: idAnimalCadastrado
    });
    console.log('  Status:', adocaoDuplicada.status, '| Mensagem:', adocaoDuplicada.data.mensagem);
    if (adocaoDuplicada.status !== 400) {
      throw new Error('Deveria ter retornado HTTP 400 para animal já adotado');
    }
    console.log('  ✓ Adoção duplicada impedida com sucesso!');

    // 9. Impedir adoção de animal inexistente
    console.log('\n▶ Teste 9: Tentar adotar animal inexistente ID 99999 (deve falhar)...');
    const adocaoInexistente = await apiRequest('POST', '/adocoes', {
      nome_adotante: 'Teste Inexistente',
      telefone: '(83) 91111-2222',
      email: 'teste@exemplo.com',
      id_animal: 99999
    });
    console.log('  Status:', adocaoInexistente.status, '| Mensagem:', adocaoInexistente.data.mensagem);
    if (adocaoInexistente.status !== 404) {
      throw new Error('Deveria ter retornado HTTP 404 para animal inexistente');
    }
    console.log('  ✓ Adoção de animal inexistente impedida com sucesso!');

    // 10. Listar histórico de adoções
    console.log('\n▶ Teste 10: Listar histórico de adoções (GET /adocoes)...');
    const adocoes = await apiRequest('GET', '/adocoes');
    console.log('  Status:', adocoes.status, '| Total de Adoções:', adocoes.data.length);
    console.log('  Última adoção registrada:', {
      adotante: adocoes.data[0].nome_adotante,
      animal: adocoes.data[0].animal,
      data: adocoes.data[0].data_adocao
    });

    // 11. Verificar estatísticas atualizadas no dashboard
    console.log('\n▶ Teste 11: Verificar estatísticas atualizadas no dashboard...');
    const statsFinal = await apiRequest('GET', '/animais/estatisticas');
    console.log('  Estatísticas finais:', statsFinal.data);

    console.log('\n========================================================');
    console.log(' TODOS OS 11 TESTES PASSARAM COM SUCESSO TOTAL!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('\n❌ ERRO DURANTE A EXECUÇÃO DOS TESTES:', err);
    process.exit(1);
  }
}

runTests();
