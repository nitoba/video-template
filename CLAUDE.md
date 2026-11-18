# Template de vídeos com IA

Vídeos de features em Remotion, feitos com IA. Responda em pt-BR.

- **Antes de criar ou editar um vídeo, leia `docs/guia-de-producao.md`.** Ele traz o que já foi aprovado e
  rejeitado, a receita técnica e o checklist.
- Para um vídeo novo, use a skill `novo-video` (`.claude/skills/novo-video/SKILL.md`); ela chama
  `capturar-telas`, `animacao-lottie` e `narracao` nos passos certos.
- Cada vídeo mora em `src/videos/<slug>/` e nasce com `bun run novo <slug> --marca <id> --titulo "..."`.
  Nunca edite `src/videos/_modelo/` para um vídeo específico: ele é o molde.
- O kit (`src/kit/`), as marcas (`src/brands/`) e o núcleo (`src/core/`) são compartilhados. Mudança neles
  vale para todos os vídeos: rode `bun run tipos` e uma folha do exemplo (`bun run folha exemplo-validacao 5 90 160`).
- Telas do produto entram como **capturas reais**, nunca redesenhadas a partir do código. Não clique em ações
  que gravam dados nas capturas e abrevie dados pessoais antes de capturar.
- Siglas na narração vão escritas como se falam ("ráti"). Gere e meça a voz antes de fixar os marcos.
- Antes de entregar um vídeo, rode `bun run conferir <slug>` e `bun run audio <slug>` e responda a cada achado
  (guia, seção 10).
- Gastos (ElevenLabs, créditos de IA): estime e avise antes; nunca repita uma geração para "tentar de novo".
- Sequência com muitos elementos (interface montando, lista, cartões em stagger): `@remotion/gsap` com
  `useGsapTimeline` (sem callbacks, `play`, `seek`, `random` nem `gsap.to()` solto; só alvos DOM/SVG). Para um ou dois
  elementos, `interpolate` e `spring` bastam. Água, líquido, ondulação e shader 2D: `@remotion/skia` (`Liquido` em
  `src/kit/skia.tsx`), sempre dirigido por `useCurrentFrame`. Referência dos dois: o vídeo `exemplo-skia-gsap`.
- Comandos: `bun run dev` (Studio), `novo`, `trilha`, `folha`, `render`, `narrar`, `conferir`, `audio`, `lottie-limpar`, `tipos`.
