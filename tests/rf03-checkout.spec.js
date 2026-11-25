const { test, expect } = require('@playwright/test');
const { PRODUTOS, TODOS, totaisEsperados } = require('../support/produtos');
const { SELETOR, entrar, irAteOResumo } = require('../support/app');

// RF03 - Checkout do pedido
// O formulario de entrega deve exigir nome, sobrenome e CEP; o resumo deve
// trazer subtotal, imposto e total; a compra deve terminar em confirmacao.

const { backpack, bikeLight, boltTShirt, onesie, fleeceJacket } = PRODUTOS;

// Pre-condicao dos casos do formulario: um produto no carrinho.
async function irAteOFormulario(page) {
  await page.click(`[data-test="add-to-cart-${backpack.slug}"]`);
  await page.click(SELETOR.linkCarrinho);
  await page.click(SELETOR.botaoCheckout);
  await page.waitForURL('**/checkout-step-one.html');
}

async function lerResumo(page) {
  return {
    subtotal: await page.locator(SELETOR.subtotal).textContent(),
    imposto: await page.locator(SELETOR.imposto).textContent(),
    total: await page.locator(SELETOR.total).textContent(),
  };
}

test.describe('RF03 - Checkout do pedido', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page);
  });

  test.describe('CN03.1 - Preenchimento valido dos campos obrigatorios', () => {
    test('CT03.1.1 - Avancar com os tres campos obrigatorios preenchidos', async ({ page }) => {
      await irAteOFormulario(page);

      await page.fill(SELETOR.primeiroNome, 'Pedro');
      await page.fill(SELETOR.sobrenome, 'Lopes');
      await page.fill(SELETOR.cep, '29100-000');
      await page.click(SELETOR.continuar);

      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    test('CT03.1.2 - Avancar com um unico caractere em cada campo obrigatorio', async ({ page }) => {
      await irAteOFormulario(page);

      // Valor limite: a menor entrada que ainda nao e vazia.
      await page.fill(SELETOR.primeiroNome, 'P');
      await page.fill(SELETOR.sobrenome, 'L');
      await page.fill(SELETOR.cep, '1');
      await page.click(SELETOR.continuar);

      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });
  });

  test.describe('CN03.2 - Campos obrigatorios nao preenchidos', () => {
    const camposVazios = [
      ['CT03.2.1', 'nome', { sobrenome: 'Lopes', cep: '29100-000' }, 'Error: First Name is required'],
      ['CT03.2.2', 'sobrenome', { nome: 'Pedro', cep: '29100-000' }, 'Error: Last Name is required'],
      ['CT03.2.3', 'CEP', { nome: 'Pedro', sobrenome: 'Lopes' }, 'Error: Postal Code is required'],
    ];

    for (const [id, campo, preenchidos, mensagem] of camposVazios) {
      test(`${id} - Bloquear o avanco com o campo de ${campo} vazio`, async ({ page }) => {
        await irAteOFormulario(page);

        if (preenchidos.nome) await page.fill(SELETOR.primeiroNome, preenchidos.nome);
        if (preenchidos.sobrenome) await page.fill(SELETOR.sobrenome, preenchidos.sobrenome);
        if (preenchidos.cep) await page.fill(SELETOR.cep, preenchidos.cep);
        await page.click(SELETOR.continuar);

        await expect(page, 'deve permanecer no formulario').toHaveURL(/checkout-step-one\.html/);
        await expect(page.locator(SELETOR.erro)).toHaveText(mensagem);
      });
    }

    test('CT03.2.4 - Bloquear o avanco com os tres campos vazios', async ({ page }) => {
      await irAteOFormulario(page);

      await page.click(SELETOR.continuar);

      await expect(page, 'deve permanecer no formulario').toHaveURL(/checkout-step-one\.html/);
      await expect(page.locator(SELETOR.erro)).toBeVisible();

      // Com mais de um campo pendente, registra o que o sistema aponta:
      // todos os campos ou apenas o primeiro deles.
      const mensagens = await page.locator(SELETOR.erro).allTextContents();
      test.info().annotations.push({
        type: 'observacao',
        description: `mensagens com os tres campos vazios: ${JSON.stringify(mensagens)}`,
      });
    });
  });

  test.describe('CN03.3 - Cancelamento do checkout', () => {
    test('CT03.3.1 - Cancelar o checkout preservando os produtos do carrinho', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${backpack.slug}"]`);
      await page.click(`[data-test="add-to-cart-${bikeLight.slug}"]`);
      await page.click(SELETOR.linkCarrinho);
      await page.click(SELETOR.botaoCheckout);
      await page.waitForURL('**/checkout-step-one.html');

      await page.click(SELETOR.cancelar);

      await expect(page).toHaveURL(/cart\.html/);
      await expect(page.locator(SELETOR.nomeProduto)).toHaveText([backpack.nome, bikeLight.nome]);
    });
  });

  test.describe('CN03.4 - Composicao do resumo do pedido', () => {
    test('CT03.4.1 - Listar no resumo exatamente os produtos do carrinho', async ({ page }) => {
      await irAteOResumo(page, [backpack, onesie]);

      await expect(page.locator(SELETOR.nomeProduto)).toHaveText([backpack.nome, onesie.nome]);
      await expect(page.locator(SELETOR.precoProduto)).toHaveText(['$29.99', '$7.99']);
    });
  });

  test.describe('CN03.5 - Calculo do imposto e do total', () => {
    const calculos = [
      ['CT03.5.1', 'um unico produto', [onesie]],
      ['CT03.5.2', 'dois produtos', [bikeLight, boltTShirt]],
      ['CT03.5.3', 'os seis produtos do catalogo', TODOS],
    ];

    for (const [id, descricao, itens] of calculos) {
      test(`${id} - Calcular imposto e total para ${descricao}`, async ({ page }) => {
        await irAteOResumo(page, itens);
        const esperado = totaisEsperados(itens);

        const resumo = await lerResumo(page);
        expect(resumo.subtotal).toBe(`Item total: $${esperado.subtotal.toFixed(2)}`);
        expect(resumo.imposto).toBe(`Tax: $${esperado.imposto.toFixed(2)}`);
        expect(resumo.total).toBe(`Total: $${esperado.total.toFixed(2)}`);
      });
    }

    test('CT03.5.4 - Exibir o subtotal com duas casas decimais', async ({ page }) => {
      // 7.99 + 49.99 e uma das somas que nao fecham em duas casas na
      // aritmetica de ponto flutuante. O valor monetario deve sair arredondado.
      const itens = [onesie, fleeceJacket];
      await irAteOResumo(page, itens);
      const esperado = totaisEsperados(itens);

      const resumo = await lerResumo(page);
      expect(resumo.subtotal, 'subtotal com duas casas decimais').toBe(
        `Item total: $${esperado.subtotal.toFixed(2)}`,
      );
      expect(resumo.imposto).toBe(`Tax: $${esperado.imposto.toFixed(2)}`);
      expect(resumo.total).toBe(`Total: $${esperado.total.toFixed(2)}`);
    });
  });

  test.describe('CN03.6 - Conclusao da compra', () => {
    test('CT03.6.1 - Concluir o pedido e exibir a confirmacao', async ({ page }) => {
      await irAteOResumo(page, [backpack]);

      await page.click(SELETOR.finalizar);

      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(page.locator(SELETOR.confirmacao)).toHaveText('Thank you for your order!');
    });

    test('CT03.6.2 - Esvaziar o carrinho apos a conclusao do pedido', async ({ page }) => {
      await irAteOResumo(page, [backpack]);
      await page.click(SELETOR.finalizar);
      await page.waitForURL('**/checkout-complete.html');

      await expect(
        page.locator(SELETOR.contadorCarrinho),
        'o icone nao deve exibir contador',
      ).toHaveCount(0);

      await page.click(SELETOR.linkCarrinho);
      await expect(page.locator(SELETOR.item)).toHaveCount(0);
    });
  });
});
