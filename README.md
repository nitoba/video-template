# Template de vídeos com IA

Repositório-modelo para criar vídeos de features (demo, lançamento, apresentação) com IA, em
[Remotion](https://www.remotion.dev): história tirada dos dados reais, telas reais do produto, câmera em
plano-sequência, legendas cinéticas, animações de apoio em Lottie, trilha sintetizada e narração.

Nasceu dos vídeos do Agrotrace/PecTrace (Jornada, Central de Inconsistências, Validação de atendimentos).
O que funcionou e o que foi rejeitado está em [`docs/guia-de-producao.md`](docs/guia-de-producao.md).

## Começar um vídeo novo

1. Crie um repositório a partir deste (copie a pasta ou use o template no Git) e instale:

   ```bash
   bun install
   ```

2. Peça à IA (Claude Code, Codex...) dentro do repositório, por exemplo:
   *"Quero um vídeo da feature X do card 1234, com narração, marca PecTrace."*
   A skill [`novo-video`](.claude/skills/novo-video/SKILL.md) conduz o resto: briefing, dados reais, roteiro
   para aprovação, `bun run novo`, capturas, narração, construção, conferência e render.

3. Ou crie o esqueleto à mão:

   ```bash
   bun run novo meu-video --marca pectrace --titulo "Meu vídeo"
   bun run dev
   ```

## Comandos

| Comando | O que faz |
|---|---|
| `bun run dev` | Remotion Studio com todos os vídeos |
| `bun run novo <slug> --marca <id> --titulo "..."` | Cria `src/videos/<slug>/` a partir do modelo e registra a composição |
| `bun run trilha <slug>` | Gera `public/<slug>/trilha.wav` |
| `bun run folha <slug> <tempos...>` | Folha de quadros parados (tempos da música) em `out/folha-<slug>.jpg`; `REBUNDLE=1` após mudar o código |
| `bun run render <slug>` | Render em blocos paralelos + trilha → `out/<slug>.mp4` |
| `bun run narrar <slug>` | Mistura a narração → `out/<slug>-narrado.mp4` (`PLAN_ONLY=1`, `TAKES="7:b"`, `STEMS=1`) |
| `bun run lottie-limpar <json>` | Corrige Lottie exportado com texto (glifos que quebram o lottie-web) |
| `bun run tipos` | Checagem de tipos |

## Estrutura

```
src/
  core/        shaders, partículas, câmera 3D, fontes, grão
  brands/      marcas: cores, céus de fundo, fontes, logo (agrotrace, pectrace; crie a sua copiando uma)
  kit/         linguagem visual: timeline em tempos de música, fundos, legendas, odômetro, janela do app,
               cursor, foco, Lottie, telas reais, fecho com o logo, câmera 2D sobre a captura (plano.tsx),
               grãos com significado (grains.tsx)
  videos/
    _modelo/             esqueleto copiado por `bun run novo`
    exemplo-validacao/   vídeo completo de referência (telas reais, Lottie, narração)
    prova-direcao/       prova de 19 s da direção atual (PecTrace): tratamento.md, papel, plano, grãos
    index.ts             registro das composições
scripts/       novo vídeo, render, trilha (lib/synth.mjs, lib/mix.mjs), narração, folha, Lottie
public/<slug>/ telas/, lottie/, voz/raw/ e a trilha gerada
docs/          guia de produção
.claude/skills novo-video, capturar-telas, animacao-lottie, narracao
```

Cada vídeo: `timeline.json` (bpm, quadros por tempo e marcos em tempos, lidos pela imagem, pela trilha e
pela narração), `story.ts` (marca, timeline, telas, câmera), `Video.tsx` (cenas), `trilha.mjs`,
`narracao.json` e `roteiro.md`.

## Ferramentas externas

- **Chrome DevTools MCP** (`.mcp.json`): captura das telas reais no Chrome já logado. O usuário sobe só a API
  e o frontend necessário.
- **LottieFiles Creator MCP** (`.mcp.json`): animações de apoio. Precisa de login (`/mcp` no Claude Code).
- **ElevenLabs** (conector do Claude): narração com a voz `fqxJm1hoJoe9YcGuwtGY`, modelo `eleven_v4`.
- Bun 1.4+, Node 24, ffmpeg e GPU (o render usa ANGLE).

## Marca nova

Copie `src/brands/agrotrace.tsx`, troque cores, céus, fontes, logo (componente e caminhos SVG para as
partículas) e registre em `src/brands/index.ts`. Depois `bun run novo <slug> --marca <id>`.
