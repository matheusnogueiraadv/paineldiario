/* =========================================================
   COMPONENTS — helpers de formatação e componentes de UI
   reutilizáveis (retornam strings de HTML).
   ========================================================= */
const UI = (() => {

  const moneyFmt = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 2,
  });
  const intFmt = new Intl.NumberFormat('pt-BR');

  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const pct = (valor, meta) => meta > 0 ? Math.min(100, Math.round((valor / meta) * 100)) : 0;

  /* Barra de progresso. tone: 'laranja' | 'ouro' | 'verde' | 'azul' */
  function progressBar(percent, tone = 'laranja') {
    return `<div class="bar bar--${tone}"><span style="width:${percent}%"></span></div>`;
  }

  /* Badge de posição do ranking (1º ouro, 2º prata, 3º bronze) */
  function posBadge(i) {
    const cls = i === 0 ? 'pos--ouro' : i === 1 ? 'pos--prata' : i === 2 ? 'pos--bronze' : '';
    return `<span class="pos ${cls}">${i + 1}º</span>`;
  }

  /* KPI simples: número grande + rótulo */
  function kpi(valor, rotulo, tone = '') {
    return `<div class="kpi ${tone ? 'kpi--' + tone : ''}">
      <strong>${valor}</strong><small>${esc(rotulo)}</small>
    </div>`;
  }

  /* Chip de coordenador com total */
  function coordChip(nome, total, tone) {
    return `<div class="coord-chip coord-chip--${tone}">
      <span class="coord-chip__nome">${esc(nome)}</span>
      <span class="coord-chip__total">${intFmt.format(total)}</span>
    </div>`;
  }

  /* Anima a transição de um valor numérico dentro de um elemento */
  function countUp(el, from, to, format, dur = 700) {
    if (from === to) { el.textContent = format(to); return; }
    const start = performance.now();
    (function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  return {
    money: (v) => moneyFmt.format(v || 0),
    int: (v) => intFmt.format(v || 0),
    esc, pct, progressBar, posBadge, kpi, coordChip, countUp,
  };
})();
