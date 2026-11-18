# Apresentação "Vídeos com IA" · roteiro do projeto ao vivo

Quarta, 18/11/2026 · cerca de 50 min · 16 slides (`apresentacao.pen` / `apresentacao.pdf`) + 20 min de projeto ao vivo.

| Bloco | Slides | Tempo |
|---|---|---|
| Abertura | 01–03 | 5 min |
| O método | 04–05 | 10 min |
| O caso real | 06–08 | 8 min |
| Ferramentas e preparação do projeto | 09–10 | 6 min |
| **Projeto ao vivo** | 11–13 | 20 min |
| Fechamento | 14–16 | 5 min |

O projeto: **um Reels vertical de 20 s, "3 erros ao criar vídeo com IA"**, feito do zero seguindo os seis passos.
Reservas: `out/reserva-prova-ensaio.mp4` (a prova de 8 s que o Claude fez no ensaio) e `out/reserva-reels.mp4`
(o Reels completo de 20 s, mesmo briefing).

---

## Antes de começar (15 min antes)

- Fechar web, CMS e API do Agrotrace: gerar vídeo e prévia ao mesmo tempo pesam na máquina.
- Terminal com fonte grande (≥ 20 pt), uma aba só, na pasta do `video-template`.
- Confirmar que **não existe** `src/videos/tres-erros/` (se sobrou de ensaio, apague a pasta, `public/tres-erros/` e
  as linhas dela em `src/videos/index.ts`).
- `bun run dev` aberto numa aba do navegador (é a prévia).
  O Skia carrega um WebAssembly na abertura; se a prévia ficar em branco, recarregue a aba uma vez.
- `out/reserva-reels.mp4` aberto num player, pausado no começo.
- Claude Code aberto (`claude`) e logado.

## Slide 09 · Ferramentas

Duas novidades no template: **GSAP** (encadeia muitas peças numa linha do tempo, como cartões em stagger) e **Skia**
(água, líquido e shader 2D). Se perguntarem, abra `exemplo-skia-gsap` no Studio: 5 s, os cartões entram com GSAP e
as gotas viram poça com Skia.

## Slide 10 · Prepare o projeto

Mostre o `prompt-inicial.md`: é o que alguém roda numa pasta vazia para ter um estúdio pronto, sem o template. Não
rode ao vivo (instala pacotes); diga que o projeto de hoje usa o template, que já foi preparado assim.

## Projeto ao vivo (slides 11–13, 20 min)

Deixe o slide **13 · Painel ao vivo** visível entre um passo e outro. Fale sempre do passo, não do código: a plateia
não precisa ler o que aparece no terminal.

> **Ensaio de 18/11 (sessão nova do Claude Code, mesmos pedidos):** passo 1 em 55 s; passos 2 e 3 em 2 min 12 s;
> prova em 6 min 49 s (incluindo um MP4 que ele renderizou sem pedirem); ajuste do passo 5 em 1 min. Total da IA
> trabalhando: cerca de 11 min. Com o "não renderize" abaixo, a prova deve cair para uns 4 a 5 min. O código que ele
> escreveu no ensaio ficou em `docs/apresentacao/ensaio-tres-erros/` (fora do Studio, só para consulta).

### Passo 1 · Briefing (2 min) · slide 12

Pergunte à plateia antes de mostrar: "para quem é esse vídeo? onde ele vai passar?". Depois cole:

```text
Vamos fazer um vídeo novo com a skill novo-video: bun run novo tres-erros --vertical --titulo "3 erros ao criar vídeo com IA".
Briefing:
- Para quem: devs e quem cria conteúdo, rolando o feed.
- Para quê: lembrar de três erros e não cometer.
- Onde: Instagram e LinkedIn, no celular, muitas vezes sem som.
- Formato: vertical 9:16 (1080x1920), 20 segundos, legenda palavra por palavra.
- Tom: direto, com um pouco de humor.
- Os 3 erros: pedir sem briefing; aceitar a primeira versão; copiar o estilo dos outros.
Antes de qualquer coisa, me diga o que ficou faltando nesse briefing.
```

No ensaio ele levou 55 s e voltou com **9 perguntas** (marca, material, narração, só o erro ou erro e correção, que
IA, fecho, limite do humor, formato do LinkedIn, idioma). Leia duas ou três em voz alta:

> "Reparem: ela não sai fazendo. Primeiro pergunta o que falta. Isso é o briefing funcionando."

### Passos 2 e 3 · Material, estilo e tratamento (3 min)

Não responda uma a uma: cole as respostas prontas (é o passo 2) junto com o pedido do tratamento (passo 3):

```text
Respostas:
- Marca agrotrace, mas com o papel e o laranja desta apresentação (#FBF6F1 e #D9561A), fonte Saira. Nada de fundo escuro nem neon.
- Sem material real e sem telas: só tipografia, formas e movimento.
- Sem narração: texto cinético com legenda palavra por palavra, funciona sem som.
- Cada erro com uma frase curta de correção.
- A IA aqui é um agente que monta o vídeo (como você). Sem citar marcas.
- Fecho: "A IA produz. Você dirige." Sem chamada, sem logo.
- Só 9:16, pt-BR, capa é o primeiro quadro.
- Não mexa em tres-erros-reserva: é outro vídeo.
- A prova é o gancho mais o primeiro erro.
Pode criar o vídeo e escrever o tratamento: a história em 4 cenas (gancho + um erro por cena), o que aparece e o texto de cada uma. Me mostre antes de construir.
```

> "Eu não disse 'bonito'. Disse de onde vem o estilo, e o que não quero."

No ensaio (2 min 12 s) ele propôs um quadro 9:16 em miniatura que cada erro estraga e cada correção conserta, com
piadas como `faz um vídeo top` e o carimbo "ÓTIMO!" na v1. Leia em voz alta a tabela das 4 cenas. Ele termina com
2 ou 3 decisões para você (cor da tinta, tempo apertado, piadas): responda no próximo pedido.

> "Mudar aqui custa uma frase. Mudar depois custa refazer cenas."

### Passo 4 · Prova (5 min, a IA trabalha, você fala)

```text
Aprovado. Tinta #23170F. Monte só o gancho e o primeiro erro, até uns 8 segundos, e me avise para eu ver na prévia.
Não renderize o MP4: só a prévia.
```

Enquanto ela trabalha (no ensaio: lê o kit, escreve as cenas, confere quadros parados e se corrige sozinha), fale
sobre o caso real: foi a prova de 18 s que salvou o vídeo da Validação de dias de retrabalho. Ela vai pedir
permissão para alguns comandos: aprove.

**Se passar de 5 min:** "eu fiz exatamente esse pedido no ensaio, olhem" → tocar `out/reserva-prova-ensaio.mp4`
(a prova que saiu no ensaio, 8 s) e seguir para o passo 5 com ela.

### Passo 5 · Ciclos (3 min) · o ponto alto

Abra a prévia (`tres-erros` no Studio), assista com a plateia e aponte **um problema real, com o segundo exato**.
No ensaio, o problema real foi o título pequeno para celular:

```text
No segundo 3, o título "Pedir sem briefing." está pequeno para quem vê no celular. Deixa ele bem maior.
Só ajusta e me avisa para eu ver na prévia, não renderiza o MP4.
```

Levou 1 min: o título foi de 80 para 132 px, em duas linhas, e ele mesmo ajustou o que bateria embaixo.

> "Eu não sei qual linha mudar. Sei dizer o que está errado e quando. É essa a habilidade."

### Passo 6 · Entrega (1 min)

Não gere o vídeo final ao vivo (demora). Mostre o pedido e o vídeo pronto:

```text
Faça os erros 2 e 3 e o fecho, e gere a versão final com a trilha.
```

> "Esse pedido termina o vídeo. Para não esperar, aqui está um pronto, feito com o mesmo briefing." →
> `out/reserva-reels.mp4`.

### Depois da apresentação

Apagar o vídeo criado ao vivo: `src/videos/tres-erros/`, `public/tres-erros/` e as linhas dele em
`src/videos/index.ts`.

---

## Notas dos slides

As notas de fala de cada slide estão no próprio `apresentacao.pen`, logo abaixo de cada slide (nota amarela). O
deck anterior, de 38 slides, está arquivado mais abaixo no mesmo arquivo.

## Perguntas prováveis

- **Precisa saber programar?** Não. Precisa saber dirigir: dizer para quem é, o que está errado e quando.
- **Quanto tempo leva?** O vídeo da Validação levou dias por causa das sete versões. Com o método e o kit, um
  vídeo curto sai numa tarde.
- **Por que não só Sora ou Veo?** Geram cenas bonitas, mas com pouco controle de texto, números e marca. Entram como
  material, não como base.
- **Quanto custa?** Assinatura do Claude, narração por caractere (opcional) e licença do Remotion para empresas acima
  de 3 pessoas. O resto é grátis.
- **Funciona para outros tipos de vídeo?** É o que o projeto de hoje mostra: um Reels sem nenhuma tela de sistema.
