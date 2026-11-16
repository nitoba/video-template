---
name: narracao
description: Grava e encaixa a narração de um vídeo deste template (ElevenLabs, voz e modelo padrão), com siglas pronunciadas certo e a timeline ajustada ao ritmo da voz. Use quando o vídeo for narrado ou quando pedirem para trocar, regravar ou corrigir a pronúncia de falas.
---

# Narração

Regras e porquês: `docs/guia-de-producao.md`, seção 6.

1. Escreva as falas em `src/videos/<slug>/narracao.json` (`{"beatBase": <beat atual>, "falas": [{n, ini,
   fim, texto}]}`), com janelas em segundos e tags da v4 (`[serious]`, `[confidently]`, `[short pause]`).
   **Siglas como se falam** ("ráti", "cê eme ésse"); confirme a pronúncia com a pessoa.
2. Estime o custo com `creative_generate_speech` (MCP da ElevenLabs) + `estimate_only` e avise o total antes de gerar.
3. Crie um flow ("<título> · narração do vídeo") e gere cada fala com voz `fqxJm1hoJoe9YcGuwtGY`, modelo
   `eleven_v4`, duas tomadas. Para muitas falas, delegue a um subagente (Opus) com o texto exato, o
   flow e o destino; proíba repetir chamada (cada uma cobra).
4. Baixe as tomadas para `public/<slug>/voz/raw/NN-a.mp3` e `NN-b.mp3`.
5. `PLAN_ONLY=1 bun run narrar <slug>`: falas que "PASSOU"/"ATRASOU" pedem tempo. Alongue a timeline toda
   (aumente `beat` em `timeline.json`, deixe `beatBase`) e abra tempos só onde o atraso é local, deslocando
   juntos os marcos e as janelas. Repita até sobrar no máximo ~0,5 s por fala.
6. Depois do render: `bun run narrar <slug>` (gera `out/<slug>-narrado.mp4`). `TAKES="7:b"` troca tomadas
   sem renderizar a imagem de novo; `STEMS=1` salva voz e trilha separadas.
7. Peça para a pessoa ouvir as falas com siglas; não há verificação automática de pronúncia.
