const { test, expect } = require('@playwright/test');
const { NOMES_AZ, NOMES_ZA } = require('../support/produtos');
const { SELETOR, entrar } = require('../support/app');

// RF01 - Ordenacao do catalogo
// A listagem deve reordenar os seis itens conforme a opcao escolhida no filtro.

const PRECOS_DECRESCENTES = [49.99, 29.99, 15.99, 15.99, 9.99, 7.99];

async function nomes(page) {
  return page.locator(SELETOR.nomeProduto).allTextContents();
}

async function precos(page) {
  const textos = await page.locator(SELETOR.precoProduto).allTextContents();
  return textos.map((t) => Number(t.replace('$', '')));
}

test.describe('RF01 - Ordenacao do catalogo', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page);
  });

  test.describe('CN01.1 - Ordenacao por nome', () => {
    test('CT01.1.1 - Ordenar o catalogo por nome de A a Z', async ({ page }) => {
      await page.selectOption(SELETOR.filtroOrdenacao, { label: 'Name (A to Z)' });

      expect(await nomes(page)).toEqual(NOMES_AZ);
    });

    test('CT01.1.2 - Ordenar o catalogo por nome de Z a A', async ({ page }) => {
      await page.selectOption(SELETOR.filtroOrdenacao, { label: 'Name (Z to A)' });

      expect(await nomes(page)).toEqual(NOMES_ZA);
    });
  });

  test.describe('CN01.2 - Ordenacao por preco', () => {
    test('CT01.2.1 - Ordenar o catalogo por preco do menor para o maior', async ({ page }) => {
      await page.selectOption(SELETOR.filtroOrdenacao, { label: 'Price (low to high)' });

      expect(await precos(page)).toEqual([...PRECOS_DECRESCENTES].reverse());
    });

    test('CT01.2.2 - Ordenar o catalogo por preco do maior para o menor', async ({ page }) => {
      await page.selectOption(SELETOR.filtroOrdenacao, { label: 'Price (high to low)' });

      expect(await precos(page)).toEqual(PRECOS_DECRESCENTES);
    });

    test('CT01.2.3 - Posicionar produtos de mesmo preco na ordenacao por preco', async ({ page }) => {
      // Os dois produtos de 15.99 devem ficar lado a lado nas duas ordenacoes,
      // entre o produto de 9.99 e o de 29.99.
      for (const opcao of ['Price (low to high)', 'Price (high to low)']) {
        await page.selectOption(SELETOR.filtroOrdenacao, { label: opcao });

        const lista = await precos(page);
        const posicoes = lista
          .map((preco, i) => (preco === 15.99 ? i : -1))
          .filter((i) => i !== -1);

        expect(posicoes, `ordenacao ${opcao}`).toHaveLength(2);
        expect(posicoes[1] - posicoes[0], `ordenacao ${opcao}: posicoes adjacentes`).toBe(1);
        expect(new Set(await nomes(page)).size, 'nenhum produto omitido ou duplicado').toBe(6);
      }
    });
  });

  test.describe('CN01.3 - Estado inicial e persistencia da ordenacao', () => {
    test('CT01.3.1 - Verificar a ordenacao aplicada ao abrir a listagem', async ({ page }) => {
      await expect(page.locator(SELETOR.opcaoAtiva)).toHaveText('Name (A to Z)');
      expect(await nomes(page)).toEqual(NOMES_AZ);
    });

    test('CT01.3.2 - Manter a ordenacao escolhida ao retornar da pagina de detalhe', async ({ page }) => {
      await page.selectOption(SELETOR.filtroOrdenacao, { label: 'Price (high to low)' });
      expect(await precos(page)).toEqual(PRECOS_DECRESCENTES);

      await page.locator(SELETOR.nomeProduto).filter({ hasText: 'Sauce Labs Fleece Jacket' }).click();
      await page.waitForURL('**/inventory-item.html*');
      await page.click(SELETOR.voltarParaProdutos);
      await page.waitForURL('**/inventory.html');

      await expect(
        page.locator(SELETOR.opcaoAtiva),
        'o filtro deve continuar indicando a ordenacao escolhida',
      ).toHaveText('Price (high to low)');
      expect(await precos(page), 'os produtos devem continuar em ordem decrescente').toEqual(
        PRECOS_DECRESCENTES,
      );
    });
  });
});
