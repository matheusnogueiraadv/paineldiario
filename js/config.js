/* =========================================================
   CONFIG — parâmetros gerais do painel
   ========================================================= */
const CONFIG = {
  // Chave de persistência local (mock). Será substituída pela
  // integração com Google Sheets (ver backend/README.md).
  storageKey: 'cerus_painel_produtividade_v1',

  // Intervalo de atualização automática dos dados (ms)
  refreshMs: 15000,

  // Intervalo de rotação de páginas em listas longas (ex.: audiências)
  rotateMs: 8000,

  // Linhas visíveis por página na tabela de audiências
  audienciasPorPagina: 3,

  // Senha do painel administrativo
  senhaAdmin: 'Cerus@2026*',

  // Coordenadores da Agenda de Prazos (ordem de exibição)
  coordenadores: ['Fábio', 'Daniel', 'Jéssica'],
};
