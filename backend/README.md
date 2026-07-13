# Backend — Integração com Google Sheets (planejada)

> **Status:** ainda não implementada. O painel roda hoje 100% no frontend com
> dados fictícios persistidos em `localStorage`.

## Arquitetura prevista

```
Google Sheets  ⇄  Google Apps Script (Web App)  ⇄  Painel (TV) / Admin
```

O **Google Apps Script** publicado como Web App servirá de backend gratuito,
sem servidor próprio:

| Endpoint | Método | Função |
|---|---|---|
| `<URL>?action=read` | GET | Lê todas as abas da planilha e devolve o JSON no formato de `js/mock-data.js` |
| `<URL>` | POST (body JSON) | Grava o JSON recebido de volta nas abas da planilha |

## Fluxo bidirecional

- **Planilha → Painel:** o dashboard faz polling (`CONFIG.refreshMs`) chamando
  `action=read`. Qualquer edição manual na planilha aparece na TV no próximo ciclo.
- **Painel Admin → Planilha:** o botão "Salvar alterações" envia o JSON via POST;
  o Apps Script grava nas abas correspondentes.

## Estrutura sugerida da planilha (uma aba por indicador)

| Aba | Colunas |
|---|---|
| `Financeiro` | valor_arrecadado, rotulo |
| `Ranking` | nome, ajuizados (+ célula meta_ouro) |
| `Prazos` | analista, coordenador, quantidade |
| `Audiencias` | condominio, horario, advogado (+ célula total_mes) |
| `Publicacoes` | recebidas_hoje, tratadas_hoje, tratadas_mes |
| `Atendimentos` | nome, abertos, meta |

## O que muda no código quando a integração chegar

Apenas **`js/store.js`**: implementar o `SheetsAdapter` (já esboçado em
comentário) e trocar `const adapter = LocalAdapter` por `SheetsAdapter`.
Dashboard, admin e componentes não precisam de nenhuma alteração, pois
consomem somente a interface `DataStore.load() / save() / onChange()`.
