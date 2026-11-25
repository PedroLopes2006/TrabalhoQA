// Seletores e as poucas acoes que se repetem nos tres arquivos de teste.
// O login esta aqui como pre-condicao: ele nao e objeto deste plano de teste.

const USUARIO = { login: 'standard_user', senha: 'secret_sauce' };

const SELETOR = {
  campoUsuario: '[data-test="username"]',
  campoSenha: '[data-test="password"]',
  botaoLogin: '[data-test="login-button"]',

  filtroOrdenacao: '[data-test="product-sort-container"]',
  opcaoAtiva: '[data-test="active-option"]',
  nomeProduto: '[data-test="inventory-item-name"]',
  precoProduto: '[data-test="inventory-item-price"]',
  item: '[data-test="inventory-item"]',

  linkCarrinho: '[data-test="shopping-cart-link"]',
  contadorCarrinho: '[data-test="shopping-cart-badge"]',
  quantidade: '[data-test="item-quantity"]',
  botaoCheckout: '[data-test="checkout"]',

  voltarParaProdutos: '[data-test="back-to-products"]',
  adicionarNoDetalhe: '[data-test="add-to-cart"]',
  removerNoDetalhe: '[data-test="remove"]',

  primeiroNome: '[data-test="firstName"]',
  sobrenome: '[data-test="lastName"]',
  cep: '[data-test="postalCode"]',
  continuar: '[data-test="continue"]',
  cancelar: '[data-test="cancel"]',
  erro: '[data-test="error"]',

  subtotal: '[data-test="subtotal-label"]',
  imposto: '[data-test="tax-label"]',
  total: '[data-test="total-label"]',
  finalizar: '[data-test="finish"]',
  confirmacao: '[data-test="complete-header"]',
};

async function entrar(page) {
  await page.goto('/');
  await page.fill(SELETOR.campoUsuario, USUARIO.login);
  await page.fill(SELETOR.campoSenha, USUARIO.senha);
  await page.click(SELETOR.botaoLogin);
  await page.waitForURL('**/inventory.html');
}

// Com o carrinho vazio o contador nao e renderizado, entao a ausencia do
// elemento precisa ser lida como zero.
async function contador(page) {
  const badge = page.locator(SELETOR.contadorCarrinho);
  return (await badge.count()) === 0 ? 0 : Number(await badge.textContent());
}

// Caminho da listagem ate o resumo do pedido, usado pelos casos de calculo
// e de conclusao da compra.
async function irAteOResumo(page, produtos) {
  for (const produto of produtos) {
    await page.click(`[data-test="add-to-cart-${produto.slug}"]`);
  }
  await page.click(SELETOR.linkCarrinho);
  await page.click(SELETOR.botaoCheckout);
  await page.fill(SELETOR.primeiroNome, 'Pedro');
  await page.fill(SELETOR.sobrenome, 'Lopes');
  await page.fill(SELETOR.cep, '29100-000');
  await page.click(SELETOR.continuar);
  await page.waitForURL('**/checkout-step-two.html');
}

module.exports = { USUARIO, SELETOR, entrar, contador, irAteOResumo };
