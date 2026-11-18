# Prompt inicial: preparar um projeto de vídeo do zero

Cole numa sessão do Claude Code aberta numa **pasta vazia** (`mkdir meu-video && cd meu-video && claude`). Ele monta
um estúdio de vídeo: projeto Remotion, pacotes, pastas e as regras que dizem à IA **o que usar, quando usar e onde
procurar o que faltar**. Leva uns 5 minutos.

**Este prompt não pergunta nada sobre o vídeo.** Ele só prepara o estúdio, e os arquivos de `docs/` ficam como
modelos vazios. As perguntas (para quem é, referências, assunto) vêm depois, quando você abre uma sessão nova e manda
o briefing do primeiro vídeo, com os pedidos de [prompts-uteis.md](prompts-uteis.md).

**Antes de colar:**
- Pré-requisitos: Node.js 20+ (22+ se for usar HyperFrames), ffmpeg, git e Python 3.10+. No Mac, prefira
  `brew install ffmpeg-full`, que traz os filtros de legenda e texto. No Windows, use o WSL.
- A pasta precisa estar **vazia e fora de outro repositório git**: o criador do Remotion recusa os dois casos.
  Suas referências (prints, logo, paleta, links) entram **depois**, na pasta `referencias/` que o prompt cria.
- Ao final, **feche e abra uma sessão nova** do Claude Code na pasta: as skills do Remotion só carregam numa sessão
  nova.

---

```text
Quero preparar esta pasta como um estúdio de vídeo feito com IA, para criar vídeos do zero (produto, tutorial,
explicativo, dados animados, Reels, vinheta). Ainda não vamos fazer nenhum vídeo: só deixar o projeto pronto.

Regras desta preparação:
- Antes de instalar algo global, pesado (mais de 200 MB), com licença restritiva ou pago, me diga o quê, onde e
  quanto custa, e espere o sim.
- Prefira o que roda local e é grátis. Antes de instalar uma skill de terceiros, leia o SKILL.md e os scripts dela.
- Não invente comando: se um passo falhar, leia a ajuda ou a documentação oficial e me diga o que mudou.

1. Confira a máquina: node (20+), npx, ffmpeg e ffprobe (com os filtros drawtext e subtitles), git, python3.
   Diga o que falta e como instalar neste sistema. Se faltar node ou ffmpeg, pare aqui.

2. Crie o projeto Remotion sem perguntas interativas:
   npx create-video@latest --yes --blank --no-tailwind .
   Depois instale as skills oficiais do Remotion: npx remotion skills add
   Inicie um repositório git e faça um primeiro commit, para cada versão do vídeo ficar guardada.

3. Instale os pacotes com npx remotion add, que acerta a versão de cada um com a do Remotion:
   @remotion/google-fonts, @remotion/lottie, @remotion/three, @remotion/media-utils, @remotion/captions,
   @remotion/install-whisper-cpp, @remotion/skia, @remotion/gsap. Depois, com npm: lottie-web, three,
   @react-three/fiber, lucide-react, e com --save-exact: @shopify/react-native-skia@2.0.0 (a do template oficial; a 2.14 importa react-native e
   quebra o bundle) e gsap.
   O Skia precisa de mais dois passos, conforme remotion.dev/docs/skia:
   - em remotion.config.ts, Config.overrideWebpackConfig((c) => enableSkia(c)), importando enableSkia de
     @remotion/skia/enable;
   - em src/index.ts, chame await LoadSkia() (de @shopify/react-native-skia/lib/module/web: o src/web da documentação quebra o tsc) antes de importar o Root e
     chamar registerRoot.
   Confira que todos os pacotes @remotion/* e o remotion têm a mesma versão, sem ^ na frente. Prove o Skia com uma
   composição de teste de 2 s (um <SkiaCanvas> com um círculo com desfoque) e uma folha de quadros; depois apague
   essa composição.
   Proponha também duas skills de gosto visual (leia o SKILL.md de cada uma e espere meu sim):
   - LottieFiles/motion-design-skill: timing, easing, sequência e os 12 princípios da animação;
   - frontend-design, das skills oficiais da Anthropic (github.com/anthropics/skills): tipografia, cor e
     composição sem o visual genérico de IA.

4. Crie a estrutura:
   - referencias/   o que eu trouxer. Nunca copie: extraia princípios.
   - docs/briefing.md, docs/estilo.md, docs/tratamento.md, docs/timeline.md   modelos curtos para os passos 1 a 4.
   - public/imagens/, public/lottie/, public/voz/, public/musica/, public/sfx/
   - CREDITS.md   autor, licença e link de todo material de terceiros.
   - .env.example com GEMINI_API_KEY e ELEVENLABS_API_KEY vazias, e .env e out/ no .gitignore.

5. Escreva docs/ferramentas.md com a tabela abaixo (o que usar, quando e o custo):
   - Montar e animar: Remotion. Animação sempre por quadro (useCurrentFrame, interpolate, spring), nunca por
     transição CSS. Licença grátis até 3 pessoas; empresa maior precisa da Company License.
   - Fontes: @remotion/google-fonts. Ícones: lucide-react.
   - Partículas e 3D: canvas 2D para poucas partículas; @remotion/three para profundidade, câmera ou milhares de
     pontos. Partícula só com significado: de onde vem, para onde vai.
   - Sequências com muitos elementos (interface montando, listas, tipografia que entra letra por letra, várias
     peças encadeadas): @remotion/gsap, com useGsapTimeline(). A linha do tempo do GSAP fica pausada e o Remotion a
     leva até o quadro atual, então prévia e render batem. Vale o que o GSAP tem de melhor: to/from, rótulos,
     posição relativa ("-=0.2"), stagger e eases como power3.out e back.out. Regras do hook (ele dá erro se
     quebrar): nada de play, seek ou callbacks (onComplete etc.); o builder é síncrono; anime só elementos do DOM
     ou SVG (para números, use interpolate); nada de "random(...)" nem stagger aleatório; nenhum gsap.to() solto
     fora da timeline; plugins do GSAP ainda não funcionam. Para um ou dois elementos, interpolate e spring bastam.
   - Efeitos 2D de acabamento: @remotion/skia (<SkiaCanvas>, do React Native Skia). Use para o que CSS e SVG fazem
     mal: água, gotas e líquido (metaballs com desfoque e limiar), ondulação, distorção, shaders (SkSL), desfoque
     de fundo real, gradientes que se movem, máscaras e brilho. Tudo dirigido por useCurrentFrame, como o resto.
     Alguns efeitos pesam na CPU: se o render ficar lento, renderize com --gl=angle.
   - Animação vetorial de apoio (o que a tela não mostra): Lottie; o LottieFiles Creator MCP cria as animações.
   - Imagens que não existem (cenas, fundos, ilustrações): Gemini (Nano Banana). Sem GEMINI_API_KEY, escreva o
     prompt da imagem para eu gerar no gemini.google.com e salvar em public/imagens/. Peça sempre a imagem sem texto
     e com área livre para o título. Fotos de banco: Openverse (api.openverse.org, CC0/CC BY).
   - Telas de um site ou app real: captura do sistema de verdade (Chrome DevTools MCP), nunca redesenhe.
   - Narração: Kokoro, local e grátis (precisa do espeak-ng; voz pt-BR pf_dora, código de idioma "p").
     ElevenLabs só se eu aprovar o custo. Escreva siglas como se falam e meça a voz antes de fixar as cenas.
   - Trilha: música CC0/CC BY do Openverse (Jamendo) ou da Pixabay Music; sintetizada em código quando o som
     precisar cair exatamente nos cortes. Nada de música gerada em serviço pago sem combinar.
   - Efeitos sonoros: gravações reais do Openverse/Freesound (CC0 ou CC BY). Busque por palavra-chave, sem o
     filtro de categoria, que não funciona para efeitos. Sem chave, o Openverse aceita 20 buscas por minuto e 200
     por dia: peça poucos resultados. Sincronize só o que conta a história.
   - Legendas: @remotion/install-whisper-cpp para transcrever com o tempo de cada palavra e @remotion/captions
     para a legenda palavra por palavra, dentro da área segura da plataforma.
   - Acabamento: ffmpeg para juntar, cortar, converter para vertical, abaixar a música na fala e normalizar em
     -14 LUFS (loudnorm), com pico real abaixo de -1,5 dBTP.
   - Faltou algo: consulte https://github.com/zhuyansen/awesome-claude-video-skills (mais de 500 skills e kits
     de vídeo, com nota de segurança e um teste de 16 delas). O Claude Code sem skill fez uma promo de 15 s em
     4,4 min: uma skill só compensa quando traz um estilo, um fluxo pronto ou uma filmagem para editar. Proponha só
     skills marcadas SAFE e espere meu sim. Pontos de partida:
     · voz local e tempo por palavra: vincentsch/explainroo
     · uma ideia que atravessa o vídeo, sem cortes: feitangyuan/onetake
     · roteiro, voz, música e clipes com modelos abertos: digitalsamba/claude-code-video-toolkit
     · motion e tipografia cinética: vibe-motion/skills, iart-ai/motion-skills, iart-ai/kinetic-typography-skills
     · produto com música original e efeitos: op7418/guizang-product-video-skill
     · vídeo longo virando Shorts com legenda: AgriciDaniel/claude-shorts
     · cortes no ritmo da música: ZiadAbdelkarim/beat-synced-edit
     · desmontar um vídeo de referência em planos: liuliu-66-create/ll-video-decomposer
     · trilha só com gravações reais e licenciadas: skill real-sound do Leonxlnx/earshot
     · vídeo em HTML em vez de React: heygen-com/hyperframes (lento: 23 min para 15 s no teste)
     · ponto de partida de estilo, quando eu não tiver referências: a galeria de 21 looks da skill
       ItsssssJack/claude-video-2, ou a skill cth9191/animate, que extrai um estilo das minhas referências
     · fundamentos de timing, cor, tipografia e layout: iart-ai/motion-design-skills

6. Escreva docs/design.md com estas regras (é o que separa um vídeo bonito de um vídeo "feito por IA"):
   O QUE DEIXA FEIO, E É PROIBIDO SEM MOTIVO:
   - tudo centralizado; texto nos cantos; fundo em gradiente genérico (roxo, azul-neon); brilho e neon;
   - tudo aparecendo com fade; tudo animando ao mesmo tempo; elementos demais na tela;
   - fontes padrão (Inter, Roboto, Arial) sem escolha; cores com o mesmo peso; cards em grade; emoji como ícone.
   O QUE FAZER:
   - Uma direção visual por vídeo (editorial, papel, brutalista, técnico…), escrita em docs/estilo.md com números:
     paleta com papéis (fundo, tinta, um destaque em no máximo 10% da tela), duas fontes (uma de display com
     personalidade e uma de texto), escala de tipo (ex.: 160/96/56/36 px em 1080x1920), grade e margens (ex.: 96 px),
     espaçamento, raio, sombra e textura.
   - Um ponto focal por quadro. Hierarquia clara: o olho sabe para onde ir em meio segundo.
   - Composição com intenção: assimetria, espaço vazio, escala dramática (uma palavra enorme vale mais que
     cinco médias), camadas em profundidade.
   - Textura e luz dão acabamento: grão sutil, sombra com a cor da tinta (não preto puro), profundidade.
   - No máximo 6 a 8 palavras na tela ao mesmo tempo em vídeo vertical.
   AUTOCRÍTICA (antes de me mostrar qualquer quadro):
   - Dê uma nota de 1 a 10 a cada quadro contra este arquivo e contra as referências, lado a lado.
   - Corrija os três piores problemas e repita até todos passarem de 8. Me mostre a nota e o que corrigiu.

7. Escreva docs/movimento.md com estas regras:
   - Entradas com desaceleração forte (bezier 0.16, 1, 0.3, 1); saídas com metade da duração da entrada.
   - Texto palavra por palavra com uns 0,09 s entre palavras, e tempo de leitura depois de cada frase.
   - Uma cor de destaque. Transição só quando tem função na história; nada de whoosh em toda transição.
   - Nada de imagem parada com zoom e destaque: elementos entram com peso, a câmera se move, a tela vira palco.
   - Antecipação, peso e continuidade: o que entra desacelera e assenta; o que sai prepara a saída; partes
     de um mesmo elemento chegam em tempos levemente diferentes (sobreposição), nunca todas juntas.
   - Checklist de cada folha de quadros: nada colidindo ou cortado, área segura, legível no celular, tempo de
     leitura suficiente.

8. Escreva o CLAUDE.md curto (é lido em toda conversa), com:
   O MÉTODO, sempre nesta ordem; mostre cada etapa e espere meu ok:
   1 Briefing: para quem, para quê, onde passa, formato e duração, tom. Se faltar algo, pergunte.
   2 Material e estilo: o que é real e o que é gerado. Para vídeos de referência, extraia quadros com ffmpeg (um
     por corte, com o filtro de detecção de cena) e olhe os quadros: você não assiste vídeo. Anote duração dos
     planos, transições, câmera, tipografia, legenda, estrutura e som, e escreva docs/estilo.md com números (ver
     docs/design.md). O estilo vem da minha marca: nunca copie cor, fonte ou roteiro de outra.
     Prove o estilo em 2 a 3 QUADROS-CHAVE parados, no tamanho final, ao lado das referências, antes de animar
     qualquer coisa. Só siga com o look aprovado.
   3 Tratamento: lista de planos (tempo, o que aparece, texto exato, som) em docs/tratamento.md, com a forma de
     narrativa escolhida para esta história. Não repita sempre a mesma estrutura.
   4 Prova: primeiro um storyboard com um quadro-chave parado por batida (nomeadas em docs/timeline.md), que eu
     aprovo; depois anime 8 a 15 s do momento central no estilo final.
   5 Ciclos: eu aponto o segundo exato e o problema; você ajusta só aquilo e me mostra na prévia
     (npm run dev) ou numa folha de quadros. Nunca renderize o MP4 sem eu pedir.
   6 Entrega: render, legenda, versões 16:9 e 9:16, -14 LUFS, CREDITS.md atualizado.
   ONDE ESTÁ CADA COISA: ferramentas em docs/ferramentas.md; design em docs/design.md; movimento em
   docs/movimento.md. Leia os três antes de montar qualquer cena, e faça a autocrítica de docs/design.md antes de
   me mostrar quadros.
   CUIDADOS: estime e pergunte antes de qualquer geração paga e nunca repita uma para "tentar de novo"; cubra
   dados pessoais em capturas; aceite só CC0, domínio público e CC BY (nada de NC, ND ou SA).
   APRENDIDO: cada correção que eu fizer vira uma linha nova aqui.

9. Scripts no package.json: dev (Remotion Studio), still (um quadro), folha (vários quadros parados numa imagem,
   com ffmpeg), render, loudness (mede LUFS e pico com ffmpeg).

10. Teste: uma composição "teste" de 5 s em 1080x1920, com um título que entra palavra por palavra, umas
   partículas leves e um efeito curto do Openverse com crédito no CREDITS.md. Gere a folha de quadros, faça a
   autocrítica de docs/design.md e me mostre a nota. Não renderize o MP4.

Os arquivos de docs/ são só modelos vazios: não preencha nada sobre um vídeo agora.

No fim, me diga em poucas linhas: o que ficou instalado, o que ficou para instalar sob demanda (com o comando de
cada um) e que devo abrir uma sessão nova, colocar minhas referências em referencias/ e mandar o briefing do
primeiro vídeo.
```

---

## Instalar sob demanda (só quando o vídeo pedir)

| Precisa de | Ferramenta | Como |
|---|---|---|
| Voz local grátis em pt-BR | Kokoro | `pip install "kokoro>=0.9.4" soundfile` e o pacote do sistema `espeak-ng` (licença GPL) |
| Voz premium | ElevenLabs | `ELEVENLABS_API_KEY` no `.env`; cobra por caractere |
| Imagens geradas direto pela IA | Gemini API | `GEMINI_API_KEY` no `.env`; sem ela, gere à mão no gemini.google.com |
| Animação vetorial | LottieFiles Creator MCP | `claude mcp add --transport http lottie-creator https://creator.mcp.lottiefiles.com/mcp` |
| Capturar telas reais | Chrome DevTools MCP | `claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest` |
| Edição com ffmpeg guiada | ffmpeg-skill | `npx ffmpeg-skill` |
| Efeitos sintetizados e trilha só com som real | Earshot e real-sound | github.com/Leonxlnx/earshot (instala torch, cerca de 1 GB) |
| Vídeo em HTML em vez de React | HyperFrames | `npx skills add heygen-com/hyperframes` (Node 22+) |
| Gosto de motion | motion-design-skill (LottieFiles) | `npx skills add LottieFiles/motion-design-skill` |
| Gosto visual | frontend-design (Anthropic) | no Claude Code: `/plugin marketplace add anthropics/skills` e instale a frontend-design |
| Estilo pronto ou extraído de referências | claude-video-2 ou animate | github.com/ItsssssJack/claude-video-2 · `/plugin marketplace add cth9191/animate` |
| Começar já com Skia num projeto novo | template oficial | `npx create-video --skia` (em vez do `--blank` do passo 2) |
| Qualquer outra coisa | catálogo | github.com/zhuyansen/awesome-claude-video-skills (só SAFE) |

## O que mudou na auditoria de 18/11

| Problema na versão anterior | Correção |
|---|---|
| Pedia para pôr as referências antes, mas o `create-video` recusa pasta que não está vazia | Pasta vazia primeiro; `referencias/` é criada pelo prompt |
| `create-video` interativo travaria o agente | `--yes --blank --no-tailwind .` |
| Pacotes instalados com `npm` podiam sair em versão diferente do Remotion e quebrar | `npx remotion add`, que acerta a versão |
| Não avisava que as skills só carregam numa sessão nova | Aviso no topo e no fim do prompt |
| Legenda com Whisper em Python, fora do Remotion | `@remotion/install-whisper-cpp` e `@remotion/captions`, no próprio projeto |
| Kokoro sem dependência nem voz pt-BR | `espeak-ng`, voz `pf_dora`, código `p` |
| Gemini citado sem dizer como a IA chega até ele | Com `GEMINI_API_KEY`, gera; sem ela, escreve o prompt para você gerar |
| Sem git nem `.env`; chave podia ir parar no repositório | `git init`, `.env.example` e `.gitignore` |
| CLAUDE.md enorme, lido inteiro em toda conversa | CLAUDE.md curto com o método e ponteiros; ferramentas e movimento em `docs/` |
| Sem licença do Remotion nem limite do Openverse | Os dois em `docs/ferramentas.md` |
| Teste podia renderizar o MP4 | Só folha de quadros |
| O vídeo saía feio: o modelo cai no visual padrão (texto centralizado, gradiente, tudo com fade) | `docs/design.md` com proibições e regras com números; quadros-chave aprovados antes de animar; storyboard por batida; autocrítica até nota 8; skills de gosto visual e de motion; referências em vídeo lidas por quadros extraídos |

Fontes: [Remotion: create-video](https://www.remotion.dev/docs/cli/create-video),
[Remotion: skills](https://www.remotion.dev/docs/cli/skills),
[Remotion: install-whisper-cpp](https://www.remotion.dev/docs/install-whisper-cpp),
[Kokoro](https://github.com/hexgrad/kokoro), [kokoro no PyPI](https://pypi.org/project/kokoro/),
[awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills),
[claude-motion](https://github.com/whaleyxbt/claude-motion).
