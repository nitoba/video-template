---
name: capturar-telas
description: Captura telas reais de um sistema web (Chrome DevTools em escala 2) para usar num vídeo deste template, com dados pessoais abreviados e pontos de clique medidos. Use quando um vídeo precisa mostrar a interface de um produto ("mostra a tela de...", "abre o browser", "as telas não estão conforme a aplicação").
---

# Capturar telas reais

Detalhes e o porquê: `docs/guia-de-producao.md`, seção 4. Nunca redesenhe uma página inteira a partir do
código quando dá para capturar a real.

1. Peça para a pessoa subir só a API e o frontend necessário, e para estar logada no Chrome.
2. Carregue as ferramentas do MCP `chrome-devtools` numa chamada só (`list_pages`, `new_page`, `emulate`,
   `evaluate_script`, `take_screenshot`, `close_page`).
3. `new_page` em segundo plano; `emulate` com `viewport: "1440x900x2"` (ou `"1680x1050x2"` se a navbar
   quebrar a 1440) e `colorScheme: "light"`. Rotas com `#`: `http://localhost:4200/#/...`.
4. Para cada estado do roteiro:
   - chegue nele por `evaluate_script` (clique por texto/seletor, espere com `setTimeout`);
   - **não clique em nada que grave dados** (Salvar, Ligar, Dispensar, Tratar, Pré-carregar);
   - limpe dados pessoais no DOM: nomes com inicial, propriedade sem o produtor, `input.value` também,
     assinaturas reais trocadas por SVG sintético; rode de novo depois de qualquer rolagem;
   - devolva no mesmo script as caixas (`getBoundingClientRect`) do que o cursor vai clicar;
   - `take_screenshot` com `filePath` dentro do repositório (fora dá "Access denied").
5. Confira cada captura com um recorte ampliado (`ffmpeg ... crop`) procurando nome ou dado sobrando. Se
   sobrar, apague a faixa (`drawbox` branco) ou recapture.
6. Converta para JPEG (`ffmpeg -i x.png -q:v 2 x.jpg`) em `public/<slug>/telas/`, apague os PNG.
7. Em `story.ts`: `TELAS` (tempo → arquivo) e os pontos de clique em px da captura.
8. Feche as abas abertas (`close_page`).

Estados que só existem depois de gravar dados viram remendos desenhados por cima da captura (exemplo:
`Ligada` em `src/videos/exemplo-validacao/real.tsx`), com estilos medidos por `getComputedStyle`.
