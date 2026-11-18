// Sistema de movimento: o que separa o vídeo profissional do amador (guia, seção "Direção antes de efeito ›
// Movimento"). Interface em camadas 3D (Layers) dentro de um Stage com transição direcional e câmera em órbita,
// contornos que se desenham (Spot), a peça que se ergue da tela (Peca), cursor em arco, cartões com peso, títulos por
// máscara, odômetro, poeira e legendas. Cores e fontes vêm do tema de movimento (MotionProvider), que por padrão sai
// da marca do vídeo. Exemplo completo: src/videos/validacao-atendimentos.
import React, {createContext, useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Img, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Brand} from '../brands';
import {CamProvider, deriva, Rastro, Sombra, trilho, velocityAt} from './corpo';
import {Plano, planoToScreen, type View} from './plano';
import {EASE, lerp, OUT, ramp, useB, useBrand} from './timeline';

// ---------- Tema ----------
export type MotionTheme = {
	/** Tinta do texto principal e tinta suave (rótulos, legendas secundárias). */
	ink: string;
	inkSoft: string;
	/** Cor de ação (contornos, cursor, destaques) e o mesmo em "r,g,b" para transparências. */
	accent: string;
	accentRgb: string;
	alert: string;
	ok: string;
	/** Fundo (papel), cartões e trilho de barras. */
	paper: string;
	card: string;
	track: string;
	/** "r,g,b" das sombras (a tinta da marca, não preto puro). */
	shadowRgb: string;
	display: string;
	ui: string;
	mono: string;
	/** Selos [texto, fundo] por tom. */
	chips: {brand: [string, string]; red: [string, string]; green: [string, string]};
};
const hexRgb = (hex: string) => (hex.match(/\w\w/g) ?? ['0', '0', '0']).map((h) => parseInt(h, 16)).join(',');
/** Tema padrão a partir da marca; cada vídeo pode sobrescrever o que quiser no MotionProvider. */
export const temaDaMarca = (brand: Brand): MotionTheme => ({
	ink: '#1f1b16',
	inkSoft: '#6b6157',
	accent: brand.cores.acentoEscuro,
	accentRgb: hexRgb(brand.cores.acentoEscuro),
	alert: brand.cores.perigo,
	ok: brand.cores.ok,
	paper: brand.cores.papel,
	card: '#fffdfb',
	track: '#efe7df',
	shadowRgb: brand.cores.papelLinha,
	display: brand.fontes.display,
	ui: brand.fontes.ui,
	mono: brand.fontes.mono,
	chips: {brand: [brand.cores.acentoEscuro, `rgba(${hexRgb(brand.cores.acentoEscuro)},0.14)`], red: ['#b91c1c', '#fde8e8'], green: ['#15803d', '#dcfce7']},
});
const MotionCtx = createContext<Partial<MotionTheme> | null>(null);
export const MotionProvider: React.FC<{theme: Partial<MotionTheme>; children: React.ReactNode}> = ({theme, children}) => <MotionCtx.Provider value={theme}>{children}</MotionCtx.Provider>;
/** Tema em uso: o da marca com as trocas do MotionProvider por cima. */
export const useMotion = (): MotionTheme => {
	const brand = useBrand();
	const over = useContext(MotionCtx);
	return useMemo(() => ({...temaDaMarca(brand), ...(over ?? {})}), [brand, over]);
};

// ---------- Curvas e câmera ----------
export type Rect = {x: number; y: number; w: number; h: number};
type SpringCfg = {damping: number; stiffness: number; mass: number};
/** Mola sem limite (deixa o overshoot aparecer) a partir do quadro `from`. */
export const pop = (f: number, from: number, cfg: SpringCfg = {damping: 12, stiffness: 170, mass: 0.7}, fps = 30) => (f < from ? 0 : spring({frame: f - from, fps, config: cfg}));
/** Ease out back: passa um pouco do alvo e volta. */
export const back = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2);
/** Tremor de câmera que decai a partir de `from` (impactos). */
export const shake = (f: number, from: number, amp = 10) => {
	const t = f - from;
	if (t < 0 || t > 20) return {x: 0, y: 0};
	const d = Math.exp(-t / 5) * amp;
	return {x: Math.sin(t * 2.9) * d, y: Math.cos(t * 3.7) * d * 0.6};
};
/**
 * Câmera por chaves [[quadro, View], ...] numa curva só (`trilho` em corpo.tsx): passa pelas chaves sem parar nelas.
 * Para segurar um enquadramento, repita a View em duas chaves seguidas.
 */
export const viewAt = (f: number, keys: [number, View][]): View => trilho(keys)(f);
/** Texto que se digita entre os quadros a e c. */
export const typed = (text: string, f: number, a: number, c: number) => text.slice(0, Math.round(text.length * ramp(f, a, c)));
/** Quanto a peça (Peca) está no centro, 0..1 (para desfocar o fundo). */
export const liftOf = (f: number, peca: number, drop?: number, fps = 30) => Math.min(1, pop(f, peca, {damping: 15, stiffness: 120, mass: 0.9}, fps)) * (drop !== undefined ? 1 - ramp(f, drop, drop + 16, EASE) : 1);

// ---------- Peças pequenas ----------
export const Chip: React.FC<{children: React.ReactNode; tone?: 'brand' | 'red' | 'green'}> = ({children, tone = 'brand'}) => {
	const t = useMotion();
	const [fg, bg] = t.chips[tone];
	return <span style={{fontFamily: t.mono, fontSize: 20, fontWeight: 500, letterSpacing: '0.04em', color: fg, background: bg, borderRadius: 999, padding: '5px 14px', whiteSpace: 'nowrap'}}>{children}</span>;
};
/** Ícone de traço (viewBox 24) a partir de `d` (elementos SVG). */
export const Svg: React.FC<{d: React.ReactNode; color?: string; size?: number; width?: number}> = ({d, color = '#fff', size = 22, width = 2.2}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round">
		{d}
	</svg>
);
export const Icon: React.FC<{d: React.ReactNode; bg: string}> = ({d, bg}) => (
	<span style={{width: 40, height: 40, borderRadius: 10, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0}}>
		<Svg d={d} />
	</span>
);
/** Traços de ícones de interface (viewBox 24) para Icon e Svg. */
export const ICONES = {
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
export const CardHeader: React.FC<{icon: React.ReactNode; title: string; chip?: string; tone?: 'brand' | 'red' | 'green'}> = ({icon, title, chip, tone = 'red'}) => {
	const t = useMotion();
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
			{icon}
			<span style={{fontFamily: t.ui, fontSize: 24, fontWeight: 600, color: t.ink}}>{title}</span>
			{chip && <Chip tone={tone}>{chip}</Chip>}
		</div>
	);
};
/** Régua: preenchimento até `fill` (0..1) e a marca do limiar em `mark` (0..1). */
export const Ruler: React.FC<{fill: number; mark: number; label: string}> = ({fill, mark, label}) => {
	const t = useMotion();
	return (
		<>
			<div style={{marginTop: 26, height: 12, borderRadius: 6, background: t.track, position: 'relative'}}>
				<div style={{position: 'absolute', inset: 0, width: `${fill * 100}%`, borderRadius: 6, background: `linear-gradient(90deg, ${t.accent}, ${t.alert})`}} />
				<div style={{position: 'absolute', left: `${mark * 100}%`, top: -9, width: 3, height: 30, borderRadius: 2, background: t.ink}} />
			</div>
			<div style={{position: 'relative', height: 26, marginTop: 10}}>
				<span style={{position: 'absolute', left: `${mark * 100}%`, transform: 'translateX(-50%)', fontFamily: t.ui, fontSize: 18, fontWeight: 500, color: t.ink, whiteSpace: 'nowrap'}}>{label}</span>
			</div>
		</>
	);
};
/** Linha rótulo/valor. */
export const KV: React.FC<{k: string; v: string; color?: string}> = ({k, v, color}) => {
	const t = useMotion();
	return (
		<div style={{display: 'flex', gap: 18, fontFamily: t.ui, fontSize: 22, lineHeight: 1.5}}>
			<span style={{width: 220, color: t.inkSoft, flexShrink: 0}}>{k}</span>
			<span style={{color: color ?? t.ink, fontWeight: 500}}>{v}</span>
		</div>
	);
};

// ---------- Anotações sobre a captura ----------
/** Contorno que se desenha em volta de um trecho da captura e solta um pulso. `z`: profundidade da camada marcada. */
export const Spot: React.FC<{v: View; r: Rect; from: number; to?: number; pad?: number; z?: number}> = ({v, r, from, to, pad = 10, z = 0}) => {
	const f = useCurrentFrame();
	const t = useMotion();
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
			<div style={{position: 'absolute', left: tl.x - pad, top: tl.y - pad, width: w, height: h, borderRadius: 14, border: `2px solid ${t.accent}`, opacity: (1 - pulse) * 0.7 * (1 - out) * (pulse > 0 ? 1 : 0), transform: `scale(${1 + pulse * 0.14})`}} />
			<svg width={w + 8} height={h + 8} style={{position: 'absolute', left: tl.x - pad - 4, top: tl.y - pad - 4, overflow: 'visible', opacity: 1 - out}}>
				<rect x={4} y={4} width={w} height={h} rx={14} fill={`rgba(${t.accentRgb},${0.07 * draw})`} stroke={t.accent} strokeWidth={3.5} strokeDasharray={perim} strokeDashoffset={perim * (1 - draw)} strokeLinecap="round" />
			</svg>
		</div>
	);
};

/** Cursor que chega em arco ao ponto (tela), afunda no clique e solta uma onda. */
export const Cursor: React.FC<{x: number; y: number; click: number; from?: [number, number]; scale?: number}> = ({x, y, click, from = [x + 300, y + 220], scale = 1}) => {
	const f = useCurrentFrame();
	const t = useMotion();
	if (f < click - 32 || f > click + 30) return null;
	// A mão chega antes do clique (uns 6 quadros), freando, e só então aperta.
	const u = ramp(f, click - 30, click - 6, OUT);
	const cx = from[0] - 40;
	const cy = y - 60;
	const px = (1 - u) ** 2 * from[0] + 2 * (1 - u) * u * cx + u * u * x;
	const py = (1 - u) ** 2 * from[1] + 2 * (1 - u) * u * cy + u * u * y;
	const press = ramp(f, click, click + 16, OUT);
	const squash = f >= click - 1 && f < click + 9 ? lerp(1, 0.84, ramp(f, click - 1, click + 2)) + 0.16 * ramp(f, click + 3, click + 9, OUT) : 1;
	const vis = ramp(f, click - 32, click - 24) * (1 - ramp(f, click + 20, click + 30));
	return (
		<div style={{position: 'absolute', inset: 0, transform: 'translateZ(200px)'}}>
			{f >= click && <div style={{position: 'absolute', left: x - 36 * press * scale, top: y - 36 * press * scale, width: 72 * press * scale, height: 72 * press * scale, borderRadius: '50%', border: `3px solid ${t.accent}`, opacity: 1 - press}} />}
			<svg width="34" height="40" viewBox="0 0 34 40" style={{position: 'absolute', left: px - 4, top: py - 3, opacity: vis, transform: `scale(${squash * scale}) rotate(${(1 - u) * -14}deg)`, transformOrigin: '4px 3px', filter: `drop-shadow(0 6px 10px rgba(${t.shadowRgb},0.3))`}}>
				<path d="M4 3 L4 31 L11.5 24 L17 36 L22 33.5 L16.5 22 L27 21.5 Z" fill={t.ink} stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
			</svg>
		</div>
	);
};

/** A peça que se ergue do trecho `r` (na captura) em 3D e vai ao centro da tela; `drop` a devolve. */
export const Peca: React.FC<{v: View; r: Rect; peca: number; drop?: number; width?: number; height?: number; centerY?: number; children: React.ReactNode}> = ({v, r, peca, drop, width = 660, height = 320, centerY = 470, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = useMotion();
	const lift = f < peca ? 0 : pop(f, peca, {damping: 13, stiffness: 120, mass: 0.9}, fps) * (drop !== undefined ? 1 - ramp(f, drop, drop + 16, EASE) : 1);
	if (lift <= 0.005) return null;
	const L = Math.min(1, lift);
	const tl = planoToScreen(v, r.x, r.y);
	const fl = Math.sin(((f - peca) / 50) * Math.PI) * 4 * L;
	return (
		<div style={{position: 'absolute', inset: 0, transform: 'translateZ(220px)', transformStyle: 'preserve-3d'}}>
			<div style={{position: 'absolute', inset: -400, background: t.paper, opacity: L * 0.5}} />
			<div style={{position: 'absolute', left: lerp(tl.x - 12, 960 - width / 2, Math.min(1.06, lift)), top: lerp(tl.y - height * 0.4, centerY - height / 2, Math.min(1.06, lift)) + fl, width, padding: '26px 32px 30px', borderRadius: 24, background: t.card, boxShadow: `0 ${2 + L * 6}px ${6 + L * 12}px rgba(${t.shadowRgb},0.06), 0 ${10 + L * 40}px ${30 + L * 90}px rgba(${t.shadowRgb},${0.08 + L * 0.16}), 0 0 0 1px rgba(${t.shadowRgb},0.07)`, opacity: Math.min(1, lift * 2), transform: `perspective(1400px) rotateX(${(1 - L) * 62}deg) rotateZ(${(1 - L) * -4}deg) scale(${lerp(0.82, 1.12, lift)})`, transformOrigin: '50% 100%'}}>
				{children}
			</div>
		</div>
	);
};

// ---------- Cenas ----------
/** Órbita das cenas ilustradas quando o vídeo não define outra: a câmera nunca para. */
const ORBITA_ILUSTRADA: [number, number, number, number] = [3, -6, 1.5, 5];
/** Escala em que a cena ilustrada é desenhada; a câmera só reduz a partir dela, então o texto não borra no zoom. */
const ZOOM_MAX = 1.7;
/**
 * Enquadramento de uma cena ilustrada de 1920×1080: o ponto (fx, fy) vai para o centro do quadro na escala `s`
 * (até 1,7). A cena é desenhada grande com `zoom` e a transformação só reduz (ver "Armadilhas" no guia).
 */
export const Enquadre: React.FC<{v?: View; children: React.ReactNode}> = ({v, children}) => {
	if (!v) return <>{children}</>;
	const k = Math.min(ZOOM_MAX, v.s);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920 * ZOOM_MAX, height: 1080 * ZOOM_MAX, transformOrigin: '0 0', transformStyle: 'preserve-3d', transform: `translate(${960 - v.fx * k}px, ${540 - v.fy * k}px) scale(${k / ZOOM_MAX})`}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, zoom: ZOOM_MAX, transformStyle: 'preserve-3d'}}>{children}</div>
		</div>
	);
};
export type Dir = 'left' | 'right' | 'up' | 'down' | 'zoom' | 'dive' | 'fade' | 'cut';
const DIRV: Record<string, [number, number]> = {left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1]};
/**
 * Bloco com transição de entrada e saída. `enter` é o lado de onde vem; `exit`, o lado para onde vai; o desfoque
 * acompanha a velocidade (efeito chicote). Com `src` e `v`, a captura real e as camadas (`layers`) ficam num plano 3D
 * que entra inclinado, assenta e orbita (`orbit` = [rx0, ry0, rx1, ry1] ao longo da cena); as anotações (`children`)
 * ficam num segundo plano com a mesma rotação, sempre por cima das camadas.
 * Sem `src` (cena ilustrada), o conteúdo ganha a mesma câmera 3D, com uma órbita padrão, e `foco` enquadra o
 * assunto: uma View em px da cena. Melhor ainda, passe `trilho` (chaves [[quadro, View], ...]): a câmera percorre
 * as chaves numa curva contínua, inclina nas curvas, desfoca na direção do movimento quando corre, e as peças em
  * `Prof` (corpo.tsx) ganham paralaxe e atraso em relação a ela.
 * Para trocar de tela sem dissolvência (abas de um mesmo modal), emende as cenas com `exit="cut"` e `cutIn`, a
 * mesma câmera (`camAt`) e o mesmo `orbitSpan`: só o conteúdo troca, o enquadramento segue.
 */
export const Stage: React.FC<{from: number; to: number; src?: string; v?: View; w?: number; h?: number; cutIn?: boolean; enter?: Dir; exit?: Dir; blur?: number; orbit?: [number, number, number, number]; base?: number; layers?: React.ReactNode; foco?: View; trilho?: [number, View][]; camAt?: (f: number) => View; orbitSpan?: [number, number]; children?: React.ReactNode}> = ({from, to, src, v, w, h, cutIn, enter = 'right', exit = 'left', blur = 0, orbit: orbitIn, base = 1, layers, foco: focoIn, trilho: chaves, camAt: camIn, orbitSpan, children}) => {
	const f = useCurrentFrame();
	// Saída em corte seco some no próprio quadro (a cena seguinte assume o mesmo enquadramento).
	if (f < from - 2 || f > to + 18 || (exit === 'cut' && f >= to) || (cutIn && f < from)) return null;
	const orbit = orbitIn ?? (src ? undefined : ORBITA_ILUSTRADA);
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
	const settle = ent === 'cut' ? 0 : 1 - ramp(f, from, from + 40, OUT);
	// `orbitSpan` estende a órbita por várias cenas emendadas em corte, para a câmera não recomeçar em cada uma.
	const o = orbitSpan ? ramp(f, orbitSpan[0], orbitSpan[1], (x) => x) : ramp(f, from, to + 16, (x) => x);
	// A órbita acelera e freia (não é uma rampa reta) e a câmera respira numa deriva que não se repete.
	const oe = o * o * (3 - 2 * o);
	const rx = settle * 12 + deriva(f, 1) * 1.3 + (orbit ? lerp(orbit[0], orbit[2], oe) : 0);
	const ry = settle * -9 + deriva(f, 2) * 1.8 + (orbit ? lerp(orbit[1], orbit[3], oe) : 0);
	const dx = deriva(f, 3) * 10;
	const camAt = camIn ?? (chaves ? trilho(chaves) : undefined);
	const foco = camAt && !src ? camAt(f) : focoIn;
	// Velocidade da câmera na tela: inclina nas curvas (como quem vira o corpo) e vira desfoque quando corre.
	const vel = camAt
		? velocityAt((g) => {
				const c = camAt(g);
				return {x: -c.fx * c.s, y: -c.fy * c.s};
			}, f)
		: {vx: 0, vy: 0, speed: 0};
	const bank = Math.max(-1.6, Math.min(1.6, vel.vx * -0.04));
	const cam: React.CSSProperties = {transform: `translateX(${dx}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${bank}deg)`, transformOrigin: '50% 50%', transformStyle: 'preserve-3d'};
	// Chicote: desfoque só no eixo do movimento. Entrada por zoom ou mergulho continua com desfoque redondo.
	const eixo = DIRV[ent] && vin > 0.001 ? DIRV[ent] : DIRV[exit] && out > 0.001 ? DIRV[exit] : null;
	return (
		<AbsoluteFill style={{opacity: op, transform: `translate(${tx}px, ${ty}px) scale(${sc})`, filter: mb > 0.3 && !eixo ? `blur(${mb}px)` : undefined}}>
			<Rastro vx={eixo ? eixo[0] * mb * 3 : 0} vy={eixo ? eixo[1] * mb * 3 : 0} coef={1 / 3} max={40} piso={1}>
			{src && v ? (
				<CamProvider at={camAt ?? (() => v)}>
					<Rastro vx={vel.vx} vy={vel.vy}>
						<AbsoluteFill style={{perspective: 2400}}>
							<AbsoluteFill style={cam}>
								{base > 0 && (
								<div style={{position: 'absolute', inset: 0, opacity: base, filter: blur > 0.01 ? `blur(${blur * 5}px)` : undefined}}>
									<Plano src={src} v={v} w={w} h={h} />
								</div>
							)}
							{layers}
						</AbsoluteFill>
					</AbsoluteFill>
					<AbsoluteFill style={{perspective: 2400}}>
							<AbsoluteFill style={cam}>{children}</AbsoluteFill>
						</AbsoluteFill>
					</Rastro>
				</CamProvider>
			) : (
				<Rastro vx={vel.vx} vy={vel.vy}>
					<AbsoluteFill style={{perspective: 1500}}>
						<AbsoluteFill style={cam}>
							<CamProvider at={camAt ?? (() => foco ?? {fx: 960, fy: 540, s: 1})}>
								<Enquadre v={foco}>{children}</Enquadre>
							</CamProvider>
						</AbsoluteFill>
					</AbsoluteFill>
				</Rastro>
			)}
			</Rastro>
		</AbsoluteFill>
	);
};

/**
 * Interface em camadas: recortes da captura (`r`, em px dela) viram peças no espaço 3D, cada uma na sua profundidade
  * `z`, entrando em sequência a partir de `at` (quadro), vindas de `from`. Passe como `layers` de um Stage com órbita.
 * As camadas não seguem a câmera com atraso: contornos (`Spot`) e remendos ficam ancorados na captura, e um atraso
 * os descolaria dela durante o movimento (aconteceu na Validação: um remendo deixou aparecer o texto de baixo).
 */
export type Layer = {r: Rect; z: number; at: number; from?: {x?: number; y?: number; z?: number; rx?: number; ry?: number}; lift?: number};
export const Layers: React.FC<{src: string; w?: number; h?: number; v: View; layers: Layer[]; radius?: number}> = ({src, w = 3360, h = 2100, v, layers, radius = 12}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = useMotion();
	return (
		<AbsoluteFill style={{transformStyle: 'preserve-3d'}}>
			{layers.map((L, i) => {
				const k = pop(f, L.at, {damping: 15, stiffness: 120, mass: 0.85}, fps);
				if (k <= 0.001) return null;
				const tl = planoToScreen(v, L.r.x, L.r.y);
				const fr = L.from ?? {};
				const u = 1 - k;
				const z = L.z * Math.min(1.2, k) + u * (fr.z ?? -500) + (L.lift ?? 0);
				return (
					<div key={i} style={{position: 'absolute', left: tl.x, top: tl.y, width: L.r.w * v.s, height: L.r.h * v.s, overflow: 'hidden', borderRadius: radius * v.s, opacity: Math.min(1, k * 2.2), boxShadow: `0 ${12 + z * 0.12}px ${30 + z * 0.3}px rgba(${t.shadowRgb},${0.1 + Math.max(0, z) * 0.0012}), 0 0 0 1px rgba(${t.shadowRgb},0.06)`, transform: `translate3d(${u * (fr.x ?? 0)}px, ${u * (fr.y ?? 160)}px, ${z}px) rotateX(${u * (fr.rx ?? 24)}deg) rotateY(${u * (fr.ry ?? 0)}deg)`, background: '#fff'}}>
						<Img src={staticFile(src)} style={{position: 'absolute', left: -L.r.x * v.s, top: -L.r.y * v.s, width: w * v.s, height: h * v.s, maxWidth: 'none'}} />
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/** Cartão com peso: entra com antecipação e rotação que assenta, a sombra cresce, e depois flutua. */
export const Card: React.FC<{x: number; y: number; w: number; h?: number; k?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x, y, w, h, k = 1, style, children}) => {
	const f = useCurrentFrame();
	const t = useMotion();
	const c = Math.min(1, k);
	const fl = Math.sin((f + x * 0.37) / 46) * 3 * c;
	// A sombra fica no papel: cresce e amolece enquanto o cartão está alto e firma quando ele pousa.
	const alto = 0.22 + (1 - c) * 0.9 - fl * 0.02;
	return (
		<>
			{h !== undefined && <Sombra x={x} y={y} w={w} h={h} lift={alto} rgb={t.shadowRgb} opacity={c} />}
			<div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: '26px 30px', borderRadius: 22, background: t.card, boxShadow: h !== undefined ? `0 0 0 1px rgba(${t.shadowRgb},0.07)` : `0 ${6 + c * 14}px ${20 + c * 40}px rgba(${t.shadowRgb},${0.04 + c * 0.08}), 0 0 0 1px rgba(${t.shadowRgb},0.07)`, opacity: c, transform: `translateY(${(1 - k) * 44 + fl}px) rotate(${(1 - k) * -5}deg) scale(${lerp(0.88, 1, k)})`, ...style}}>
				{children}
			</div>
		</>
	);
};

/** Título centrado. Com `at` (tempo da música) e texto simples, cada palavra sobe de dentro de uma máscara. */
export const Headline: React.FC<{text: React.ReactNode; y: number; size?: number; k: number; at?: number; color?: string; font?: string; weight?: number}> = ({text, y, size = 64, k, at, color, font, weight = 600}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const b = useB();
	const t = useMotion();
	const base: React.CSSProperties = {position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: font ?? t.display, fontWeight: weight, fontSize: size, color: color ?? t.ink, letterSpacing: '-0.01em'};
	if (typeof text === 'string' && at !== undefined) {
		return (
			<div style={base}>
				{text.split(' ').map((wd, i) => {
					const u = pop(f, b(at) + i * 3, {damping: 15, stiffness: 150, mass: 0.7}, fps);
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

/**
 * Odômetro: cada casa só gira quando a de baixo vira, como num contador mecânico. `digits` fixa o número de casas
 * inteiras (sem ele, cresce com o valor a partir de `minInt`); `decimals` mostra casas depois da vírgula; `sep` põe
 * o ponto de milhar.
 */
export const Odo: React.FC<{value: number; size: number; digits?: number; decimals?: number; minInt?: number; color?: string; sep?: boolean; style?: React.CSSProperties}> = ({value, size, digits, decimals = 0, minInt = 1, color, sep = true, style}) => {
	const t = useMotion();
	const lh = size * 1.02;
	const v = Math.max(0, value) * 10 ** decimals;
	const ints = digits ?? Math.max(minInt, String(Math.floor(Math.max(0, value))).length);
	const total = ints + decimals;
	const cols = Array.from({length: total}, (_, i) => total - 1 - i);
	return (
		<span style={{display: 'inline-flex', fontFamily: t.display, fontWeight: 700, fontSize: size, color: color ?? t.ink, lineHeight: `${lh}px`, height: lh, overflow: 'hidden', fontVariantNumeric: 'tabular-nums', ...style}}>
			{cols.map((p) => {
				const q = v / 10 ** p;
				const frac = q % 1;
				const pos = p === 0 ? q % 10 : (Math.floor(q) % 10) + Math.max(0, (frac - 0.9) / 0.1);
				const hide = p >= decimals + minInt && Math.floor(q) === 0;
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
						{sep && p === decimals + 3 && <span>.</span>}
						{decimals > 0 && p === decimals && <span>,</span>}
					</React.Fragment>
				);
			})}
		</span>
	);
};

/** Poeira de fundo: grãos lentos que dão vida ao papel. */
export const Dust: React.FC<{count?: number}> = ({count = 46}) => {
	const f = useCurrentFrame();
	const t = useMotion();
	const ref = useRef<HTMLCanvasElement>(null);
	const pts = useMemo(() => Array.from({length: count}, (_, i) => ({x: random(`dx${i}`) * 1920, y: random(`dy${i}`) * 1080, r: 1.5 + random(`dr${i}`) * 2.5, s: 0.15 + random(`ds${i}`) * 0.35, ph: random(`dp${i}`) * 6.28, o: i % 4 === 0})), [count]);
	useLayoutEffect(() => {
		const ctx = ref.current?.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, 1920, 1080);
		for (const p of pts) {
			const x = (p.x + f * p.s * 1.4 + Math.sin(f / 60 + p.ph) * 12) % 1940;
			const y = (p.y - f * p.s * 0.6 + 1080 * 4) % 1100;
			ctx.fillStyle = p.o ? `rgba(${t.accentRgb},0.16)` : `rgba(${hexRgb(t.inkSoft)},0.12)`;
			ctx.beginPath();
			ctx.arc(x, y, p.r, 0, Math.PI * 2);
			ctx.fill();
		}
	});
	return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />;
};

/** Legendas da narração: [início, fim, texto] em segundos. */
/** Legenda de 56 px, em até duas linhas (a caixa encolhe até o texto quebrado). Ocupa os ~200 px de baixo: enquadre o assunto acima disso. */
export const Legendas: React.FC<{itens: [number, number, string][]; bottom?: number}> = ({itens, bottom = 36}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = useMotion();
	const sec = f / fps;
	const cur = itens.find(([ini, fim]) => sec >= ini - 0.15 && sec <= fim + 0.35);
	if (!cur) return null;
	const [ini, fim, text] = cur;
	const k = ramp(sec, ini - 0.15, ini + 0.05) * (1 - ramp(sec, fim + 0.15, fim + 0.35));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', opacity: k}}>
			<div style={{maxWidth: text.length > 42 ? Math.min(1600, text.length * 15.5 + 150) : 1600, padding: '12px 32px', borderRadius: 18, textWrap: 'balance', background: t.card, boxShadow: `0 8px 24px rgba(${t.shadowRgb},0.12), 0 0 0 1px rgba(${t.shadowRgb},0.06)`, fontFamily: t.ui, fontSize: 56, fontWeight: 500, lineHeight: 1.18, color: t.ink, textAlign: 'center'}}>{text}</div>
		</div>
	);
};
