# 3 erros ao criar vídeo com IA · tratamento

> Escrito antes de construir; aguarda aprovação. Depois, prova = gancho + erro 1 (0–7,6 s).
> Guia: docs/guia-de-producao.md, seção "Direção antes de efeito".

## Para quem e para quê

- **Quem assiste:** devs e quem cria conteúdo, rolando o feed do Instagram e do LinkedIn no celular, quase sempre
  sem som. Decide em 1 s se para.
- **O problema, nas palavras dessa pessoa:** "pedi um vídeo pra IA e veio uma coisa genérica, igual a todo mundo".
- **A ideia em uma frase:** a IA monta, mas quem decide é você: **"A IA produz. Você dirige."**
- **Marca:** agrotrace (assinatura nenhuma: sem logo, sem chamada) · **Formato:** 9:16, 1080×1920, 30 fps ·
  **Duração:** 20 s · **Prova:** gancho + erro 1 (7,6 s).

## Estrutura (desenhada para esta história)

- **Três estruturas candidatas:**
  1. Lista numerada: "1", "2", "3" grandes, cada um com a frase. É o clichê do formato.
  2. Antes e depois em tela dividida: em cima o erro, embaixo a correção. Funciona bem em 9:16, mas divide o quadro
     em dois textos médios e nenhum texto grande.
  3. **Um objeto atravessa o vídeo:** um quadro 9:16 em miniatura (o vídeo que o agente está montando) passa pelas
     quatro cenas. Cada erro estraga o quadro de um jeito, e cada correção o conserta. No fim, o quadro está pronto.
- **A escolhida é a 3.** O assunto é "fazer um vídeo", e o quadro mostra isso acontecendo sem precisar de tela nem de
  marca. Cada erro tem uma consequência visível no mesmo objeto, e a continuidade dá o fio que uma lista não dá.
- **Diferente do vídeo anterior (`validacao-atendimentos`) em 6 de 6:**
  - estrutura: objeto que atravessa, em vez de caso real;
  - abertura: capa tipográfica pronta no quadro zero, em vez de grade de pontos;
  - plano-assinatura: o quadro em miniatura sendo montado;
  - câmera: plana e frontal, empurrando o quadro de cena em cena, em vez de órbita sobre capturas;
  - trilha: 90 BPM curta, com o silêncio antes da última palavra;
  - fecho: frase, sem logo.
- **O que este vídeo não é:**
  - não é um tutorial nem um vídeo de feature (não há telas);
  - não é escuro, neon nem vidro (seção 1 do guia);
  - não cita ferramenta nem marca, nem como piada;
  - não tem mascote nem rosto de IA: o agente aparece só pelo que ele faz (formas que chegam sozinhas, um cursor que
    digita).
- **Abertura:** o quadro zero já é a capa (título inteiro, legível em miniatura). No primeiro tempo, o "3" se solta
  e vira o contador da tela.
- **Receitas do catálogo:**
  - `Headline` palavra por palavra para todo texto, como pede o briefing;
  - odômetro (`Odo`) no contador 1/3 → 3/3, como eixo condutor;
  - carimbo com tremor uma vez, no erro 2: é o único impacto de tela inteira do vídeo.
- **Receitas novas que o vídeo pede:**
  - o **quadro em miniatura** (moldura 9:16 com cantos de enquadramento);
  - **formas que caem com física** (círculos, barras, triângulos laranja e tinta), com `pouso` e `Sombra` de
    `src/kit/corpo.tsx`;
  - o **adesivo que descola** (erro 3).

### As 4 cenas

O texto é a legenda: cada frase entra palavra por palavra (4 quadros entre palavras) na faixa segura do celular, e
não há legenda separada embaixo. O erro aparece em tinta e é **riscado**. A correção entra em laranja logo abaixo.

| Tempo | Cena | O que aparece | Texto na tela | Como sai |
|---|---|---|---|---|
| 0–3,2 s | **1. Gancho** | Quadro zero = capa: um **"3"** laranja enorme, com "erros ao criar vídeo com IA" em tinta. Ao lado, o quadro 9:16 em miniatura, vazio, com um cursor piscando. No primeiro tempo, o "3" encolhe e vira o contador **1/3** no alto. | **3 erros** ao criar vídeo com IA | O quadro vazio vem para o centro e cresce: é o palco do erro 1. |
| 3,2–7,6 s | **2. Pedir sem briefing** | Dentro do quadro, o cursor digita `faz um vídeo top`. O agente responde **despejando formas** que caem, se empilham tortas e ficam no canto (o genérico). A frase de erro é riscada. Então três **etiquetas** caem no quadro, "quem", "onde" e "pra quê", e as formas se reorganizam numa composição limpa, presas às etiquetas. | ~~Pedir sem briefing.~~ / **Diga quem, onde e pra quê.** | O quadro organizado desliza para a esquerda e vira a "v1" da cena seguinte. O contador rola para 2/3. |
| 7,6–11,9 s | **3. Aceitar a primeira versão** | O quadro "v1" chega e uma mão apressada (só o cursor) carimba **"ÓTIMO!"** nele, com tremor. A frase de erro é riscada e o carimbo cai. Atrás da v1 surgem a **v2** e a **v3** em leque, cada uma mais refinada: menos formas, alinhamento melhor, mais respiro. A v3 vem para a frente. | ~~Aceitar a primeira versão.~~ / **A v1 é rascunho.** | A v3 fica sozinha no centro, e o contador rola para 3/3. |
| 11,9–20 s | **4. Copiar o estilo dos outros** e fecho | Um **adesivo cinza**, com contorno duplicado de fotocópia e a etiqueta `estilo-do-outro-FINAL(2).css`, cobre a v3. A frase de erro é riscada. O adesivo **descola** pelo canto e cai, e o quadro aparece com as cores próprias, laranja e tinta. O quadro sobe e encolhe. Um tempo de silêncio. Embaixo, o fecho: "A IA produz." em tinta e "**Você dirige.**" em laranja. Ela segura 1,5 s. | ~~Copiar o estilo dos outros.~~ / **Leve a ideia, não a roupa.** → **A IA produz. Você dirige.** | Fim. Último quadro parado 1,5 s, sem logo. |

**Orçamento de leitura (regra `caracteres ÷ 15 + 1,5 s`), está apertado:**

| Trecho | Texto | Pede | Tem |
|---|---|---|---|
| Gancho | 29 caracteres | 3,4 s | 3,2 s, mas a capa já está inteira no quadro zero |
| Erro 1 | 45 caracteres | 4,5 s | 4,4 s |
| Erro 2 | 42 caracteres | 4,3 s | 4,3 s |
| Erro 3 | 53 caracteres | 5,0 s | 5,0 s |
| Fecho | 25 caracteres | 3,2 s | 3,1 s |

Total: 20,0 s. O pedido e o disponível empatam, sem folga. Se a prova mostrar que a leitura corre, há duas saídas:
ir para 21–22 s, ou encurtar uma das correções.

## Direção de arte

A marca é agrotrace, mas com as cores e a fonte da apresentação, como pedido. Nada da paleta verde da marca entra.

- **Base:**
  - papel `#FBF6F1` (o `Paper` do kit, com grão leve);
  - laranja `#D9561A`;
  - tinta marrom-escura `#2B211B` para o texto. A proposta é minha; trocar se a apresentação tiver outra;
  - tinta a 35% para o que é secundário.
- **O que cada cor quer dizer, do começo ao fim:**
  - **laranja** é "o que você decide": o "3" da capa, as correções e "Você dirige.";
  - **tinta** é o fato ou o erro, e o risco que o corta;
  - **cinza frio** só no adesivo da cópia: é a única cor que não é nossa, e sai do vídeo junto com o adesivo;
  - não há vermelho, para não brigar com o laranja: o erro se marca pelo risco, não pela cor.
- **Tipografia:**
  - Saira em todo o texto: 800 nos erros e correções, 600 no fecho;
  - mono só no que o agente "digita" (`faz um vídeo top`) e nos nomes `v1`/`v2`/`v3` e `.css`.
- **Tamanhos (celular):**
  - frases com 72–96 px;
  - o "3" da capa com cerca de 520 px;
  - nada abaixo de 56 px, salvo as etiquetas de apoio (40 px ou mais).
- **Área segura:** texto e quadro ficam entre y 260 e y 1500 e entre x 90 e x 990, longe dos botões e da legenda
  do Reels e do LinkedIn.
- **Princípio que fica das referências do guia:** uma peça protagonista (o quadro), câmera contínua e física nas
  formas. Nenhuma cor, textura ou fonte de fora.

## Edição

- **Cortes:** nenhum corte seco. São três passagens, e o quadro é o objeto que leva de uma cena à outra:
  - cresce (gancho → 1);
  - desliza e vira "v1" (1 → 2);
  - fica e recebe o adesivo (2 → 3).
- **Câmera:** plana e frontal, com uma deriva lenta e contínua (`Stage` com `trilho`, inclinação mínima). Os
  movimentos grandes são do quadro, não da câmera: uma coisa mexe de cada vez.
- **Física:**
  - as formas do erro 1 caem com antecipação e quique;
  - o carimbo do erro 2 é o único impacto com tremor;
  - o adesivo do erro 3 descola em arco, com a sombra crescendo.
- **Continuidade:**
  - o contador 1/3 → 3/3 fica no alto o tempo todo;
  - o mesmo quadro passa pelas quatro cenas;
  - o cursor do gancho é o que digita no erro 1 e carimba no erro 2.
- **Funciona sem som?** Sim. Todo o sentido está no texto e no quadro, e o som só reforça.

## Som

- **Base:** trilha sintetizada a 90 BPM, curta e leve (pluck e pad, bateria só a partir do erro 1).
- **Foley:**
  - teclas baixas na digitação;
  - um "toc" de madeira em cada forma que pousa (poucas, não em todas);
  - o baque do carimbo;
  - o "rasg" do adesivo descolando.
- **Silêncio:** o único fica entre "A IA produz." e "Você dirige.". A música corta seco, e a última palavra entra
  com uma nota que resolve.
- **J-cuts:**
  - o baque do carimbo chega 2 quadros antes da imagem;
  - o rasgo do adesivo começa antes de ele soltar.

| Trecho | Música | Foley | Conferido na mix |
|---|---|---|---|
| Gancho | pad e pluck, sem bateria | cursor piscando (tique leve) | |
| Erro 1 | entra a bateria leve | teclas, tocs das formas | |
| Erro 2 | groove | carimbo (J-cut) | |
| Erro 3 | groove, abrindo o filtro | rasgo do adesivo (J-cut) | |
| Fecho | silêncio, depois nota que resolve | — | |
