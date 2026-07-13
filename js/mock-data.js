/* =========================================================
   MOCK DATA — dados fictícios para estruturação do layout.
   Este objeto tem exatamente o formato que a integração com
   o Google Sheets deverá devolver (ver backend/README.md).
   ========================================================= */
const MOCK_DATA = {
  atualizadoEm: null, // preenchido ao salvar

  // 6. Indicador Financeiro (destaque principal)
  financeiro: {
    arrecadado: 1880936.32,
    dataAtualizacao: '2026-07-10', // data real da última atualização — não usar a data de hoje
    metaOuro: 5250000.00,
    rotulo: 'Inadimplência arrecadada',
  },

  // 1. Ranking de Ajuizamento
  ranking: {
    metaOuro: 180, // meta individual de processos ajuizados
    metaTime: 540, // meta geral do time (apenas 3 auxiliares ativos neste mês)
    responsaveis: [
      { nome: 'Auxiliar Jurídico 1', ajuizados: 37 },
      { nome: 'Auxiliar Jurídico 2', ajuizados: 33 },
      { nome: 'Auxiliar Jurídico 3', ajuizados: 29 },
      { nome: 'Auxiliar Jurídico 4', ajuizados: 26 },
      { nome: 'Auxiliar Jurídico 5', ajuizados: 22 },
      { nome: 'Auxiliar Jurídico 6', ajuizados: 18 },
      { nome: 'Auxiliar Jurídico 7', ajuizados: 14 },
    ],
  },

  // 2. Agenda de Prazos (hoje)
  // Carteira do Fábio: Laís, Rayonara e Thayná · Carteira do Daniel: Wesley, Mayara e Eike · Carteira da Jéssica: Emanuelle
  prazos: {
    analistas: [
      { nome: 'Wesley Gadelha',      coordenador: 'Daniel',  quantidade: 12 },
      { nome: 'Mayara Bezerra',      coordenador: 'Daniel',  quantidade: 9  },
      { nome: 'Laís Saraiva',        coordenador: 'Fábio',   quantidade: 14 },
      { nome: "Eike D'Lucca",        coordenador: 'Daniel',  quantidade: 7  },
      { nome: 'Emanuelle Lima',      coordenador: 'Jéssica', quantidade: 11 },
      { nome: 'Rayonara Cavalcante', coordenador: 'Fábio',   quantidade: 8  },
      { nome: 'Thayná Muniz',        coordenador: 'Fábio',   quantidade: 6  },
    ],
  },

  // 3. Audiências do dia
  audiencias: {
    totalMes: 87,
    hoje: [
      { condominio: 'Cond. Parque das Águas',    horario: '09:00', advogado: 'Dr. Rafael Torres' },
      { condominio: 'Cond. Solar dos Ipês',      horario: '10:30', advogado: 'Dra. Camila Nunes' },
      { condominio: 'Cond. Vila Verde',          horario: '11:15', advogado: 'Dr. Rafael Torres' },
      { condominio: 'Cond. Morada do Sol',       horario: '13:30', advogado: 'Dra. Paula Ribeiro' },
      { condominio: 'Cond. Jardim Botânico',     horario: '14:45', advogado: 'Dr. André Martins' },
      { condominio: 'Cond. Residencial Aurora',  horario: '16:00', advogado: 'Dra. Camila Nunes' },
      { condominio: 'Cond. Portal da Serra',     horario: '17:20', advogado: 'Dr. André Martins' },
    ],
  },

  // 4. Publicações
  publicacoes: {
    recebidasHoje: 46,
    tratadasHoje: 38,
    tratadasMes: 812,
  },

  // 5. Atendimentos para Ajuizamento
  atendimentos: [
    { nome: 'Assistente 1', abertos: 14, meta: 20 },
    { nome: 'Assistente 2', abertos: 17, meta: 20 },
  ],
};
