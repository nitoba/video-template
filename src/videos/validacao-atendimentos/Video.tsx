// Validação de atendimentos (PecTrace), versão narrada. O roteiro e a voz são os do vídeo antigo (38 falas em
// narracao.json); cada fala ganhou a imagem que a explica, na linguagem da prova aprovada (src/videos/prova-direcao):
// papel quente, tinta marrom, laranja para ação, amarelo do marca-texto para "cópia", câmera contínua sobre
// capturas reais, a peça que sai da tela e grãos que ligam uma informação à outra. Legendas sempre ligadas.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {IbsLogo} from '../../brands/agrotrace';
import {PEC_ICON_PATHS, PEC_TEXT_PATHS} from '../../brands/paths-pectrace';
import {PecLogo} from '../../brands/pectrace';
import {Grain} from '../../core/Grain';
import {Paper} from '../../core/Paper';
import {GrainCanvas, type GrainSpec, hexToRgbTuple, sampleShapePoints} from '../../kit/grains';
import {LottieAt} from '../../kit/lottie';
import {Plano, type View, planoToScreen, viewMatching} from '../../kit/plano';
import {EASE, lerp, OUT, ramp, VideoProvider} from '../../kit/timeline';
import {b, BRAND, LEGENDAS, lottie, M, s, sp, T, TIMELINE, tela} from './story';

const INK = '#2b1a10';
const INK_SOFT = '#806452';
const ORANGE = '#e5601f';
const RED = '#dc2626';
const GREEN = '#16a34a';
const MARKER = 'rgba(250,214,77,0.85)';
const PAPER = '#fff8f4';
const CARD = '#fffdfb';
const {display: DISPLAY, ui: UI, mono: MONO} = BRAND.fontes;
const SHADOW = '0 18px 50px rgba(102,50,17,0.10), 0 0 0 1px rgba(102,50,17,0.07)';
const spr = (f: number, at: number, cfg = {damping: 16, stiffness: 150, mass: 0.7}) => Math.min(1, sp(f, at, cfg));
/** Quadro de um marco mais `sec` segundos. */
const at = (mark: number, sec = 0) => b(mark) + s(sec);

// ---------- Câmera por chaves ----------
const viewAt = (f: number, keys: [number, View][]): View => {
	if (f <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) {
		if (f < keys[i][0]) {
			const [a, c] = [keys[i - 1][1], keys[i][1]];
			const u = ramp(f, keys[i - 1][0], keys[i][0], EASE);
			return {fx: lerp(a.fx, c.fx, u), fy: lerp(a.fy, c.fy, u), s: a.s * (c.s / a.s) ** u};
		}
	}
	return keys[keys.length - 1][1];
};

// ---------- Peças comuns ----------
const Chip: React.FC<{children: React.ReactNode; tone?: 'brand' | 'red' | 'green'}> = ({children, tone = 'brand'}) => {
	const c = {brand: ['#8c4418', '#fde4d3'], red: ['#b91c1c', '#fde8e8'], green: ['#15803d', '#dcfce7']}[tone];
	return <span style={{fontFamily: MONO, fontSize: 20, fontWeight: 500, letterSpacing: '0.04em', color: c[0], background: c[1], borderRadius: 999, padding: '5px 14px', whiteSpace: 'nowrap'}}>{children}</span>;
};

const Svg: React.FC<{d: React.ReactNode; color?: string; size?: number; width?: number}> = ({d, color = '#fff', size = 22, width = 2.2}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round">
		{d}
	</svg>
);
const Icon: React.FC<{d: React.ReactNode; bg: string}> = ({d, bg}) => (
	<span style={{width: 40, height: 40, borderRadius: 10, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0}}>
		<Svg d={d} />
	</span>
);
const D = {
	pdf: (
		<>
			<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
			<path d="M14 3v6h6" />
			<path d="M8 15h1.5a1.5 1.5 0 0 0 0-3H8v5" />
		</>
	),
	file: (
		<>
			<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
			<path d="M14 3v6h6M8 14h8M8 18h5" />
		</>
	),
	edit: (
		<>
			<path d="M12 20h9" />
			<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
		</>
	),
	userPen: (
		<>
			<circle cx="9" cy="7" r="4" />
			<path d="M3 21v-1a6 6 0 0 1 9-5.2M15 21l1-3 4.5-4.5a1.4 1.4 0 0 1 2 2L18 20Z" />
		</>
	),
	copy: (
		<>
			<rect x="8" y="8" width="12" height="13" rx="2" />
			<path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" />
		</>
	),
	hash: <path d="M5 9h15M4 15h15M10 3 8 21M16 3l-2 18" />,
	chat: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5A8 8 0 1 1 21 12Z" />,
	rule: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6" />,
	mail: (
		<>
			<rect x="3" y="5" width="18" height="14" rx="2" />
			<path d="m3 7 9 6 9-6" />
		</>
	),
	check: <path d="m5 12 5 5 9-10" />,
	sync: <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" />,
	spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
	user: (
		<>
			<circle cx="12" cy="8" r="4" />
			<path d="M4 21a8 8 0 0 1 16 0" />
		</>
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</>
	),
	bell: <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0" />,
};
const VERIFS: {nome: string; d: React.ReactNode}[] = [
	{nome: 'RAT ausente', d: D.pdf},
	{nome: 'Contrato', d: D.file},
	{nome: 'Assinaturas do RAT', d: D.edit},
	{nome: 'Assinatura do consultor', d: D.userPen},
	{nome: 'Cópia e cola', d: D.copy},
	{nome: 'Identificador externo', d: D.hash},
	{nome: 'Pertinência da recomendação', d: D.chat},
];

const CardHeader: React.FC<{icon: React.ReactNode; title: string; chip?: string; tone?: 'brand' | 'red' | 'green'}> = ({icon, title, chip, tone = 'red'}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
		{icon}
		<span style={{fontFamily: UI, fontSize: 24, fontWeight: 600, color: INK}}>{title}</span>
		{chip && <Chip tone={tone}>{chip}</Chip>}
	</div>
);
const Ruler: React.FC<{fill: number; mark: number; label: string}> = ({fill, mark, label}) => (
	<>
		<div style={{marginTop: 26, height: 12, borderRadius: 6, background: '#f4e7de', position: 'relative'}}>
			<div style={{position: 'absolute', inset: 0, width: `${fill * 100}%`, borderRadius: 6, background: `linear-gradient(90deg, ${ORANGE}, ${RED})`}} />
			<div style={{position: 'absolute', left: `${mark * 100}%`, top: -9, width: 3, height: 30, borderRadius: 2, background: INK}} />
		</div>
		<div style={{position: 'relative', height: 26, marginTop: 10}}>
			<span style={{position: 'absolute', left: `${mark * 100}%`, transform: 'translateX(-50%)', fontFamily: UI, fontSize: 18, fontWeight: 500, color: INK, whiteSpace: 'nowrap'}}>{label}</span>
		</div>
	</>
);
const KV: React.FC<{k: string; v: string; color?: string}> = ({k, v, color = INK}) => (
	<div style={{display: 'flex', gap: 18, fontFamily: UI, fontSize: 22, lineHeight: 1.5}}>
		<span style={{width: 220, color: INK_SOFT, flexShrink: 0}}>{k}</span>
		<span style={{color, fontWeight: 500}}>{v}</span>
	</div>
);

type Rect = {x: number; y: number; w: number; h: number};

/** Mola sem limite (deixa o overshoot aparecer) a partir de um quadro. */
const pop = (f: number, from: number, cfg = {damping: 12, stiffness: 170, mass: 0.7}) => (f < from ? 0 : sp(f - from, 0, cfg));
/** Ease out back: passa um pouco do alvo e volta. */
const back = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2);
/** Tremor de câmera que decai a partir de `from` (impactos). */
const shake = (f: number, from: number, amp = 10) => {
	const t = f - from;
	if (t < 0 || t > 20) return {x: 0, y: 0};
	const d = Math.exp(-t / 5) * amp;
	return {x: Math.sin(t * 2.9) * d, y: Math.cos(t * 3.7) * d * 0.6};
};

/** Contorno que se desenha em volta de um trecho da captura e solta um pulso (acompanha a câmera). */
const Spot: React.FC<{v: View; r: Rect; from: number; to?: number; pad?: number; z?: number}> = ({v, r, from, to, pad = 10, z = 0}) => {
	const f = useCurrentFrame();
	if (f < from) return null;
	const draw = ramp(f, from, from + 16, EASE);
	const out = to !== undefined ? ramp(f, to, to + 10) : 0;
	if (out >= 1) return null;
	const tl = planoToScreen(v, r.x, r.y);
	const br = planoToScreen(v, r.x + r.w, r.y + r.h);
	const w = br.x - tl.x + pad * 2;
	const h = br.y - tl.y + pad * 2;
	const perim = 2 * (w + h);
	const pulse = ramp(f, from + 10, from + 34, OUT);
	return (
		<div style={{position: 'absolute', inset: 0, transform: `translateZ(${z + 4}px)`}}>
			<div style={{position: 'absolute', left: tl.x - pad, top: tl.y - pad, width: w, height: h, borderRadius: 14, border: `2px solid ${ORANGE}`, opacity: (1 - pulse) * 0.7 * (1 - out) * (pulse > 0 ? 1 : 0), transform: `scale(${1 + pulse * 0.14})`}} />
			<svg width={w + 8} height={h + 8} style={{position: 'absolute', left: tl.x - pad - 4, top: tl.y - pad - 4, overflow: 'visible', opacity: 1 - out}}>
				<rect x={4} y={4} width={w} height={h} rx={14} fill={`rgba(229,96,31,${0.07 * draw})`} stroke={ORANGE} strokeWidth={3.5} strokeDasharray={perim} strokeDashoffset={perim * (1 - draw)} strokeLinecap="round" />
			</svg>
		</div>
	);
};

/** Cursor que chega em arco ao ponto (tela), afunda no clique e solta uma onda. */
const Cursor: React.FC<{x: number; y: number; click: number; from?: [number, number]}> = ({x, y, click, from = [x + 300, y + 220]}) => {
	const f = useCurrentFrame();
	if (f < click - 28 || f > click + 30) return null;
	const t = ramp(f, click - 26, click - 2, EASE);
	const cx = from[0] - 40;
	const cy = y - 60;
	const px = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * cx + t * t * x;
	const py = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * cy + t * t * y;
	const press = ramp(f, click, click + 16, OUT);
	const squash = f >= click && f < click + 8 ? 0.82 + 0.18 * ramp(f, click, click + 8) : 1;
	const vis = ramp(f, click - 28, click - 20) * (1 - ramp(f, click + 20, click + 30));
	return (
		<>
			{f >= click && <div style={{position: 'absolute', left: x - 36 * press, top: y - 36 * press, width: 72 * press, height: 72 * press, borderRadius: '50%', border: `3px solid ${ORANGE}`, opacity: 1 - press}} />}
			<svg width="34" height="40" viewBox="0 0 34 40" style={{position: 'absolute', left: px - 4, top: py - 3, opacity: vis, transform: `scale(${squash}) rotate(${(1 - t) * -14}deg)`, transformOrigin: '4px 3px', filter: 'drop-shadow(0 6px 10px rgba(43,26,16,0.3))'}}>
				<path d="M4 3 L4 31 L11.5 24 L17 36 L22 33.5 L16.5 22 L27 21.5 Z" fill={INK} stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
			</svg>
		</>
	);
};

/** Peça que se ergue do trecho (`r`, na captura) em 3D e vai ao centro; a tela atrás desfoca e clareia. */
const liftOf = (f: number, peca: number, drop?: number) => Math.min(1, sp(f - peca, 0, {damping: 15, stiffness: 120, mass: 0.9})) * (drop !== undefined ? 1 - ramp(f, drop, drop + 16, EASE) : 1);
const Peca: React.FC<{v: View; r: Rect; peca: number; drop?: number; width?: number; height?: number; children: React.ReactNode}> = ({v, r, peca, drop, width = 660, height = 320, children}) => {
	const f = useCurrentFrame();
	const lift = f < peca ? 0 : sp(f - peca, 0, {damping: 13, stiffness: 120, mass: 0.9}) * (drop !== undefined ? 1 - ramp(f, drop, drop + 16, EASE) : 1);
	if (lift <= 0.005) return null;
	const L = Math.min(1, lift);
	const tl = planoToScreen(v, r.x, r.y);
	const fl = Math.sin(((f - peca) / 50) * Math.PI) * 4 * L;
	return (
		<div style={{position: 'absolute', inset: 0, transform: 'translateZ(220px)', transformStyle: 'preserve-3d'}}>
			<div style={{position: 'absolute', inset: -400, background: PAPER, opacity: L * 0.5}} />
			<div style={{position: 'absolute', left: lerp(tl.x - 12, 960 - width / 2, Math.min(1.06, lift)), top: lerp(tl.y - height * 0.4, 470 - height / 2, Math.min(1.06, lift)) + fl, width, padding: '26px 32px 30px', borderRadius: 24, background: CARD, boxShadow: `0 ${2 + L * 6}px ${6 + L * 12}px rgba(102,50,17,0.06), 0 ${10 + L * 40}px ${30 + L * 90}px rgba(102,50,17,${0.08 + L * 0.16}), 0 0 0 1px rgba(102,50,17,0.07)`, opacity: Math.min(1, lift * 2), transform: `perspective(1400px) rotateX(${(1 - L) * 62}deg) rotateZ(${(1 - L) * -4}deg) scale(${lerp(0.82, 1.12, lift)})`, transformOrigin: '50% 100%'}}>
				{children}
			</div>
		</div>
	);
};

type Dir = 'left' | 'right' | 'up' | 'down' | 'zoom' | 'dive' | 'fade' | 'cut';
const DIRV: Record<string, [number, number]> = {left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1]};
/**
 * Bloco com transição de entrada e saída. `enter` é o lado de onde vem; `exit`, o lado para onde vai; o desfoque
 * acompanha a velocidade (efeito de chicote). Com `src`, a captura real fica num plano 3D que entra inclinado,
 * assenta e segue derivando: a câmera nunca para.
 */
const Stage: React.FC<{from: number; to: number; src?: string; v?: View; w?: number; h?: number; cutIn?: boolean; enter?: Dir; exit?: Dir; blur?: number; orbit?: [number, number, number, number]; base?: number; layers?: React.ReactNode; children?: React.ReactNode}> = ({from, to, src, v, w, h, cutIn, enter = 'right', exit = 'left', blur = 0, orbit, base = 1, layers, children}) => {
	const f = useCurrentFrame();
	if (f < from - 2 || f > to + 18) return null;
	const ent: Dir = cutIn ? 'cut' : enter;
	const inn = ent === 'cut' ? 1 : ramp(f, from, from + 20, OUT);
	const out = ramp(f, to, to + 16, (x) => x * x);
	const vin = ent === 'cut' ? 0 : (1 - inn) ** 2;
	let tx = 0;
	let ty = 0;
	let sc = 1;
	let op = 1;
	if (DIRV[ent]) {
		tx += DIRV[ent][0] * vin * 900;
		ty += DIRV[ent][1] * vin * 700;
	} else if (ent === 'zoom') sc *= lerp(1, 0.82, vin);
	else if (ent === 'dive') sc *= lerp(1, 1.3, vin);
	if (ent === 'fade' || ent === 'zoom' || ent === 'dive') op *= inn;
	if (DIRV[exit]) {
		tx += DIRV[exit][0] * out * 900;
		ty += DIRV[exit][1] * out * 700;
	} else if (exit === 'dive') sc *= 1 + out * 0.7;
	else if (exit === 'zoom') sc *= 1 - out * 0.2;
	if (exit === 'fade' || exit === 'dive' || exit === 'zoom') op *= 1 - out;
	const mb = vin * 22 + out * 22;
	const settle = 1 - ramp(f, from, from + 40, OUT);
	// Órbita [rx0, ry0, rx1, ry1] ao longo da cena: a câmera gira em volta das camadas (paralaxe real).
	const o = ramp(f, from, to + 16, (x) => x);
	const rx = settle * 12 + Math.sin(f / 80) * 1.1 + (orbit ? lerp(orbit[0], orbit[2], o) : 0);
	const ry = settle * -9 + Math.sin(f / 115 + 1) * 1.5 + (orbit ? lerp(orbit[1], orbit[3], o) : 0);
	const dx = Math.sin(f / 95) * 10;
	return (
		<AbsoluteFill style={{opacity: op, transform: `translate(${tx}px, ${ty}px) scale(${sc})`, filter: mb > 0.3 ? `blur(${mb}px)` : undefined}}>
			{src && v ? (
				<AbsoluteFill style={{perspective: 2400}}>
					<AbsoluteFill style={{transform: `translateX(${dx}px) rotateX(${rx}deg) rotateY(${ry}deg)`, transformOrigin: '50% 50%', transformStyle: 'preserve-3d'}}>
						{base > 0 && (
							<div style={{position: 'absolute', inset: 0, opacity: base, filter: blur > 0.01 ? `blur(${blur * 5}px)` : undefined}}>
								<Plano src={src} v={v} w={w} h={h} />
							</div>
						)}
						{layers}
					</AbsoluteFill>
				</AbsoluteFill>
			) : null}
			{src && v ? (
				<AbsoluteFill style={{perspective: 2400}}>
					<AbsoluteFill style={{transform: `translateX(${dx}px) rotateX(${rx}deg) rotateY(${ry}deg)`, transformOrigin: '50% 50%', transformStyle: 'preserve-3d'}}>
						{children}
					</AbsoluteFill>
				</AbsoluteFill>
			) : (
				children
			)}
		</AbsoluteFill>
	);
};

/**
 * Interface em camadas: recortes da captura (`r`, em px dela) viram peças no espaço 3D, cada uma na sua
 * profundidade `z`, entrando em sequência a partir de `at` (quadro), vindas de `from`. Dentro de um Stage com
 * órbita, as profundidades diferentes se deslocam umas sobre as outras.
 */
type Layer = {r: Rect; z: number; at: number; from?: {x?: number; y?: number; z?: number; rx?: number; ry?: number}; lift?: number};
const Layers: React.FC<{src: string; w?: number; h?: number; v: View; layers: Layer[]; radius?: number}> = ({src, w = 3360, h = 2100, v, layers, radius = 12}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{transformStyle: 'preserve-3d'}}>
			{layers.map((L, i) => {
				const k = pop(f, L.at, {damping: 15, stiffness: 120, mass: 0.85});
				if (k <= 0.001) return null;
				const tl = planoToScreen(v, L.r.x, L.r.y);
				const fr = L.from ?? {};
				const u = 1 - k;
				const z = L.z * Math.min(1.2, k) + u * (fr.z ?? -500) + (L.lift ?? 0);
				return (
					<div key={i} style={{position: 'absolute', left: tl.x, top: tl.y, width: L.r.w * v.s, height: L.r.h * v.s, overflow: 'hidden', borderRadius: radius * v.s, opacity: Math.min(1, k * 2.2), boxShadow: `0 ${12 + z * 0.12}px ${30 + z * 0.3}px rgba(102,50,17,${0.1 + Math.max(0, z) * 0.0012}), 0 0 0 1px rgba(102,50,17,0.06)`, transform: `translate3d(${u * (fr.x ?? 0)}px, ${u * (fr.y ?? 160)}px, ${z}px) rotateX(${u * (fr.rx ?? 24)}deg) rotateY(${u * (fr.ry ?? 0)}deg)`, background: '#fff'}}>
						<Img src={staticFile(src)} style={{position: 'absolute', left: -L.r.x * v.s, top: -L.r.y * v.s, width: w * v.s, height: h * v.s, maxWidth: 'none'}} />
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/** Blocos da gaveta do dossiê (capturas do web, 3360 de largura), entrando da direita um a um. */
const gaveta = (at0: number, blocks: [number, number, number, number, number][]): Layer[] => blocks.map(([x, y, w, h, z], i) => ({r: {x, y, w, h}, z, at: at0 + 2 + i * 4, from: {x: 700, y: 0, z: -120, rx: 0, ry: -28}}));
const GAVETA_CONTRATO: [number, number, number, number, number][] = [[1958, 0, 1402, 132, 30], [1958, 132, 1402, 260, 20], [1958, 392, 1402, 100, 50], [1958, 492, 1402, 148, 20], [1958, 640, 1402, 84, 10], [1990, 735, 1330, 627, 70], [1990, 1378, 1330, 722, 20]];
const GAVETA_COPIA: [number, number, number, number, number][] = [[1958, 0, 1402, 132, 30], [1990, 236, 1330, 945, 70], [1990, 1210, 1330, 462, 30], [1958, 1700, 1402, 400, 10]];
/**
 * Modal do CMS (capturas de 2880) em partes: cabeçalho, abas, (cartão do topo), menu, conteúdo e rodapé. Os
 * destaques (`heroes`) vêm à frente como peças próprias.
 */
const cmsLayers = (at0: number, topcard: boolean, heroes: Rect[] = []): Layer[] => {
	const y0 = topcard ? 780 : 445;
	const parts: [Rect, number][] = [
		[{x: 289, y: 115, w: 2299, h: 165}, 30],
		[{x: 289, y: 300, w: 2299, h: 145}, 20],
		...(topcard ? ([[{x: 330, y: 465, w: 2210, h: 300}, 50]] as [Rect, number][]) : []),
		[{x: 300, y: y0, w: 490, h: 1530 - y0}, 10],
		[{x: 800, y: y0, w: 1760, h: 1530 - y0}, 35],
		[{x: 289, y: 1530, w: 2299, h: 154}, 15],
	];
	return [
		...parts.map(([r, z], i) => ({r, z, at: at0 + 2 + i * 3, from: {y: 120 + i * 20, z: -500, rx: 30}})),
		...heroes.map((r, i) => ({r, z: 110, at: at0 + 22 + i * 5, from: {y: 60, z: -200, rx: 50}})),
	];
};

/** Cartão com peso: entra com antecipação e rotação que assenta, a sombra cresce, e depois flutua. */
const Card: React.FC<{x: number; y: number; w: number; h?: number; k?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x, y, w, h, k = 1, style, children}) => {
	const f = useCurrentFrame();
	const c = Math.min(1, k);
	const fl = Math.sin((f + x * 0.37) / 46) * 3 * c;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: '26px 30px', borderRadius: 22, background: CARD, boxShadow: `0 ${6 + c * 14}px ${20 + c * 40}px rgba(102,50,17,${0.04 + c * 0.08}), 0 0 0 1px rgba(102,50,17,0.07)`, opacity: c, transform: `translateY(${(1 - k) * 44 + fl}px) rotate(${(1 - k) * -5}deg) scale(${lerp(0.88, 1, k)})`, ...style}}>
			{children}
		</div>
	);
};

/** Título: palavra a palavra, cada uma sobe de dentro de uma máscara. Com `at` (tempo) e texto simples. */
const Headline: React.FC<{text: React.ReactNode; y: number; size?: number; k: number; at?: number; color?: string; font?: string; weight?: number}> = ({text, y, size = 64, k, at: atBeat, color = INK, font = DISPLAY, weight = 600}) => {
	const f = useCurrentFrame();
	const base: React.CSSProperties = {position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: '-0.01em'};
	if (typeof text === 'string' && atBeat !== undefined) {
		return (
			<div style={base}>
				{text.split(' ').map((wd, i) => {
					const u = pop(f, b(atBeat) + i * 3, {damping: 15, stiffness: 150, mass: 0.7});
					return (
						<span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.08em', marginRight: '0.24em'}}>
							<span style={{display: 'inline-block', transform: `translateY(${(1 - u) * 110}%) rotate(${(1 - u) * 6}deg)`, opacity: Math.min(1, u * 2)}}>{wd}</span>
						</span>
					);
				})}
			</div>
		);
	}
	return <div style={{...base, opacity: k, transform: `translateY(${(1 - k) * 22}px)`, filter: k < 0.98 ? `blur(${(1 - k) * 8}px)` : undefined}}>{text}</div>;
};

/** Odômetro: cada casa rola como um contador mecânico. */
const Odo: React.FC<{value: number; digits: number; size: number; color?: string; sep?: boolean}> = ({value, digits, size, color = INK, sep = true}) => {
	const lh = size * 1.02;
	const cols = Array.from({length: digits}, (_, i) => digits - 1 - i);
	return (
		<span style={{display: 'inline-flex', fontFamily: DISPLAY, fontWeight: 700, fontSize: size, color, lineHeight: `${lh}px`, height: lh, overflow: 'hidden', fontVariantNumeric: 'tabular-nums'}}>
			{cols.map((p) => {
				// Cada casa só gira no último décimo da volta da casa de baixo, como num contador mecânico.
				const q = value / 10 ** p;
				const frac = q % 1;
				const pos = p === 0 ? q % 10 : (Math.floor(q) % 10) + Math.max(0, (frac - 0.9) / 0.1);
				const whole = Math.floor(value / 10 ** p);
				const hide = p > 0 && whole === 0 && value < 10 ** p;
				return (
					<React.Fragment key={p}>
						<span style={{display: 'inline-block', height: lh, opacity: hide ? 0.12 : 1}}>
							<span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-pos * lh}px)`}}>
								{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
									<span key={j} style={{height: lh, display: 'block', textAlign: 'center'}}>
										{d}
									</span>
								))}
							</span>
						</span>
						{sep && p === 3 && <span>.</span>}
					</React.Fragment>
				);
			})}
		</span>
	);
};

/** Poeira de fundo: grãos lentos que dão vida ao papel. */
const Dust: React.FC = () => {
	const f = useCurrentFrame();
	const ref = useRef<HTMLCanvasElement>(null);
	const pts = useMemo(() => Array.from({length: 46}, (_, i) => ({x: random(`dx${i}`) * 1920, y: random(`dy${i}`) * 1080, r: 1.5 + random(`dr${i}`) * 2.5, s: 0.15 + random(`ds${i}`) * 0.35, ph: random(`dp${i}`) * 6.28, o: i % 4 === 0})), []);
	useLayoutEffect(() => {
		const ctx = ref.current?.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, 1920, 1080);
		for (const p of pts) {
			const x = (p.x + f * p.s * 1.4 + Math.sin(f / 60 + p.ph) * 12) % 1940;
			const y = (p.y - f * p.s * 0.6 + 1080 * 4) % 1100;
			ctx.fillStyle = p.o ? 'rgba(229,96,31,0.16)' : 'rgba(128,100,82,0.12)';
			ctx.beginPath();
			ctx.arc(x, y, p.r, 0, Math.PI * 2);
			ctx.fill();
		}
	});
	return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />;
};

/** Texto que se digita entre dois quadros. */
const typed = (text: string, f: number, a: number, c: number) => text.slice(0, Math.round(text.length * ramp(f, a, c)));

// ---------- Legendas ----------
const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	const cur = LEGENDAS.find(([ini, fim]) => t >= ini - 0.15 && t <= fim + 0.35);
	if (!cur) return null;
	const [ini, fim, text] = cur;
	const k = ramp(t, ini - 0.15, ini + 0.05) * (1 - ramp(t, fim + 0.15, fim + 0.35));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', opacity: k}}>
			<div style={{maxWidth: 1480, padding: '12px 28px', borderRadius: 16, background: 'rgba(255,250,246,0.94)', boxShadow: '0 8px 24px rgba(102,50,17,0.12), 0 0 0 1px rgba(102,50,17,0.06)', fontFamily: UI, fontSize: 34, fontWeight: 500, lineHeight: 1.3, color: INK, textAlign: 'center'}}>{text}</div>
		</div>
	);
};

// ---------- A ficha do RAT (desenhada; os dados reais vêm das telas) ----------
const RAT_W = 720;
const RAT_H = 520;
/** Zonas da ficha, em px dentro dela. */
const RZ = {contrato: {x: 36, y: 168, w: 648, h: 40}, texto: {x: 36, y: 226, w: 648, h: 112}, assin: {x: 36, y: 372, w: 648, h: 116}, produtor: {x: 372, y: 372, w: 312, h: 116}};
const RatFicha: React.FC<{x: number; y: number; scale?: number; opacity?: number; produtor?: 'vazio' | 'erro' | 'alerta'; k?: number; rot?: number; wob?: number}> = ({x, y, scale = 1, opacity = 1, produtor = 'vazio', k = 0, rot = 0, wob = 0}) => (
	<div style={{position: 'absolute', left: x, top: y, width: RAT_W, height: RAT_H, transform: `scale(${scale}) rotate(${rot}deg)`, transformOrigin: '50% 50%', opacity, borderRadius: 18, background: '#fffefc', boxShadow: '0 24px 60px rgba(102,50,17,0.16), 0 0 0 1px rgba(102,50,17,0.08)', padding: 36}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
			<Chip>RAT</Chip>
			<span style={{fontFamily: UI, fontSize: 24, fontWeight: 600, color: INK}}>Relatório de atendimento técnico</span>
		</div>
		<div style={{marginTop: 22, display: 'grid', gap: 4}}>
			<KV k="Técnico" v="William S." />
			<KV k="Data" v="05/09/2026" />
			<KV k="Contrato nº" v="234/2026" />
		</div>
		<div style={{marginTop: 22, display: 'grid', gap: 12}}>
			{[0.96, 0.9, 0.72].map((w, i) => (
				<div key={i} style={{height: 12, width: `${w * 100}%`, borderRadius: 6, background: '#efe4db'}} />
			))}
		</div>
		<div style={{position: 'absolute', left: 36, right: 36, top: RZ.assin.y, display: 'flex', gap: 24}}>
			<div style={{flex: 1, height: 116, borderRadius: 12, border: '1.5px solid #e4d6cb', position: 'relative'}}>
				<svg viewBox="0 0 200 60" style={{position: 'absolute', left: 30, top: 14, width: 220, height: 66}}>
					<path d="M6 40 C 20 8, 30 8, 34 36 S 52 52, 58 24 S 74 6, 80 34 S 98 50, 108 22 S 128 14, 132 36 S 160 44, 192 26" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
				</svg>
				<span style={{position: 'absolute', left: 14, bottom: 8, fontFamily: UI, fontSize: 18, color: INK_SOFT}}>Consultor</span>
			</div>
			<div style={{flex: 1, height: 116, borderRadius: 12, border: `2px dashed ${produtor === 'erro' && k > 0.5 ? RED : produtor === 'alerta' && k > 0.2 ? ORANGE : '#e4d6cb'}`, background: produtor === 'erro' ? `rgba(220,38,38,${0.07 * k})` : produtor === 'alerta' ? `rgba(229,96,31,${0.08 * k})` : undefined, position: 'relative', transform: `translateX(${wob}px)`}}>
				<span style={{position: 'absolute', left: 14, bottom: 8, fontFamily: UI, fontSize: 18, color: INK_SOFT}}>Produtor</span>
			</div>
		</div>
	</div>
);

// ============ 1. 3.736 atendimentos, nenhum conferido, todos para o zip ============
const GRID = {cols: 89, rows: 42, x: 380, y: 340, w: 1020, h: 470};
const N_ATEND = 3736;
const BOX = {x: 1500, y: 460, w: 330, h: 230};
const AtoNumero: React.FC = () => {
	const f = useCurrentFrame();
	const ref = useRef<HTMLCanvasElement>(null);
	const dots = useMemo(
		() =>
			Array.from({length: N_ATEND}, (_, i) => {
				const c = i % GRID.cols;
				const r = Math.floor(i / GRID.cols);
				const x = GRID.x + (c / (GRID.cols - 1)) * GRID.w;
				const y = GRID.y + (r / (GRID.rows - 1)) * GRID.h;
				return {x, y, c, r, j: random(`n${i}`), d: Math.hypot((x - 890) / 520, (y - 575) / 240)};
			}),
		[],
	);
	const from = b(M.numero) - 10;
	const to = at(M.rat, 0.4);
	const Z = b(M.zip);
	// Câmera: entra inclinada sobre a grade e acompanha o fluxo até a caixa.
	const pan = ramp(f, Z - 6, Z + s(2.2), EASE);
	useLayoutEffect(() => {
		const ctx = ref.current?.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, 1920, 1080);
		const bx = BOX.x + BOX.w / 2;
		const by = BOX.y + BOX.h / 2;
		const wave = ramp(f, b(M.nenhum), b(M.nenhum) + 26) * 1.5;
		for (const d of dots) {
			// Surge em onda a partir do centro, passando um pouco do tamanho e voltando.
			const a0 = b(M.numero) + d.d * 34 + d.j * 6;
			const appear = ramp(f, a0, a0 + 12);
			if (appear <= 0) continue;
			const t0 = Z + (d.c / GRID.cols) * 46 + d.j * 18;
			const t = EASE(ramp(f, t0, t0 + 26));
			if (t >= 1) continue;
			const x = lerp(d.x, bx, t) + Math.sin(t * Math.PI) * (d.j - 0.5) * 40;
			const y = lerp(d.y, by, t) - Math.sin(t * Math.PI) * (90 + d.j * 60);
			const bump = wave > 0 && wave < 1.5 ? Math.exp(-(((d.d - wave) / 0.09) ** 2)) : 0;
			ctx.fillStyle = `rgba(${lerp(128, 43, bump)},${lerp(100, 26, bump)},${lerp(82, 16, bump)},${(0.5 + bump * 0.4) * Math.min(1, appear * 2) * (1 - t * 0.3)})`;
			ctx.beginPath();
			ctx.arc(x, y, 3.6 * back(appear) * (1 + bump * 0.6) * (1 - t * 0.35), 0, Math.PI * 2);
			ctx.fill();
		}
	});
	if (f < from || f > to + 16) return null;
	const out = ramp(f, to, to + 14, EASE);
	const count = N_ATEND * ramp(f, b(M.numero), at(M.numero, 1.6), OUT);
	const head = pop(f, b(M.numero));
	const none = pop(f, b(M.nenhum) + 6, {damping: 9, stiffness: 220, mass: 0.6});
	const box = pop(f, b(M.zip) - s(0.5));
	const recv = ramp(f, at(M.zip, 0.7), at(M.zip, 2.8));
	const hit = recv > 0 && recv < 1 ? Math.abs(Math.sin(f * 0.9)) * 0.05 : 0;
	const rx = lerp(14, 4, ramp(f, from, Z, OUT)) + Math.sin(f / 70) * 1;
	return (
		<AbsoluteFill style={{opacity: 1 - out, filter: out > 0.01 ? `blur(${out * 8}px)` : undefined, perspective: 2200}}>
			<AbsoluteFill style={{transform: `translateX(${-pan * 160}px) rotateX(${rx}deg) rotateY(${-pan * 6}deg) scale(${lerp(0.96, 1.02, ramp(f, from, to, (x) => x))})`}}>
				<div style={{position: 'absolute', left: GRID.x, top: 110, opacity: Math.min(1, head), transform: `translateY(${(1 - head) * 30}px)`, display: 'flex', alignItems: 'baseline', gap: 24}}>
					<Odo value={count} digits={4} size={124} />
					<span style={{fontFamily: UI, fontSize: 34, color: INK_SOFT}}>atendimentos concluídos na JBS</span>
				</div>
				<div style={{position: 'absolute', left: GRID.x, top: 252, opacity: Math.min(1, none * 1.5), display: 'flex', alignItems: 'baseline', gap: 16}}>
					<span style={{fontFamily: UI, fontSize: 30, color: INK_SOFT}}>conferidos:</span>
					<span style={{display: 'inline-block', fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: ORANGE, transform: `scale(${lerp(2.6, 1, Math.min(1.2, none))}) rotate(${(1 - none) * -12}deg)`, transformOrigin: '20% 80%'}}>0</span>
				</div>
				<canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />
				<Card x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} k={box} style={{display: 'grid', placeItems: 'center', textAlign: 'center', transform: `translateY(${(1 - box) * 44}px) rotate(${(1 - box) * -5}deg) scale(${lerp(0.88, 1, box) * (1 + hit)}, ${lerp(0.88, 1, box) * (1 - hit)})`}}>
					<div>
						<div style={{display: 'flex', justifyContent: 'center', marginBottom: 14}}>
							<Icon d={D.file} bg={ORANGE} />
						</div>
						<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: INK}}>Exportação</div>
						<div style={{fontFamily: UI, fontSize: 22, color: INK_SOFT, marginTop: 6}}>zip para a JBS</div>
						<div style={{marginTop: 16, height: 8, width: 240, borderRadius: 4, background: '#f4e7de'}}>
							<div style={{height: 8, width: `${recv * 100}%`, borderRadius: 4, background: ORANGE}} />
						</div>
					</div>
				</Card>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ============ 2. O RAT do William, sem a assinatura do produtor ============
const RAT_CX = 960 - RAT_W / 2;
const RAT_CY = 440 - RAT_H / 2;
const AtoRat: React.FC = () => {
	const f = useCurrentFrame();
	const from = b(M.rat);
	const to = b(M.titulo);
	const stampAt = b(M.volta) + s(0.15);
	const burst = useMemo(
		() =>
			Array.from({length: 34}, (_, i) => {
				const a = (i / 34) * Math.PI * 2 + random(`ba${i}`) * 0.3;
				const r = 120 + random(`br${i}`) * 160;
				const cx = RAT_CX + 520;
				const cy = RAT_CY + 120;
				return {a: {x: cx, y: cy}, c: {x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.7}, t0: stampAt, dur: 16 + random(`bd${i}`) * 10, size: 5 + random(`bz${i}`) * 4, lift: -20, wob: 0, depth: random(`bp${i}`) * 0.5, color: [220, 38, 38] as [number, number, number]} satisfies GrainSpec;
			}),
		[stampAt],
	);
	if (f < from - 2 || f > to + 20) return null;
	// Ejeção: a caixa encolhe (antecipação) e o ponto sai em arco, girando, até virar a ficha.
	const grow = pop(f, from + 4, {damping: 14, stiffness: 100, mass: 0.9});
	const G = Math.min(1, grow);
	const err = ramp(f, b(M.semAssin), at(M.semAssin, 0.4));
	const wob = f >= b(M.semAssin) ? Math.sin((f - b(M.semAssin)) * 1.7) * 9 * Math.exp(-(f - b(M.semAssin)) / 9) : 0;
	const toJbs = ramp(f, b(M.jbs), at(M.jbs, 1.1), EASE) * (1 - ramp(f, b(M.volta), at(M.volta, 0.5), EASE));
	const recoil = f >= b(M.volta) ? Math.sin((f - b(M.volta)) / 3) * 22 * Math.exp(-(f - b(M.volta)) / 8) : 0;
	const stamp = f >= stampAt ? pop(f, stampAt, {damping: 11, stiffness: 260, mass: 0.6}) * (1 - ramp(f, at(M.agora, 0.1), at(M.agora, 0.5))) : 0;
	const now = ramp(f, b(M.agora), at(M.agora, 1.2), (x) => x);
	const alertK = ramp(f, at(M.agora, 1.1), at(M.agora, 1.5));
	const out = ramp(f, to, to + 16, EASE);
	const jbsK = pop(f, b(M.jbs) - s(0.3)) * (1 - ramp(f, b(M.agora), at(M.agora, 0.4)));
	const sk = shake(f, stampAt, 16);
	const sx = BOX.x + BOX.w / 2 - RAT_W / 2;
	const sy = BOX.y + BOX.h / 2 - RAT_H / 2;
	const arc = Math.sin(G * Math.PI) * -160;
	const x = lerp(lerp(sx, RAT_CX, G), RAT_CX + 360, toJbs) + recoil;
	const y = lerp(sy, RAT_CY, G) + arc * (1 - G) + Math.sin(toJbs * Math.PI) * -30;
	const scale = lerp(0.03, 1, grow) * lerp(1, 0.74, toJbs) * (1 - out * 0.2);
	const rot = (1 - G) * -28 + Math.sin(toJbs * Math.PI) * 6 + recoil * -0.15;
	return (
		<AbsoluteFill style={{opacity: 1 - out, filter: out > 0.01 ? `blur(${out * 8}px)` : undefined, transform: `translate(${sk.x}px, ${sk.y}px)`}}>
			<Card x={1470} y={300} w={330} h={260} k={jbsK} style={{display: 'grid', placeItems: 'center', textAlign: 'center'}}>
				<div>
					<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: INK}}>JBS</div>
					<div style={{fontFamily: UI, fontSize: 22, color: INK_SOFT}}>recebe o zip</div>
				</div>
			</Card>
			<RatFicha x={x} y={y} scale={scale} rot={rot} wob={wob} produtor={f >= at(M.agora, 1.1) ? 'alerta' : 'erro'} k={f >= at(M.agora, 1.1) ? alertK : err} />
			{err > 0 && toJbs < 0.4 && (
				<div style={{position: 'absolute', left: x + RZ.produtor.x * scale + (RAT_W * (1 - scale)) / 2, top: y + (RZ.produtor.y + RZ.produtor.h + 14) * scale + (RAT_H * (1 - scale)) / 2, opacity: err * (1 - alertK), transform: `translateY(${(1 - err) * 12}px)`}}>
					<Chip tone="red">sem assinatura do produtor</Chip>
				</div>
			)}
			{stamp > 0.01 && (
				<div style={{position: 'absolute', left: RAT_CX + 380, top: RAT_CY + 70, transform: `rotate(-9deg) scale(${lerp(2.2, 1, Math.min(1.1, stamp))})`, opacity: Math.min(1, stamp * 3), border: `4px solid ${RED}`, borderRadius: 14, padding: '8px 20px', background: 'rgba(255,248,244,0.85)', fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: '0.05em', color: RED, textTransform: 'uppercase', boxShadow: `0 ${(1 - Math.min(1, stamp)) * 30}px ${(1 - Math.min(1, stamp)) * 40}px rgba(102,50,17,0.25)`}}>
					Rejeitado
					<div style={{fontFamily: UI, fontSize: 20, fontWeight: 600, letterSpacing: 0, textTransform: 'none'}}>visita não paga</div>
				</div>
			)}
			<GrainCanvas grains={burst} ripples={false} glow={false} tail={0.08} />
			{now > 0 && now < 1 && (
				<>
					<div style={{position: 'absolute', left: RAT_CX - 10, top: RAT_CY, width: RAT_W + 20, height: now * RAT_H, background: 'linear-gradient(rgba(229,96,31,0), rgba(229,96,31,0.08))', opacity: Math.sin(now * Math.PI)}} />
					<div style={{position: 'absolute', left: RAT_CX - 10, top: RAT_CY + now * RAT_H - 3, width: RAT_W + 20, height: 6, borderRadius: 3, background: ORANGE, boxShadow: '0 0 30px rgba(229,96,31,0.8)', opacity: Math.sin(now * Math.PI)}} />
				</>
			)}
			{alertK > 0 && (
				<div style={{position: 'absolute', left: RAT_CX + RZ.produtor.x, top: RAT_CY + RZ.produtor.y + RZ.produtor.h + 14, opacity: alertK, transform: `translateY(${(1 - alertK) * 14}px)`}}>
					<Chip>alerta antes da JBS</Chip>
				</div>
			)}
		</AbsoluteFill>
	);
};

// ============ 3. Título ============
const AtoTitulo: React.FC = () => {
	const f = useCurrentFrame();
	const logo = pop(f, b(M.titulo));
	return (
		<Stage from={b(M.titulo)} to={b(M.sync)} enter="zoom" exit="up">
			<div style={{position: 'absolute', left: 960 - 160, top: 300, opacity: Math.min(1, logo * 2), transform: `scale(${lerp(0.4, 1, logo)}) rotate(${(1 - logo) * -20}deg)`}}>
				<PecLogo width={320} color={INK} iconColor={ORANGE} />
			</div>
			<Headline text="Validação de atendimentos" y={420} size={104} k={1} at={M.titulo + 0.3} />
			<Headline text="O erro aparece antes de chegar à JBS." y={580} size={42} k={1} at={M.titulo + 3.0} font={UI} weight={500} color={INK_SOFT} />
		</Stage>
	);
};

// ============ 4. Como funciona: sincroniza, fila, IA lê, assinatura, sete verificações ============
const AtoComo: React.FC = () => {
	const f = useCurrentFrame();
	const zone = (r: Rect, mark: number, label: string, ly: number) => {
		const k = spr(f, mark);
		if (k <= 0.01) return null;
		return (
			<React.Fragment key={label}>
				<svg width={r.w + 24} height={r.h + 20} style={{position: 'absolute', left: 300 + r.x - 12, top: 200 + r.y - 10, overflow: 'visible'}}>
					<rect x={4} y={4} width={r.w + 16} height={r.h + 12} rx={10} fill={`rgba(229,96,31,${0.06 * k})`} stroke={ORANGE} strokeWidth={3.5} strokeDasharray={2 * (r.w + r.h + 56)} strokeDashoffset={2 * (r.w + r.h + 56) * (1 - ramp(f, b(mark), b(mark) + 16, EASE))} />
				</svg>
				<div style={{position: 'absolute', left: 300 + r.x + r.w + 8, top: 200 + r.y + r.h / 2, width: lerp(0, 120, k), height: 2, background: ORANGE}} />
				<div style={{position: 'absolute', left: 1150, top: ly - 22, opacity: k, transform: `translateX(${(1 - k) * 20}px)`}}>
					<span style={{fontFamily: UI, fontSize: 30, fontWeight: 600, color: INK}}>{label}</span>
				</div>
			</React.Fragment>
		);
	};
	return (
		<>
			{/* Sincroniza e entra na fila. */}
			<Stage from={b(M.sync)} to={b(M.ia)} enter="down">
				<LottieAt src={lottie('sincronizacao')} at={M.sync} x={360} y={110} w={1200} h={500} />
				{Array.from({length: 7}, (_, i) => {
					const k = pop(f, b(M.fila) + i * 6, {damping: 13, stiffness: 120, mass: 0.8});
					const belt = Math.max(0, f - b(M.fila) - 40) * 0.7;
					return <div key={i} style={{position: 'absolute', left: lerp(-160, 470 + i * 118, Math.min(1, k)) + belt, top: 680 - Math.sin(Math.min(1, k) * Math.PI) * 90, transform: `rotate(${(1 - k) * -30}deg)`, width: 92, height: 116, borderRadius: 12, background: '#fffefc', boxShadow: SHADOW, padding: 12, opacity: Math.min(1, k * 2)}}>
						<div style={{height: 8, width: 40, borderRadius: 4, background: ORANGE, opacity: 0.6}} />
						{[0.9, 0.7, 0.8].map((w, j) => <div key={j} style={{height: 6, width: `${w * 100}%`, borderRadius: 3, background: '#efe4db', marginTop: 10}} />)}
					</div>;
				})}
				<div style={{position: 'absolute', left: 1320, top: 722, opacity: spr(f, M.fila + 1)}}>
					<Chip>fila de validação</Chip>
				</div>
			</Stage>
			{/* A IA lê o RAT: contrato impresso, assinaturas e texto. */}
			<Stage from={b(M.ia)} to={b(M.assinRef)} enter="right">
				<RatFicha x={300} y={200} />
				{(() => {
					const t = ramp(f, at(M.ia, 0.3), at(M.ia, 3.3), (x) => x);
					return t > 0 && t < 1 ? <div style={{position: 'absolute', left: 290, top: 200 + t * RAT_H - 3, width: RAT_W + 20, height: 6, borderRadius: 3, background: ORANGE, boxShadow: '0 0 24px rgba(229,96,31,0.7)', opacity: Math.sin(t * Math.PI)}} /> : null;
				})()}
				<LottieAt src={lottie('ia')} at={M.ia} x={1130} y={170} w={170} h={170} loop />
				{zone(RZ.contrato, M.zonaContrato, 'O contrato impresso', 388)}
				{zone(RZ.assin, M.zonaAssin, 'As assinaturas', 630)}
				{zone(RZ.texto, M.zonaTexto, 'O texto', 482)}
			</Stage>
			{/* A assinatura do consultor contra a referência do técnico. */}
			<Stage from={b(M.assinRef)} to={b(M.sete)}>
				<LottieAt src={lottie('assinatura')} at={M.assinRef} x={480} y={220} w={960} h={420} />
				<div style={{position: 'absolute', left: 520, top: 170, opacity: spr(f, M.assinRef + 0.3)}}>
					<Chip>assinatura no RAT</Chip>
				</div>
				<div style={{position: 'absolute', left: 1130, top: 170, opacity: spr(f, M.assinRef + 0.8)}}>
					<Chip>referência do técnico</Chip>
				</div>
			</Stage>
		</>
	);
};

// ============ 4b. Sete verificações; nada é rejeitado, vira alerta e o gestor decide ============
const TILE = 112;
const TILE_GAP = 46;
const TILES_X = 960 - (7 * TILE + 6 * TILE_GAP) / 2;
const TILE_Y = 250;
const ALERTAS = [1, 4, 5];
const AtoSete: React.FC = () => {
	const f = useCurrentFrame();
	const gestorCard = {x: 760, y: 640, w: 400, h: 110};
	const grains = useMemo(
		() =>
			ALERTAS.flatMap((i) =>
				Array.from({length: 14}, (_, k) => ({a: {x: TILES_X + i * (TILE + TILE_GAP) + TILE / 2, y: TILE_Y + TILE / 2}, c: {x: gestorCard.x + 40 + random(`gc${i}${k}`) * (gestorCard.w - 80), y: gestorCard.y + 20}, t0: at(M.gestor, 0.2) + random(`gt${i}${k}`) * 26, dur: 26 + random(`gd${i}${k}`) * 8, size: 6 + random(`gz${i}${k}`) * 3, lift: 60 + random(`gl${i}${k}`) * 60, wob: random(`gw${i}${k}`) * 4, depth: 0.2 + random(`gp${i}${k}`) * 0.4}) satisfies GrainSpec),
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const red = ramp(f, b(M.alerta), at(M.alerta, 0.5));
	const stats = spr(f, M.tempoIa) * (1 - ramp(f, b(M.alerta), at(M.alerta, 0.4)));
	return (
		<Stage from={b(M.sete)} to={b(M.email)}>
			{VERIFS.map((v, i) => {
				const k = pop(f, b(M.sete) + i * 5, {damping: 9, stiffness: 160, mass: 0.7});
				const ai = ALERTAS.indexOf(i);
				const flip = ai >= 0 ? ramp(f, b(M.alerta) + ai * 5, b(M.alerta) + ai * 5 + 14, EASE) : 0;
				const isRed = flip > 0.5;
				const x = TILES_X + i * (TILE + TILE_GAP);
				const bob = Math.sin((f + i * 9) / 30) * 4 * Math.min(1, k);
				return (
					<div key={v.nome} style={{position: 'absolute', left: x, top: TILE_Y, width: TILE, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * -220 + bob}px) rotate(${(1 - k) * -18}deg) perspective(800px) rotateY(${flip < 0.5 ? flip * 180 : (flip - 1) * 180}deg)`}}>
						{isRed && <div style={{position: 'absolute', left: TILE / 2, top: -46, transform: 'translateX(-50%)', opacity: red}}><Chip tone="red">alerta</Chip></div>}
						<div style={{width: TILE, height: TILE, borderRadius: 24, display: 'grid', placeItems: 'center', background: isRed ? RED : '#ecfdf3', boxShadow: isRed ? '0 12px 30px rgba(220,38,38,0.3)' : '0 0 0 2px #bbf7d0', transform: `scale(${isRed ? 1 + 0.1 * Math.sin(red * Math.PI) : 1})`}}>
							<Svg d={v.d} color={isRed ? '#fff' : GREEN} size={48} width={2} />
						</div>
						<div style={{marginTop: 16, width: TILE + 40, marginLeft: -20, textAlign: 'center', fontFamily: UI, fontSize: 21, fontWeight: 500, lineHeight: 1.25, color: INK}}>{v.nome}</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 24, opacity: stats}}>
				{[
					['≈ 12 s', 'por atendimento', M.tempoIa],
					['< 1 centavo', 'de IA por atendimento', M.custo],
				].map(([big, small, m]) => {
					const k = spr(f, m as number);
					return (
						<div key={big as string} style={{display: 'flex', alignItems: 'baseline', gap: 12, padding: '16px 28px', borderRadius: 18, background: CARD, boxShadow: SHADOW, opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
							<span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: INK}}>{big}</span>
							<span style={{fontFamily: UI, fontSize: 24, color: INK_SOFT}}>{small}</span>
						</div>
					);
				})}
			</div>
			<GrainCanvas grains={grains} />
			<Card x={gestorCard.x} y={gestorCard.y} w={gestorCard.w} k={spr(f, M.gestor)} style={{display: 'flex', alignItems: 'center', gap: 16}}>
				<Icon d={D.user} bg={ORANGE} />
				<div>
					<div style={{fontFamily: UI, fontSize: 26, fontWeight: 600, color: INK}}>O gestor decide</div>
					<div style={{fontFamily: UI, fontSize: 20, color: INK_SOFT}}>nada é rejeitado automaticamente</div>
				</div>
			</Card>
		</Stage>
	);
};

// ============ 5. O resumo por e-mail e o clique ============
const AtoEmail: React.FC = () => {
	const f = useCurrentFrame();
	const c = at(M.clique, 0.7);
	const dive = ramp(f, c + 4, b(M.lista) + 6, EASE);
	return (
		<Stage from={b(M.email)} to={b(M.lista)} enter="right" exit="dive">
			<AbsoluteFill style={{transform: `scale(${1 + dive * 0.35})`, transformOrigin: '960px 520px'}}>
				<LottieAt src={lottie('email')} at={M.email} x={600} y={150} w={720} h={560} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center', opacity: spr(f, M.soNovo)}}>
					<Chip>só quando há alerta novo</Chip>
				</div>
				<Cursor x={980} y={560} click={c} />
			</AbsoluteFill>
		</Stage>
	);
};

// ============ 6. A lista: 22 de 209 prontos; primeiro o contrato ============
const LISTA_ROWS = [171, 526, 704, 882, 1060, 1238, 1417, 1594, 1772, 1950];
const ROW_EDGES = [229, 407, 585, 763, 940, 1118, 1296, 1474, 1652, 1829, 2007];
const AtoLista: React.FC = () => {
	const f = useCurrentFrame();
	const L0 = b(M.lista);
	const v = viewAt(f, [
		[L0, {fx: 1680, fy: 1040, s: 0.54}],
		[b(M.grave), {fx: 1640, fy: 1060, s: 0.57}],
		[at(M.grave, 1.4), {fx: 1300, fy: 1100, s: 0.74}],
		[b(M.dossie), {fx: 1280, fy: 1110, s: 0.78}],
	]);
	const k = pop(f, b(M.prontos));
	const fill = ramp(f, at(M.prontos, 0.3), at(M.prontos, 1.6), OUT);
	const layers: Layer[] = [
		{r: {x: 0, y: 0, w: 3360, h: 140}, z: 20, at: L0 + 2, from: {y: -200, z: -200, rx: -20}, lift: 0},
		...ROW_EDGES.slice(0, -1).map((y0, i) => ({r: {x: 139, y: y0, w: 3063, h: ROW_EDGES[i + 1] - y0}, z: i === 8 ? 90 : 10 + (i % 2) * 14, at: L0 + 6 + i * 3, from: {y: 260 + i * 10, z: -600, rx: 40, x: (i % 2 ? 1 : -1) * 60}})),
	];
	return (
		<Stage from={L0} to={b(M.dossie)} src={tela('lista')} v={v} enter="dive" base={0} orbit={[16, -14, 6, 10]} layers={<Layers src={tela('lista')} v={v} layers={layers} />}>
			{ROW_EDGES.slice(0, -1).map((y, r) => (r === 0 ? null : <Spot key={y} v={v} r={{x: 1030, y: y + 120 - 22, w: 112, h: 44}} from={at(M.grave, 0.3) + r * 3} to={b(M.dossie)} pad={8} z={20} />))}
			<Card x={1290} y={70} w={560} k={k * (1 - ramp(f, b(M.grave), at(M.grave, 0.5)))} style={{transform: `translateZ(160px) translateY(${(1 - k) * 44}px) rotate(${(1 - k) * -5}deg)`}}>
				<div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
					<Odo value={22 * fill} digits={2} size={72} sep={false} />
					<span style={{fontFamily: UI, fontSize: 28, color: INK_SOFT}}>de 209 prontos para a JBS</span>
				</div>
				<div style={{marginTop: 18, height: 12, borderRadius: 6, background: '#f4e7de'}}>
					<div style={{height: 12, width: `${(22 / 209) * 100 * back(fill)}%`, borderRadius: 6, background: GREEN}} />
				</div>
			</Card>
		</Stage>
	);
};

// ============ 7. O dossiê: contrato vencido ============
const CONTRATO_LINHA: Rect = {x: 2010, y: 850, w: 1300, h: 92};
const AtoDossie: React.FC = () => {
	const f = useCurrentFrame();
	const D0 = b(M.dossie);
	const v = viewAt(f, [
		[D0, {fx: 2420, fy: 560, s: 0.78}],
		[at(M.dossie, 1.2), {fx: 2440, fy: 600, s: 0.8}],
		[b(M.contrato), {fx: 2660, fy: 1000, s: 1.0}],
		[b(M.copia), {fx: 2670, fy: 1005, s: 1.04}],
	]);
	const layers = gaveta(D0, GAVETA_CONTRATO);
	return (
		<Stage from={D0} to={b(M.copia)} src={tela('dossie-contrato')} v={v} enter="fade" base={0.35} blur={0.6 + liftOf(f, b(M.contratoPeca))} orbit={[8, 10, 4, -6]} layers={<Layers src={tela('dossie-contrato')} v={v} layers={layers} />}>
			<Spot v={v} r={{x: 1995, y: 28, w: 480, h: 80}} from={at(M.dossie, 0.7)} to={b(M.contrato)} z={30} />
			<Spot v={v} r={CONTRATO_LINHA} from={at(M.contrato, 0.3)} to={b(M.contratoPeca)} z={70} />
			<Peca v={v} r={CONTRATO_LINHA} peca={b(M.contratoPeca)} width={720} height={320}>
				<CardHeader icon={<Icon d={D.file} bg={RED} />} title="Contrato" chip="alerta alto" />
				<div style={{fontFamily: DISPLAY, fontSize: 52, fontWeight: 700, color: INK, marginTop: 18, lineHeight: 1}}>Contrato vencido</div>
				<div style={{marginTop: 18, display: 'grid', gap: 2}}>
					<KV k="Contrato" v="137/2022 · venceu em 21/09/2025" color="#c2410c" />
					<KV k="Executado em" v="04/08/2026" />
					<KV k="Número no RAT" v="não informado" color="#b91c1c" />
				</div>
			</Peca>
		</Stage>
	);
};

// ============ 8. A cópia: as duas fichas e a comparação lado a lado (a prova) ============
export const WORDS = TIMELINE.texto.split(' ');
export const wordBeat = (i: number) => M.escreve + (i * TIMELINE.escrita) / (WORDS.length - 1);
export const copyBeat = (i: number) => M.copiaChega + (i * TIMELINE.copiaDur) / (WORDS.length - 1);
const CARD_PAD = 40;
const Passage: React.FC<{num: string; label: string; at: (i: number) => number; x: number; y: number; style?: React.CSSProperties; frame?: number}> = ({num, label, at: wat, x, y, style, frame = 1}) => {
	const f = useCurrentFrame();
	const sweep = ramp(f, b(M.copiaMarca), b(M.copiaMarca) + 22, EASE) * WORDS.length;
	const head = ramp(f, b(wat(0)) - 12, b(wat(0)) + 6, OUT);
	return (
		<div style={{position: 'absolute', left: x - CARD_PAD, top: y - CARD_PAD, width: 1240, padding: CARD_PAD, borderRadius: 20, background: `rgba(255,253,251,${frame})`, boxShadow: `0 18px 50px rgba(102,50,17,${0.08 * frame}), 0 0 0 1px rgba(102,50,17,${0.07 * frame})`, ...style}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, height: 36, marginBottom: 20, opacity: head, transform: `translateY(${(1 - head) * 10}px)`}}>
				<Chip>{num}</Chip>
				<span style={{fontFamily: UI, fontSize: 21, fontWeight: 500, color: INK_SOFT}}>{label}</span>
			</div>
			<div style={{fontFamily: UI, fontSize: 46, lineHeight: 1.42, color: INK, letterSpacing: '-0.01em'}}>
				{WORDS.map((w, i) => {
					const u = spr(f, wat(i), {damping: 18, stiffness: 170, mass: 0.6});
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
const A_X = 380;
const A_Y = 262;
const A_LINE = 351;
const B_X = A_X + 44;
const B_Y = 640;
const PUSH = 1.04;
const AtoFichas: React.FC = () => {
	const f = useCurrentFrame();
	const C = b(M.copia);
	const R = b(M.lado);
	if (f < C - 2 || f > R + 16) return null;
	const inn = ramp(f, C, C + 14, OUT);
	const out = ramp(f, R - 2, R + 8, EASE);
	const settle = ramp(f, b(M.copiaChega) - 6, b(M.copiaChega) + 14, OUT);
	const title = spr(f, M.copiaTitulo, {damping: 16, stiffness: 140, mass: 0.8});
	const fast = Math.max(0, 1 - out * 2.2);
	const push = lerp(1, PUSH, ramp(f, C, R, (x) => x));
	return (
		<AbsoluteFill style={{opacity: inn, filter: inn < 0.99 ? `blur(${(1 - inn) * 10}px)` : undefined, transform: `scale(${push})`, transformOrigin: `${A_X}px ${A_LINE}px`}}>
			<div style={{position: 'absolute', left: A_X - CARD_PAD, top: 108, fontFamily: DISPLAY, fontWeight: 600, fontSize: 72, letterSpacing: '-0.01em', color: INK, opacity: title * fast, transform: `translateY(${(1 - title) * 24 - out * 30}px)`}}>
				O mesmo texto. <span style={{color: ORANGE}}>Em duas fazendas.</span>
			</div>
			{f >= b(M.copiaChega) - 10 && <Passage num="#60096" label="Outra propriedade · situação encontrada" at={copyBeat} x={B_X} y={lerp(700, B_Y, settle)} style={{opacity: fast * ramp(f, b(M.copiaChega) - 10, b(M.copiaChega) + 4), transform: `translateX(${out * 260}px) rotate(${0.5 - out * 0.5}deg)`}} />}
			<Passage num="#60290" label="Sítio Taismara · situação encontrada" at={wordBeat} x={A_X} y={lerp(A_Y + 190, A_Y, settle)} frame={1 - out} style={{opacity: 1 - out, transform: `scale(${1 + out * 0.03})`, filter: out > 0.01 ? `blur(${out * 8}px)` : undefined}} />
		</AbsoluteFill>
	);
};
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
const AtoLado: React.FC = () => {
	const f = useCurrentFrame();
	const R = b(M.lado);
	const P = b(M.dispensar);
	const grains = useMemo(() => {
		const out: (GrainSpec & {row: number})[] = [];
		ROWS_L.forEach((L, r) => {
			const n = Math.max(4, Math.round((L.x1 - L.x0) / 55));
			for (let k = 0; k < n; k++) {
				const q = (k + 0.5 + (random(`q${r}-${k}`) - 0.5) * 0.6) / n;
				const Rr = ROWS_R[r];
				const start = M.liga + r * 0.45 + q * 0.5 + random(`s${r}-${k}`) * 0.15;
				out.push({row: r, a: {x: L.x0 + q * (L.x1 - L.x0), y: L.y}, c: {x: Rr.x0 + q * (Rr.x1 - Rr.x0), y: Rr.y}, t0: b(start), dur: 34 + random(`d${r}-${k}`) * 6, size: 6 + random(`z${r}-${k}`) * 3, lift: 70 + r * 14 + random(`l${r}-${k}`) * 30, wob: r * 1.3 + random(`w${r}-${k}`) * 0.8, depth: 0.15 + random(`p${r}-${k}`) * 0.5});
			}
		});
		return out;
	}, []);
	if (f < R - 2 || f > P + 16) return null;
	const u = ramp(f, R, b(M.assenta), EASE);
	const drift = lerp(1, 1.02, ramp(f, b(M.assenta), P, (x) => x));
	const s0 = 1.4 * PUSH;
	const start = viewMatching(206, 1161, A_X, A_LINE, s0);
	const v: View = {fx: lerp(start.fx, 1675, u), fy: lerp(start.fy, 1290, u), s: lerp(s0, 0.6, u ** 0.85) * drift};
	const fade = ramp(f, R + 4, R + 18, OUT);
	const out = ramp(f, P, P + 14, EASE);
	const lit = ROWS_R.map((_, r) => {
		const first = Math.min(...grains.filter((g) => g.row === r).map((g) => g.t0 + g.dur));
		return ramp(f, first - 4, first + 14, OUT);
	});
	return (
		<AbsoluteFill style={{opacity: 1 - out, filter: out > 0.01 ? `blur(${out * 8}px)` : undefined}}>
			<div style={{position: 'absolute', inset: 0, filter: fade < 0.99 ? `blur(${(1 - fade) * 10}px)` : undefined}}>
				<Plano src={tela('comparacao')} v={v} opacity={fade} />
			</div>
			{ROWS_R.map((row, r) => {
				const tl = planoToScreen(v, row.x0 - 8, row.y - 22);
				const br = planoToScreen(v, row.x1 + 8, row.y + 22);
				return <div key={r} style={{position: 'absolute', left: tl.x, top: tl.y, width: br.x - tl.x, height: br.y - tl.y, borderRadius: 4, background: 'rgba(229,96,31,0.16)', boxShadow: `0 0 ${18 * lit[r]}px rgba(229,96,31,0.35)`, opacity: lit[r]}} />;
			})}
			{[
				{num: '#60290', label: 'em análise', x: 206, y: 1548, at: M.assenta - 0.3},
				{num: '#60096', label: 'origem do texto', x: 1814, y: 1508, at: M.assenta},
			].map((c) => {
				const p = planoToScreen(v, c.x, c.y);
				const k = spr(f, c.at);
				return (
					<div key={c.num} style={{position: 'absolute', left: p.x, top: p.y, display: 'flex', alignItems: 'center', gap: 12, opacity: k, transform: `translateY(${(1 - k) * 14}px)`, padding: '8px 16px 8px 10px', borderRadius: 999, background: CARD, boxShadow: '0 8px 24px rgba(102,50,17,0.12), 0 0 0 1px rgba(102,50,17,0.08)'}}>
						<Chip>{c.num}</Chip>
						<span style={{fontFamily: UI, fontSize: 21, fontWeight: 500, color: INK_SOFT}}>{c.label}</span>
					</div>
				);
			})}
			<GrainCanvas grains={grains} map={(p) => planoToScreen(v, p.x, p.y)} />
		</AbsoluteFill>
	);
};

// ============ 9. Dispensar com justificativa; revalidar ============
const DISP_BTN: Rect = {x: 2028, y: 1060, w: 320, h: 86};
const REV_BTN: Rect = {x: 1995, y: 517, w: 218, h: 84};
const AtoDispensar: React.FC = () => {
	const f = useCurrentFrame();
	const v: View = {fx: 2280, fy: 860, s: lerp(1.12, 1.18, ramp(f, b(M.dispensar), b(M.revalidar), (x) => x))};
	const btn = planoToScreen(v, DISP_BTN.x + DISP_BTN.w / 2, DISP_BTN.y + DISP_BTN.h / 2);
	const modal = spr(f, M.dispJust - 0.3) * (1 - ramp(f, b(M.dispOk), at(M.dispOk, 0.4), EASE));
	const ok = spr(f, M.dispOk + 0.2);
	const text = 'Conferido com o técnico na visita de retorno.';
	return (
		<Stage from={b(M.dispensar)} to={b(M.revalidar)} src={tela('dossie-copia')} v={v} enter="down" base={0.35} blur={0.6 + Math.max(modal, ok * 0.6)} orbit={[6, -10, 3, 6]} layers={<Layers src={tela('dossie-copia')} v={v} layers={gaveta(b(M.dispensar), GAVETA_COPIA)} />}>
			<Spot v={v} r={DISP_BTN} from={at(M.dispensar, 0.2)} to={b(M.dispJust)} z={70} />
			<Cursor x={btn.x} y={btn.y} click={b(M.dispClick)} />
			{modal > 0.01 && (
				<>
					<div style={{position: 'absolute', inset: 0, background: PAPER, opacity: modal * 0.5}} />
					<Card x={960 - 380} y={250} w={760} k={modal}>
						<CardHeader icon={<Icon d={D.copy} bg={RED} />} title="Dispensar alerta" chip="cópia e cola" />
						<div style={{fontFamily: UI, fontSize: 22, color: INK_SOFT, marginTop: 22}}>Justificativa</div>
						<div style={{marginTop: 10, minHeight: 96, padding: '14px 18px', borderRadius: 12, border: `2px solid ${ORANGE}`, fontFamily: UI, fontSize: 28, color: INK, lineHeight: 1.35}}>
							{typed(text, f, at(M.dispJust, 0.2), at(M.dispJust, 1.6))}
							<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: ORANGE}}>|</span>
						</div>
						<div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 20}}>
							<span style={{fontFamily: UI, fontSize: 24, fontWeight: 600, color: '#fff', background: ORANGE, borderRadius: 12, padding: '12px 26px', transform: `scale(${f > at(M.dispOk, -0.3) ? 0.94 : 1})`}}>Dispensar</span>
						</div>
					</Card>
				</>
			)}
			{ok > 0.01 && (
				<Card x={960 - 300} y={380} w={600} k={ok} style={{display: 'flex', alignItems: 'center', gap: 16}}>
					<Icon d={D.check} bg={GREEN} />
					<div>
						<div style={{fontFamily: UI, fontSize: 28, fontWeight: 600, color: INK}}>Alerta dispensado</div>
						<div style={{fontFamily: UI, fontSize: 21, color: INK_SOFT}}>com justificativa e registro de quem dispensou</div>
					</div>
				</Card>
			)}
		</Stage>
	);
};
const AtoRevalidar: React.FC = () => {
	const f = useCurrentFrame();
	const v: View = {fx: 2240, fy: 640, s: lerp(1.25, 1.3, ramp(f, b(M.revalidar), b(M.antes), (x) => x))};
	const btn = planoToScreen(v, REV_BTN.x + REV_BTN.w / 2, REV_BTN.y + REV_BTN.h / 2);
	const reading = ramp(f, at(M.revClick, 0.15), at(M.revClick, 0.4)) * (1 - ramp(f, b(M.revOk), at(M.revOk, 0.3)));
	const ok = spr(f, M.revOk);
	const spin = (f * 12) % 360;
	return (
		<Stage from={b(M.revalidar)} to={b(M.antes)} src={tela('dossie-contrato')} v={v} enter="right" base={0.35} blur={0.6 + Math.max(reading, ok) * 0.5} orbit={[4, 8, 8, -8]} layers={<Layers src={tela('dossie-contrato')} v={v} layers={gaveta(b(M.revalidar), GAVETA_CONTRATO)} />}>
			<Spot v={v} r={REV_BTN} from={at(M.revalidar, 0.2)} to={at(M.revClick, 0.3)} z={20} />
			<Cursor x={btn.x} y={btn.y} click={b(M.revClick)} />
			{reading > 0.01 && (
				<Card x={960 - 280} y={400} w={560} k={reading} style={{display: 'flex', alignItems: 'center', gap: 18}}>
					<svg width="44" height="44" viewBox="0 0 44 44" style={{transform: `rotate(${spin}deg)`}}>
						<circle cx="22" cy="22" r="17" fill="none" stroke="#f4e7de" strokeWidth="5" />
						<path d="M22 5 A17 17 0 0 1 39 22" fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
					</svg>
					<span style={{fontFamily: UI, fontSize: 28, fontWeight: 600, color: INK}}>A IA está lendo o RAT de novo</span>
				</Card>
			)}
			{ok > 0.01 && (
				<Card x={960 - 260} y={400} w={520} k={ok} style={{display: 'flex', alignItems: 'center', gap: 16}}>
					<Icon d={D.sync} bg={GREEN} />
					<span style={{fontFamily: UI, fontSize: 28, fontWeight: 600, color: INK}}>Revalidado agora</span>
				</Card>
			)}
		</Stage>
	);
};

// ============ 10. Os atendimentos de antes: técnico, período, prévia; 209 sem falha; a rima com o William ============
const Field: React.FC<{label: string; value: string}> = ({label, value}) => (
	<div style={{flex: 1}}>
		<div style={{fontFamily: UI, fontSize: 20, color: INK_SOFT, marginBottom: 8}}>{label}</div>
		<div style={{height: 60, borderRadius: 12, border: '2px solid #ead9cc', padding: '0 18px', display: 'flex', alignItems: 'center', fontFamily: UI, fontSize: 26, color: INK}}>{value}</div>
	</div>
);
const AtoAntes: React.FC = () => {
	const f = useCurrentFrame();
	const panel = spr(f, M.antes) * (1 - ramp(f, b(M.numeros), at(M.numeros, 0.5), EASE));
	const prev = spr(f, M.previa);
	const g = ramp(f, at(M.numeros, 0.3), at(M.numeros, 0.6));
	const gridOut = ramp(f, b(M.rima), at(M.rima, 0.5), EASE);
	const done = ramp(f, at(M.numeros, 0.8), at(M.numeros, 3.2), (x) => x) * 209;
	const rat = spr(f, M.rima + 0.2, {damping: 18, stiffness: 110, mass: 0.9});
	const ring = ramp(f, b(M.rimaOk), at(M.rimaOk, 0.4));
	return (
		<Stage from={b(M.antes)} to={b(M.cms)}>
			{panel > 0.01 && (
				<Card x={960 - 460} y={250} w={920} k={panel}>
					<CardHeader icon={<Icon d={D.clock} bg={ORANGE} />} title="Validar atendimentos existentes" />
					<div style={{display: 'flex', gap: 22, marginTop: 26}}>
						<Field label="Técnico" value={typed('Todos os técnicos', f, at(M.antes, 1.2), at(M.antes, 1.9))} />
						<Field label="Período" value={typed('01/08/2026 a 30/09/2026', f, at(M.antes, 2.2), at(M.antes, 3.0))} />
					</div>
					<div style={{marginTop: 24, padding: '18px 22px', borderRadius: 14, background: '#fdf0e6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: prev, transform: `translateY(${(1 - prev) * 12}px)`}}>
						<div>
							<div style={{fontFamily: UI, fontSize: 20, color: INK_SOFT}}>Prévia</div>
							<div style={{fontFamily: DISPLAY, fontSize: 44, fontWeight: 700, color: INK}}>209 atendimentos</div>
							<div style={{fontFamily: UI, fontSize: 20, color: INK_SOFT}}>nada roda, e nada é gasto, até confirmar</div>
						</div>
						<span style={{fontFamily: UI, fontSize: 24, fontWeight: 600, color: '#fff', background: ORANGE, borderRadius: 12, padding: '12px 24px'}}>Validar 209</span>
					</div>
				</Card>
			)}
			{g > 0 && (
				<AbsoluteFill style={{opacity: g * (1 - gridOut)}}>
					{Array.from({length: 209}, (_, i) => {
						const c = i % 19;
						const r = Math.floor(i / 19);
						const on = done > i;
						const pk = back(ramp(f, at(M.numeros, 0.2) + (c + r) * 1.2, at(M.numeros, 0.2) + (c + r) * 1.2 + 12));
						const hit = on ? back(ramp(f, at(M.numeros, 0.8) + (i / 209) * s(2.4), at(M.numeros, 0.8) + (i / 209) * s(2.4) + 10)) : 0;
						return <div key={i} style={{position: 'absolute', left: 620 + c * 36, top: 230 + r * 36, width: 22, height: 22, borderRadius: 11, background: on ? ORANGE : '#e9dcd2', transform: `scale(${pk * (0.7 + 0.3 * hit)})`, boxShadow: on ? `0 0 ${10 * (1 - Math.min(1, hit))}px rgba(229,96,31,0.8)` : undefined}} />;
					})}
					<div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', gap: 70}}>
						<div style={{textAlign: 'center'}}>
							<Odo value={done} digits={3} size={92} sep={false} />
							<div style={{fontFamily: UI, fontSize: 26, color: INK_SOFT}}>validados em agosto e setembro</div>
						</div>
						<div style={{textAlign: 'center', opacity: ramp(f, at(M.numeros, 3.0), at(M.numeros, 3.5))}}>
							<div style={{fontFamily: DISPLAY, fontSize: 92, fontWeight: 700, color: GREEN, lineHeight: 1}}>0</div>
							<div style={{fontFamily: UI, fontSize: 26, color: INK_SOFT}}>falhas</div>
						</div>
					</div>
				</AbsoluteFill>
			)}
			{rat > 0.01 && (
				<>
					<RatFicha x={RAT_CX} y={RAT_CY} scale={lerp(0.9, 1, rat)} opacity={rat} produtor="alerta" k={ring} />
					<div style={{position: 'absolute', left: RAT_CX + RZ.produtor.x - 12, top: RAT_CY + RZ.produtor.y - 12, width: RZ.produtor.w + 24, height: RZ.produtor.h + 24, borderRadius: 16, border: `3px solid ${ORANGE}`, opacity: ring, transform: `scale(${lerp(1.12, 1, ring)})`}} />
					<div style={{position: 'absolute', left: RAT_CX + RZ.produtor.x, top: RAT_CY + RZ.produtor.y + RZ.produtor.h + 22, opacity: ring}}>
						<Chip>alerta antes da JBS</Chip>
					</div>
				</>
			)}
		</Stage>
	);
};

// ============ 11. No CMS, sem deploy ============
const HeroChip: React.FC<{text: string; k: number; y?: number}> = ({text, k, y = 120}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
		<div style={{padding: '16px 30px', borderRadius: 999, background: CARD, boxShadow: SHADOW, fontFamily: DISPLAY, fontSize: 40, fontWeight: 600, color: INK}}>{text}</div>
	</div>
);
const CmsShot: React.FC<{src: string; from: number; to: number; v: View; children?: React.ReactNode; blur?: number; layers?: Layer[]; enter?: Dir; exit?: Dir; orbit?: [number, number, number, number]}> = ({src, from, to, v, children, blur = 0, layers, enter, exit, orbit = [10, -12, 4, 8]}) => (
	<Stage from={from} to={to} src={tela(src)} v={v} w={2880} h={1800} blur={layers ? 0.7 + blur : blur} base={layers ? 0.3 : 1} enter={enter} exit={exit} orbit={orbit} layers={layers && <Layers src={tela(src)} w={2880} h={1800} v={v} layers={layers} />}>
		{children}
	</Stage>
);
const REGRA_CHIPS: Rect = {x: 950, y: 600, w: 470, h: 136};
const AtoCms: React.FC = () => {
	const f = useCurrentFrame();
	const vProg = viewAt(f, [
		[b(M.cms), {fx: 1500, fy: 980, s: 0.7}],
		[b(M.liberar), {fx: 1400, fy: 1080, s: 0.78}],
	]);
	const vLib: View = {fx: 1440, fy: 820, s: lerp(1.0, 1.06, ramp(f, b(M.liberar), b(M.modo), (x) => x))};
	const libBtn = planoToScreen(vLib, 1122 + 316, 861 + 42);
	const vModo: View = {fx: 1660, fy: 980, s: lerp(0.95, 1.0, ramp(f, b(M.modo), b(M.verif), (x) => x))};
	const vVer: View = {fx: 1350, fy: 950, s: lerp(0.95, 1.0, ramp(f, b(M.verif), b(M.regua), (x) => x))};
	const vReg: View = {fx: 1640, fy: 820, s: lerp(0.92, 0.98, ramp(f, b(M.regua), b(M.assRef), (x) => x))};
	const mark = lerp(0.55, 0.8, ramp(f, at(M.reguaPeca, 0.3), at(M.reguaPeca, 1.2), EASE));
	const vAss: View = {fx: 1660, fy: 1150, s: lerp(0.86, 0.92, ramp(f, b(M.assRef), b(M.tecnico), (x) => x))};
	const vTec: View = {fx: 1435, fy: 940, s: lerp(0.92, 0.97, ramp(f, b(M.tecnico), b(M.dest), (x) => x))};
	const vDest: View = {fx: 1300, fy: 1120, s: lerp(1.0, 1.05, ramp(f, b(M.dest), b(M.ligar), (x) => x))};
	return (
		<>
			<CmsShot src="cms-programas" from={b(M.cms)} to={b(M.liberar)} v={vProg} enter="zoom" exit="up" layers={[{r: {x: 0, y: 0, w: 700, h: 1800}, z: 0, at: b(M.cms), from: {x: -400, y: 0, z: -100, rx: 0}}, {r: {x: 700, y: 0, w: 2180, h: 170}, z: 20, at: b(M.cms) + 4, from: {y: -150, z: -200, rx: -20}}, {r: {x: 700, y: 360, w: 2180, h: 1100}, z: 30, at: b(M.cms) + 8}, {r: {x: 690, y: 1132, w: 1900, h: 76}, z: 120, at: at(M.cms, 0.6), from: {y: 40, z: -100, rx: 60}}]}>
				<Spot v={vProg} r={{x: 690, y: 1132, w: 1900, h: 76}} from={at(M.cms, 0.6)} z={120} />
				<HeroChip text="Tudo pelo CMS · sem deploy" k={spr(f, M.semDeploy)} />
			</CmsShot>
			<CmsShot src="cms-liberar" from={b(M.liberar)} to={b(M.modo)} v={vLib} enter="down" layers={[...cmsLayers(b(M.liberar), false), {r: {x: 1100, y: 840, w: 680, h: 125}, z: 130, at: at(M.liberar, 2.4), from: {y: 60, z: -150, rx: 50}}]}>
				<HeroChip text="Nasce desligada · só um master libera" k={spr(f, M.liberar + 1.2)} />
				<Spot v={vLib} r={{x: 1122, y: 861, w: 633, h: 84}} from={at(M.liberar, 2.6)} z={130} />
				<Cursor x={libBtn.x} y={libBtn.y} click={b(M.liberarClick)} />
			</CmsShot>
			<CmsShot src="cms-funcionamento" from={b(M.modo)} to={b(M.verif)} v={vModo} enter="right" layers={cmsLayers(b(M.modo), true, [{x: 819, y: 972, w: 828, h: 132}, {x: 1677, y: 972, w: 831, h: 132}])}>
				<Spot v={vModo} r={{x: 819, y: 972, w: 828, h: 132}} from={b(M.silencioso)} to={b(M.ativo)} z={110} />
				<Spot v={vModo} r={{x: 1677, y: 972, w: 831, h: 132}} from={b(M.ativo)} z={110} />
			</CmsShot>
			<CmsShot src="cms-verificacoes-copia" from={b(M.verif)} to={b(M.regua)} v={vVer} enter="right" orbit={[12, 10, 4, -8]} layers={[...cmsLayers(b(M.verif), false), {r: {x: 820, y: 470, w: 1720, h: 270}, z: 70, at: at(M.verif, 0.5), from: {y: 80, z: -300, rx: 40}}, {r: {x: 820, y: 740, w: 1720, h: 500}, z: 100, at: at(M.verif, 0.7), from: {y: 80, z: -300, rx: 40}}, {r: {x: 820, y: 1240, w: 1720, h: 180}, z: 70, at: at(M.verif, 0.9), from: {y: 80, z: -300, rx: 40}}]}>
				<Spot v={vVer} r={{x: 1600, y: 520, w: 300, h: 860}} from={at(M.verif, 0.6)} z={100} />
				<Spot v={vVer} r={{x: 1930, y: 520, w: 360, h: 860}} from={at(M.verif, 1.8)} z={100} />
			</CmsShot>
			<CmsShot src="cms-regras" from={b(M.regua)} to={b(M.assRef)} v={vReg} enter="zoom" blur={liftOf(f, b(M.reguaPeca))} layers={cmsLayers(b(M.regua), false, [{x: 950, y: 600, w: 470, h: 136}])}>
				<Spot v={vReg} r={REGRA_CHIPS} from={at(M.regua, 0.3)} to={b(M.reguaPeca)} z={110} />
				<Peca v={vReg} r={REGRA_CHIPS} peca={b(M.reguaPeca)} width={640} height={300}>
					<CardHeader icon={<Icon d={D.rule} bg={ORANGE} />} title="Cópia e cola · regras" />
					<div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 18}}>
						<span style={{fontFamily: DISPLAY, fontSize: 92, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums', lineHeight: 0.9}}>{Math.round(mark * 100)}%</span>
						<span style={{fontFamily: UI, fontSize: 24, lineHeight: 1.3, color: INK_SOFT}}>
							de semelhança
							<br />
							em 31 dias
						</span>
					</div>
					<Ruler fill={0} mark={mark} label="limiar" />
				</Peca>
			</CmsShot>
			<CmsShot src="cms-assinaturas" from={b(M.assRef)} to={b(M.tecnico)} v={vAss} enter="down" orbit={[14, -10, 6, 10]} layers={[...cmsLayers(b(M.assRef), true), ...[0, 1, 2, 3, 4, 5].map((i) => ({r: {x: 819 + (i % 3) * 560, y: 1155 + Math.floor(i / 3) * 170, w: 550, h: 160}, z: 90 + (i % 3) * 20, at: at(M.assRef, 0.5) + i * 4, from: {y: 120, z: -400, rx: 60, x: ((i % 3) - 1) * 80}}))]}>
				<Spot v={vAss} r={{x: 819, y: 1155, w: 1677, h: 333}} from={at(M.assRef, 0.4)} z={110} />
				<Spot v={vAss} r={{x: 2061, y: 798, w: 411, h: 63}} from={at(M.assRef, 1.8)} z={35} />
			</CmsShot>
			<CmsShot src="cms-modal-tecnico" from={b(M.tecnico)} to={b(M.dest)} v={vTec} enter="zoom" orbit={[8, 12, 4, -8]} layers={[{r: {x: 483, y: 189, w: 1914, h: 160}, z: 60, at: b(M.tecnico) + 2, from: {y: -100, z: -300, rx: -30}}, ...[0, 1, 2, 3, 4].map((i) => ({r: {x: 534 + (i % 3) * 556, y: 372 + Math.floor(i / 3) * 600, w: 540, h: 580}, z: 80 + (i % 3) * 25, at: b(M.tecnico) + 8 + i * 4, from: {y: 160, z: -500, rx: 50, ry: ((i % 3) - 1) * 20}}))]}>
				<Spot v={vTec} r={{x: 534, y: 372, w: 552, h: 570}} from={at(M.tecnico, 0.4)} z={80} />
			</CmsShot>
			<CmsShot src="cms-email" from={b(M.dest)} to={b(M.ligar)} v={vDest} enter="right" layers={cmsLayers(b(M.dest), true, [{x: 820, y: 1000, w: 1740, h: 220}])}>
				<Spot v={vDest} r={{x: 833, y: 1131, w: 488, h: 60}} from={at(M.dest, 0.2)} to={at(M.dest, 1.3)} z={110} />
				<Spot v={vDest} r={{x: 1175, y: 1021, w: 221, h: 80}} from={at(M.dest, 1.3)} z={110} />
			</CmsShot>
		</>
	);
};

// ============ 12. Ligou; o ciclo ============
const AtoLigar: React.FC = () => {
	const f = useCurrentFrame();
	const v: View = {fx: 1470, fy: 640, s: lerp(0.86, 0.9, ramp(f, b(M.ligar), b(M.ciclo), (x) => x))};
	const btn = planoToScreen(v, 2143 + 157, 505 + 41);
	const pill = planoToScreen(v, 508, 609);
	const on = spr(f, M.ligarClick + 0.25);
	return (
		<CmsShot src="cms-verificacoes" from={b(M.ligar)} to={b(M.ciclo)} v={v} enter="down" exit="zoom" layers={cmsLayers(b(M.ligar), true)}>
			<Spot v={v} r={{x: 2143, y: 505, w: 315, h: 82}} from={at(M.ligar, 0.2)} to={b(M.ligarClick)} z={50} />
			<Cursor x={btn.x} y={btn.y} click={b(M.ligarClick)} />
			{on > 0.01 && (
				<div style={{position: 'absolute', left: pill.x - 6, top: pill.y - 6, opacity: on, transform: `scale(${lerp(1.3, 1, on)})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: '#dcfce7', boxShadow: '0 0 0 3px #86efac', fontFamily: UI, fontSize: 26, fontWeight: 700, color: '#15803d'}}>
					<Svg d={D.check} color="#15803d" size={24} width={3} />
					Ligada
				</div>
			)}
		</CmsShot>
	);
};
const CICLO = [
	{label: 'Sincroniza', d: D.sync, m: 'cSync'},
	{label: 'A IA lê', d: D.spark, m: 'cIa'},
	{label: 'Verifica', d: D.check, m: 'cVerif'},
	{label: 'Avisa', d: D.bell, m: 'cAvisa'},
	{label: 'O gestor decide', d: D.user, m: 'cDecide'},
] as const;
const CX = 960;
const CY = 470;
const RX = 560;
const RY = 270;
const nodePos = (i: number, spin = 0) => {
	const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5 + spin;
	return {x: CX + Math.cos(a) * RX, y: CY + Math.sin(a) * RY};
};
const AtoCiclo: React.FC = () => {
	const f = useCurrentFrame();
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const ctx = ref.current?.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, 1920, 1080);
		const drawn = ramp(f, b(M.cSync), at(M.cDecide, 0.6));
		ctx.strokeStyle = 'rgba(229,96,31,0.35)';
		ctx.lineWidth = 3;
		ctx.setLineDash([4, 10]);
		ctx.beginPath();
		ctx.ellipse(CX, CY, RX, RY, 0, -Math.PI / 2, -Math.PI / 2 + drawn * Math.PI * 2);
		ctx.stroke();
		ctx.setLineDash([]);
		// Grãos girando no ciclo depois que ele fecha.
		const run = f - at(M.cDecide, 0.4);
		if (run > 0) {
			for (let i = 0; i < 26; i++) {
				const a = -Math.PI / 2 + ((run * 0.012 + i / 26) % 1) * Math.PI * 2 + run * 0.0024;
				const x = CX + Math.cos(a) * RX;
				const y = CY + Math.sin(a) * RY;
				ctx.fillStyle = `rgba(229,96,31,${0.35 + 0.5 * ((i % 3) / 2)})`;
				ctx.beginPath();
				ctx.arc(x, y, 5 + (i % 3), 0, Math.PI * 2);
				ctx.fill();
			}
		}
	});
	return (
		<Stage from={b(M.ciclo)} to={b(M.final)} enter="zoom" exit="fade">
			<canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: CY - 40, textAlign: 'center', opacity: spr(f, M.ciclo)}}>
				<div style={{fontFamily: DISPLAY, fontSize: 56, fontWeight: 700, color: INK}}>7 verificações</div>
				<div style={{fontFamily: UI, fontSize: 24, color: INK_SOFT}}>em todo atendimento novo</div>
			</div>
			{CICLO.map((n, i) => {
				const p = nodePos(i, Math.max(0, f - at(M.cDecide, 0.6)) * 0.0024);
				const k = pop(f, b(M[n.m]), {damping: 10, stiffness: 180, mass: 0.7});
				return (
					<div key={n.label} style={{position: 'absolute', left: p.x - 150, top: p.y - 44, width: 300, height: 88, borderRadius: 20, background: CARD, boxShadow: SHADOW, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', opacity: Math.min(1, k * 2), transform: `scale(${lerp(0.4, 1, k)}) rotate(${(1 - k) * -14}deg)`}}>
						<Icon d={n.d} bg={i === 4 ? INK : ORANGE} />
						<span style={{fontFamily: UI, fontSize: 28, fontWeight: 600, color: INK, whiteSpace: 'nowrap'}}>{n.label}</span>
					</div>
				);
			})}
		</Stage>
	);
};

// ============ 13. Fecho: os grãos desenham o logo ============
const LOGO = {x: 960 - 290, y: 600, w: 580};
const AtoFinal: React.FC = () => {
	const f = useCurrentFrame();
	const F = b(M.final);
	const L = b(M.logo);
	const grains = useMemo(() => {
		const sample = (paths: string[], color: GrainSpec['color'], n: number, seed: string) =>
			sampleShapePoints(paths, [413, 78], LOGO, n, `${seed}c`).map((c, i) => {
				const a = {x: 760 + random(`${seed}ax${i}`) * 520, y: 440 + random(`${seed}ay${i}`) * 50};
				return {a, c, t0: L - 30 + random(`${seed}t${i}`) * 16, dur: 24 + random(`${seed}d${i}`) * 8, size: 3 + random(`${seed}z${i}`) * 2, lift: 40 + random(`${seed}l${i}`) * 90, wob: random(`${seed}w${i}`) * 20, depth: random(`${seed}p${i}`) * 0.6, color} satisfies GrainSpec;
			});
		return [...sample(PEC_ICON_PATHS, hexToRgbTuple(ORANGE), 260, 'ic'), ...sample(PEC_TEXT_PATHS, hexToRgbTuple(INK), 620, 'tx')];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	if (f < F) return null;
	const up = ramp(f, L - 6, L + 16, EASE);
	const solid = ramp(f, L + 2, L + 16, EASE);
	const end = ramp(f, at(M.logo, 3.4), at(M.logo, 4.2));
	return (
		<AbsoluteFill style={{opacity: 1 - end}}>
			<Headline text="Validação de atendimentos." y={lerp(300, 230, up)} size={88} k={1} at={M.final + 0.2} />
			<Headline text={<span style={{fontFamily: UI, fontWeight: 500, fontSize: 44, color: INK_SOFT}}>O RAT chega, e o erro <span style={{color: ORANGE, fontWeight: 600}}>não passa</span>.</span>} y={lerp(430, 360, up)} k={spr(f, M.final + 2.4)} />
			<div style={{position: 'absolute', left: LOGO.x, top: LOGO.y, opacity: solid}}>
				<PecLogo width={LOGO.w} color={INK} iconColor={ORANGE} />
			</div>
			<GrainCanvas grains={grains} ripples={false} settle={0.35} glow={false} tail={0.02} />
			<div style={{position: 'absolute', left: 960 - 40, bottom: 60, opacity: ramp(f, L + 24, L + 44)}}>
				<IbsLogo width={80} color={INK_SOFT} />
			</div>
		</AbsoluteFill>
	);
};

export const Video: React.FC = () => (
	<VideoProvider timeline={T} brand={BRAND}>
		<AbsoluteFill style={{background: PAPER}}>
			<Paper color={PAPER} />
			<Dust />
			<AtoNumero />
			<AtoRat />
			<AtoTitulo />
			<AtoComo />
			<AtoSete />
			<AtoEmail />
			<AtoLista />
			<AtoDossie />
			<AtoFichas />
			<AtoLado />
			<AtoDispensar />
			<AtoRevalidar />
			<AtoAntes />
			<AtoCms />
			<AtoLigar />
			<AtoCiclo />
			<AtoFinal />
			<Subtitles />
			<Grain amount={0.03} vignette={0} />
		</AbsoluteFill>
	</VideoProvider>
);
