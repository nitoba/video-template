// __TITULO__. Esqueleto gerado por `bun run novo` na linguagem aprovada (guia, "Direção antes de efeito"): papel da
// marca, interface em camadas 3D com câmera em órbita, transições com direção, a peça que sai da tela e grãos que
// desenham o logo. Troque cada bloco seguindo o tratamento aprovado (tratamento.md); textos e números abaixo são
// marcadores. Exemplo completo: src/videos/validacao-atendimentos.
import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {
	Card,
	CardHeader,
	Cursor,
	Dust,
	EASE,
	Grain,
	GrainCanvas,
	type GrainSpec,
	Headline,
	hexToRgbTuple,
	Icon,
	ICONES,
	KV,
	type Layer,
	Layers,
	Legendas,
	lerp,
	liftOf,
	Odo,
	OUT,
	Paper,
	Peca,
	planoToScreen,
	pop,
	ramp,
	sampleShapePoints,
	Spot,
	Stage,
	useMotion,
	VideoProvider,
	viewAt,
} from '../../kit';
import {ALVO, at, b, BRAND, FAIXAS, LEGENDAS, M, T, TELA, TITULO} from './story';

/** 1. Gancho: um número real que abre a pergunta do vídeo, e a pergunta. */
const Gancho: React.FC = () => {
	const f = useCurrentFrame();
	const m = useMotion();
	const head = pop(f, b(M.numero));
	const v = 3736 * ramp(f, b(M.numero), at(M.numero, 1.6), OUT);
	return (
		<Stage from={b(M.numero) - 10} to={b(M.titulo)} enter="fade" exit="up">
			<div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: Math.min(1, head), transform: `translateY(${(1 - head) * 30}px)`}}>
				<div style={{fontFamily: m.mono, fontSize: 22, letterSpacing: '0.24em', color: m.inkSoft}}>RÓTULO DO NÚMERO · FONTE</div>
				<Odo value={v} digits={4} size={180} />
			</div>
			<Headline text="Uma pergunta que a feature responde?" y={640} size={60} k={1} at={M.pergunta} />
		</Stage>
	);
};

/** 2. Título com a marca. */
const Titulo: React.FC = () => {
	const f = useCurrentFrame();
	const m = useMotion();
	const logo = pop(f, b(M.titulo));
	const Logo = BRAND.Logo;
	return (
		<Stage from={b(M.titulo)} to={b(M.app)} enter="down" exit="zoom">
			<div style={{position: 'absolute', left: 960 - 160, top: 300, opacity: Math.min(1, logo * 2), transform: `scale(${lerp(0.4, 1, logo)}) rotate(${(1 - logo) * -18}deg)`}}>
				<Logo width={320} color={m.ink} />
			</div>
			<Headline text={TITULO} y={430} size={104} k={1} at={M.titulo + 0.3} />
			<Headline text="Uma frase que diz o que muda para quem usa." y={590} size={40} k={1} at={M.titulo + 2} font={m.ui} weight={500} color={m.inkSoft} />
		</Stage>
	);
};

/** 3. A tela: a captura vira camadas, a câmera orbita, o contorno marca o alvo, o cursor clica e a peça sai. */
const NoApp: React.FC = () => {
	const f = useCurrentFrame();
	const m = useMotion();
	const A0 = b(M.app);
	const cx = ALVO.x + ALVO.w / 2;
	const cy = ALVO.y + ALVO.h / 2;
	const v = viewAt(f, [
		[A0, {fx: TELA.w / 2, fy: TELA.h / 2, s: 0.55}],
		[b(M.foco) - 10, {fx: TELA.w / 2, fy: TELA.h / 2, s: 0.58}],
		[b(M.foco) + 20, {fx: cx - 300, fy: cy + 260, s: 0.95}],
		[b(M.resultado), {fx: cx - 300, fy: cy + 260, s: 0.98}],
		[b(M.resultado) + 30, {fx: TELA.w / 2, fy: TELA.h / 2, s: 0.6}],
	]);
	const layers: Layer[] = FAIXAS.map(([x, y, w, h, z], i) => ({r: {x, y, w, h}, z, at: A0 + 4 + i * 4, from: {y: 200 + i * 20, z: -600, rx: 40, x: (i % 2 ? 1 : -1) * 60}}));
	const alvo = planoToScreen(v, cx, cy);
	return (
		<Stage from={A0} to={b(M.fecho)} src={TELA.src} v={v} w={TELA.w} h={TELA.h} enter="zoom" exit="fade" base={0} blur={liftOf(f, b(M.peca))} orbit={[16, -12, 6, 10]} layers={<Layers src={TELA.src} w={TELA.w} h={TELA.h} v={v} layers={layers} />}>
			<Spot v={v} r={ALVO} from={b(M.foco)} to={b(M.peca)} z={110} />
			<Cursor x={alvo.x} y={alvo.y} click={b(M.clique)} />
			<Peca v={v} r={ALVO} peca={b(M.peca)} width={680} height={300}>
				<CardHeader icon={<Icon d={ICONES.check} bg={BRAND.cores.ok} />} title="O resultado" chip="novo" tone="green" />
				<div style={{fontFamily: m.display, fontSize: 56, fontWeight: 700, color: m.ink, marginTop: 18, lineHeight: 1}}>O que o clique trouxe</div>
				<div style={{marginTop: 18, display: 'grid', gap: 2}}>
					<KV k="Dado real" v="da tela, com data" />
					<KV k="Outro dado" v="sem inventar número" />
				</div>
			</Peca>
		</Stage>
	);
};

/** 4. Fecho: os grãos saem da frase e desenham o logo. */
const LOGO_W = 560;
const Fecho: React.FC = () => {
	const f = useCurrentFrame();
	const m = useMotion();
	const F = b(M.fecho);
	const L = b(M.logo);
	const [vw, vh] = BRAND.logoParticulas.viewBox;
	const box = {x: 960 - LOGO_W / 2, y: 600, w: LOGO_W};
	const grains = useMemo(
		() =>
			sampleShapePoints(BRAND.logoParticulas.paths, [vw, vh], box, 760, 'logo').map((c, i) => ({a: {x: 700 + random(`fa${i}`) * 520, y: 360 + random(`fb${i}`) * 60}, c, t0: L - 30 + random(`ft${i}`) * 16, dur: 24 + random(`fd${i}`) * 8, size: 3 + random(`fz${i}`) * 2, lift: 40 + random(`fl${i}`) * 90, wob: random(`fw${i}`) * 20, depth: random(`fp${i}`) * 0.6, color: hexToRgbTuple(i % 3 ? m.ink : m.accent)}) satisfies GrainSpec),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[m.ink, m.accent],
	);
	if (f < F) return null;
	const up = ramp(f, L - 6, L + 16, EASE);
	const solid = ramp(f, L + 2, L + 16, EASE);
	const Logo = BRAND.Logo;
	return (
		<AbsoluteFill>
			<Headline text={TITULO} y={lerp(300, 230, up)} size={84} k={1} at={M.fecho + 0.2} />
			<Headline text="Frase de assinatura." y={lerp(420, 350, up)} size={42} k={1} at={M.fecho + 1.4} font={m.ui} weight={500} color={m.inkSoft} />
			<div style={{position: 'absolute', left: box.x, top: box.y, opacity: solid}}>
				<Logo width={LOGO_W} color={m.ink} />
			</div>
			<GrainCanvas grains={grains} ripples={false} settle={0.35} glow={false} tail={0.02} />
			<Card x={960 - 150} y={930} w={300} k={pop(f, L + 30)} style={{padding: '10px 18px', textAlign: 'center', fontFamily: m.ui, fontSize: 18, color: m.inkSoft}}>
				Dados ilustrativos
			</Card>
		</AbsoluteFill>
	);
};

export const Video: React.FC = () => (
	<VideoProvider timeline={T} brand={BRAND}>
		<AbsoluteFill style={{background: BRAND.cores.papel}}>
			<Paper color={BRAND.cores.papel} />
			<Dust />
			<Gancho />
			<Titulo />
			<NoApp />
			<Fecho />
			<Legendas itens={LEGENDAS} />
			<Grain amount={0.03} vignette={0} />
		</AbsoluteFill>
	</VideoProvider>
);
