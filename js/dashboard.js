/* =========================================================
   DASHBOARD — renderização das seções do painel de TV.
   Cada seção tem sua própria função de render; para incluir
   um novo indicador, crie o card no HTML, a função render
   correspondente e registre-a em renderAll().
   ========================================================= */
(() => {
  const $ = (sel) => document.querySelector(sel);

  let dadosAtuais = null;
  let valorFinanceiroAnterior = null;
  let paginaAudiencias = 0;

  const TONES_COORD = { 'Fábio': 'laranja', 'Daniel': 'roxo', 'Jéssica': 'verde' };

  /* ---------- Cabeçalho: data e relógio ---------- */
  function renderRelogio() {
    const agora = new Date();
    $('#relogio').textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const data = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    $('#dataHoje').textContent = data.charAt(0).toUpperCase() + data.slice(1);
  }

  /* ---------- 6. Indicador Financeiro (destaque) ---------- */
  function parseDataLocal(str) {
    const [ano, mes, dia] = str.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  /* Dias úteis (seg-sex) restantes entre hoje e o fim do mês corrente, ambos inclusive. */
  function diasUteisRestantesNoMes() {
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    let count = 0;
    for (const d = new Date(hoje); d <= fim; d.setDate(d.getDate() + 1)) {
      const diaSemana = d.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) count++;
    }
    return Math.max(1, count);
  }

  function renderFinanceiro(d) {
    const el = $('#financeiroValor');
    const de = valorFinanceiroAnterior ?? d.financeiro.arrecadado;
    UI.countUp(el, de, d.financeiro.arrecadado, UI.money, 900);
    valorFinanceiroAnterior = d.financeiro.arrecadado;
    $('#financeiroRotulo').textContent = d.financeiro.rotulo || 'Inadimplência arrecadada';

    const dataRef = d.financeiro.dataAtualizacao
      ? parseDataLocal(d.financeiro.dataAtualizacao)
      : new Date();
    $('#financeiroData').textContent = 'Atualizado em ' + dataRef.toLocaleDateString('pt-BR');

    const meta = d.financeiro.metaOuro || 0;
    const falta = Math.max(0, meta - d.financeiro.arrecadado);
    const diasUteis = diasUteisRestantesNoMes();
    const faltaPorDia = falta / diasUteis;

    $('#financeiroMeta').innerHTML = meta > 0 ? `
      <div class="hero-meta__item">
        <small>Falta p/ Meta Ouro (${UI.money(meta)})</small>
        <strong>${falta > 0 ? UI.money(falta) : 'Meta atingida 🏆'}</strong>
      </div>
      <div class="hero-meta__item">
        <small>Falta por dia útil</small>
        <strong>${falta > 0 ? UI.money(faltaPorDia) : '—'}</strong>
      </div>` : '';
  }

  /* Formata uma data 'YYYY-MM-DD' como texto curto de "última atualização". */
  function formatarDataAtualizacao(str) {
    if (!str) return '';
    return 'Atualizado em ' + parseDataLocal(str).toLocaleDateString('pt-BR');
  }

  /* ---------- 1. Ranking de Ajuizamento ---------- */
  function renderRanking(d) {
    const meta = d.ranking.metaOuro;
    $('#rankingData').textContent = formatarDataAtualizacao(d.ranking.dataAtualizacao);
    const lista = [...d.ranking.responsaveis]
      .sort((a, b) => b.ajuizados - a.ajuizados)
      .slice(0, 7);

    $('#rankingLista').innerHTML = lista.map((r, i) => {
      const falta = Math.max(0, meta - r.ajuizados);
      const atingiu = falta === 0;
      return `<div class="rank-row ${atingiu ? 'rank-row--ouro' : ''}">
        <div class="rank-row__info">
          ${UI.posBadge(i)}
          <span class="rank-row__nome">${UI.esc(r.nome)}</span>
          <span class="rank-row__qtd">${UI.int(r.ajuizados)}</span>
          <span class="rank-row__falta">${atingiu ? '🏆 Meta Ouro' : `faltam ${UI.int(falta)}`}</span>
        </div>
        ${UI.progressBar(UI.pct(r.ajuizados, meta), atingiu ? 'ouro' : 'laranja')}
      </div>`;
    }).join('');

    const total = lista.reduce((s, r) => s + r.ajuizados, 0);
    const metaTime = d.ranking.metaTime ?? (meta * lista.length);
    const restante = Math.max(0, metaTime - total);
    $('#rankingRodape').innerHTML = `
      <div class="total-box">
        <small>Total do time</small><strong>${UI.int(total)}</strong>
      </div>
      <div class="total-box total-box--ouro">
        <small>Restante p/ Meta Ouro</small><strong>${UI.int(restante)}</strong>
      </div>`;
    $('#rankingMeta').textContent = `Meta Ouro: ${UI.int(metaTime)}`;
  }

  /* ---------- 2. Agenda de Prazos (hoje) ---------- */
  function renderPrazos(d) {
    const analistas = [...d.prazos.analistas]
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 7);
    const max = Math.max(1, ...analistas.map(a => a.quantidade));

    $('#prazosLista').innerHTML = analistas.map(a => {
      const tone = TONES_COORD[a.coordenador] || 'laranja';
      return `<div class="prazo-row">
        <span class="dot dot--${tone}" title="${UI.esc(a.coordenador)}"></span>
        <span class="prazo-row__nome">${UI.esc(a.nome)}</span>
        ${UI.progressBar(UI.pct(a.quantidade, max), tone)}
        <span class="prazo-row__qtd">${UI.int(a.quantidade)}</span>
      </div>`;
    }).join('');

    $('#prazosCoordenadores').innerHTML = CONFIG.coordenadores.map(c => {
      const total = d.prazos.analistas
        .filter(a => a.coordenador === c)
        .reduce((s, a) => s + a.quantidade, 0);
      return UI.coordChip(c, total, TONES_COORD[c] || 'laranja');
    }).join('');

    const totalDia = d.prazos.analistas.reduce((s, a) => s + a.quantidade, 0);
    $('#prazosTotal').textContent = `${UI.int(totalDia)} hoje`;
  }

  /* ---------- 3. Audiências do dia ---------- */
  function renderAudiencias(d) {
    const hoje = d.audiencias.hoje || [];
    const porPagina = CONFIG.audienciasPorPagina;
    const paginas = Math.max(1, Math.ceil(hoje.length / porPagina));
    paginaAudiencias = paginaAudiencias % paginas;
    const visiveis = hoje.slice(paginaAudiencias * porPagina, (paginaAudiencias + 1) * porPagina);

    $('#audienciasCorpo').innerHTML = visiveis.length
      ? visiveis.map(a => `<tr>
          <td>${UI.esc(a.condominio)}</td>
          <td class="td-hora">${UI.esc(a.horario)}</td>
          <td class="td-adv">${UI.esc(a.advogado)}</td>
        </tr>`).join('')
      : `<tr><td colspan="3" class="td-vazio">Nenhuma audiência hoje</td></tr>`;

    $('#audienciasPaginacao').textContent = paginas > 1 ? `${paginaAudiencias + 1}/${paginas}` : '';
    $('#audienciasKpis').innerHTML =
      UI.kpi(UI.int(hoje.length), 'Hoje', 'laranja') +
      UI.kpi(UI.int(d.audiencias.totalMes), 'No mês');
  }

  /* ---------- 4. Publicações ---------- */
  function renderPublicacoes(d) {
    const p = d.publicacoes;
    const pendentes = Math.max(0, p.recebidasHoje - p.tratadasHoje);
    $('#publicacoesKpis').innerHTML =
      UI.kpi(UI.int(p.recebidasHoje), 'Recebidas hoje') +
      UI.kpi(UI.int(p.tratadasHoje), 'Tratadas hoje', 'verde') +
      UI.kpi(UI.int(p.tratadasMes), 'Tratadas no mês', 'laranja');
    $('#publicacoesBarra').innerHTML = `
      <small>Tratamento do dia — ${pendentes > 0 ? UI.int(pendentes) + ' pendentes' : 'em dia ✓'}</small>
      ${UI.progressBar(UI.pct(p.tratadasHoje, p.recebidasHoje), pendentes > 0 ? 'laranja' : 'verde')}`;
  }

  /* ---------- 5. Atendimentos para Ajuizamento ---------- */
  function renderAtendimentos(d) {
    $('#atendimentosData').textContent = formatarDataAtualizacao(d.atendimentos.dataAtualizacao);
    $('#atendimentosLista').innerHTML = d.atendimentos.lista.map(a => {
      const p = UI.pct(a.abertos, a.meta);
      const atingiu = a.abertos >= a.meta;
      return `<div class="atend-row">
        <div class="atend-row__info">
          <span class="atend-row__nome">${UI.esc(a.nome)}</span>
          <span class="atend-row__qtd">${UI.int(a.abertos)} <small>/ ${UI.int(a.meta)}</small></span>
        </div>
        ${UI.progressBar(p, atingiu ? 'verde' : 'azul')}
      </div>`;
    }).join('');
  }

  /* ---------- 7. Solicitação de Matrículas ---------- */
  function renderMatriculas(d) {
    const m = d.matriculas;
    $('#matriculasKpis').innerHTML =
      UI.kpi(UI.int(m.cerus), 'Cerus', 'laranja') +
      UI.kpi(UI.int(m.parceiros), 'Parceiros');
  }

  /* ---------- Orquestração ---------- */
  function renderAll(d) {
    dadosAtuais = d;
    renderFinanceiro(d);
    renderMatriculas(d);
    renderRanking(d);
    renderPrazos(d);
    renderAudiencias(d);
    renderPublicacoes(d);
    renderAtendimentos(d);

    const quando = d.atualizadoEm
      ? new Date(d.atualizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '—';
    $('#atualizadoEm').textContent = `Dados atualizados às ${quando}`;
  }

  function init() {
    renderRelogio();
    setInterval(renderRelogio, 1000);

    DataStore.load().then(renderAll);

    // Atualização automática (polling) — busca dados novos salvos no
    // painel administrativo, mesmo que tenham sido gravados em outro
    // dispositivo/computador. Mantém o painel vivo na TV.
    setInterval(() => DataStore.load().then(renderAll), CONFIG.refreshMs);

    // Rotação de páginas das audiências
    setInterval(() => {
      paginaAudiencias++;
      if (dadosAtuais) renderAudiencias(dadosAtuais);
    }, CONFIG.rotateMs);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
