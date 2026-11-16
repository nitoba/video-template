# Exemplo: Validação de atendimentos (PecTrace, ~181 s, narrado)

Vídeo aprovado da feature de validação de atendimentos por IA (card 14210 do Agrotrace), trazido como
referência completa do template. Mostra, num só vídeo:

- gancho com número real em odômetro, conflito tirado dos dados e um único silêncio;
- telas do web recriadas em React a partir dos templates (`web.tsx`) e telas **reais** do CMS e da
  comparação lado a lado (`real.tsx`, capturas em `public/exemplo-validacao/cms` e `/web`);
- documento (RAT) recriado com assinaturas sintéticas (`rat.tsx`);
- animações Lottie com o padrão de motion (`public/exemplo-validacao/*.json`, `lottie.tsx`);
- trilha com tema, silêncio, J-cut e cliques (`trilha.mjs`) e narração com 38 falas (`narracao.json`).

Este exemplo ainda usa cópias próprias do kit (`fx.tsx`, `story.ts`, `lottie.tsx`), anteriores ao
`src/kit/`. Vídeos novos devem usar `src/kit/` (veja `src/videos/_modelo/`).

Dados: banco local do Agrotrace em 13/11/2026; nomes de técnicos e produtores abreviados; e-mail e estado
"Ligada" do CMS são ilustrativos.

```bash
bun run render exemplo-validacao
bun run narrar exemplo-validacao
```
