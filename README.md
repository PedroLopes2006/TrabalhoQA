# Automação de testes de sistema (E2E) — SauceDemo

Suíte Playwright que automatiza os 31 casos de teste projetados no plano de teste
da disciplina de Qualidade de Software.

- **Sistema sob teste:** https://www.saucedemo.com/
- **Técnica:** teste funcional (caixa-preta)
- **Nível:** teste de sistema
- **Ferramenta:** Playwright

## Requisitos validados

| ID | Requisito | Cenários | Casos |
| --- | --- | --- | --- |
| RF01 | Ordenação do catálogo | 3 | 7 |
| RF02 | Gestão do carrinho | 4 | 10 |
| RF03 | Checkout do pedido | 6 | 14 |
| | **Total** | **13** | **31** |

A autenticação não é objeto deste plano de teste. O login aparece apenas como
pré-condição, em `support/app.js`, para alcançar as telas avaliadas.

## Como executar

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
npx playwright install chromium
npm test
```

Para ver o relatório em HTML depois da execução:

```bash
npm run report
```

Outros comandos:

```bash
npm run test:rf01      # só a ordenação do catálogo
npm run test:rf02      # só a gestão do carrinho
npm run test:rf03      # só o checkout
npm run test:headed    # com o navegador visível
```

Para gerar as capturas de tela que comprovam os defeitos encontrados:

```bash
npm run evidencias
```

As imagens vão para a pasta `evidencias/`, já nomeadas por defeito.

O endereço do sistema sob teste pode ser trocado pela variável `BASE_URL`,
útil para rodar contra uma instância local:

```bash
BASE_URL=http://localhost:4173 npm test
```

## Organização

```
playwright.config.js       configuração da suíte e dos relatórios
evidencias.js              captura as telas que comprovam os defeitos
support/produtos.js        catálogo, preços e cálculo dos totais esperados
support/app.js             seletores e ações reaproveitadas pelos testes
tests/rf01-ordenacao.spec.js
tests/rf02-carrinho.spec.js
tests/rf03-checkout.spec.js
```

Cada `test()` carrega o identificador do caso de teste do plano, de `CT01.1.1`
a `CT03.6.2`, e cada `describe()` carrega o cenário correspondente. Isso mantém
a rastreabilidade entre o projeto dos casos de teste e a automação.

## Saídas geradas

| Caminho | Conteúdo |
| --- | --- |
| `relatorio-html/` | relatório navegável, com captura de tela e vídeo das falhas |
| `resultados.json` | resultado de cada caso em formato legível por máquina |
| `test-results/` | evidências das falhas: captura de tela, vídeo e trace |

Os testes rodam em série e sem repetição automática, porque o carrinho é
compartilhado pela sessão e porque um caso reprovado deve indicar defeito, e
não instabilidade de rede.
