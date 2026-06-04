/** Build local / desenvolvimento (`ng serve`, `ng build --configuration=development`). */
export const environment = {
  production: false,
  /**
   * Opcional: texto exibido em “Última atualização da base” no painel.
   * Ex.: data vinda da API. Se vazio, o dashboard usa um texto padrão (sem simular timestamp falso).
   */
  dashboardDataLastRefreshLabel: '' as string,
};
