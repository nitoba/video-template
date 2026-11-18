// 3 erros ao criar vídeo com IA (vertical 1080×1920, sem narração). Tratamento: tratamento.md.
// Um quadro 9:16 em miniatura (o vídeo que o agente monta) atravessa as cenas: cada erro o estraga e cada correção
// o conserta. Só tipografia, formas e movimento; o texto cinético é a legenda. Prova: gancho + erro 1.
import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {dampedSettle, deriva, EASE, Grain, IN, lerp, MotionProvider, Odo, OUT, Paper, pop, pouso, ramp, Sombra, typed, VideoProvider} from '../../kit';
import {b, BRAND, C, M, T, TEMA} from './story';

const SAIRA = TEMA.display;
const MONO = TEMA.mono;

// ---------- Texto cinético: cada palavra sobe de dentro de uma máscara (4 quadros entre palavras) ----------
type FraseProps = {
	lines: string[];
	top: number;
	size: number;
	color: string;
	/** Quadro em que a primeira palavra entra (negativo = já está no quadro zero). */
	from: number;
	weight?: number;
	align?: 'center' | 'left';
	left?: number;
	/** Quadro em que o risco atravessa a frase (erro). */
	strike?: number;
	/** Quadro em que as palavras saem para cima. */
	out?: number;
	lh?: number;
	/** Depois de riscada, a frase encolhe para a escala `to` (a partir do topo) e cede lugar à correção. */
	shrink?: {at: number; to: number};
};
const Frase: React.FC<FraseProps> = ({lines, top, size, color, from, weight = 800, align = 'center', left = 0, strike, out, lh = 1.04, shrink}) => {
	const f = useCurrentFrame();
	let idx = 0;
	const dim = strike !== undefined ? ramp(f, strike + 12, strike + 26, EASE) : 0;
	const sc = shrink ? lerp(1, shrink.to, ramp(f, shrink.at, shrink.at + 12, EASE)) : 1;
	return (
		<div style={{position: 'absolute', top, left: align === 'center' ? 0 : left, right: align === 'center' ? 0 : undefined, textAlign: align, fontFamily: SAIRA, fontWeight: weight, fontSize: size, lineHeight: lh, color, letterSpacing: '-0.015em', opacity: 1 - dim * 0.55, transform: sc !== 1 ? `scale(${sc})` : undefined, transformOrigin: '50% 0'}}>
			{lines.map((line, li) => {
				const s = strike !== undefined ? ramp(f, strike + li * 5, strike + li * 5 + 11, OUT) : 0;
				return (
					<div key={li}>
						<span style={{position: 'relative', display: 'inline-block'}}>
							{line.split(' ').map((wd, wi) => {
								const i = idx++;
								const u = pop(f, from + i * 4, {damping: 15, stiffness: 150, mass: 0.7});
								const o = out !== undefined ? ramp(f, out + i * 2, out + i * 2 + 11, IN) : 0;
								return (
									<span key={wi} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.1em', marginBottom: '-0.1em', marginRight: wi < line.split(' ').length - 1 ? '0.24em' : 0}}>
										<span style={{display: 'inline-block', transform: `translateY(${(1 - u) * 110 - o * 115}%) rotate(${(1 - u) * 6}deg)`, opacity: Math.min(1, u * 2)}}>{wd}</span>
									</span>
								);
							})}
							{s > 0 && <span style={{position: 'absolute', left: -8, top: '52%', height: Math.max(6, size * 0.085), width: `calc(${s * 100}% + 16px)`, background: C.tinta, borderRadius: 4, transform: 'rotate(-1.5deg)', opacity: out !== undefined ? 1 - ramp(f, out, out + 8) : 1}} />}
						</span>
					</div>
				);
			})}
		</div>
	);
};

// ---------- Câmera: plana e frontal, com deriva contínua (a câmera nunca para) ----------
const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
	const f = useCurrentFrame();
	// Empurra devagar na capa, recua quando o quadro cresce, volta a empurrar no erro.
	const push = 1 + 0.035 * ramp(f, 0, b(M.sai), EASE) - 0.035 * ramp(f, b(M.sai), b(M.erro1) + 10, EASE) + 0.02 * ramp(f, b(M.erro1), b(M.erro2), (x) => x);
	const rx = deriva(f, 1) * 1.1;
	const ry = deriva(f, 2) * 1.4;
	return (
		<AbsoluteFill style={{perspective: 2200}}>
			<AbsoluteFill style={{transform: `translate(${deriva(f, 3) * 6}px, ${deriva(f, 4) * 5}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${push})`, transformStyle: 'preserve-3d'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ---------- O "3" da capa vira o contador ----------
const Contador: React.FC = () => {
	const f = useCurrentFrame();
	const k = pop(f, b(M.sai) + 6, {damping: 16, stiffness: 110, mass: 0.9});
	const size = lerp(620, 72, k);
	const left = lerp(64, 166, k);
	const top = lerp(150, 214, k);
	const cor = interpolateColors(Math.min(1, k), [0, 1], [C.laranja, C.tinta]);
	const nIn = pop(f, b(M.erro1) - 2, {damping: 14, stiffness: 150, mass: 0.7});
	const n = 1 + ramp(f, b(M.erro2), b(M.erro2) + 10, EASE);
	const float = (1 - Math.min(1, k)) * Math.sin(f / 22) * 6;
	return (
		<>
			<div style={{position: 'absolute', left, top: top + float, fontFamily: SAIRA, fontWeight: 900, fontSize: size, lineHeight: 1, color: cor, letterSpacing: '-0.04em'}}>3</div>
			{nIn > 0.01 && (
				<div style={{position: 'absolute', left: 90, top: 214, display: 'flex', alignItems: 'flex-start', opacity: Math.min(1, nIn * 2), transform: `translateY(${(1 - nIn) * 30}px)`}}>
					<Odo value={n} size={72} color={C.laranja} sep={false} style={{fontWeight: 900, lineHeight: 1}} />
					<span style={{fontFamily: SAIRA, fontWeight: 900, fontSize: 72, lineHeight: 1, color: C.tinta, marginLeft: 2}}>/</span>
				</div>
			)}
		</>
	);
};

// ---------- O quadro 9:16: o vídeo que o agente está montando ----------
const W = 394;
const H = 700;
type Peca = {
	id: string;
	w: number;
	h: number;
	style: React.CSSProperties;
	mess: {x: number; y: number; r: number};
	fin?: {x: number; y: number};
};
const SOFT = 'rgba(35,23,15,0.32)';
// Na bagunça, as peças caem empilhadas no canto. Com o briefing, viram três ícones: quem (pessoa), onde (celular),
// pra quê (alvo). O que não serve a nenhum dos três (barra, triângulo, quadrado) é chutado para fora.
const PECAS: Peca[] = [
	{id: 'anel', w: 130, h: 130, style: {borderRadius: '50%', border: `13px solid ${C.tinta}`}, mess: {x: 118, y: 535, r: 0}, fin: {x: 268, y: 540}},
	{id: 'celular', w: 92, h: 160, style: {borderRadius: 20, background: C.tinta}, mess: {x: 222, y: 522, r: 18}, fin: {x: 268, y: 362}},
	{id: 'barra', w: 170, h: 26, style: {borderRadius: 13, background: SOFT}, mess: {x: 150, y: 452, r: -12}},
	{id: 'cabeca', w: 70, h: 70, style: {borderRadius: '50%', background: C.laranja}, mess: {x: 318, y: 565, r: 0}, fin: {x: 268, y: 126}},
	{id: 'ombros', w: 132, h: 66, style: {borderRadius: '66px 66px 0 0', background: C.laranja}, mess: {x: 96, y: 425, r: 160}, fin: {x: 268, y: 206}},
	{id: 'triangulo', w: 110, h: 96, style: {clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', background: SOFT}, mess: {x: 300, y: 478, r: 25}},
	{id: 'tela', w: 70, h: 118, style: {borderRadius: 9, background: C.laranja}, mess: {x: 236, y: 396, r: -30}, fin: {x: 268, y: 358}},
	{id: 'ponto', w: 44, h: 44, style: {borderRadius: '50%', background: C.laranja}, mess: {x: 44, y: 578, r: 0}, fin: {x: 268, y: 540}},
	{id: 'quadrado', w: 56, h: 56, style: {borderRadius: 8, background: SOFT}, mess: {x: 168, y: 372, r: 38}},
];
const ROTULOS = [
	{t: 'quem', y: 166},
	{t: 'onde', y: 362},
	{t: 'pra quê', y: 540},
];

const PecaView: React.FC<{p: Peca; i: number}> = ({p, i}) => {
	const f = useCurrentFrame();
	// As peças só começam a cair depois do "enter" (M.cai).
	const land = b(M.cai) + 8 + i * 2;
	if (f < land - 13) return null;
	let x = p.mess.x;
	let y = p.mess.y;
	let r = p.mess.r;
	let sx = 1;
	let sy = 1;
	if (f < land) {
		// Queda com gravidade (acelera) e giro até o ângulo em que pousa.
		const u = ramp(f, land - 12, land);
		y = lerp(-140, p.mess.y, u * u);
		r = p.mess.r - 110 * (1 - u);
	} else {
		const t = f - land;
		y -= Math.abs(dampedSettle(t, 0.07, 0.28)) * 22;
		const q = pouso(f, land, 0.16);
		sx = q.sx;
		sy = q.sy;
	}
	// Briefing: cada peça útil vai ao seu lugar em arco, com mola; as que sobram são chutadas para fora.
	const a = b(M.arruma) + i * 2;
	if (p.fin) {
		const k = pop(f, a, {damping: 13, stiffness: 140, mass: 0.8});
		const kk = Math.min(1, k);
		x = lerp(x, p.fin.x, k);
		y = lerp(y, p.fin.y, k) - Math.sin(Math.PI * kk) * 70;
		r = lerp(r, 0, k);
		if (kk > 0.98) y += Math.sin(f / 18 + i) * 3;
	} else {
		const k = ramp(f, a, a + 16, IN);
		x += 560 * k;
		y -= 90 * Math.sin(Math.PI * k * 0.6);
		r += 150 * k;
	}
	return (
		<div style={{position: 'absolute', left: x - p.w / 2, top: y - p.h / 2, width: p.w, height: p.h, transform: `rotate(${r}deg)`}}>
			<div style={{width: '100%', height: '100%', boxSizing: 'border-box', transform: `scale(${sx}, ${sy})`, transformOrigin: '50% 100%', ...p.style}} />
		</div>
	);
};

const Rotulo: React.FC<{t: string; y: number; at: number}> = ({t, y, at}) => {
	const f = useCurrentFrame();
	const k = pop(f, at, {damping: 12, stiffness: 160, mass: 0.7});
	if (k <= 0.001) return null;
	const q = pouso(f, at + 9, 0.1);
	return (
		<>
			<div style={{position: 'absolute', left: 22, top: y - 26 - (1 - k) * 280, height: 52, display: 'flex', alignItems: 'center', opacity: Math.min(1, k * 3), transform: `scale(${q.sx}, ${q.sy})`, transformOrigin: '50% 100%'}}>
				<span style={{fontFamily: SAIRA, fontWeight: 700, fontSize: 32, lineHeight: 1, color: C.laranja, border: `3px solid ${C.laranja}`, borderRadius: 999, padding: '6px 16px 8px', background: '#FFF4EA', whiteSpace: 'nowrap'}}>{t}</span>
			</div>
		</>
	);
};

const Quadro: React.FC = () => {
	const f = useCurrentFrame();
	const k = pop(f, b(M.cresce), {damping: 15, stiffness: 120, mass: 0.9});
	const sai = ramp(f, b(M.erro2) - 2, b(M.erro2) + 16, EASE);
	const s = lerp(0.5, 1, k) * lerp(1, 0.86, sai);
	const cx = 540 - 400 * sai;
	const cy = lerp(1300, 1078, k);
	const rot = lerp(-4, 0, Math.min(1, k)) - 5 * sai + deriva(f, 7) * 0.6;
	// Prompt: cursor piscando na capa; o pedido sem briefing se digita, "enter", e a barra sai.
	const pedido = typed('faz um vídeo top', f, b(M.digita), b(M.digita) + 22);
	const digitando = f >= b(M.digita) && f < b(M.cai);
	const caret = digitando || Math.floor(f / 14) % 2 === 0;
	const enter = ramp(f, b(M.cai) - 4, b(M.cai) + 2) * (1 - ramp(f, b(M.cai) + 4, b(M.cai) + 12));
	const barraSai = ramp(f, b(M.risca), b(M.risca) + 12, IN);
	const enterSq = pouso(f, b(M.cai) - 3, 0.05);
	return (
		<div style={{position: 'absolute', left: cx - W / 2, top: cy - H / 2, width: W, height: H, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: '50% 50%'}}>
			<Sombra x={0} y={0} w={W} h={H} lift={0.35 + 0.25 * sai} rgb="35,23,15" />
			<div style={{position: 'absolute', inset: 0, borderRadius: 24, background: C.cartao, boxShadow: '0 0 0 1.5px rgba(35,23,15,0.1)', overflow: 'hidden'}}>
				{ROTULOS.map((r, i) => (
					<Rotulo key={r.t} t={r.t} y={r.y} at={b(M.etiquetas) + i * 6} />
				))}
				{PECAS.map((p, i) => (
					<PecaView key={p.id} p={p} i={i} />
				))}
				<div style={{position: 'absolute', left: 12, right: 12, bottom: 18, height: 70, borderRadius: 16, border: `2.5px solid ${interpolateColors(enter, [0, 1], ['rgba(35,23,15,0.22)', C.laranja])}`, background: C.papel, display: 'flex', alignItems: 'center', paddingLeft: 12, fontFamily: MONO, fontSize: 30, letterSpacing: '-0.03em', whiteSpace: 'nowrap', color: C.tinta, opacity: 1 - barraSai, transform: `translateY(${barraSai * 60}px) scale(${enterSq.sx}, ${enterSq.sy})`}}>
					<span style={{color: C.laranja, marginRight: 12}}>›</span>
					{pedido}
					<span style={{display: 'inline-block', width: 13, height: 30, marginLeft: 3, background: C.tinta, opacity: caret ? 1 : 0}} />
				</div>
			</div>
			{/* Cantos de enquadramento: é um quadro de vídeo, não um cartão. */}
			{[
				[-18, -18, 0],
				[W + 18, -18, 90],
				[W + 18, H + 18, 180],
				[-18, H + 18, 270],
			].map(([x, y, a], i) => (
				<div key={i} style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${a}deg)`}}>
					<div style={{position: 'absolute', left: 0, top: 0, width: 44, height: 5, background: C.tinta, borderRadius: 3}} />
					<div style={{position: 'absolute', left: 0, top: 0, width: 5, height: 44, background: C.tinta, borderRadius: 3}} />
				</div>
			))}
		</div>
	);
};

// ---------- Cenas ----------
const Gancho: React.FC = () => {
	const f = useCurrentFrame();
	if (f > b(M.erro1) + 10) return null;
	const out = b(M.sai);
	return (
		<>
			<Frase lines={['erros']} align="left" left={478} top={512} size={172} color={C.tinta} from={-60} out={out} />
			<Frase lines={['ao criar vídeo', 'com IA']} align="left" left={74} top={772} size={112} lh={1.02} color={C.tinta} from={-60} out={out + 4} />
		</>
	);
};

const Erro1: React.FC = () => {
	const f = useCurrentFrame();
	if (f < b(M.erro1) - 2) return null;
	return (
		<>
			{/* O erro entra grande (assunto da cena) e, riscado, encolhe para dar lugar à correção. */}
			<Frase lines={['Pedir sem', 'briefing.']} top={320} size={132} lh={0.98} color={C.tinta} from={b(M.erro1) + 4} strike={b(M.risca)} shrink={{at: b(M.risca) + 2, to: 0.58}} out={b(M.erro2) - 4} />
			<Frase lines={['Diga quem, onde', 'e pra quê.']} top={500} size={88} color={C.laranja} from={b(M.corrige)} out={b(M.erro2) - 2} />
		</>
	);
};

export const Video: React.FC = () => (
	<VideoProvider timeline={T} brand={BRAND}>
		<MotionProvider theme={TEMA}>
			<AbsoluteFill style={{background: C.papel}}>
				<Paper color={C.papel} fiber={0.025} />
				<Camera>
					<Quadro />
					<Gancho />
					<Erro1 />
					<Contador />
				</Camera>
				<Grain amount={0.025} vignette={0} />
			</AbsoluteFill>
		</MotionProvider>
	</VideoProvider>
);
