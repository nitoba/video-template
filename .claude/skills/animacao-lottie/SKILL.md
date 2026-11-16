---
name: animacao-lottie
description: Cria animações de apoio em Lottie (LottieFiles Creator MCP) com acabamento de artista de motion para vídeos deste template, e as toca no Remotion. Use quando o vídeo precisa ilustrar algo que a interface não mostra (sincronização, IA lendo, e-mail chegando, comparação) ou quando pedirem animações "mais polidas".
---

# Animação de apoio (Lottie)

Padrão completo em `docs/guia-de-producao.md`, seção 5. Exemplos aprovados em
`public/exemplo-validacao/*.json` (sincronização, assinatura, e-mail, brilho de IA).

1. O MCP `lottie-creator` precisa de login (a pessoa entra por `/mcp`). Leia os tópicos
   `animation,patterns,shapes,paints` com `creator_docs` antes do primeiro script.
2. Planeje tempos e coordenadas e escreva **um** `creator_exec` com a cena inteira, num `documentId` novo:
   - nada linear: tangentes de saída `{outTangent:{x:0.16,y:1},inTangent:{x:0.3,y:1}}`, mola
     `{outTangent:{x:0.34,y:1.6},inTangent:{x:0.64,y:1}}`, queda `{outTangent:{x:0.55,y:0},inTangent:{x:1,y:0.45}}`;
   - antecipação antes da ação, amasso ao pousar, cascata entre irmãos, movimento secundário, arcos com
     rotação pela tangente, fecho com mola, anel e faíscas; laço sem emenda nos ícones;
   - cores da marca; sombras de contato com elipses; **sem texto**.
3. Confira com `renderFilmstrip({times: [...]})` nos momentos de pico, pouso e fim. Corrija só o que está
   errado (outro `creator_exec` no mesmo documento).
4. `creator.export('nome.json', 'lottie')`, `creator_download_file` e `curl` para
   `public/<slug>/lottie/nome.json`. Versão anterior em `v1/` até a nova ser aprovada.
5. No vídeo: `<LottieAt src="<slug>/lottie/nome.json" at={M.x} x y w h />` (caixa com a proporção da
   composição).

Armadilhas: texto dentro de grupo não exporta; texto solto quebra o lottie-web (rode `bun run
lottie-limpar`); filho de grupo tem posição local; `createComp` só uma vez por documento.
