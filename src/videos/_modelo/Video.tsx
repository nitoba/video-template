// __TITULO__. Esqueleto gerado por `bun run novo`: troque cada bloco seguindo o roteiro aprovado
// (roteiro.md) e o guia (docs/guia-de-producao.md). Cada bloco é uma função do tempo f.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, Browser, Cursor, Flash, Glass, Grain, LogoFinal, Odo, ramp, Ring, S, ShotSeq, VideoProvider, Words} from '../../kit';
import {ALVO, b, BRAND, CAM, M, SLUG, T, TELAS, TITULO} from './story';

/** 1. Gancho: um número real que abre a pergunta do vídeo. */
const Gancho: React.FC<{f: number}> = ({f}) => {
	if (f >= b(M.virada) + 8) return null;
	const v = 3736 * ramp(f, b(M.numero), b(M.numero + 3.2), (x) => 1 - (1 - x) ** 3);
	const out = ramp(f, b(M.virada) - 6, b(M.virada) + 6);
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<Ring x={960} y={540} at={b(M.gancho)} size={16} />
			<div style={{position: 'absolute', left: 150, top: 300, fontFamily: BRAND.fontes.mono, fontSize: 24, letterSpacing: '0.3em', color: BRAND.cores.acento, opacity: ramp(f, b(M.numero) - 6, b(M.numero) + 4)}}>RÓTULO DO NÚMERO · FONTE</div>
			<div style={{position: 'absolute', left: 146, top: 350}}>
				<Odo value={v} size={210} color="#fff" />
			</div>
		</AbsoluteFill>
	);
};

/** 2. Título com a marca. */
const Titulo: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.titulo) - 0.2 || f >= b(M.app)) return null;
	const out = ramp(f, b(M.app) - 0.6, b(M.app));
	const Logo = BRAND.Logo;
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<Words text={TITULO} at={M.titulo} out={M.app} y={500} size={104} hot={[TITULO.split(' ').slice(-1)[0]]} />
			<div style={{position: 'absolute', left: 860, bottom: 80, ...T.enter(f, M.titulo + 2.6)}}>
				<Logo width={200} color="rgba(255,255,255,0.8)" />
			</div>
		</AbsoluteFill>
	);
};

/** Tela ilustrativa enquanto não há captura real em TELAS. */
const TelaIlustrativa: React.FC = () => (
	<AbsoluteFill style={{background: '#f4f4f5', fontFamily: BRAND.fontes.ui}}>
		<div style={{height: 60, background: BRAND.cores.acentoEscuro}} />
		<div style={{position: 'absolute', left: 32, top: 92, fontSize: 26, fontWeight: 700, color: '#18181b'}}>Troque por uma captura real</div>
		<div style={{position: 'absolute', left: 32, top: 132, fontSize: 15, color: '#71717a'}}>public/{SLUG}/telas/01.jpg · veja docs/guia-de-producao.md, seção 4</div>
		<div style={{position: 'absolute', left: ALVO.x - 90, top: ALVO.y - 19, width: 180, height: 38, borderRadius: 8, background: BRAND.cores.acentoEscuro, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14}}>Ação principal</div>
		{[0, 1, 2, 3].map((i) => (
			<div key={i} style={{position: 'absolute', left: 32, right: 32, top: 200 + i * 120, height: 100, borderRadius: 12, background: '#fff', border: '1px solid #e4e4e7'}} />
		))}
	</AbsoluteFill>
);

/** 3. O software resolvendo: plano-sequência na tela, com câmera, cursor e legenda. */
const NoApp: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.app) - 1 || f >= b(M.final) + 6) return null;
	const cam = T.camAt(f, CAM);
	const op = ramp(f, b(M.app) - 1, b(M.app) + 6) * (1 - ramp(f, b(M.final) - 0.3, b(M.final) + 0.3));
	return (
		<AbsoluteFill style={{opacity: op}}>
			<Browser cam={cam} url={`app.exemplo.com.br/#/${SLUG}`} blur={T.motionBlur(f, CAM)}>
				{TELAS.length ? <ShotSeq keys={TELAS} w={1440} h={810} /> : <TelaIlustrativa />}
				<Ring x={ALVO.x} y={ALVO.y} at={b(M.clique)} size={20} />
				<Cursor x={ALVO.x} y={ALVO.y} click={b(M.clique)} from={[700, 600]} scale={1.12 / (S * cam.z)} />
			</Browser>
			<Glass at={M.app + 1.5} out={M.clique} l1="A virada da história" l2="numa frase curta." sub="Subtítulo com o detalhe técnico." />
			<Glass at={M.resultado} out={M.final} l1="O resultado" l2="que o clique trouxe." />
		</AbsoluteFill>
	);
};

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<VideoProvider timeline={T} brand={BRAND}>
			<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
				<Backdrop keys={[[0, 'black'], [1.5, 'dark'], [M.virada, 'principal'], [M.app, 'dark'], [M.final, 'dark']]} />
				<Gancho f={f} />
				<Words text="Uma frase que vira a história." at={M.virada + 0.3} out={M.titulo - 0.2} y={540} size={76} hot={['vira']} />
				<Titulo f={f} />
				<NoApp f={f} />
				<LogoFinal from={M.final} logo={M.logo} titulo={TITULO} destaque={[TITULO.split(' ').slice(-1)[0]]} frase="Frase de assinatura." nota="Dados ilustrativos" />
				<Flash at={M.titulo} amt={0.35} />
				<Grain />
				<Sequence from={0} durationInFrames={durationInFrames}>
					<Audio src={staticFile(`${SLUG}/trilha.wav`)} />
				</Sequence>
			</AbsoluteFill>
		</VideoProvider>
	);
};
