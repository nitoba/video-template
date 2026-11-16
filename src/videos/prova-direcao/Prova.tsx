// Prova de direção PecTrace: "O mesmo texto. Em duas fazendas." Roteiro e direção em tratamento.md.
// Papel quente, tinta marrom, laranja da marca para ação, amarelo do marca-texto do app para "cópia".
// Partículas com significado: cada grão sai de uma linha copiada e acende a mesma linha no outro atendimento.
import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {IbsLogo} from '../../brands/agrotrace';
import {PEC_ICON_PATHS, PEC_TEXT_PATHS} from '../../brands/paths-pectrace';
import {PecLogo, pectrace} from '../../brands/pectrace';
import {Grain} from '../../core/Grain';
import {Paper} from '../../core/Paper';
import {GrainCanvas, type GrainSpec, hexToRgbTuple, sampleShapePoints} from '../../kit/grains';
import {Plano, type View, planoToScreen, viewMatching} from '../../kit/plano';
import {createTimeline, EASE, lerp, OUT, ramp, VideoProvider} from '../../kit/timeline';
import timeline from './timeline.json';

const T = createTimeline(timeline);
const {b, M, sp} = T;
export const TOTAL = T.TOTAL;
const brand = pectrace;

const INK = '#2b1a10';
const INK_SOFT = '#806452';
const ORANGE = '#e5601f';
const MARKER = 'rgba(250,214,77,0.85)';
const PAPER = '#fff8f4';
const CARD = '#fffdfb';
const {display: DISPLAY, ui: UI, mono: MONO} = brand.fontes;

export const WORDS = timeline.texto.split(' ');
/** Tempo em que a palavra i aparece no original e na cópia (a trilha usa os mesmos tempos). */
export const wordBeat = (i: number) => M.escreve + (i * timeline.escrita) / (WORDS.length - 1);
export const copyBeat = (i: number) => M.copia + (i * timeline.copiaDur) / (WORDS.length - 1);

// ---------- Ato 1: o texto e a cópia, como duas fichas de RAT ----------
const Chip: React.FC<{children: React.ReactNode}> = ({children}) => (
	<span style={{fontFamily: MONO, fontSize: 20, fontWeight: 500, letterSpacing: '0.04em', color: '#8c4418', background: '#fde4d3', borderRadius: 999, padding: '5px 14px'}}>{children}</span>
);

const CARD_PAD = 40;
const Passage: React.FC<{num: string; label: string; at: (i: number) => number; x: number; y: number; style?: React.CSSProperties; frame?: number}> = ({num, label, at, x, y, style, frame = 1}) => {
	const f = useCurrentFrame();
	const sweep = ramp(f, b(M.marca), b(M.marca) + 22, EASE) * WORDS.length;
	const head = ramp(f, b(at(0)) - 12, b(at(0)) + 6, OUT);
	return (
		<div style={{position: 'absolute', left: x - CARD_PAD, top: y - CARD_PAD, width: 1240, padding: CARD_PAD, borderRadius: 20, background: `rgba(255,253,251,${frame})`, boxShadow: `0 18px 50px rgba(102,50,17,${0.08 * frame}), 0 0 0 1px rgba(102,50,17,${0.07 * frame})`, ...style}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, height: 36, marginBottom: 20, opacity: head, transform: `translateY(${(1 - head) * 10}px)`}}>
				<Chip>{num}</Chip>
				<span style={{fontFamily: UI, fontSize: 21, fontWeight: 500, color: INK_SOFT}}>{label}</span>
			</div>
			<div style={{fontFamily: UI, fontSize: 46, lineHeight: 1.42, color: INK, letterSpacing: '-0.01em'}}>
				{WORDS.map((w, i) => {
					const u = Math.min(1, sp(f, at(i), {damping: 18, stiffness: 170, mass: 0.6}));
					const hl = Math.max(0, Math.min(1, sweep - i));
					return (
						<span key={i} style={{display: 'inline-block', paddingRight: i < WORDS.length - 1 ? '0.27em' : 0, opacity: u, transform: `translateY(${(1 - u) * 14}px)`, filter: u < 0.98 ? `blur(${(1 - u) * 6}px)` : undefined, backgroundImage: `linear-gradient(${MARKER}, ${MARKER})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 62%', backgroundSize: `${hl * 100}% 72%`}}>
							{w}
						</span>
					);
				})}
			</div>
		</div>
	);
};

// Conteúdo da ficha A depois de assentar: texto em x 380, primeira linha centrada em y 351 (casa com a captura).
const A_X = 380;
const A_Y = 262; // topo do conteúdo
const A_LINE = 351; // centro da primeira linha
const PUSH = 1.04;
const ActOne: React.FC = () => {
	const f = useCurrentFrame();
	const R = b(M.revela);
	if (f > R + 16) return null;
	const out = ramp(f, R - 2, R + 8, EASE);
	const settle = ramp(f, b(M.copia) - 6, b(M.copia) + 14, OUT);
	const title = Math.min(1, sp(f, M.titulo, {damping: 16, stiffness: 140, mass: 0.8}));
	const fast = Math.max(0, 1 - out * 2.2);
	// Avanço lento de câmera durante todo o ato, ancorado no início da primeira linha (o ponto que casa com a captura).
	const push = lerp(1, PUSH, ramp(f, 0, R, (x) => x));
	return (
		<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${A_X}px ${A_LINE}px`}}>
			<div style={{position: 'absolute', left: A_X - CARD_PAD, top: 108, fontFamily: DISPLAY, fontWeight: 600, fontSize: 72, letterSpacing: '-0.01em', color: INK, opacity: title * fast, transform: `translateY(${(1 - title) * 24 - out * 30}px)`}}>
				O mesmo texto. <span style={{color: ORANGE}}>Em duas fazendas.</span>
			</div>
			{/* Cópia: entra por baixo, deslocada como uma folha empilhada, e sai para a direita, onde está o outro atendimento. */}
			{f >= b(M.copia) - 10 && <Passage num="#60096" label="Outra propriedade · situação encontrada" at={copyBeat} x={A_X + 44} y={lerp(700, 640, settle)} style={{opacity: fast * ramp(f, b(M.copia) - 10, b(M.copia) + 4), transform: `translateX(${out * 260}px) rotate(${0.5 - out * 0.5}deg)`}} />}
			{/* Original: a ficha some na transição e o texto entrega o lugar ao trecho real da comparação. */}
			<Passage num="#60290" label="Situação encontrada" at={wordBeat} x={A_X} y={lerp(A_Y + 190, A_Y, settle)} frame={1 - out} style={{opacity: 1 - out, transform: `scale(${1 + out * 0.03})`, filter: out > 0.01 ? `blur(${out * 8}px)` : undefined}} />
		</AbsoluteFill>
	);
};

// Linhas destacadas na comparação (px da captura de 3360): esquerda = em análise, direita = origem do texto.
const ROWS_L = [
	{y: 1161, x0: 206, x1: 1446},
	{y: 1208, x0: 206, x1: 1494},
	{y: 1255, x0: 206, x1: 463},
	{y: 1351, x0: 206, x1: 1536},
	{y: 1398, x0: 206, x1: 803},
	{y: 1494, x0: 206, x1: 952},
];
const ROWS_R = [
	{y: 1120, x0: 1814, x1: 3047},
	{y: 1168, x0: 1814, x1: 3102},
	{y: 1216, x0: 1814, x1: 2071},
	{y: 1311, x0: 1814, x1: 3139},
	{y: 1358, x0: 1814, x1: 2412},
	{y: 1454, x0: 1814, x1: 2560},
];

const Caption: React.FC<{text: string; at: number; out: number}> = ({text, at, out}) => {
	const f = useCurrentFrame();
	const u = Math.min(1, sp(f, at, {damping: 18, stiffness: 140, mass: 0.8})) * (1 - ramp(f, b(out) - 8, b(out) + 4));
	return (
		<>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 280, background: `linear-gradient(rgba(255,248,244,0), ${PAPER} 64%)`, opacity: u}} />
			<div style={{position: 'absolute', left: 120, bottom: 74, display: 'flex', alignItems: 'center', gap: 22, opacity: u, transform: `translateY(${(1 - u) * 20}px)`}}>
				<span style={{width: 12, height: 12, borderRadius: 6, background: ORANGE, boxShadow: '0 0 0 6px rgba(229,96,31,0.15)'}} />
				<span style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 52, color: INK}}>{text}</span>
			</div>
		</>
	);
};

const ActTwo: React.FC = () => {
	const f = useCurrentFrame();
	const R = b(M.revela);
	const P = b(M.prova);
	const grains = useMemo(() => {
		const out: (GrainSpec & {row: number})[] = [];
		ROWS_L.forEach((L, r) => {
			const n = Math.max(4, Math.round((L.x1 - L.x0) / 55));
			for (let k = 0; k < n; k++) {
				const q = (k + 0.5 + (random(`q${r}-${k}`) - 0.5) * 0.6) / n;
				const Rr = ROWS_R[r];
				// Grãos partem linha a linha, de cima para baixo, em ondas.
				const start = M.liga + r * 0.45 + q * 0.5 + random(`s${r}-${k}`) * 0.15;
				out.push({row: r, a: {x: L.x0 + q * (L.x1 - L.x0), y: L.y}, c: {x: Rr.x0 + q * (Rr.x1 - Rr.x0), y: Rr.y}, t0: b(start), dur: 34 + random(`d${r}-${k}`) * 6, size: 6 + random(`z${r}-${k}`) * 3, lift: 70 + r * 14 + random(`l${r}-${k}`) * 30, wob: r * 1.3 + random(`w${r}-${k}`) * 0.8, depth: 0.15 + random(`p${r}-${k}`) * 0.5});
			}
		});
		return out;
	}, []);
	if (f < R - 2 || f >= P) return null;
	const u = ramp(f, R, b(M.assenta), EASE);
	const drift = lerp(1, 1.02, ramp(f, b(M.assenta), P, (x) => x));
	// Começa casando a primeira linha destacada com a frase do ato 1 (já ampliada pelo avanço do ato 1) e recua
	// até os dois blocos destacados ficarem legíveis lado a lado.
	const s0 = 1.4 * PUSH;
	const start = viewMatching(206, 1161, A_X, A_LINE, s0);
	const v: View = {fx: lerp(start.fx, 1675, u), fy: lerp(start.fy, 1320, u), s: lerp(s0, 0.6, u ** 0.85) * drift};
	const fade = ramp(f, R + 4, R + 18, OUT);
	// Cada linha da origem acende quando os grãos chegam nela.
	const lit = ROWS_R.map((_, r) => {
		const arrivals = grains.filter((g) => g.row === r).map((g) => g.t0 + g.dur);
		const first = Math.min(...arrivals);
		return ramp(f, first - 4, first + 14, OUT);
	});
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', inset: 0, filter: fade < 0.99 ? `blur(${(1 - fade) * 10}px)` : undefined}}>
				<Plano src="prova-direcao/comparacao.jpg" v={v} opacity={fade} />
			</div>
			{ROWS_R.map((row, r) => {
				const tl = planoToScreen(v, row.x0 - 8, row.y - 22);
				const br = planoToScreen(v, row.x1 + 8, row.y + 22);
				return <div key={r} style={{position: 'absolute', left: tl.x, top: tl.y, width: br.x - tl.x, height: br.y - tl.y, borderRadius: 4, background: 'rgba(229,96,31,0.16)', boxShadow: `0 0 ${18 * lit[r]}px rgba(229,96,31,0.35)`, opacity: lit[r] * (1 - ramp(f, P - 20, P))}} />;
			})}
			{[
				{num: '#60290', label: 'em análise', x: 206, y: 1548, at: M.assenta - 0.3},
				{num: '#60096', label: 'origem do texto', x: 1814, y: 1508, at: M.assenta},
			].map((c) => {
				const p = planoToScreen(v, c.x, c.y);
				const k = Math.min(1, sp(f, c.at, {damping: 16, stiffness: 150, mass: 0.7})) * (1 - ramp(f, P - 16, P));
				return (
					<div key={c.num} style={{position: 'absolute', left: p.x, top: p.y, display: 'flex', alignItems: 'center', gap: 12, opacity: k, transform: `translateY(${(1 - k) * 14}px)`, padding: '8px 16px 8px 10px', borderRadius: 999, background: CARD, boxShadow: '0 8px 24px rgba(102,50,17,0.12), 0 0 0 1px rgba(102,50,17,0.08)'}}>
						<Chip>{c.num}</Chip>
						<span style={{fontFamily: UI, fontSize: 21, fontWeight: 500, color: INK_SOFT}}>{c.label}</span>
					</div>
				);
			})}
			<GrainCanvas grains={grains} map={(p) => planoToScreen(v, p.x, p.y)} />
			<Caption text="A IA lê cada atendimento e mostra o que se repete." at={M.legenda} out={M.prova} />
		</AbsoluteFill>
	);
};

// ---------- Ato 3: a prova no dossiê ----------
const FOCO = {x: 2400, y: 580, w: 840, h: 84};
const CopyIcon: React.FC = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round">
		<rect x="8" y="8" width="12" height="13" rx="2" />
		<path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" />
	</svg>
);
const ActThree: React.FC = () => {
	const f = useCurrentFrame();
	const P = b(M.prova);
	const F = b(M.fecho);
	if (f < P || f > F + 20) return null;
	const u = ramp(f, P, F, (x) => x);
	const v: View = {fx: 2650, fy: 650, s: lerp(1.0, 1.07, u)};
	const out = ramp(f, F, F + 18, EASE);
	const ring = Math.min(1, sp(f, M.foco, {damping: 14, stiffness: 170, mass: 0.7}));
	const lift = sp(f, M.peca, {damping: 15, stiffness: 120, mass: 0.9});
	const bar = ramp(f, b(M.peca) + 6, b(M.peca) + 26, OUT);
	const tl = planoToScreen(v, FOCO.x, FOCO.y);
	const br = planoToScreen(v, FOCO.x + FOCO.w, FOCO.y + FOCO.h);
	const dim = ramp(f, b(M.foco), b(M.foco) + 16, EASE);
		return (
		<AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.06})`}}>
			<div style={{position: 'absolute', inset: 0, filter: lift > 0.02 ? `blur(${Math.min(1, lift) * 5}px)` : undefined}}>
				<Plano src="prova-direcao/dossie.jpg" v={v} />
			</div>
			{/* O resto da tela recua um pouco para o foco ler sozinho. */}
			<div style={{position: 'absolute', inset: 0, background: 'rgba(255,248,244,0.42)', opacity: dim, WebkitMaskImage: `radial-gradient(ellipse ${br.x - tl.x + 260}px ${(br.y - tl.y) * 3 + 320}px at ${(tl.x + br.x) / 2}px ${tl.y - 40}px, transparent 55%, black 100%)`}} />
			<div style={{position: 'absolute', left: tl.x - 12, top: tl.y - 10, width: br.x - tl.x + 24, height: br.y - tl.y + 20, borderRadius: 14, border: `3px solid ${ORANGE}`, boxShadow: '0 0 0 8px rgba(229,96,31,0.12)', opacity: ring * (1 - Math.min(1, lift) * 0.85), transform: `scale(${lerp(1.1, 1, ring)})`}} />
			<div style={{position: 'absolute', inset: 0, background: PAPER, opacity: Math.min(1, lift) * 0.5}} />
			<div
				style={{
					position: 'absolute',
					left: lerp(tl.x - 12, 960 - 320, Math.min(1.05, lift)),
					top: lerp(tl.y - 330, 540 - 170, Math.min(1.05, lift)),
					width: 640,
					padding: '26px 32px 30px',
					borderRadius: 24,
					background: CARD,
					boxShadow: `0 ${2 + lift * 6}px ${6 + lift * 12}px rgba(102,50,17,0.06), 0 ${10 + lift * 34}px ${30 + lift * 80}px rgba(102,50,17,${0.08 + lift * 0.14}), 0 0 0 1px rgba(102,50,17,0.07)`,
					opacity: Math.min(1, lift * 1.5),
					transform: `scale(${lerp(0.9, 1.12, lift)})`,
					transformOrigin: '50% 50%',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
					<span style={{width: 40, height: 40, borderRadius: 10, background: '#dc2626', display: 'grid', placeItems: 'center'}}>
						<CopyIcon />
					</span>
					<span style={{fontFamily: UI, fontSize: 24, fontWeight: 600, color: INK}}>Cópia e cola</span>
					<span style={{fontFamily: UI, fontSize: 18, fontWeight: 600, color: '#b91c1c', background: '#fde8e8', borderRadius: 8, padding: '4px 10px'}}>Alerta</span>
				</div>
				<div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 18}}>
					<span style={{fontFamily: DISPLAY, fontSize: 104, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums', lineHeight: 0.9, letterSpacing: '-0.02em'}}>{Math.round(100 * bar)}%</span>
					<span style={{fontFamily: UI, fontSize: 24, lineHeight: 1.3, color: INK_SOFT}}>
						semelhante ao
						<br />
						atendimento #60096
					</span>
				</div>
				<div style={{marginTop: 26, height: 12, borderRadius: 6, background: '#f4e7de', position: 'relative'}}>
					<div style={{position: 'absolute', inset: 0, width: `${bar * 100}%`, borderRadius: 6, background: `linear-gradient(90deg, ${ORANGE}, #dc2626)`}} />
					<div style={{position: 'absolute', left: '80%', top: -9, width: 3, height: 30, borderRadius: 2, background: INK}} />
				</div>
				<div style={{position: 'relative', height: 26, marginTop: 10}}>
					<span style={{position: 'absolute', left: '80%', transform: 'translateX(-50%)', fontFamily: UI, fontSize: 18, fontWeight: 500, color: INK, whiteSpace: 'nowrap'}}>limiar 80%</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------- Fecho: os grãos desenham o logo ----------
const LOGO = {x: 960 - 290, y: 600, w: 580};
const useLogoGrains = (): GrainSpec[] =>
	useMemo(() => {
		const sample = (paths: string[], color: GrainSpec['color'], n: number, seed: string) =>
			sampleShapePoints(paths, [413, 78], LOGO, n, `${seed}c`).map((c, i) => {
				// Partem da palavra "conferido." e caem no desenho do logo.
				const a = {x: 1125 + random(`${seed}ax${i}`) * 270, y: 468 + random(`${seed}ay${i}`) * 52};
				return {a, c, t0: b(M.fecho + 1.3) + random(`${seed}t${i}`) * 16, dur: 24 + random(`${seed}d${i}`) * 8, size: 3 + random(`${seed}z${i}`) * 2, lift: 40 + random(`${seed}l${i}`) * 90, wob: random(`${seed}w${i}`) * 20, depth: random(`${seed}p${i}`) * 0.6, color} satisfies GrainSpec;
			});
		return [...sample(PEC_ICON_PATHS, hexToRgbTuple(ORANGE), 260, 'ic'), ...sample(PEC_TEXT_PATHS, hexToRgbTuple(INK), 620, 'tx')];
	}, []);

const Close: React.FC = () => {
	const f = useCurrentFrame();
	const F = b(M.fecho);
	const L = b(M.logo);
	const grains = useLogoGrains();
	if (f < F) return null;
	const words = ['Cada', 'atendimento,', 'conferido.'];
	const up = ramp(f, L - 6, L + 16, EASE);
	const solid = ramp(f, L + 2, L + 16, EASE);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, top: lerp(440, 330, up), textAlign: 'center', fontFamily: DISPLAY, fontWeight: 600, fontSize: 84, color: INK, letterSpacing: '-0.01em'}}>
				{words.map((w, i) => {
					const u = Math.min(1, sp(f, M.fecho + 0.4 + i * 0.35, {damping: 17, stiffness: 150, mass: 0.7}));
					return (
						<span key={w} style={{display: 'inline-block', marginRight: i < 2 ? '0.25em' : 0, color: i === 2 ? ORANGE : INK, opacity: u, transform: `translateY(${(1 - u) * 26}px)`, filter: u < 0.98 ? `blur(${(1 - u) * 8}px)` : undefined}}>
							{w}
						</span>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: LOGO.x, top: LOGO.y, opacity: solid}}>
				<PecLogo width={LOGO.w} color={INK} iconColor={ORANGE} />
			</div>
			<GrainCanvas grains={grains} map={(p) => p} ripples={false} settle={0.35} glow={false} tail={0.02} />
			<div style={{position: 'absolute', left: 960 - 40, bottom: 60, opacity: ramp(f, L + 24, L + 44)}}>
				<IbsLogo width={80} color={INK_SOFT} />
			</div>
		</AbsoluteFill>
	);
};

export const Prova: React.FC = () => (
	<VideoProvider timeline={T} brand={brand}>
		<AbsoluteFill style={{background: PAPER}}>
			<Paper color={PAPER} />
			<ActOne />
			<ActTwo />
			<ActThree />
			<Close />
			<Grain amount={0.03} vignette={0} />
		</AbsoluteFill>
	</VideoProvider>
);
