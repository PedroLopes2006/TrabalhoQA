// Captura as telas que comprovam os tres defeitos encontrados na execucao.
// Nao faz parte da suite de testes: serve so para gerar as imagens que entram
// no relatorio.
//
// Uso: npm run evidencias

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';
const PASTA = path.join(__dirname, 'evidencias');

const SELETOR = {
  usuario: '[data-test="username"]',
  senha: '[data-test="password"]',
  login: '[data-test="login-button"]',
  filtro: '[data-test="product-sort-container"]',
  nomeProduto: '[data-test="inventory-item-name"]',
  voltar: '[data-test="back-to-products"]',
  carrinho: '[data-test="shopping-cart-link"]',
  checkout: '[data-test="checkout"]',
  primeiroNome: '[data-test="firstName"]',
  sobrenome: '[data-test="lastName"]',
  cep: '[data-test="postalCode"]',
  continuar: '[data-test="continue"]',
  finalizar: '[data-test="finish"]',
};

async function entrar(page) {
  await page.goto(`${BASE_URL}/`);
  await page.fill(SELETOR.usuario, 'standard_user');
  await page.fill(SELETOR.senha, 'secret_sauce');
  await page.click(SELETOR.login);
  await page.waitForURL('**/inventory.html');
}

// A aplicacao troca a URL antes de renderizar a tela nova, entao a captura
// espera um elemento proprio da tela alvo antes de disparar.
async function esperarTela(page, seletor) {
  await page.locator(seletor).first().waitFor({ state: 'visible' });
}

async function salvar(page, nome) {
  const arquivo = path.join(PASTA, `${nome}.png`);
  await page.screenshot({ path: arquivo, fullPage: true });
  console.log('  gerado:', path.relative(__dirname, arquivo));
}

async function preencherEntrega(page) {
  await page.fill(SELETOR.primeiroNome, 'Pedro');
  await page.fill(SELETOR.sobrenome, 'Lopes');
  await page.fill(SELETOR.cep, '29100-000');
  await page.click(SELETOR.continuar);
  await page.waitForURL('**/checkout-step-two.html');
  await esperarTela(page, '[data-test="subtotal-label"]');
}

(async () => {
  fs.mkdirSync(PASTA, { recursive: true });

  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await contexto.newPage();

  console.log('DEF-001 - ordenacao perdida ao voltar do detalhe');
  await entrar(page);
  await page.selectOption(SELETOR.filtro, { label: 'Price (high to low)' });
  await salvar(page, 'def001-antes');
  await page.locator(SELETOR.nomeProduto).filter({ hasText: 'Sauce Labs Fleece Jacket' }).click();
  await page.waitForURL('**/inventory-item.html*');
  await page.click(SELETOR.voltar);
  await page.waitForURL('**/inventory.html');
  await esperarTela(page, SELETOR.filtro);
  await salvar(page, 'def001-depois');

  console.log('DEF-002 - pedido concluido com o carrinho vazio');
  await entrar(page);
  await page.click(SELETOR.carrinho);
  await esperarTela(page, '[data-test="continue-shopping"]');
  await salvar(page, 'def002-carrinho-vazio');
  await page.click(SELETOR.checkout);
  await preencherEntrega(page);
  await salvar(page, 'def002-resumo-zerado');
  await page.click(SELETOR.finalizar);
  await page.waitForURL('**/checkout-complete.html');
  await esperarTela(page, '[data-test="complete-header"]');
  await salvar(page, 'def002-pedido-confirmado');

  console.log('DEF-003 - subtotal sem arredondamento');
  await entrar(page);
  await page.click('[data-test="add-to-cart-sauce-labs-onesie"]');
  await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
  await page.click(SELETOR.carrinho);
  await page.click(SELETOR.checkout);
  await preencherEntrega(page);
  await salvar(page, 'def003-subtotal');

  await navegador.close();
  console.log('\nEvidencias geradas na pasta evidencias/');
})();
