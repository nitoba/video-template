# Guia de produção de vídeos (Agrotrace / PecTrace)

Este guia reúne o que aprendemos fazendo os vídeos das features Jornada, Central de Inconsistências e
Validação de atendimentos. Leia antes de começar um vídeo novo.

Referências aprovadas:

- **Vídeo narrado de feature, na linguagem atual (molde):** `src/videos/validacao-atendimentos/`
  (`bun run render validacao-atendimentos` e `bun run narrar validacao-atendimentos`): 38 falas, legendas, telas reais
  em camadas 3D, transições com direção e animação com física.
- **Prova da direção (PecTrace, novembro de 2026):** `src/videos/prova-direcao/`, com o tratamento em
  `tratamento.md`: papel da marca, câmera contínua sobre a captura real, partículas com significado e uma peça da
  interface como protagonista.
- **O esqueleto de `bun run novo`** (`src/videos/_modelo/`) já nasce nessa linguagem, para qualquer marca.
- **Linguagem antiga (escura, janela do navegador):** `src/videos/exemplo-validacao/`, mantido como referência
  técnica de narração, Lottie e capturas.
- **História em plano-sequência e Central de Inconsistências:** ficam no repositório original
  `agrotrace-video` (`src/jornada-historia/`, `src/central/`), que não foi trazido para cá; os
  componentes que eles usavam viraram o kit deste template (`src/kit/`).

Neste template, cada vídeo mora em `src/videos/<slug>/` e é criado com `bun run novo`. O passo a passo
para a IA está na skill `.claude/skills/novo-video/SKILL.md`.

## 1. O que nos diferencia

**A história vem primeiro; os recursos visuais e sonoros são apoio.** Mas o vídeo também
precisa vender a funcionalidade, mostrando o software de verdade. A fórmula que funcionou:

> Uma história real (tirada dos dados) com conflito, em que **cada virada é resolvida por uma
> função do software**, mostrada de perto, legível e sendo usada (cursor, cliques, dados
> mudando).

### O que já foi rejeitado e por quê

| Tentativa | Problema |
|---|---|
| Cinemático escuro sem roteiro (v1) | Bonito, mas sem fio condutor. |
| Mundo 3D em miniatura (v2) | Escondia o software: "não reflete a realidade", "quero ver dentro da aplicação". |
| Gravação real com capítulos (A) | "Muito parado", "sem dinamicidade", "som não está legal", não dava ênfase. |
| Recriação com capítulos (B) | Repetitiva: tour de funcionalidades com o mesmo molde em toda cena. |
| **Plano-sequência com história (aprovado)** | A história prende e o software aparece resolvendo cada problema. |
| Telas do CMS redesenhadas em React (Validação v1) | "Não estão conforme o layout da aplicação": a recriação a partir do código errou título, abas, cabeçalho, cores e conteúdo de cada seção. Resolvido com capturas reais (seção 4). |
| Animações Lottie lineares e simples (Validação v1) | "Não estão trabalhadas como se fosse um artista de motion": movimento linear, sem antecipação, sem mola, elementos parados esperando a vez. Resolvido com o padrão da seção 5. |
| Três direções novas em moodboard com imagens de IA (16/11/2026) | "Amador": página, direções, fontes e estilo. Trocar a identidade não era o pedido; o pedido era acabamento. |
| Cetim escuro, plano macro e partículas copiados de Raycast, Linear e Comet (16/11/2026) | "Mais partículas e trilha não deixam o vídeo bom" e "o escuro não combina com o PecTrace". Referência é princípio, não estilo. Resolvido pela seção "Direção antes de efeito". |
| Telas paradas com zoom pequeno e contornos (16/11/2026, versão narrada v1) | "Sem dinamicidade, sem vida, uma imagem parada com um pequeno zoom e highlights: é amador." Resolvido com o sistema de movimento (seção "Direção antes de efeito › Movimento"). |
| Modelo com estrutura fixa para todo vídeo (16/11/2026) | "O template deve ser uma direção visual e não sempre ter a mesma estrutura, senão fica cansativo." O modelo virou uma tela limpa; a estrutura nasce no tratamento (seção "Direção, não fórmula"). |
| Voz soletrando siglas (Validação v1) | "RAT" saiu como "R-A-T". A sigla se fala "ráti". Resolvido escrevendo a pronúncia no texto da fala (seção 6). |

## Direção antes de efeito

Quem faz o vídeo age como roteirista, diretor e editor. Efeito não salva uma cena sem ideia.

### Tratamento e prova antes do vídeo

1. Escreva `tratamento.md` na pasta do vídeo (modelo em `src/videos/_modelo/tratamento.md`): para quem,
   o problema que essa pessoa sente, a ideia em uma frase, o roteiro em tabela, a direção de arte, a
   edição e o som. Peça aprovação.
2. Construa uma **prova de 15 a 20 s** com o momento central da história (telas reais, trilha e
   foley) e aprove antes do vídeo completo. Mudar a direção numa prova custa minutos; num vídeo de
   90 s custa o dia.

### Identidade vem da marca e do nicho

- Comece pela marca do vídeo (`src/brands/<marca>.tsx`) e pelo próprio app: cores, fontes, os
  materiais do mundo do usuário. O PecTrace é laranja e claro, o app é claro e o RAT é um documento
  de campo, então a prova usa papel quente (`Paper`), tinta marrom, laranja para ação e o amarelo do
  marca-texto do app para "cópia". O fundo escuro não combina com essa marca.
- Cada marca e cada nicho pedem a sua adaptação. Não reaproveite a estética de um vídeo de outra
  marca só porque ficou bonita lá.
- Das referências externas (Raycast, Linear, Comet...) tire **o princípio**, nunca a cor, a textura
  ou a tipografia:
  - **câmera contínua:** um movimento que vai do detalhe ao contexto, em vez de muitos cortes;
  - **uma peça da interface como protagonista:** a peça sai da tela, o resto desfoca e recua;
  - **partícula como ligação entre dados:** o grão sai de onde a informação está e chega onde ela
    se repete.

### Partículas com significado (`src/kit/grains.tsx`)

- Cada grão tem origem e destino que **querem dizer algo**. Na prova, cada linha copiada solta uma
  fita de grãos que cai na mesma linha do outro atendimento, e a linha de destino acende quando eles
  chegam. No fecho, os grãos saem da palavra "conferido." e desenham o logo (`sampleShapePoints`).
- Pouca quantidade e trajetória organizada (uma fita por linha, fases próximas). Muitos grãos com
  rastro longo viram riscos caóticos por cima do texto, e glow em grão denso vira borrão.
- Os grãos agem **depois** que a câmera assenta. Dois movimentos ao mesmo tempo competem.

### Direção, não fórmula

O template fixa a **direção visual**: papel da marca, movimento, camadas, física, grãos com significado e o tom
editorial. A **estrutura** de cada vídeo é desenhada no tratamento, a partir da história daquela feature. O
`bun run novo` entrega só uma tela limpa já ligada, sem sequência pronta.

- **Uma estrutura por história.** Escolha a forma que serve a feature, ou invente outra, e diga no tratamento por que
  ela serve.
- **Não repita a forma nem a abertura dos dois últimos vídeos** (veja "Estruturas já usadas", abaixo). Ao terminar
  um vídeo, registre a estrutura dele lá.
- **Receitas são peças, não sequência.** Combine, adapte ou crie receitas novas; cada uma deve dizer algo sobre a
  feature. Uma receita usada sem motivo vira enfeite.

**Formas de narrativa (menu):**

| Forma | Serve quando |
|---|---|
| Caso real investigado | Há um erro concreto nos dados que a feature pega (um RAT, um técnico, uma data). |
| Antes e depois | O ganho é visível ao pôr o processo antigo e o novo lado a lado. |
| Pergunta e resposta | A feature responde a uma pergunta que o gestor já faz hoje. |
| Um objeto atravessa o vídeo | Um documento, um animal ou uma visita passa por cada etapa do sistema. |
| Um dia na vida | O valor está na rotina (manhã, campo, sincronização, noite). |
| Contagem ou escala | O impacto está no volume (milhares de atendimentos, hectares, horas). |
| Mapa ou território | A feature é espacial (propriedades, rotas, áreas). |
| Tutorial em três gestos | O público já conhece o problema e precisa ver como se usa. |

**Receitas de cena (catálogo):**

| Receita | O que comunica | Onde ver |
|---|---|---|
| Grade de pontos que escoa | Volume; cada ponto é um item real que vai para algum lugar | `validacao-atendimentos/Video.tsx`, `AtoNumero` |
| Objeto ejetado que vira documento | Sair do volume para um caso | `AtoRat` (ponto → ficha do RAT) |
| Carimbo com estilhaço e tremor | Uma decisão dura (rejeitado, aprovado) | `AtoRat` (stamp e burst) |
| Leitura que varre um documento | Conferência automática | `AtoRat` (agora) e `AtoComo` (IA lê) |
| Zonas que se desenham num documento | O que é lido ou checado | `AtoComo` (contrato, assinaturas, texto) |
| Ícones que caem e giram para alerta | Verificações e o resultado de cada uma | `AtoSete` |
| Mergulho de um clique para a tela | Passar de um aviso para o sistema | `AtoEmail` |
| Lista em camadas com linhas que voam | Uma coleção real, um item em destaque | `AtoLista` |
| Gaveta em blocos | Abrir um detalhe | `AtoDossie`, `AtoDispensar` |
| A peça que se ergue da tela | O dado que importa, isolado | `Peca` em `src/kit/motion.tsx` |
| Fichas iguais com marca-texto | Repetição, cópia | `AtoFichas`; `prova-direcao/Prova.tsx`, `ActOne` |
| Comparação ligada por grãos | Isto é igual àquilo | `AtoLado`; `prova-direcao/Prova.tsx`, `ActTwo` |
| Formulário que se preenche e prévia | Configurar antes de rodar | `AtoAntes` |
| Grade que acende um a um com odômetro | Um lote processado | `AtoAntes` (209) |
| Modal do CMS em partes, trecho à frente | Configuração no back-office | `AtoCms` e `cmsLayers` |
| Interruptor que liga | Ativar | `AtoLigar` |
| Ciclo que gira com grãos | Processo contínuo | `AtoCiclo` |
| Grãos que desenham o logo | Assinatura da marca | `AtoFinal`, `sampleShapePoints` |

**Estruturas já usadas:**

| Vídeo | Forma | Abertura | Fecho |
|---|---|---|---|
| Jornada (agrotrace-video) | Um dia na vida, em plano-sequência | Relógio do dia | Os 4 pings viram os 4 pontos do logo |
| Central de Inconsistências (agrotrace-video) | Caso real | Número em odômetro | Logo de partículas |
| Validação, prova (`prova-direcao`) | Caso real em três gestos | Frase escrita em papel | Grãos de "conferido." viram o logo |
| Validação, narrada (`validacao-atendimentos`) | Caso real, depois como funciona, rotina do gestor e configuração | Grade de 3.736 pontos | Ciclo e logo de grãos |

### Movimento (o que separa o vídeo profissional do amador)

Componentes em `src/kit/motion.tsx`: `Stage`, `Layers`, `Spot`, `Peca`, `Cursor`, `Card`, `Headline`, `Odo`, `Dust`,
`Legendas`, `viewAt`, `pop`, `shake`. Cores e fontes vêm do tema de movimento: por padrão saem da marca
(`temaDaMarca`), e o vídeo troca o que quiser com `<MotionProvider theme={...}>`. Exemplo completo:
`src/videos/validacao-atendimentos/Video.tsx`.

- **A interface nunca é foto.** Recorte a captura em peças (linhas, cartões, blocos da gaveta, partes do modal) e
  ponha cada uma no espaço 3D, na sua profundidade (`Layers`). As peças entram em sequência, vindas do fundo. O
  trecho da fala vem à frente como peça própria.
- **A câmera nunca para.** Cada tela entra inclinada e orbita durante a cena, e as profundidades diferentes geram
  paralaxe. Avanço de 3% a 6% não conta como movimento.
- **Transições com direção.** As cenas empurram umas às outras com desfoque de movimento (efeito chicote), ou
  entram por mergulho e zoom. A dissolvência pelo papel fica reservada. Alterne as direções em telas seguidas.
- **Peso e física.** Antecipação, arco, quique e overshoot, rotação que assenta, sombra que cresce com a altura e
  flutuação em repouso. Impactos têm tremor de câmera e estilhaço de grãos.
- **Desenho em vez de aparição.** Contornos, linhas-guia e zonas se desenham, e números rolam como odômetro. Títulos
  sobem de dentro de uma máscara, palavra por palavra.
- **Anotações por cima, na profundidade certa.** Camadas e anotações ficam em dois planos 3D que giram juntos.
  Cada contorno vai na profundidade (`z`) da peça que marca; se não, ele some atrás das camadas.
- **Teste curto antes do vídeo todo.** Renderize os primeiros 60 a 80 s e aprove antes de aplicar no resto.

### Edição

- **Ritmo:** quem assiste lê mais rápido do que o texto aparece. Escrita palavra a palavra de uma
  frase de 15 palavras: cerca de 2 s, não 4,5.
- **Composição:** cada quadro tem um centro claro. Nada de um elemento sozinho no terço de cima com o
  resto vazio. A câmera nunca fica parada: um avanço lento já basta.
- **Câmera sobre a captura (`src/kit/plano.tsx`):** recue rápido (cerca de 1,7 s) até um
  enquadramento **legível**, com respiro nas bordas, e deixe uma deriva lenta. Quadros de interface
  recortada sem foco cansam.
- **Casamento de corte:** o texto desenhado casa com a mesma linha da captura, na mesma posição e
  escala (`viewMatching`). A transição passa pelo papel com desfoque, sem dois textos sobrepostos.
- **Continuidade:** elementos do começo voltam como âncoras, como os selos #60290 e #60096 do ato 1
  presos aos blocos da comparação no ato 2.
- **Fecho:** segure o logo cerca de 1,5 s. Três segundos parado já é tempo morto.

## 2. Roteiro

1. **Ache o conflito nos dados reais.** Não invente: procure o que deu errado no dia ou no
   período. Na Jornada foram um técnico sem sinal às 08:06 e uma coleta a 2,9 km da
   propriedade às 14:40. Rode um probe no modelo, listando eventos, alertas e atrasos, antes
   de escrever.
2. **Estrutura em atos:** situação, tensão, virada (o produto) e resolução.
   - Gancho com uma pergunta ("Onde está cada um agora?").
   - Marca cedo (até ~15 s).
   - Contexto: como se chega à tela.
   - Conflito 1, resolvido pela função X.
   - Conflito 2, resolvido pela função Y.
   - Resumo em números.
   - Assinatura.
3. **Um eixo condutor.** Na Jornada foi o relógio do dia: os carimbos de hora (06:20, 08:06,
   14:40, 23:30) são âncoras recorrentes, em tipografia grande e em odômetro.
4. **Protagonistas com nome** ("Kaique ficou sem sinal") em vez de "um técnico".
5. **Legendas:**
   - frases curtas, uma ideia por vez, no máximo duas linhas;
   - de 2,5 a 4 s na tela, para dar tempo de ler;
   - uma palavra de destaque em cor;
   - subtítulo opcional, em fonte de interface, para o detalhe técnico.
6. **Fecho que rima com a abertura.** Os 4 pings do começo voltam como os 4 pontos que
   formam o logo, com as mesmas 4 notas.
7. Evite a lista de funcionalidades disfarçada de narrativa. Se uma cena não move a história,
   corte ou funda com outra.

## 3. Edição e motion

- **Regra dos seis, de Walter Murch:** o corte serve primeiro à emoção, depois à história,
  depois ao ritmo. Olhar, plano e espaço vêm por último.
- **Plano-sequência dentro do app** em vez de janela inclinada com título no canto. A câmera
  (`story.ts › MOVES`) vai de região em região do app, com o zoom que deixa a interface
  legível. Por exemplo: tooltip a 2,1×, alerta a 3,4×, feed a 2,0×.
- **Foco (`Spot`):** escurece o app e deixa só a região importante iluminada, com contorno.
  O contexto continua visível e a legenda fica sobre a área escura.
- **Transições com motivo,** nunca decorativas:
  - o clique no dia mergulha na barra do gráfico (whip zoom), com corte no pico e um clarão;
  - o pull-back revela que os pontos do mapa estão dentro do painel (match cut);
  - salto de horas: tela escurece, relógio grande rodando.
- **Variar o ritmo:**
  - rampa de velocidade no replay (acelera e freia);
  - quase parado na tensão (slow push);
  - salto no corte do tempo.
- **A câmera nunca para totalmente:** uma leve respiração de mão, e desfoque de movimento
  proporcional à velocidade da câmera (`motionBlur`).
- **Cursor de verdade:**
  - vai até o alvo com easing e clica com a onda;
  - arrasta a linha do tempo, com o cursor colado à bolinha;
  - botões escurecem e encolhem no clique, nunca clareiam.
- **Cor como dramaturgia:** a luz do fundo segue a hora do dia (azul de madrugada, quente de
  dia, roxo à noite).
  - Conflito de sinal: o app inteiro perde a cor (`saturate`) e só o que é vermelho volta
    colorido (`Patch`).
  - Alerta: o fundo puxa para o vermelho.
- **Eventos:**
  - `Pill` com linha-guia para explicar partes de um componente, acumulando em vez de
    piscar;
  - `PingRing` para eventos no mapa;
  - tremor de câmera curto só nos dois choques.
- **Antes do render completo, confira quadros parados.** Gere 6 quadros por trecho com
  `npx remotion still --scale=0.5` e monte uma folha com `ffmpeg xstack`. Procure:
  - texto sobre texto;
  - caixas de foco desalinhadas;
  - marcadores fora do quadro.

## 4. Telas: reais primeiro

O vídeo vende o software, então a interface precisa ser a que o cliente vai ver. Recriar uma tela a
partir do código parece fiel, mas erra em detalhes que quem usa o sistema percebe na hora (título do
diálogo, ordem e ícones das abas, densidade, cores do tema, textos de ajuda).

**Regra:** toda tela que aparece no vídeo vem de uma captura real, a menos que precise de um estado que
não dá para produzir sem gravar dados. Animação, câmera, cursor e legendas ficam por cima.

### Como capturar (receita da Validação)

1. Peça ao usuário para subir só o que precisa: **API + web** ou **API + CMS**. Os três juntos travam a
   máquina dele; ele mesmo alterna os servidores.
2. Use o MCP `chrome-devtools`, que fala com o Chrome do usuário, já logado. O painel do navegador do
   app serve para olhar e medir estilos, mas devolve imagens reduzidas.
3. Abra uma aba nova em segundo plano (`new_page` com `background: true`) e emule o tamanho em 2x:
   `emulate` com `viewport: "1440x900x2"` no CMS e `"1680x1050x2"` no web. A 1440 px a navbar do web
   quebra em duas linhas e cobre o conteúdo.
4. Web e CMS usam rotas com `#`: `http://localhost:4200/#/dashboard/...`. Sem o `#`, os assets voltam
   como HTML e a página fica em branco.
5. Navegue e clique por `evaluate_script` (seletores e texto), não por coordenadas. Na mesma chamada,
   devolva a caixa (`getBoundingClientRect`) de cada elemento que o cursor do vídeo vai clicar e guarde
   esses números junto da captura (em `real.tsx` ficam em `CMS_PTS`).
6. `take_screenshot` com `filePath` **dentro do repositório aberto**. Fora dos workspace roots do MCP dá
   "Access denied". Depois converta para JPEG de alta qualidade (`ffmpeg -q:v 2`) e mova para
   `public/<slug>/telas/`.
7. Feche as abas que abriu.

### O que nunca fazer na captura

- Não clique em ações que gravam dados: Salvar, Ligar validação, Dispensar, Pré-carregar, Tratar. O
  estado depois do clique vira um **remendo** desenhado por cima da captura no vídeo (em `real.tsx`, o
  componente `Ligada`).
- Fechar janelas pelo X às vezes deixa uma janela por trás (o tiling do web). Na dúvida, recarregue a
  página e refaça o caminho antes da próxima captura.

### Dados pessoais

Antes de cada `take_screenshot`, limpe a tela no DOM (só na página, nada é gravado):

- técnicos com nome e inicial ("Kaique R."), destinatários idem;
- propriedade sem o nome do produtor ("SITIO TAISMARA", não "SITIO TAISMARA - FULANO DE TAL");
- campos de produtor com iniciais (também nos `input.value`);
- imagens de assinatura trocadas por um SVG sintético (`<img>.src = data:image/svg+xml...`).

Conteúdo carregado depois (drawer que renderiza ao rolar, por exemplo) escapa da limpeza: rode a função
de novo depois de cada rolagem e confira um recorte ampliado antes de usar. Se escapar, apague a faixa na
imagem com `ffmpeg` (`drawbox` branco e reposicione o que sobrar).

### Como montar no vídeo

- Cada tela é uma `<Img>` dentro do `Browser` (use `h` igual à altura da captura): `ShotSeq` do kit
  (`src/kit/shots.tsx`) troca as telas por tempo com um fade curto (7 a 10 quadros); troca de contexto é
  a íris a partir do clique (`iris`).
- Capturas de proporção diferente da janela entram por altura e centradas (`fitShot`).
- Quando uma parte da história não tem tela real (por exemplo, um estado que só existe depois de gravar),
  recrie só aquele componente com os estilos medidos na tela real (`getComputedStyle`: fonte, cor,
  raio, tamanho), não a página inteira.

## 5. Animações de apoio (Lottie)

As animações ilustram o que a interface não mostra: a sincronização chegando, a IA lendo, a assinatura
sendo comparada, o e-mail das 7h. Elas aparecem grandes na tela e por poucos segundos, então cada quadro
precisa parecer feito por um artista de motion.

### Padrão de movimento

- **Nada linear.** Entradas com curva exponencial, saídas com aceleração, e mola com overshoot nos
  pousos. Tangentes usadas na Validação:
  - saída (entrada de elementos): `{outTangent: {x: 0.16, y: 1}, inTangent: {x: 0.3, y: 1}}`;
  - vai e volta: `{outTangent: {x: 0.65, y: 0}, inTangent: {x: 0.35, y: 1}}`;
  - mola: `{outTangent: {x: 0.34, y: 1.6}, inTangent: {x: 0.64, y: 1}}`;
  - queda: `{outTangent: {x: 0.55, y: 0}, inTangent: {x: 1, y: 0.45}}`.
- **Antecipação antes da ação:** o botão afunda antes do toque, o envelope sobe um pouco antes de cair.
- **Amasso e estica:** o que pousa achata (`scale {x: 1.1, y: 0.86}`) e volta com uma mola curta.
- **Cascata:** elementos irmãos nunca entram juntos; 80 a 300 ms entre eles.
- **Movimento secundário:** o que já está parado reage ao que chega (os itens da fila cedem 4 px a cada
  pacote; a nuvem pulsa quando um pacote passa por ela).
- **Trajetória em arco**, nunca em linha reta, e o objeto gira acompanhando a tangente.
- **Ritmo humano** quando imita uma pessoa: a assinatura é escrita com pausas onde a caneta levantaria,
  e uma ponta de caneta segue o traço pelo comprimento acumulado do caminho.
- **Fecho com recompensa:** selo com mola e rotação, anel que se expande e some, faíscas radiais.
- **Laço sem emenda** nos ícones que ficam rodando: primeiro e último quadro iguais, curvas simétricas.

### Como produzir

1. Planeje no papel os tempos de cada elemento e escreva **um** `creator_exec` que monta a cena inteira
   (MCP `lottie-creator`, LottieFiles Creator). Confira com `renderFilmstrip` em tempos escolhidos (o
   pico, o pouso, o fim), não só em quadros espaçados por igual.
2. Paleta da marca (laranja PecTrace ou verde Agrotrace), traço com pontas redondas, sombras de contato
   feitas com elipses semitransparentes (efeitos de sombra e blur atrapalham o export).
3. **Sem texto dentro do Lottie.** Os rótulos vêm do vídeo (legendas em `Words`), na fonte certa.
4. Exporte (`creator.export('x.json', 'lottie')`), baixe com `creator_download_file` e guarde em
   `public/<slug>/lottie/`; mantenha a versão anterior numa subpasta (`v1/`) até a nova ser aprovada.
5. No vídeo, `LottieAt` (`src/kit/lottie.tsx`) toca a animação presa ao quadro a partir de um marco da
   música. Se o JSON tiver texto, rode `bun run lottie-limpar <arquivo>` antes.

### Armadilhas do Lottie

- Texto dentro de grupo não exporta ("nested node text"); texto solto exporta, mas o Creator embute os
  glifos (`chars`) e o lottie-web quebra no render com `Cannot read properties of undefined (reading
  'push')`. Se precisar de texto, apague `chars` do JSON e use uma fonte do sistema.
- Um filho movido para dentro de um grupo (`setParentInPlace`) passa a ter a posição **no espaço local do
  grupo**: as chaves de `Position` dele são relativas ao pivô do grupo.
- `animate(..., {ease})` aceita só `"linear" | "in" | "out" | "inOut"`, tangentes ou array; não aceita
  outros campos misturados (para morph de caminho use `{ease, slice: 'vec2'}` direto no `creator.animate`).
- A cor de traço anima com `setKeyFramesSrgbColor(paint, PropertyType.Solid, ...)`.
- Não chame `createComp` duas vezes no mesmo documento; para refazer do zero, use outro `documentId`.

## 6. Narração

- Voz `fqxJm1hoJoe9YcGuwtGY`, modelo `eleven_v4`, um flow por vídeo. Duas tomadas por fala;
  `TAKES="7:b"` troca a tomada sem renderizar a imagem de novo.
- **Siglas se escrevem como se falam.** A voz soletra maiúsculas: "RAT" vira "ráti", "RATs" vira
  "rátis", CMS vira "cê eme ésse". Antes de gerar, procure siglas no roteiro e decida a pronúncia com o
  usuário.
- **Grave a voz antes de fixar os marcos.** A voz quase sempre pede mais tempo que as legendas. Rode
  `PLAN_ONLY=1 bun run narrar <slug>`, veja quais falas "PASSOU" e "ATRASOU", e então:
  alongue a timeline inteira (na Validação, de 21 para 23 quadros por tempo) e abra tempos só onde o
  atraso é local. Isso evita renderizar duas vezes.
- Quando abrir tempos no meio da timeline, desloque **juntos** os marcos e as janelas das falas
  (`src/videos/<slug>/narracao.json`, em segundos do corte com `beatBase` quadros por tempo: ao alongar a
  timeline, mude só o `beat` em `timeline.json` e deixe `beatBase` como estava).
- Gerar muitas falas é trabalho mecânico: delegue a um subagente (Opus) com o texto exato, o flow e a
  pasta de destino, proibindo nova chamada para "tentar de novo" (cada chamada cobra).

## 7. Música e som

- **Edite na música:**
  - 100 BPM, de modo que 1 tempo = 18 quadros a 30 fps;
  - todos os marcos ficam em `timeline.json` como tempos (`marks`), lidos pelo vídeo
    (`b(beat)`) e pela trilha (`at(beat)`);
  - cliques, choques e entradas de texto caem em tempos fortes.
- **Curva de energia por atos,** não um loop:
  - intro: pad e pings, sem bateria;
  - passeio: groove leve em meio tempo;
  - replay: groove cheio com arpejo em semicolcheias;
  - conflito: silêncio;
  - virada: drop;
  - tensão: sem bumbo, pulso grave e dissonância de segunda menor;
  - noite: groove quente;
  - marca: resolução.
- **Tema e assinatura sonora:**
  - um motivo curto com significado: 4 notas de Rémaj7, uma por técnico;
  - ele volta transformado: no conflito, só a nota do Kaique, sem resposta; nos registros
    chegando, pings subindo;
  - no fim, sobe e resolve no Ré agudo junto do logo, com uma respiração antes.
- **O som nasce da imagem:** o tique do relógio aparece sozinho e vira o chimbal. Dados
  chegando são sonificados (um ping por registro atrasado).
- **Silêncio é a ferramenta mais forte:**
  - use uma vez, planejado: a música corta seco (pad sem cauda no compasso anterior);
  - nunca deixe um silêncio acidental. No arrasto da linha do tempo pusemos um pad abafado
    por baixo.
- **Som antes da imagem (J-cut):** o ping toca um instante antes do ponto acender; o alarme,
  antes do cartão.
- **Pouca sincronia:** sincronize só o que conta a história. Som em tudo vira *mickey
  mousing*. Os efeitos de interface (clique, pop) ficam baixos e curtos. Cada transição não
  precisa de subida, whoosh e impacto.
- **Mix:**
  - música e efeitos em barramentos separados (duas instâncias de `createSynth` +
    `render()`);
  - na música, filtro passa-baixa automatizado (fecha no salto de tempo e no arrasto, abre na
    volta);
  - sidechain do bumbo no pad;
  - camadas em faixas de frequência diferentes.
- **Entrega:**
  - normalizar em **-14 LUFS integrados, pico real ≤ -1,5 dBTP**, com o `loudnorm` do ffmpeg
    em duas passadas (já está no script);
  - conferir com `ffmpeg -af ebur128=peak=true`;
  - olhar forma de onda e espectrograma (`showwavespic`, `showspectrumpic`) para ver se a
    curva de energia bate com o roteiro.

## 8. Receita técnica (reaproveite)

| Peça | Onde |
|---|---|
| Timeline em tempos de música: `b()`, mola, entrada de camada, curvas, câmera por chaves, cursor, desfoque de movimento | `src/kit/timeline.tsx` (`createTimeline`) |
| Marca e beat para os componentes (`useB`, `useBrand`) | `VideoProvider` em `src/kit/timeline.tsx` |
| Fundos (`Mesh`, `Dark`, `Paper`, `Backdrop`), legenda cinética (`Words`), cartão de vidro (`Glass`), odômetro (`Odo`), HUD, pílula com linha-guia, janela do app (`Browser`), cursor, foco (`Spot`), ondas, faíscas, clarão, íris | `src/kit/fx.tsx` |
| Telas reais em sequência e encaixe de captura | `src/kit/shots.tsx` (`ShotSeq`, `fitShot`) |
| Lottie preso ao quadro | `src/kit/lottie.tsx` (`LottieAt`) |
| Fecho com partículas formando o logo da marca | `src/kit/LogoFinal.tsx` |
| Marcas (cores, céus, fontes, logo, rodapé) | `src/brands/*.tsx` |
| Grão, shaders, partículas, câmera 3D | `src/core/` |
| Sintetizador offline (pad, pluck FM, bateria, whoosh, riser, impacto, reverb) | `scripts/lib/synth.mjs` |
| Mix: barramentos, ganho e passa-baixa automatizados, loudnorm em duas passadas | `scripts/lib/mix.mjs` |
| Trilha de referência completa (tema, silêncio, J-cut, cliques) | `src/videos/exemplo-validacao/trilha.mjs` |
| Render em blocos paralelos + mux da trilha | `bun run render <slug>` (`scripts/render.sh`) |
| Narração: corte das bordas, encaixe nas janelas, ducking e mix | `bun run narrar <slug>` (`scripts/narrar.mjs`) |
| Folha de quadros por tempo da música | `bun run folha <slug> <tempos...>` (`scripts/folha.sh`) |
| Exemplo de telas recriadas em React (quando não dá para capturar), RAT/documento, remendo de estado | `src/videos/exemplo-validacao/web.tsx`, `rat.tsx`, `real.tsx` |

### Armadilhas conhecidas

- (Repositório `agrotrace-video`) HTML exportado do Pencil sai deformado sem o patch de `scripts/central-design.mjs` (content-box, flex sem
  `min-width: 0`, `height: 100%`). Compare sempre com o PNG do Pencil antes de animar.
- `perspective` faz o Chromium rasterizar em escala 1 e o texto borra no zoom. A janela da Central é desenhada em 2,5×
  com `zoom` e a transformação só reduz (`Browser` em `src/kit/fx.tsx` já faz isso).
- `text-shadow` em odômetro cria caixas (colunas com `overflow: hidden`); use `filter: drop-shadow` no pai.

- Transições GL do Remotion não capturam WebGL aninhado. Por isso o mapa é renderizado fora
  da tela, para um `<img>`. O plano-sequência evita o problema.
- Não use a variável `TMP` no `render.sh`: conflita com o Remotion.
- Hooks antes de qualquer `return` antecipado (React #310).
- Odômetro: quando o tempo anda mais de meio minuto por quadro, os dígitos trocam direto em vez
  de rolar (`speed`), senão aparecem dígitos cortados.
- Coordenadas: as caixas do app ficam em px do app (1920×1080, sem a barra do navegador).
  `fit(box, zoom, sx, sy)` põe a caixa onde você quer na tela; `toScreen(view, x, y)` faz o
  caminho inverso para o que fica em px de tela (pílulas, cursor).
- Arquivos `.pen` (design system) só se leem pelas ferramentas do Pencil MCP.

- Chaves de câmera (`CAM_*`), de cursor (`PTR*`) e de rolagem precisam estar em **tempo crescente**.
  Ao deslocar marcos, uma chave escrita como `M.x + 3` pode passar da seguinte e a câmera salta.
- O script de folha de quadros converte tempos em quadros com o `beat` da timeline: ao alongar a
  timeline, atualize-o, senão as folhas mostram os momentos errados.
- Webpack do Remotion: `npx remotion bundle` uma vez e `remotion still <bundle>` para cada quadro
  (muito mais rápido que um bundle por still); mande o stderr do bundle para `/dev/null`.
- Dados que mudam entre rodadas: a validação reprocessada trocou o atendimento de origem (#60090 virou
  #60096). Antes do render final, confira os números e ids da tela contra o banco ou a captura.

## 9. Checklist de um vídeo novo

1. Probe nos dados: quais são os conflitos reais e quem são os protagonistas?
   Escreva `tratamento.md` e faça a prova de 15 a 20 s (seção "Direção antes de efeito") antes do vídeo
   completo.
2. Leia os commits recentes da branch da feature: mudanças de última hora costumam ser o que o usuário
   quer ver (na Validação, a comparação lado a lado da cópia e cola).
3. Roteiro em tabela (tempo, história, função mostrada, legenda, som, narração), aprovado antes de
   construir. Siglas com a pronúncia escrita.
4. Capturas reais das telas (seção 4), com dados pessoais abreviados e pontos de clique medidos.
5. Narração gerada e medida com `PLAN_ONLY=1`; `timeline.json` com BPM e marcos em tempos, já no ritmo
   da voz.
6. Câmera, foco e cursor em `story.ts` ou na composição; legendas e pílulas por cima.
7. Animações de apoio no padrão da seção 5, conferidas por filmstrip nos momentos de pico.
8. Folhas de quadros parados por trecho e correções.
9. Trilha com a curva de energia, o tema, um silêncio e o J-cut. Conferir LUFS e forma de onda.
10. Render completo (`bun run render <slug>`), mix da narração (`bun run narrar <slug>`), folha de contato do mp4 e `ffprobe`
    (quadros, duração, áudio).
