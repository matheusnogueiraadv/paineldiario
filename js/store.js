/* =========================================================
   DATASTORE — camada de dados do painel.

   Hoje: persistência em localStorage (mock), com sincronização
   entre abas via evento 'storage' (admin ⇄ dashboard).

   Futuro: trocar o adaptador interno por chamadas ao backend
   do Google Sheets (Apps Script) mantendo a MESMA interface
   pública: load(), save(), onChange(). Nada fora deste arquivo
   precisará mudar. Ver backend/README.md.
   ========================================================= */
const DataStore = (() => {

  /* ---------- Adaptador atual: localStorage (mock) ---------- */
  const LocalAdapter = {
    load() {
      try {
        const raw = localStorage.getItem(CONFIG.storageKey);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('DataStore: dados locais inválidos, usando mock.', e);
      }
      return JSON.parse(JSON.stringify(MOCK_DATA));
    },
    save(data) {
      data.atualizadoEm = new Date().toISOString();
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
      return Promise.resolve(data);
    },
  };

  /* ---------- Adaptador futuro: Google Sheets ----------
  const SheetsAdapter = {
    // GET  <URL_APPS_SCRIPT>?action=read   → JSON no formato de MOCK_DATA
    // POST <URL_APPS_SCRIPT>  body=JSON    → grava na planilha
    async load() { ... },
    async save(data) { ... },
  };
  ------------------------------------------------------- */

  const adapter = LocalAdapter;

  return {
    load: () => adapter.load(),
    save: (data) => adapter.save(data),

    /* Notifica quando os dados mudarem em outra aba (ex.: admin salvou). */
    onChange(callback) {
      window.addEventListener('storage', (e) => {
        if (e.key === CONFIG.storageKey) callback(adapter.load());
      });
    },

    /* Restaura os dados fictícios originais. */
    reset() {
      localStorage.removeItem(CONFIG.storageKey);
      return adapter.load();
    },
  };
})();
