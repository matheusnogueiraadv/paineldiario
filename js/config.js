/* =========================================================
   CONFIG — parâmetros gerais do painel
   ========================================================= */
const CONFIG = {
  // Intervalo de atualização automática dos dados (ms)
  refreshMs: 15000,

  // Intervalo para recarregar a página inteira (ms). Necessário porque o
  // painel fica com a mesma aba aberta o dia todo em uma TV — sem isso, só
  // os DADOS atualizariam (via refreshMs); o CÓDIGO (html/css/js) ficaria
  // preso na versão que estava no ar quando a aba foi aberta, mesmo depois
  // de novos deploys.
  reloadMs: 2 * 60 * 60 * 1000, // 2 horas

  // Intervalo de rotação de páginas em listas longas (ex.: audiências)
  rotateMs: 8000,

  // Linhas visíveis por página na tabela de audiências
  audienciasPorPagina: 3,

  // Senha do painel administrativo
  senhaAdmin: 'Cerus@2026*',

  // Coordenadores da Agenda de Prazos (ordem de exibição)
  coordenadores: ['Fábio', 'Daniel', 'Jéssica'],
};
