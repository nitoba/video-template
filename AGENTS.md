# AGENTS.md · template de vídeos com IA

As instruções valem para qualquer agente (Claude Code, Codex e outros). Responda em pt-BR.

1. Leia `docs/guia-de-producao.md` antes de criar ou editar um vídeo.
2. Siga os roteiros em `.claude/skills/`: `novo-video` (do briefing à entrega), `capturar-telas`,
   `animacao-lottie` e `narracao`. São arquivos Markdown comuns; quem não carrega skills deve lê-los direto.
3. Crie vídeos com `bun run novo <slug> --marca <id> --titulo "..."`; não edite `src/videos/_modelo/` para um
   vídeo específico.
4. Regras fixas: telas reais (capturas, não redesenho); nada de clicar em ações que gravam dados; dados
   pessoais abreviados antes de capturar; siglas da narração escritas como se falam; estimar e avisar gastos;
   `bun run tipos` e folhas de quadros antes do render completo.
