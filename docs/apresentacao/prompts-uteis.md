# Prompts úteis para vídeo com IA

Pedidos prontos para colar no Claude Code, na ordem do método. Troque o que está entre `<>`. Funcionam com o
template ou com um projeto preparado pelo [prompt inicial](prompt-inicial.md).

## Como usar

Isto é um cardápio, não um roteiro: **mande um pedido por vez e espere a resposta antes do próximo.**

1. **Siga a ordem do método.** Briefing → referências e estilo → tratamento → prova. Cada etapa termina com a IA
   mostrando algo (perguntas, `estilo.md`, lista de planos, prova): olhe, aprove ou corrija, e só então siga.
   Mandar tudo junto pula as decisões baratas, que são o ponto do método.
2. **Os do meio são sob demanda.** "Ciclos de ajuste" e "Cenas que costumam sair bem" entram quando aparece a
   necessidade (um texto pequeno no segundo 3, um contador, uma versão 9:16). Um vídeo pode usar só três ou quatro.
3. **Preencha os `<>`** com o seu caso: o segundo exato, a cor em hex, o texto exato.
4. **Feche sempre com "Depois de cada vídeo"**, para as correções virarem regras no `CLAUDE.md`.

Um vídeo curto costuma levar de 6 a 10 pedidos: briefing, estilo, tratamento, prova, dois ou três ajustes e entrega.

O que se repete em quem já usa: **escreva como uma lista de planos** (formato, duração, cores em hex, texto exato,
como termina), **peça para ver quadros antes do render**, **aponte o segundo exato na revisão** e **peça o custo
antes de qualquer geração paga**.

---

## 1 · Briefing

```text
Vou fazer um vídeo. Antes de qualquer coisa, me faça as perguntas que faltam neste briefing:
- Para quem: <público, e como assiste: celular, sem som, reunião>
- Para quê: <o que a pessoa deve entender ou fazer depois>
- Onde vai passar: <Instagram, LinkedIn, YouTube, apresentação>
- Formato e duração: <9:16, 16:9 ou 1:1> · <segundos>
- Tom: <direto, sério, com humor…>
```

## 2 · Referências e estilo

```text
Em referencias/ estão <prints, links, vídeos> de que eu gosto. Para cada um, anote: duração média dos planos, tipo
de transição, movimento de câmera, estilo de legenda, estrutura (gancho, meio, fecho) e uso de som e silêncio.
Depois escreva docs/estilo.md com o princípio que vamos levar de cada um. Não copie cor, fonte nem roteiro: o
estilo vem da nossa marca (<cores em hex>, <fonte>).
```

Referência em vídeo (a IA não assiste vídeo, então peça os quadros):

```text
Extraia com ffmpeg um quadro por corte de referencias/<video>.mp4 (detecção de cena) e monte uma folha com eles.
Use essa folha para analisar o estilo.
```

Antes de qualquer animação, prove o look em quadros parados:

```text
Monte 3 quadros-chave parados, no tamanho final, no estilo do docs/estilo.md: a abertura, o momento central e o
fecho. Coloque cada um ao lado de um quadro das referências. Dê uma nota de 1 a 10 contra o docs/design.md,
corrija os três piores problemas até passar de 8, e só então me mostre, com a nota.
```

Se o look não agradar, diga o porquê com o vocabulário de design:

```text
Está com cara de IA: tudo centralizado, todo texto do mesmo tamanho e o fundo é um gradiente. Quero uma palavra
enorme ocupando metade da tela, alinhada à esquerda numa grade de 96 px, fundo liso com grão, e uma cor de
destaque só.
```

## 3 · Tratamento como lista de planos

```text
Escreva o tratamento como uma lista de planos: tempo de início e fim, o que aparece, o texto exato na tela e o som.
Diga qual forma de narrativa escolheu e por quê. Me mostre antes de escrever qualquer código.
```

Variações:

```text
Proponha 3 aberturas diferentes para os primeiros 3 segundos, cada uma em uma frase. Eu escolho uma.
```

```text
Encurte o tratamento para <N> segundos sem perder a ideia principal. Diga o que saiu.
```

## 4 · Prova

```text
Faça o storyboard do momento central: um quadro-chave parado por batida, com o nome da batida e o movimento que
liga um ao próximo. Me mostre antes de animar.
```

Depois do storyboard aprovado:

```text
Monte só o momento central, <8 a 15> segundos, no estilo final. Marque cada batida com um nome. Não renderize o
MP4: me mostre uma folha de quadros, um por batida, e me avise para eu ver na prévia.
```

## 5 · Ciclos de ajuste

Sempre o segundo exato e o problema, nunca "refaz":

```text
No segundo <3,5>, <o título> está <pequeno para quem vê no celular>. <Deixa bem maior>. Só isso.
```

```text
Entre o segundo <8> e o <11> o texto some antes de dar tempo de ler. Segura mais <meio segundo>.
```

```text
A câmera está parada na cena <2>. Faz ela se aproximar devagar enquanto os elementos entram.
```

```text
Antes de me mostrar, faça a autocrítica: nota de 1 a 10 para cada quadro da folha contra o docs/design.md e as
referências; corrija os três piores problemas até passar de 8.
```

```text
O movimento está mecânico: tudo entra junto e com a mesma velocidade. Escalone as entradas, dê antecipação e
deixe cada elemento assentar com peso.
```

```text
Gere 3 variações da cena <de abertura>, cada uma com uma ideia de movimento diferente. Me mostre um quadro de cada.
```

## Cenas que costumam sair bem de primeira

Títulos e tipografia:

```text
Título "<texto>" centralizado sobre fundo <#hex>, em <fonte> <peso>. Uma linha <#hex> se desenha embaixo em
0,5 s, depois o subtítulo "<texto>" aparece. Segura 2 s e some.
```

```text
Tipografia cinética: estas 4 frases entram uma por batida (a cada 0,8 s) e sobem empilhadas. A frase ativa fica
em <#hex>; as anteriores ficam em cinza e menores, mas legíveis.
```

Números e gráficos:

```text
Contador que sobe de 0 a <valor> em 2 s, desacelerando no fim, com "<rótulo>" embaixo. Use o número exato.
```

```text
Gráfico de barras com estes dados: <A: 12, B: 30, C: 18>. As barras crescem uma depois da outra e o valor sobe
em cima de cada uma. Destaque a barra <B> em <#hex>.
```

Interface e produto:

```text
Use as capturas em public/imagens/<arquivo>.png. O cursor entra pela direita, clica em <botão> no segundo 2 e a
tela reage. Separe a tela em camadas que se afastam em profundidade; a câmera orbita devagar.
```

Formatos sociais:

```text
Versão 9:16 de 15 s: gancho nos primeiros 3 s, legenda palavra por palavra com a palavra ativa destacada, todo
texto dentro da área segura (sem nada nos 15% de baixo nem nos 10% de cima).
```

```text
Lower third com fundo transparente: nome "<nome>" e cargo "<cargo>" com uma barra <#hex>. Exporte em ProRes 4444
com canal alfa e teste sobre uma imagem clara.
```

Sequência encadeada com GSAP:

```text
Com @remotion/gsap (useGsapTimeline), monte a entrada da <tela do app>: <o cabeçalho desce, os cartões sobem em
stagger de 0,08 s com power3.out, o botão entra por último com back.out>. Use rótulos e posição relativa para
encadear, sem callbacks nem play. Me mostre 4 quadros.
```

Efeitos com Skia (água, líquido, distorção, shader):

```text
Com @remotion/skia, faça <gotas que caem e se juntam como líquido / uma onda que atravessa a tela / a imagem
ondulando quando é tocada>. Dirija tudo por useCurrentFrame, sem animação própria do Skia. Me mostre 4 quadros
antes de seguir.
```

Loops e transições:

```text
Loop perfeito de 2 s: <pontos girando em círculo>. Confira que os quadros 0, 60 e 120 são iguais.
```

## Imagens auxiliares (Gemini, Nano Banana)

```text
Gere uma imagem 16:9, sem nenhum texto, no estilo <papel creme, paleta #FBF6F1 e #D9561A, fotografia editorial,
luz natural>, de <descrição da cena>. Deixe o terço <de cima> livre para o título.
```

Depois, no Claude Code:

```text
Salvei a imagem em public/imagens/<arquivo>.jpg. Use como fundo da cena <2>, com um zoom lento de 5% e o título
na área livre.
```

## Som

```text
Faça uma lista de cues de som a partir das batidas da timeline: onde entra música, onde cai cada efeito, onde
fica o único silêncio. Sincronize só o que conta a história. Busque os efeitos no Openverse (CC0 ou CC BY) e
anote autor, licença e link no CREDITS.md.
```

```text
Narração: grave as falas com <Kokoro>, meça cada uma e ajuste o tempo das cenas à voz. Antes, escreva as siglas
como se falam.
```

## Custo e entrega

```text
Antes de gerar <a voz / as imagens / a música>, me diga quanto custa e espere meu sim.
```

```text
Gere a versão final: render em 1080p 30 fps, legenda palavra por palavra, música abaixando na fala, -14 LUFS.
Confira com ffprobe e loudnorm, me mostre quadros do começo, do meio e do fim, e atualize o CREDITS.md.
```

```text
Faça também a versão 9:16 sem refazer as cenas: reenquadre e reposicione os textos para a área segura.
```

## Depois de cada vídeo

```text
Liste o que eu corrigi neste vídeo e transforme cada correção numa regra curta na seção "Aprendido" do CLAUDE.md.
```

---

Fontes: [ChatCut: 16 prompts de motion graphics testados](https://chatcut.io/blog/claude-motion-graphics),
[claude-motion](https://github.com/whaleyxbt/claude-motion), [Wireflow](https://www.wireflow.ai/blog/remotion-claude-code),
[createmotion](https://createmotion.io/guides/claude-code-remotion-launch-video/),
[promptsrush](https://promptsrush.com/blog/how-to-edit-videos-with-claude),
[awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills).
