/* =========================================================
   WORKER — serve os arquivos estáticos do painel e expõe uma
   API mínima (/api/dados) que usa o Cloudflare KV como fonte
   central de dados, compartilhada por qualquer dispositivo
   (TV, painel administrativo, etc).
   ========================================================= */
const CHAVE_KV = 'dados';

function comCors(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/dados') {
      if (request.method === 'OPTIONS') {
        return comCors(new Response(null, { status: 204 }));
      }

      if (request.method === 'GET') {
        const salvo = await env.PAINEL_KV.get(CHAVE_KV);
        return comCors(new Response(salvo || 'null', {
          headers: { 'Content-Type': 'application/json' },
        }));
      }

      if (request.method === 'POST') {
        const corpo = await request.text();
        try {
          JSON.parse(corpo); // valida antes de gravar
        } catch {
          return comCors(new Response(JSON.stringify({ erro: 'JSON inválido' }), { status: 400 }));
        }
        await env.PAINEL_KV.put(CHAVE_KV, corpo);
        return comCors(new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        }));
      }

      return comCors(new Response('Método não permitido', { status: 405 }));
    }

    // Qualquer outra rota: serve os arquivos estáticos (index.html, admin.html, css/js…)
    return env.ASSETS.fetch(request);
  },
};
