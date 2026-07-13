/* =========================================================
   DATASTORE — camada de dados do painel.

   Hoje: fonte central via Cloudflare Worker + KV (arquivo
   worker.js), acessível em /api/dados. Qualquer dispositivo
   (TV, painel administrativo) lê e grava no mesmo lugar —
   diferente do antigo modelo em localStorage, que era isolado
   por navegador/computador.

   Futuro: Google Sheets pode substituir ou complementar o KV
   como fonte de dados. Como load()/save() são a única interface
   usada pelo resto do app, a troca fica isolada neste arquivo.
   Ver backend/README.md.
   ========================================================= */
const DataStore = (() => {
  const ENDPOINT = '/api/dados';

  async function load() {
    try {
      const resposta = await fetch(ENDPOINT, { cache: 'no-store' });
      if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
      const dados = await resposta.json();
      if (dados && dados.financeiro) return dados;
    } catch (e) {
      console.warn('DataStore: não foi possível carregar os dados da nuvem, usando mock local.', e);
    }
    return JSON.parse(JSON.stringify(MOCK_DATA));
  }

  async function save(dados) {
    dados.atualizadoEm = new Date().toISOString();
    const resposta = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
    return dados;
  }

  return {
    load,
    save,

    /* Restaura os dados fictícios originais (grava na nuvem também). */
    reset: () => save(JSON.parse(JSON.stringify(MOCK_DATA))),
  };
})();
