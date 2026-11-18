# Rega · telas do app para o vídeo

Telas do app fictício **Rega** (o exemplo de [exemplo-primeiro-video.md](../exemplo-primeiro-video.md)), desenhadas no
Pencil e exportadas para o agente que monta o Reels. A fonte editável é o arquivo próprio
[`../rega.pen`](../rega.pen) (frames `01 · Bloqueio` a `05 · Fecho`), separado da apresentação.

## Como passar para o agente

Copie esta pasta para `public/rega/` do projeto do vídeo e mande:

```text
Em public/rega/ estão as telas do app Rega (telas/), os elementos soltos para animar (camadas/) e as fotos (fotos/).
Leia public/rega/README.md. Use as telas como estão, sem redesenhar: anime entrando e saindo com as camadas por cima.
```

## Telas (1080x2340, proporção de iPhone, PNG)

As telas têm a proporção de um celular, não a do vídeo. No Reels (1080x1920), coloque cada tela dentro de um celular
ou de um recorte arredondado e anime esse celular no quadro.

| Arquivo | Batida do vídeo | O que mostra |
|---|---|---|
| `telas/01-bloqueio.png` | O lembrete chega | Tela de bloqueio, 8:42, notificação "A Samambaia está com sede" |
| `telas/02-hoje.png` | O app abre | "Suas plantas precisam de você", semana com o dia 18, anel "2/3" da rotina, a Samambaia atrasada com o botão de regar, Jiboia e Costela já regadas, dica do dia |
| `telas/03-detalhe.png` | Decisão | A samambaia murcha em vaso branco ocupando o topo, "Samambaia" com o selo "Com sede", cartão verde com água, luz e umidade, "Próxima rega: Hoje, até 10h" e o botão "Regar agora" |
| `telas/04-regada.png` | A planta é salva | "Tudo em dia por hoje", anel "3/3" cheio, a samambaia já viçosa e marcada, aviso "Samambaia regada · próxima no domingo, 23 nov" |
| `telas/05-fecho.png` | Assinatura | Ícone, "Rega.", "Sua planta agradece." e a samambaia feliz |

## Camadas (PNG com fundo transparente, já com a sombra)

| Arquivo | Para animar |
|---|---|
| `camadas/notificacao.png` | Desce do topo sobre a foto da planta murcha |
| `camadas/semana.png`, `camadas/rotina-de-hoje.png` | Entram em sequência quando o app abre |
| `camadas/tarefa-samambaia.png` | Destaque do Hoje; o toque no botão de gota leva ao Detalhe |
| `camadas/lista-de-tarefas.png`, `camadas/dica-do-dia.png` | Sobem escalonadas |
| `camadas/nome-samambaia.png`, `camadas/cartao-de-cuidados.png` | No Detalhe, o cartão verde sobe de baixo com mola |
| `camadas/botao-regar-agora.png` | O toque: o botão afunda 4% e volta |
| `camadas/aviso-regada.png` | Sobe de baixo na tela 04; o anel vai de 2/3 para 3/3 |
| `camadas/barra-de-abas.png` | Fixa na base, se a tela for montada por partes |
| `camadas/icone-do-app.png`, `camadas/marca-rega.png` | Fecho: o ícone entra, depois a marca |

## Sequências com GSAP

A entrada de cada tela, montada pelas camadas, fica numa linha do tempo do `@remotion/gsap` (`useGsapTimeline`):

| Tela | Sequência |
|---|---|
| 02 · Hoje | Título sobe, semana entra dia a dia (stagger 0,04 s), o cartão da rotina sobe e o anel cresce até 2/3, as tarefas sobem em stagger de 0,08 s com `power3.out` e a da Samambaia dá um leve pulo (`back.out`) |
| 03 · Detalhe | A planta sobe e assenta, o nome entra, o cartão verde sobe com `back.out(1.4)` e os três cuidados entram em stagger |
| 04 · Regada | O aviso escuro sobe de baixo, o anel vai a 3/3 e a marca de feito da Samambaia entra com escala |
| 05 · Fecho | O ícone entra, "Rega." sobe palavra a palavra e a planta feliz aparece por último |

O GSAP cuida do encadeamento; o Skia, dos efeitos de água e de distorção. Não use callbacks (`onComplete`) nem
`random`: o hook recusa.

## Efeitos com Skia

As telas são PNG parados. O movimento que dá vida a elas vem do `@remotion/skia` (`<SkiaCanvas>`), sempre dirigido
por `useCurrentFrame`:

| Momento | Efeito |
|---|---|
| A notificação chega (01) | Gotas saem da notificação, se juntam e se separam como líquido (desfoque com limiar) e caem na planta |
| O app abre (01 → 02) | Ondulação circular a partir do toque na notificação, distorcendo a tela por 0,4 s |
| Toque em "Regar agora" (03) | Ondulação a partir do botão; o cartão verde se enche de água de baixo para cima, com a borda ondulando |
| A planta é salva (03 → 04) | A samambaia murcha se dissolve na feliz com um shader de ruído, e não com um fade |
| Anel 2/3 → 3/3 (04) | O arco cresce com um brilho que percorre a ponta |

Detalhes de instalação e render (`enableSkia`, `LoadSkia`, `--gl=angle`): remotion.dev/docs/skia.

## Fotos (`fotos/`)

`vaso-samambaia-murcha.png`, `vaso-samambaia-feliz.png`, `vaso-jiboia.png` e `vaso-costela.png` mostram as plantas em vaso
branco sobre fundo branco, e a transição da murcha para a feliz é a virada do vídeo. Sobre um fundo claro, use
`mix-blend-mode: multiply` para o branco sumir. `bloqueio-fundo.png` é a foto da tela de bloqueio. Todas foram geradas
por IA no Pencil e não têm texto.

## Estilo

| Papel | Valor |
|---|---|
| Fundo | `#F6F5F1` · cartões `#FFFFFF` com sombra suave, sem contorno · bloco claro `#EEF2EC` |
| Verde folha (marca, botões) | `#2F5D3A` · claro `#4E8A5C` · suave `#DCE7D9` |
| Sol (só o que pede atenção: sede, água, destaque) | `#E8A33D` · suave `#F8E3BF` |
| Tinta | `#1E2B21` · secundária `#7A857C` |
| Fontes | Fredoka 500 nos títulos · Nunito 500/700 no resto, sem negrito pesado |
| Forma | Minimalista: muito espaço, cantos de 44 a 64 px, planta como protagonista, verde só no que é ação ou está ativo |

O sol aparece só no que precisa de atenção (a tarefa atrasada, a água de hoje, o selo de 12%). Depois da rega, o selo
fica verde.
