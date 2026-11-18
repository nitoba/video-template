// Reserva do projeto ao vivo da apresentação (docs/apresentacao/roteiro-demo.md): Reels vertical de 20 s,
// "3 erros ao criar vídeo com IA". Forma: contagem (gancho, três erros, fecho), legenda palavra por palavra.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card, Dust, EASE, Grain, MotionProvider, OUT, Paper, pop, ramp, SAIRA, shake, Stage, typed, useMotion, VideoProvider} from '../../kit';
import {b, BRAND, M, T} from './story';

const TEMA = {ink: '#23170F', inkSoft: '#6B5446', accent: '#D9561A', accentRgb: '217,86,26', paper: '#FBF6F1', card: '#FFFBF7', shadowRgb: '60,30,10', display: SAIRA, ui: SAIRA};
const W = 1080;

/** Palavras que sobem uma a uma, centradas, com quebra automática. */
const Palavras: React.FC<{text: string; at: number; y: number; size: number; color?: string; hot?: string[]; weight?: number}> = ({text, at, y, size, color, hot = [], weight = 700}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const m = useMotion();
	return (
		<div style={{position: 'absolute', left: 80, right: 80, top: y, textAlign: 'center', fontFamily: m.display, fontWeight: weight, fontSize: size, lineHeight: 1.05, letterSpacing: '-0.02em', color: color ?? m.ink}}>
			{text.split(' ').map((w, i) => {
				const u = pop(f, at + i * 4, {damping: 14, stiffness: 160, mass: 0.7}, fps);
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.06em', marginRight: '0.22em'}}>
						<span style={{display: 'inline-block', transform: `translateY(${(1 - u) * 110}%) rotate(${(1 - u) * 6}deg)`, opacity: Math.min(1, u * 2), color: hot.includes(w) ? m.accent : undefined}}>{w}</span>
					</span>
				);
			})}
		</div>
	);
};

/** Número do erro com o rótulo. */
const Numero: React.FC<{n: number; at: number}> = ({n, at}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const m = useMotion();
	const u = pop(f, at, {damping: 11, stiffness: 150, mass: 0.8}, fps);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 18, opacity: Math.min(1, u * 2)}}>
			<span style={{fontFamily: m.display, fontWeight: 800, fontSize: 260, lineHeight: 1, color: m.accent, transform: `scale(${0.6 + u * 0.4}) rotate(${(1 - u) * -12}deg)`, display: 'inline-block'}}>{n}</span>
			<span style={{fontFamily: 'JetBrains Mono, monospace', fontSize: 30, letterSpacing: 4, color: m.inkSoft}}>ERRO</span>
		</div>
	);
};

const Gancho: React.FC = () => {
	const f = useCurrentFrame();
	const k = ramp(f, b(M.inicio) + 40, b(M.inicio) + 56, OUT);
	return (
		<Stage from={b(M.inicio)} to={b(M.erro1)} enter="zoom" exit="up">
			<Palavras text="Seu vídeo com IA parece amador?" at={b(M.inicio)} y={620} size={128} hot={['amador?']} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 1080, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 40}px)`}}>
				<span style={{fontFamily: SAIRA, fontWeight: 600, fontSize: 64, color: TEMA.inkSoft}}>3 erros que quase todo mundo comete.</span>
			</div>
		</Stage>
	);
};

/** Erro 1: o pedido vago é riscado e vira um briefing. */
const Erro1: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const m = useMotion();
	const a = b(M.erro1);
	const vago = typed('“faz um vídeo aí”', f, a + 14, a + 40);
	const risco = ramp(f, a + 50, a + 62, EASE);
	const {x: sx, y: sy} = shake(f, a + 60, 8);
	const kb = pop(f, a + 72, {damping: 14, stiffness: 130, mass: 0.9}, fps);
	const itens = ['para quem', 'onde vai passar', 'quanto tempo', 'qual o tom'];
	return (
		<Stage from={a} to={b(M.erro2)} enter="down" exit="left">
			<Numero n={1} at={a} />
			<Palavras text="Pedir sem briefing" at={a + 6} y={540} size={96} />
			<div style={{position: 'absolute', left: 140, top: 760, width: 800, padding: '30px 36px', borderRadius: 22, background: m.card, boxShadow: '0 18px 50px rgba(60,30,10,0.12)', transform: `translate(${sx}px, ${sy}px) scale(${1 - kb * 0.12}) translateY(${-kb * 60}px)`, opacity: 1 - kb * 0.35}}>
				<div style={{fontFamily: 'JetBrains Mono, monospace', fontSize: 52, color: m.inkSoft, position: 'relative', display: 'inline-block'}}>
					{vago}
					<div style={{position: 'absolute', left: 0, top: '52%', height: 6, borderRadius: 3, background: '#B91C1C', width: `${risco * 100}%`}} />
				</div>
			</div>
			<Card x={140} y={980} w={800} k={kb}>
				<div style={{fontFamily: 'JetBrains Mono, monospace', fontSize: 26, letterSpacing: 3, color: m.accent, fontWeight: 700}}>BRIEFING</div>
				{itens.map((t, i) => {
					const u = ramp(f, a + 84 + i * 7, a + 96 + i * 7, OUT);
					return (
						<div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 18, opacity: u, transform: `translateX(${(1 - u) * 30}px)`}}>
							<span style={{width: 36, height: 36, borderRadius: 18, background: m.accent, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800}}>✓</span>
							<span style={{fontFamily: SAIRA, fontSize: 48, fontWeight: 600, color: m.ink}}>{t}</span>
						</div>
					);
				})}
			</Card>
		</Stage>
	);
};

/** Erro 2: sete versões em leque; a sétima se ergue. */
const Erro2: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const m = useMotion();
	const a = b(M.erro2);
	const ergue = pop(f, a + 96, {damping: 13, stiffness: 120, mass: 0.9}, fps);
	return (
		<Stage from={a} to={b(M.erro3)} enter="right" exit="left">
			<Numero n={2} at={a} />
			<Palavras text="Aceitar a primeira versão" at={a + 6} y={540} size={96} />
			{Array.from({length: 7}, (_, i) => {
				const u = pop(f, a + 30 + i * 7, {damping: 14, stiffness: 150, mass: 0.7}, fps);
				const last = i === 6;
				const rot = (i - 3) * 7;
				const x = 540 + (i - 3) * 95 - 150;
				const lift = last ? ergue : 0;
				return (
					<div key={i} style={{position: 'absolute', left: x, top: 960 - lift * 120, width: 300, height: 420, borderRadius: 22, background: last ? m.card : '#F3E9E0', border: `3px solid ${last && ergue > 0.1 ? m.accent : 'rgba(60,30,10,0.12)'}`, boxShadow: `0 ${10 + lift * 30}px ${30 + lift * 40}px rgba(60,30,10,${0.08 + lift * 0.12})`, opacity: Math.min(1, u * 2) * (last ? 1 : 1 - ergue * 0.45), transform: `rotate(${rot * (1 - lift)}deg) scale(${(0.7 + u * 0.3) * (1 + lift * 0.18)})`, transformOrigin: '50% 100%', zIndex: last ? 10 : i, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28}}>
						<span style={{fontFamily: 'JetBrains Mono, monospace', fontSize: 34, fontWeight: 700, color: last ? m.accent : m.inkSoft}}>v{i + 1}</span>
						{last && <span style={{fontFamily: SAIRA, fontSize: 40, fontWeight: 700, color: m.accent, opacity: ergue}}>✓ aprovada</span>}
					</div>
				);
			})}
		</Stage>
	);
};

/** Erro 3: o card neon copiado é coberto pela cara da marca. */
const Erro3: React.FC = () => {
	const f = useCurrentFrame();
	const m = useMotion();
	const a = b(M.erro3);
	const wipe = ramp(f, a + 62, a + 82, EASE);
	const kc = ramp(f, a + 20, a + 34, OUT);
	return (
		<Stage from={a} to={b(M.fecho)} enter="up" exit="zoom">
			<Numero n={3} at={a} />
			<Palavras text="Copiar o estilo dos outros" at={a + 6} y={540} size={96} />
			<div style={{position: 'absolute', left: 140, top: 820, width: 800, height: 600, borderRadius: 28, overflow: 'hidden', opacity: kc, transform: `translateY(${(1 - kc) * 60}px)`, boxShadow: '0 24px 60px rgba(60,30,10,0.18)'}}>
				<div style={{position: 'absolute', inset: 0, background: '#0B0B16', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<span style={{fontFamily: SAIRA, fontSize: 92, fontWeight: 800, color: '#7CFFB2', textShadow: '0 0 24px #7CFFB2, 0 0 60px #2EE6A8'}}>FUTURISTA</span>
				</div>
				<div style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: `${wipe * 100}%`, background: m.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, borderLeft: `8px solid ${m.accent}`}}>
					<span style={{fontFamily: SAIRA, fontSize: 84, fontWeight: 800, color: m.accent, opacity: ramp(f, a + 78, a + 90), whiteSpace: 'nowrap'}}>a sua marca</span>
					<span style={{fontFamily: SAIRA, fontSize: 40, color: m.inkSoft, opacity: ramp(f, a + 84, a + 96), whiteSpace: 'nowrap'}}>cores, fonte e tom de vocês</span>
				</div>
			</div>
		</Stage>
	);
};

const Fecho: React.FC = () => (
	<Stage from={b(M.fecho)} to={b(M.fim) + 30} enter="zoom" exit="fade">
		<Palavras text="A IA produz." at={b(M.fecho)} y={700} size={140} />
		<Palavras text="Você dirige." at={b(M.fecho) + 14} y={880} size={140} hot={['dirige.']} />
	</Stage>
);

/** Legenda palavra por palavra, embaixo, com a palavra atual em destaque. */
const FALAS: [number, string][] = [
	[0.4, 'Seu vídeo com IA parece amador?'],
	[4.7, 'Erro um: pedir sem dizer para quem é.'],
	[13, 'Erro dois: aceitar a primeira versão.'],
	[21.2, 'Erro três: copiar o estilo dos outros.'],
	[27.2, 'A IA produz. Você dirige.'],
];
const Legenda: React.FC = () => {
	const f = useCurrentFrame();
	const m = useMotion();
	const idx = FALAS.findIndex(([t], i) => f >= b(t) && (i === FALAS.length - 1 || f < b(FALAS[i + 1][0])));
	if (idx < 0) return null;
	const [t, txt] = FALAS[idx];
	const words = txt.split(' ');
	const per = 7;
	const cur = Math.floor((f - b(t)) / per);
	return (
		<div style={{position: 'absolute', left: 90, right: 90, bottom: 210, display: 'flex', justifyContent: 'center'}}>
			<div style={{padding: '18px 30px', borderRadius: 18, background: 'rgba(35,23,15,0.9)', textAlign: 'center', fontFamily: SAIRA, fontWeight: 700, fontSize: 50, lineHeight: 1.2}}>
				{words.map((w, i) => (
					<span key={i} style={{color: i === Math.min(cur, words.length - 1) ? '#F2B38F' : '#F6EBE1', opacity: i <= cur ? 1 : 0.25, marginRight: '0.25em'}}>{w}</span>
				))}
			</div>
		</div>
	);
};

export const Video: React.FC = () => (
	<VideoProvider timeline={T} brand={BRAND}>
		<MotionProvider theme={TEMA}>
			<AbsoluteFill style={{background: TEMA.paper, width: W}}>
				<Paper color={TEMA.paper} />
				<Dust />
				<Gancho />
				<Erro1 />
				<Erro2 />
				<Erro3 />
				<Fecho />
				<Legenda />
				<Grain amount={0.03} vignette={0} />
			</AbsoluteFill>
		</MotionProvider>
	</VideoProvider>
);
