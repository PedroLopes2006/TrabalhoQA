/**
 * Catalogo do SauceDemo: seis produtos fixos.
 *
 * O campo "slug" e o sufixo usado pelos atributos data-test dos botoes,
 * como em data-test="add-to-cart-sauce-labs-backpack".
 */
const PRODUTOS = {
  backpack: { nome: 'Sauce Labs Backpack', preco: 29.99, slug: 'sauce-labs-backpack' },
  bikeLight: { nome: 'Sauce Labs Bike Light', preco: 9.99, slug: 'sauce-labs-bike-light' },
  boltTShirt: { nome: 'Sauce Labs Bolt T-Shirt', preco: 15.99, slug: 'sauce-labs-bolt-t-shirt' },
  fleeceJacket: { nome: 'Sauce Labs Fleece Jacket', preco: 49.99, slug: 'sauce-labs-fleece-jacket' },
  onesie: { nome: 'Sauce Labs Onesie', preco: 7.99, slug: 'sauce-labs-onesie' },
  testAllTheThings: {
    nome: 'Test.allTheThings() T-Shirt (Red)',
    preco: 15.99,
    slug: 'test.allthethings()-t-shirt-(red)',
  },
};

const TODOS = Object.values(PRODUTOS);

/** Ordem esperada na opcao "Name (A to Z)". */
const NOMES_AZ = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
];

/** Ordem esperada na opcao "Name (Z to A)". */
const NOMES_ZA = [...NOMES_AZ].reverse();

/** Aliquota de imposto aplicada sobre o subtotal do pedido. */
const ALIQUOTA_IMPOSTO = 0.08;

/**
 * Calcula os tres valores esperados no resumo do pedido, em reais do dominio
 * do sistema (dolares), arredondados a duas casas decimais.
 */
function totaisEsperados(produtos) {
  const subtotal = produtos.reduce((soma, p) => soma + p.preco, 0);
  const subtotalArredondado = Number(subtotal.toFixed(2));
  const imposto = Number((subtotalArredondado * ALIQUOTA_IMPOSTO).toFixed(2));
  const total = Number((subtotalArredondado + imposto).toFixed(2));
  return { subtotal: subtotalArredondado, imposto, total };
}

module.exports = { PRODUTOS, TODOS, NOMES_AZ, NOMES_ZA, ALIQUOTA_IMPOSTO, totaisEsperados };
