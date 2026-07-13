# Cerus — Painel de Produtividade Jurídica

Dashboard executivo para exibição contínua em TV (16:9), sem rolagem, com os
principais indicadores de produtividade do escritório, e painel administrativo
para edição dos dados.

## Como usar

- **TV / Dashboard:** abrir `index.html` em tela cheia (F11). Todo o conteúdo
  cabe em uma única tela; os dados se atualizam sozinhos a cada 15 s.
- **Administração:** abrir `admin.html` (senha: `Cerus@2026*`). Ao clicar em
  **Salvar alterações**, o dashboard aberto em outra aba/janela do mesmo
  computador é atualizado na hora.

## Estrutura

```
PainelProdutividade/
├── index.html          # Dashboard da TV
├── admin.html          # Painel administrativo (com senha)
├── css/
│   ├── base.css        # Variáveis, tema e componentes compartilhados
│   ├── dashboard.css   # Layout 16:9 sem rolagem
│   └── admin.css       # Estilo do painel administrativo
├── js/
│   ├── config.js       # Parâmetros (metas, intervalos, senha, coordenadores)
│   ├── mock-data.js    # Dados fictícios (mesmo formato da futura integração)
│   ├── store.js        # Camada de dados (localStorage hoje, Sheets depois)
│   ├── components.js   # Componentes reutilizáveis (barras, KPIs, badges…)
│   ├── dashboard.js    # Renderização das seções do painel
│   └── admin.js        # Formulários de edição
└── backend/
    └── README.md       # Plano da integração com Google Sheets
```

## Indicadores exibidos

1. **Ranking de Ajuizamento** — top 7 responsáveis, quanto falta para a Meta
   Ouro, barra de progresso, total do time e restante para a meta coletiva.
2. **Agenda de Prazos (hoje)** — 7 analistas com demandas do dia e totais por
   coordenador (Fábio, Daniel, Jéssica).
3. **Audiências do Dia** — condomínio, horário e advogado; totais do dia e do
   mês. Se houver mais audiências do que cabe no card, as páginas giram
   automaticamente a cada 8 s.
4. **Publicações** — recebidas hoje, tratadas hoje, total tratado no mês e
   barra de tratamento do dia.
5. **Atendimentos para Ajuizamento** — Meiriely e Gabriela, com meta e
   progresso.
6. **Indicador Financeiro** — inadimplência arrecadada até a data, em destaque
   no topo da tela.

## Como adicionar um novo indicador

1. Acrescente os dados em `js/mock-data.js` (e depois na planilha).
2. Crie o card no `index.html` e a função `render...()` em `js/dashboard.js`,
   registrando-a em `renderAll()`.
3. Se for editável, adicione a seção correspondente em `js/admin.js`.

## Integração com Google Sheets

Ainda não implementada — ver [backend/README.md](backend/README.md). Somente o
arquivo `js/store.js` precisará mudar quando a planilha for conectada.
