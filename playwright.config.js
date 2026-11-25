// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuracao da suite de testes de sistema (E2E) do SauceDemo.
 *
 * O endereco do sistema sob teste vem da variavel de ambiente BASE_URL.
 * Sem ela, a suite roda contra o ambiente publico https://www.saucedemo.com.
 */
module.exports = defineConfig({
  testDir: './tests',

  // Os testes manipulam o carrinho, que e compartilhado por sessao.
  // Rodar em serie evita interferencia entre eles.
  fullyParallel: false,
  workers: 1,

  // Um teste reprovado deve indicar defeito, e nao instabilidade da rede.
  // Por isso nao ha repeticao automatica.
  retries: 0,

  timeout: 30 * 1000,
  expect: { timeout: 10 * 1000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'relatorio-html', open: 'never' }],
    ['json', { outputFile: 'resultados.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
