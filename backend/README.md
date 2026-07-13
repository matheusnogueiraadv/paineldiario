# Backend — Cloudflare Worker + KV (atual) e Google Sheets (futuro)

## Arquitetura atual

```
Cloudflare Worker (worker.js)  ⇄  Cloudflare KV (namespace PAINEL_KV)
              ↑                              
   /api/dados (GET / POST)
              ↑
   Painel (TV) e Painel da Controladoria — mesmo domínio
```

O painel é publicado como um Cloudflare Worker com **assets estáticos**
(`index.html`, `admin.html`, `css/`, `js/`) e uma rota de API (`/api/dados`)
definida em `worker.js`, que lê/grava um único registro JSON no Cloudflare KV.
Isso resolve o problema de `localStorage` ser isolado por navegador: agora
qualquer dispositivo (TV, computador da controladoria) lê e grava na mesma
fonte central pela internet.

- **GET `/api/dados`** — devolve o JSON salvo no KV (ou `null` se nunca foi salvo).
- **POST `/api/dados`** (body JSON) — grava o JSON recebido no KV.

`js/store.js` é a única camada que conhece esse endpoint (`DataStore.load()` /
`DataStore.save()`); dashboard e admin não sabem como os dados são persistidos.

### Configuração necessária (uma vez)

1. No painel do Cloudflare: **Workers & Pages → Storage & Databases → KV →
   Create namespace** (ex.: `PAINEL_DADOS`).
2. Copiar o **Namespace ID** gerado e colar em `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "PAINEL_KV"
   id = "<namespace id>"
   ```
3. Fazer `git push` — o próximo deploy automático do Cloudflare já aplica o
   binding.

### Limitações atuais

- Não há histórico/versionamento — cada `save()` sobrescreve o registro anterior.
- A TV precisa recarregar a página (F5) ou esperar o próximo ciclo de polling
  (`CONFIG.refreshMs`, 15s) para ver dados salvos por outra pessoa.
- Sem controle de conflito: se duas pessoas salvarem quase ao mesmo tempo, a
  última gravação sobrescreve a anterior.

## Evolução futura: Google Sheets

Planejado como uma fonte de dados mais amigável para quem não é técnico
(editar direto na planilha), possivelmente coexistindo com o KV:

```
Google Sheets  ⇄  Google Apps Script (Web App)  ⇄  Worker (/api/dados)
```

O Apps Script publicado como Web App exporia:

| Endpoint | Método | Função |
|---|---|---|
| `<URL>?action=read` | GET | Lê todas as abas da planilha e devolve o JSON no formato de `js/mock-data.js` |
| `<URL>` | POST (body JSON) | Grava o JSON recebido de volta nas abas da planilha |

### Estrutura sugerida da planilha (uma aba por indicador)

| Aba | Colunas |
|---|---|
| `Financeiro` | valor_arrecadado, meta_ouro, data_atualizacao, rotulo |
| `Ranking` | nome, ajuizados (+ células meta_ouro e meta_time) |
| `Prazos` | analista, coordenador, quantidade |
| `Audiencias` | condominio, horario, advogado (+ célula total_mes) |
| `Publicacoes` | recebidas_hoje, tratadas_hoje, tratadas_mes |
| `Atendimentos` | nome, abertos, meta |

### O que muda no código quando essa integração chegar

Apenas `worker.js` (para repassar as chamadas ao Apps Script em vez do KV,
ou usar o KV como cache) — `js/store.js`, dashboard e admin continuam
consumindo somente `DataStore.load() / save()`, sem alterações.
