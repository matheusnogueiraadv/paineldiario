/* =========================================================
   ADMIN — formulários de edição dos indicadores.
   Lê os dados via DataStore, monta os formulários e, ao
   salvar, grava via DataStore.save() na nuvem — qualquer
   dispositivo (TV, outro computador) recebe a atualização no
   próximo carregamento/atualização automática.
   ========================================================= */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const grid = () => $('#adminGrid');

  let dados = null;

  /* ---------- Controle de acesso ---------- */
  function initGate() {
    if (sessionStorage.getItem('cerus_admin_ok') === '1') {
      $('#gate').remove();
      return;
    }
    $('#gateForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('#gateSenha').value === CONFIG.senhaAdmin) {
        sessionStorage.setItem('cerus_admin_ok', '1');
        $('#gate').remove();
      } else {
        $('#gateErro').textContent = 'Senha incorreta.';
        $('#gateSenha').value = '';
        $('#gateSenha').focus();
      }
    });
  }

  /* ---------- Helpers de montagem ---------- */
  function secao(titulo, corpoHtml, extraHeader = '') {
    return `<section class="card card--admin">
      <div class="card__header">
        <h2 class="card__title">${titulo}</h2>${extraHeader}
      </div>
      <div class="card__body">${corpoHtml}</div>
    </section>`;
  }

  const inputTexto = (id, valor) =>
    `<input class="campo" type="text" data-campo="${id}" value="${UI.esc(valor)}" />`;
  const inputNum = (id, valor, step = 1) =>
    `<input class="campo campo--num" type="number" min="0" step="${step}" data-campo="${id}" value="${valor}" />`;

  /* ---------- Seções ---------- */
  function htmlFinanceiro() {
    return secao('Indicador Financeiro', `
      <div class="linha-campos">
        <label>Valor arrecadado (R$)
          ${inputNum('financeiro.arrecadado', dados.financeiro.arrecadado, 0.01)}
        </label>
        <label>Meta Ouro (R$)
          ${inputNum('financeiro.metaOuro', dados.financeiro.metaOuro || 0, 0.01)}
        </label>
        <label>Data da última atualização
          <input class="campo" type="date" data-campo="financeiro.dataAtualizacao" value="${dados.financeiro.dataAtualizacao || ''}" />
        </label>
        <label>Rótulo do indicador
          ${inputTexto('financeiro.rotulo', dados.financeiro.rotulo)}
        </label>
      </div>`);
  }

  function htmlRanking() {
    const linhas = dados.ranking.responsaveis.map((r, i) => `<tr>
      <td>${inputTexto(`ranking.responsaveis.${i}.nome`, r.nome)}</td>
      <td style="width:130px">${inputNum(`ranking.responsaveis.${i}.ajuizados`, r.ajuizados)}</td>
    </tr>`).join('');
    return secao('Ranking de Ajuizamento', `
      <div class="linha-campos" style="margin-bottom:10px">
        <label>Meta Ouro (individual)
          ${inputNum('ranking.metaOuro', dados.ranking.metaOuro)}
        </label>
        <label>Meta geral do time
          ${inputNum('ranking.metaTime', dados.ranking.metaTime ?? dados.ranking.metaOuro * dados.ranking.responsaveis.length)}
        </label>
        <label>Data da última atualização
          <input class="campo" type="date" data-campo="ranking.dataAtualizacao" value="${dados.ranking.dataAtualizacao || ''}" />
        </label>
      </div>
      <table class="form-tabela">
        <thead><tr><th>Responsável</th><th>Ajuizados</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>`);
  }

  function htmlPrazos() {
    const opcoes = (sel) => CONFIG.coordenadores
      .map(c => `<option value="${c}" ${c === sel ? 'selected' : ''}>${c}</option>`).join('');
    const linhas = dados.prazos.analistas.map((a, i) => `<tr>
      <td>${inputTexto(`prazos.analistas.${i}.nome`, a.nome)}</td>
      <td style="width:140px">
        <select class="campo" data-campo="prazos.analistas.${i}.coordenador">${opcoes(a.coordenador)}</select>
      </td>
      <td style="width:110px">${inputNum(`prazos.analistas.${i}.quantidade`, a.quantidade)}</td>
    </tr>`).join('');
    return secao('Agenda de Prazos (hoje)', `
      <table class="form-tabela">
        <thead><tr><th>Analista</th><th>Coordenador</th><th>Prazos hoje</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>`);
  }

  function htmlAudiencias() {
    const linhas = dados.audiencias.hoje.map((a, i) => `<tr>
      <td>${inputTexto(`audiencias.hoje.${i}.condominio`, a.condominio)}</td>
      <td style="width:100px">${inputTexto(`audiencias.hoje.${i}.horario`, a.horario)}</td>
      <td>${inputTexto(`audiencias.hoje.${i}.advogado`, a.advogado)}</td>
      <td style="width:44px"><button class="btn btn--perigo btn--mini" data-remover-aud="${i}" title="Remover">✕</button></td>
    </tr>`).join('');
    return secao('Audiências do Dia', `
      <div class="linha-campos" style="margin-bottom:10px">
        <label>Total de audiências no mês
          ${inputNum('audiencias.totalMes', dados.audiencias.totalMes)}
        </label>
      </div>
      <table class="form-tabela">
        <thead><tr><th>Condomínio</th><th>Horário</th><th>Advogado</th><th></th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>`,
      `<button class="btn btn--mini" id="btnAddAudiencia">+ Adicionar</button>`);
  }

  function htmlPublicacoes() {
    return secao('Publicações', `
      <div class="linha-campos">
        <label>Recebidas hoje ${inputNum('publicacoes.recebidasHoje', dados.publicacoes.recebidasHoje)}</label>
        <label>Tratadas hoje ${inputNum('publicacoes.tratadasHoje', dados.publicacoes.tratadasHoje)}</label>
        <label>Tratadas no mês ${inputNum('publicacoes.tratadasMes', dados.publicacoes.tratadasMes)}</label>
      </div>`);
  }

  function htmlAtendimentos() {
    const linhas = dados.atendimentos.lista.map((a, i) => `<tr>
      <td>${inputTexto(`atendimentos.lista.${i}.nome`, a.nome)}</td>
      <td style="width:120px">${inputNum(`atendimentos.lista.${i}.abertos`, a.abertos)}</td>
      <td style="width:120px">${inputNum(`atendimentos.lista.${i}.meta`, a.meta)}</td>
    </tr>`).join('');
    return secao('Atendimentos p/ Ajuizamento', `
      <div class="linha-campos" style="margin-bottom:10px">
        <label>Data da última atualização
          <input class="campo" type="date" data-campo="atendimentos.dataAtualizacao" value="${dados.atendimentos.dataAtualizacao || ''}" />
        </label>
      </div>
      <table class="form-tabela">
        <thead><tr><th>Atendente</th><th>Abertos</th><th>Meta</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>`);
  }

  function htmlMatriculas() {
    return secao('Solicitação de Matrículas', `
      <div class="linha-campos">
        <label>Cerus (carteira interna)
          ${inputNum('matriculas.cerus', dados.matriculas.cerus)}
        </label>
        <label>Parceiros (carteira externa)
          ${inputNum('matriculas.parceiros', dados.matriculas.parceiros)}
        </label>
      </div>`);
  }

  function render() {
    grid().innerHTML =
      htmlFinanceiro() + htmlMatriculas() + htmlRanking() + htmlPrazos() +
      htmlAudiencias() + htmlPublicacoes() + htmlAtendimentos();

    $('#btnAddAudiencia')?.addEventListener('click', () => {
      coletar();
      dados.audiencias.hoje.push({ condominio: '', horario: '', advogado: '' });
      render();
    });

    grid().querySelectorAll('[data-remover-aud]').forEach(btn => {
      btn.addEventListener('click', () => {
        coletar();
        dados.audiencias.hoje.splice(Number(btn.dataset.removerAud), 1);
        render();
      });
    });
  }

  /* ---------- Coleta os campos de volta para o objeto de dados ---------- */
  function coletar() {
    grid().querySelectorAll('[data-campo]').forEach(input => {
      const caminho = input.dataset.campo.split('.');
      let alvo = dados;
      for (let i = 0; i < caminho.length - 1; i++) alvo = alvo[caminho[i]];
      const chave = caminho[caminho.length - 1];
      alvo[chave] = input.type === 'number' ? Number(input.value || 0) : input.value;
    });
  }

  /* ---------- Ações do topo ---------- */
  function mostrarAviso() {
    const aviso = $('#avisoSalvo');
    aviso.classList.add('visivel');
    setTimeout(() => aviso.classList.remove('visivel'), 2500);
  }

  function initAcoes() {
    $('#btnSalvar').addEventListener('click', async () => {
      coletar();
      try {
        await DataStore.save(dados);
        mostrarAviso();
      } catch (e) {
        alert('Não foi possível salvar na nuvem. Verifique sua conexão e tente novamente.');
        console.error(e);
      }
    });

    $('#btnAbrirPainel').addEventListener('click', () => window.open('index.html', '_blank'));

    $('#btnResetar').addEventListener('click', async () => {
      if (!confirm('Restaurar os dados fictícios originais? As alterações atuais serão perdidas.')) return;
      try {
        dados = await DataStore.reset();
        render();
      } catch (e) {
        alert('Não foi possível restaurar os dados na nuvem. Verifique sua conexão e tente novamente.');
        console.error(e);
      }
    });

    $('#btnExportar').addEventListener('click', () => {
      coletar();
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'painel-produtividade.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    $('#btnImportar').addEventListener('click', () => $('#inputImportar').click());
    $('#inputImportar').addEventListener('change', (e) => {
      const arquivo = e.target.files[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => {
        try {
          dados = JSON.parse(leitor.result);
          render();
          alert('Dados importados. Clique em "Salvar alterações" para aplicar no painel.');
        } catch {
          alert('Arquivo JSON inválido.');
        }
      };
      leitor.readAsText(arquivo);
      e.target.value = '';
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    initGate();
    dados = await DataStore.load();
    render();
    initAcoes();
  });
})();
