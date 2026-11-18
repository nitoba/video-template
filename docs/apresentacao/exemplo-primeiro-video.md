# Exemplo: o primeiro vídeo no estúdio novo

Um vídeo para testar o estúdio preparado pelo [prompt inicial](prompt-inicial.md). Ele usa quase todas as
ferramentas (imagem gerada, ícones, partículas, tipografia, efeitos sonoros, trilha e legenda) sem precisar de
nenhum sistema real nem de dados de cliente.

**O vídeo:** o lançamento de um app fictício chamado **Rega**, que lembra você de regar as plantas.
Reels vertical, 20 segundos.

---

## Antes de começar: as referências

Na pasta `referencias/` do projeto, coloque:

- `links.md` com 2 ou 3 vídeos curtos de lançamento de app de que você gosta (do Instagram ou do YouTube);
- uma paleta: crie `paleta.md` com `#F4F1EA` (papel), `#2F5D3A` (verde folha) e `#E8A33D` (sol);
- se quiser, um print de um app de que você gosta visualmente.

Depois feche e abra o Claude Code na pasta (sessão nova). Mande um pedido por vez e espere a resposta.

## 1 · Briefing

```text
Vou fazer um vídeo. Antes de qualquer coisa, me faça as perguntas que faltam neste briefing:
- Para quem: pessoas de 25 a 40 anos que têm plantas em casa e vivem esquecendo de regar, rolando o feed.
- Para quê: entender em 20 segundos o que o Rega faz e ter vontade de baixar.
- Onde vai passar: Instagram Reels, no celular, muitas vezes sem som.
- Formato e duração: 9:16, 20 segundos.
- Tom: leve e bem-humorado, com a planta como personagem.
- O produto: Rega, um app que lembra de regar cada planta na hora certa, pelo tipo de planta e pelo clima.
```

Responda as perguntas dele em uma frase cada.

## 2 · Referências e estilo

```text
Em referencias/ estão os links e a paleta. Para cada vídeo, anote a duração média dos planos, as transições, o
movimento de câmera, o estilo de legenda, a estrutura e o uso de som. Depois escreva docs/estilo.md com o princípio
que vamos levar de cada um. Não copie cor, fonte nem roteiro: o estilo vem da paleta do Rega e de uma fonte
arredondada e simpática que você vai propor.
```

### 2b · Quadros-chave (antes de animar qualquer coisa)

```text
Monte 3 quadros-chave parados em 1080x1920, no estilo do docs/estilo.md: a planta murcha falando, o celular com o
Rega e o fecho. Coloque cada um ao lado de um quadro das referências, dê uma nota de 1 a 10 contra o
docs/design.md, corrija os três piores problemas até passar de 8 e me mostre com a nota.
```

Se ainda estiver com cara de IA, diga o porquê (tudo centralizado, texto todo do mesmo tamanho, gradiente) e o que
quer no lugar. É aqui que o vídeo fica bonito ou feio: mudar um quadro parado custa um minuto.

## 3 · Tratamento

```text
Escreva o tratamento como uma lista de planos: tempo, o que aparece, o texto exato na tela e o som. Ideia: a planta
murcha fala com quem assiste, o app aparece e salva o dia. Termine com "Rega. Sua planta agradece." Diga qual forma
de narrativa escolheu e por quê. Me mostre antes de escrever qualquer código.
```

Corrija uma coisa só, para treinar o ciclo. Por exemplo:

```text
A abertura precisa prender em 2 segundos. Comece com a planta dizendo "Ei. Você esqueceu de mim de novo?"
```

## 4 · Imagem da planta (Gemini)

O tratamento vai pedir uma planta-personagem. Peça a ele o prompt da imagem:

```text
Escreva o prompt para eu gerar no Gemini a imagem da planta murcha e da planta feliz, no estilo do docs/estilo.md,
sem texto e com fundo liso para recortar.
```

Gere no gemini.google.com, salve em `public/imagens/planta-murcha.png` e `planta-feliz.png` e avise:

```text
Salvei as duas imagens em public/imagens/. Use nas cenas da planta.
```

## 5 · Prova

```text
Faça o storyboard dos primeiros 8 segundos: um quadro-chave parado por batida. Me mostre antes de animar.
```

```text
Monte só os primeiros 8 segundos: a planta murcha falando e o celular com o Rega entrando. Quando o lembrete chegar,
faça as gotas de água com @remotion/skia: elas saem do celular, se juntam e se separam como líquido (desfoque com
limiar) e caem na planta com peso. Marque cada batida com um nome. Não renderize o MP4: me mostre uma folha de
quadros e me avise para eu ver na prévia.
```

## 6 · Ciclos

Assista na prévia (`npm run dev`) e aponte o que estiver errado, com o segundo exato. Exemplos:

```text
No segundo 2, a fala da planta some antes de dar tempo de ler. Segura mais meio segundo.
```

```text
As gotas caem em linha reta, sem peso. Faz elas acelerarem na queda e respingarem ao tocar na folha.
```

Quando a prova estiver boa:

```text
Aprovado. Faça o resto do vídeo do mesmo jeito e me mostre a folha de quadros do vídeo inteiro.
```

## 7 · Som

```text
Faça a lista de cues de som a partir das batidas: um pingo d'água no lembrete, um "pop" quando a planta se
levanta, e uma trilha leve e alegre que abaixa nas falas. Busque os efeitos e a música no Openverse (CC0 ou CC BY)
e anote autor, licença e link no CREDITS.md. Me mostre a lista antes de mixar.
```

## 8 · Entrega

```text
Gere a versão final: 1080x1920, 30 fps, legenda palavra por palavra dentro da área segura, música abaixando nas
falas, -14 LUFS. Confira com ffprobe e loudness, me mostre quadros do começo, do meio e do fim, e atualize o
CREDITS.md.
```

```text
Liste o que eu corrigi neste vídeo e transforme cada correção numa regra curta na seção "Aprendido" do CLAUDE.md.
```

---

**O que esse exemplo exercita:** briefing com perguntas, análise de referências, tratamento como lista de planos,
imagem gerada (Gemini), partículas com significado (as gotas), tipografia e legenda, efeitos e trilha com licença,
ajuste pelo segundo exato, entrega com loudness e créditos, e a regra aprendida no fim. São de 10 a 12 pedidos e
algumas horas na primeira vez.
