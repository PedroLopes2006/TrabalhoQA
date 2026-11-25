const { test, expect } = require('@playwright/test');
const { PRODUTOS, TODOS } = require('../support/produtos');
const { SELETOR, entrar, contador } = require('../support/app');

// RF02 - Gestao do carrinho
// O carrinho deve refletir exatamente os produtos selecionados, qualquer que
// seja a tela usada para incluir ou retirar.

const { backpack, bikeLight, onesie, fleeceJacket } = PRODUTOS;

test.describe('RF02 - Gestao do carrinho', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page);
  });

  test.describe('CN02.1 - Inclusao de produtos', () => {
    test('CT02.1.1 - Incluir produto no carrinho pela listagem', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${backpack.slug}"]`);
      await page.click(SELETOR.linkCarrinho);

      await expect(page.locator(SELETOR.nomeProduto)).toHaveText([backpack.nome]);
      await expect(page.locator(SELETOR.precoProduto)).toHaveText(['$29.99']);
      await expect(page.locator(SELETOR.quantidade)).toHaveText(['1']);
    });

    test('CT02.1.2 - Incluir produto no carrinho pela pagina de detalhe', async ({ page }) => {
      await page.locator(SELETOR.nomeProduto).filter({ hasText: bikeLight.nome }).click();
      await page.click(SELETOR.adicionarNoDetalhe);
      await page.click(SELETOR.linkCarrinho);

      await expect(page.locator(SELETOR.nomeProduto)).toHaveText([bikeLight.nome]);
      await expect(page.locator(SELETOR.precoProduto)).toHaveText(['$9.99']);
      await expect(page.locator(SELETOR.quantidade)).toHaveText(['1']);
    });
  });

  test.describe('CN02.2 - Retirada de produtos', () => {
    test('CT02.2.1 - Retirar produto do carrinho pela listagem', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${backpack.slug}"]`);
      expect(await contador(page)).toBe(1);

      await page.click(`[data-test="remove-${backpack.slug}"]`);

      expect(await contador(page)).toBe(0);
      await expect(
        page.locator(`[data-test="add-to-cart-${backpack.slug}"]`),
        'o botao deve voltar a oferecer a inclusao',
      ).toBeVisible();
    });

    test('CT02.2.2 - Retirar produto do carrinho pela pagina de detalhe', async ({ page }) => {
      await page.locator(SELETOR.nomeProduto).filter({ hasText: bikeLight.nome }).click();
      await page.click(SELETOR.adicionarNoDetalhe);
      expect(await contador(page)).toBe(1);

      await page.click(SELETOR.removerNoDetalhe);

      expect(await contador(page)).toBe(0);
      await page.click(SELETOR.linkCarrinho);
      await expect(page.locator(SELETOR.item)).toHaveCount(0);
    });

    test('CT02.2.3 - Retirar produto dentro do carrinho', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${backpack.slug}"]`);
      await page.click(`[data-test="add-to-cart-${bikeLight.slug}"]`);
      await page.click(SELETOR.linkCarrinho);
      await expect(page.locator(SELETOR.item)).toHaveCount(2);

      await page.click(`[data-test="remove-${backpack.slug}"]`);

      await expect(page.locator(SELETOR.nomeProduto)).toHaveText([bikeLight.nome]);
      expect(await contador(page)).toBe(1);
    });
  });

  test.describe('CN02.3 - Contador do carrinho', () => {
    test('CT02.3.1 - Atualizar o contador conforme os produtos incluidos', async ({ page }) => {
      const sequencia = [backpack, bikeLight, onesie];

      for (const [i, produto] of sequencia.entries()) {
        await page.click(`[data-test="add-to-cart-${produto.slug}"]`);
        expect(await contador(page), `apos incluir ${produto.nome}`).toBe(i + 1);
      }
    });

    test('CT02.3.2 - Ocultar o contador quando o carrinho fica vazio', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${onesie.slug}"]`);
      await expect(page.locator(SELETOR.contadorCarrinho)).toBeVisible();

      await page.click(`[data-test="remove-${onesie.slug}"]`);

      await expect(
        page.locator(SELETOR.contadorCarrinho),
        'sem produtos, o icone nao deve exibir contador',
      ).toHaveCount(0);
    });
  });

  test.describe('CN02.4 - Limites e persistencia do carrinho', () => {
    test('CT02.4.1 - Impedir o avanco para o checkout com o carrinho vazio', async ({ page }) => {
      await page.click(SELETOR.linkCarrinho);
      await expect(page.locator(SELETOR.item)).toHaveCount(0);

      await page.click(SELETOR.botaoCheckout);

      // Sem produtos nao ha pedido a finalizar: o sistema deve barrar aqui.
      await expect(page, 'nao deve avancar para o formulario de entrega').toHaveURL(/cart\.html/);
      await expect(page.locator(SELETOR.erro), 'deve informar o impedimento').toBeVisible();
    });

    test('CT02.4.2 - Incluir no carrinho todos os produtos do catalogo', async ({ page }) => {
      for (const produto of TODOS) {
        await page.click(`[data-test="add-to-cart-${produto.slug}"]`);
      }
      expect(await contador(page)).toBe(6);

      await page.click(SELETOR.linkCarrinho);
      await expect(page.locator(SELETOR.item)).toHaveCount(6);
      await expect(page.locator(SELETOR.quantidade)).toHaveText(['1', '1', '1', '1', '1', '1']);
    });

    test('CT02.4.3 - Preservar o conteudo do carrinho ao navegar entre as telas', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${backpack.slug}"]`);
      await page.click(`[data-test="add-to-cart-${onesie.slug}"]`);

      await page.locator(SELETOR.nomeProduto).filter({ hasText: fleeceJacket.nome }).click();
      await page.waitForURL('**/inventory-item.html*');
      await page.click(SELETOR.voltarParaProdutos);

      expect(await contador(page)).toBe(2);
      await page.click(SELETOR.linkCarrinho);
      await expect(page.locator(SELETOR.nomeProduto)).toHaveText([backpack.nome, onesie.nome]);
    });
  });
});
