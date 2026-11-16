---
name: novo-video
description: Conduz a criação de um vídeo novo de feature neste template, do briefing ao MP4 narrado. Use sempre que pedirem um vídeo, demo, vídeo de lançamento ou apresentação de uma funcionalidade ("cria um vídeo da feature X", "quero um vídeo sobre...", "monta um vídeo do card..."), mesmo sem citar o template.
---

# Novo vídeo

Leia `docs/guia-de-producao.md` inteiro antes de começar; esta skill é o roteiro de execução, o guia é o
porquê. A referência de linguagem é a prova `src/videos/prova-direcao/` (com `tratamento.md`); o
`exemplo-validacao` continua como molde técnico de narração e capturas.

Aja como roteirista, diretor e editor: história e direção vêm antes de qualquer efeito, e a identidade
visual sai da marca e do nicho do vídeo, nunca da estética de outra marca.

## 1. Briefing (pergunte só o que faltar)

- Feature, card ou branch; repositório do produto e onde estão os dados (banco local, API).
- Público, duração, marca (`src/brands/`: agrotrace, pectrace ou nova), narração sim/não.
- Siglas da feature e como se falam (a voz soletra maiúsculas: RAT → "ráti").
- Quem vai subir os servidores do produto para as capturas (o usuário alterna web e CMS; não suba os três).

## 2. Material real

1. Leia a documentação e os **commits recentes** da branch da feature (`git log`, READMEs): mudanças de
   última hora costumam ser o que a pessoa quer ver.
2. Ache o conflito nos dados reais (consultas só de leitura). Números do vídeo vêm do banco, com data.
3. Escreva `tratamento.md` (depois do passo 3, modelo em `_modelo/tratamento.md`): para quem, o problema,
   a ideia em uma frase, o roteiro em tabela (tempos, imagem, texto na tela, som), a direção de arte
   derivada da marca e o princípio tirado de cada referência. Peça aprovação.
4. Construa uma **prova de 15 a 20 s** com o momento central e peça aprovação antes do vídeo completo.
   Só então detalhe `roteiro.md` com a narração.

## 3. Criar o vídeo

```bash
bun install
bun run novo <slug> --marca <agrotrace|pectrace> --titulo "Título"
```

Isso copia `src/videos/_modelo/` para `src/videos/<slug>/` (já na linguagem aprovada: papel da marca, tela em
camadas, órbita, peça, grãos no logo), copia a tela ilustrativa para `public/<slug>/telas/`, registra a
composição e gera a trilha inicial. Troque em `story.ts` a `TELA`, o `ALVO` e as `FAIXAS` pela captura real e os
recortes dela.

## 4. Telas reais

Siga a skill `capturar-telas`. Capturas em `public/<slug>/telas/`, pontos de clique medidos e guardados em
`story.ts`, dados pessoais abreviados antes de cada captura.

## 5. Narração antes dos marcos

Se houver narração, siga a skill `narracao`: grave, rode `PLAN_ONLY=1 bun run narrar <slug>` e ajuste
`timeline.json` (beat e marcos) até nenhuma fala passar muito da janela. Só então construa as cenas.

## 6. Construir

- Cenas em `Video.tsx` como funções do quadro, usando o kit (`src/kit/`). Marcos sempre por nome (`M.x`),
  nunca quadros soltos.
- Captura real com câmera contínua: `Plano`, `planoToScreen` e `viewMatching` (`src/kit/plano.tsx`).
  Fundo da marca: `Paper` com `cores.papel`. Partículas só com origem e destino que signifiquem algo:
  `GrainCanvas` e `sampleShapePoints` (`src/kit/grains.tsx`).
- Movimento (obrigatório; tela parada com zoom e contorno lê como amador): `src/kit/motion.tsx`. Cada captura
  entra num `Stage` com `orbit` e vira camadas (`Layers`); os trechos citados ganham `Spot` com o `z` da camada e,
  quando são o assunto, uma `Peca`. Transições direcionais entre cenas (`enter`/`exit`). Paleta do vídeo no
  `MotionProvider`. Legendas com `Legendas`.
- Chaves de câmera, cursor e rolagem em **tempo crescente** (confira depois de mexer em marcos).
- Animações de apoio: skill `animacao-lottie`.
- Trilha: edite `trilha.mjs` (tema, curva de energia, um silêncio, cliques nos marcos).

## 7. Conferir e entregar

1. `bun run tipos`.
2. Folhas de quadros por trecho (`REBUNDLE=1 bun run folha <slug> <tempos...>`), olhando de perto: texto
   sobre texto, foco desalinhado, nome completo ou dado pessoal visível.
   Revise como editor, com quadros a cada 0,5 s do MP4. Pergunte: o ritmo de leitura está certo? Todo
   quadro tem um centro claro? A câmera está viva? Há dois movimentos competindo? O fecho segura demais?
3. `bun run render <slug>` (em segundo plano; leva minutos) e, se narrado, `bun run narrar <slug>`.
4. `ffprobe` (quadros, duração, áudio) e LUFS (`ffmpeg -af ebur128=peak=true`), alvo −14.
5. Folha de contato do MP4 final, entrega dos arquivos e um resumo do que é real e do que é ilustrativo.
6. Registre no README da pasta do vídeo (ou em `roteiro.md`) as decisões e os dados usados.
