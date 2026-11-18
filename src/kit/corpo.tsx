// Corpo e câmera: o que separa uma peça animada de uma peça que parece existir.
// Tudo aqui é função pura do quadro (o Remotion renderiza quadros fora de ordem): nada acumula estado.
// - trilho: câmera em curva contínua por chaves (não para em cada chave, só onde duas chaves repetem o valor);
// - velocidade, atraso e assentamento derivados da própria trajetória (desfoque, inclinação, arrasto);
// - Prof: profundidade real numa cena ilustrada (paralaxe com a câmera, atraso e fora de foco);
// - Sombra: a sombra fica na mesa enquanto a peça sobe; pouso: o amasso de quem chega com peso;
// - Rastro: desfoque na direção do movimento, com teto baixo para interface clara.
import React, {createContext, useContext, useId} from 'react';
import {useCurrentFrame} from 'remotion';
import type {View} from './plano';

// ---------- Curvas ----------
/** Interpolação cúbica monótona (Fritsch–Carlson): passa pelas chaves sem parar nelas e sem passar do valor. */
export const spline = (keys: [number, number][]) => {
	const n = keys.length;
	const xs = keys.map((k) => k[0]);
	const ys = keys.map((k) => k[1]);
	if (n === 1) return () => ys[0];
	for (let i = 1; i < n; i++) if (xs[i] <= xs[i - 1]) throw new Error(`Chaves fora de ordem: ${xs[i - 1]} e depois ${xs[i]} (os quadros precisam crescer).`);
	const d: number[] = [];
	const m: number[] = new Array(n).fill(0);
	for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
	// As pontas chegam e saem em repouso: a cena começa e termina assentada.
	for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
	for (let i = 0; i < n - 1; i++) {
		if (d[i] === 0) {
			m[i] = 0;
			m[i + 1] = 0;
			continue;
		}
		const a = m[i] / d[i];
		const c = m[i + 1] / d[i];
		const s = a * a + c * c;
		if (s > 9) {
			const k = 3 / Math.sqrt(s);
			m[i] = k * a * d[i];
			m[i + 1] = k * c * d[i];
		}
	}
	return (x: number) => {
		if (x <= xs[0]) return ys[0];
		if (x >= xs[n - 1]) return ys[n - 1];
		let i = 0;
		while (x > xs[i + 1]) i++;
		const h = xs[i + 1] - xs[i];
		const u = (x - xs[i]) / h;
		const u2 = u * u;
		const u3 = u2 * u;
		return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
	};
};

/**
 * Câmera por chaves [[quadro, View], ...] numa curva só: a velocidade é contínua de uma chave para a outra, então a
 * câmera passa pelos pontos em vez de parar em cada um. Para segurar um enquadramento, repita a View em duas chaves.
 * A escala é interpolada em log (um zoom de 1 para 2 tem o mesmo peso que de 2 para 4).
 */
export const trilho = (keys: [number, View][]) => {
	const fx = spline(keys.map(([t, v]) => [t, v.fx]));
	const fy = spline(keys.map(([t, v]) => [t, v.fy]));
	const ls = spline(keys.map(([t, v]) => [t, Math.log(v.s)]));
	return (f: number): View => ({fx: fx(f), fy: fy(f), s: Math.exp(ls(f))});
};

/** Velocidade de uma trajetória pura por diferença central (px por quadro), para desfoque, estica e inclinação. */
export const velocityAt = (posAt: (f: number) => {x: number; y: number}, f: number, dt = 0.5) => {
	const a = posAt(f - dt);
	const c = posAt(f + dt);
	const vx = (c.x - a.x) / (2 * dt);
	const vy = (c.y - a.y) / (2 * dt);
	return {vx, vy, speed: Math.hypot(vx, vy)};
};

/** Oscilação amortecida depois de um impacto (t em quadros): multiplique pela amplitude de pico. */
export const dampedSettle = (t: number, freq = 0.1, damping = 0.15) => (t <= 0 ? 0 : Math.exp(-damping * t) * Math.sin(2 * Math.PI * freq * t));

/** Deriva orgânica: senos em frequências que não se repetem juntas. Devolve −1..1; `k` separa os eixos. */
export const deriva = (f: number, k = 0) => (Math.sin(f * 0.021 + k * 1.7) + 0.6 * Math.sin(f * 0.047 + k * 3.1 + 1.3) + 0.35 * Math.sin(f * 0.083 + k * 5.3 + 2.1)) / 1.95;

/**
 * Amasso de quem pousa com peso em `at` (quadro): achata por 2 quadros e volta numa mola curta. `forca` 0,06 é uma
 * peça leve; 0,2 é uma queda. Devolve as escalas para `scale(sx, sy)` com a origem na base da peça.
 */
export const pouso = (f: number, at: number, forca = 0.1) => {
	const t = f - at;
	if (t < 0 || t > 24) return {sx: 1, sy: 1};
	const q = t < 2 ? forca * ((t + 1) / 2) : forca * Math.exp(-(t - 2) / 2.6) * Math.cos((t - 2) * 0.95);
	return {sx: 1 + q, sy: 1 - q};
};

/** Estica na direção do movimento a partir da velocidade (px por quadro): 1 parado, até `max` no pico. */
export const estica = (speed: number, max = 1.18, cheio = 60) => 1 + (max - 1) * Math.min(1, speed / cheio);

// ---------- Câmera da cena (para as peças saberem onde ela está e onde estava) ----------
type Cam = {at: (f: number) => View};
const CamCtx = createContext<Cam | null>(null);
export const CamProvider: React.FC<{at: (f: number) => View; children: React.ReactNode}> = ({at, children}) => <CamCtx.Provider value={{at}}>{children}</CamCtx.Provider>;
export const useCam = () => useContext(CamCtx);

/**
 * Profundidade numa cena ilustrada. `z` em px para perto da câmera (rótulos e peças em destaque: 40 a 160; fundo:
 * negativo): com a câmera em 3D, o que está mais perto anda mais, e isso é a paralaxe. `lag` (quadros) faz a peça
 * seguir a câmera com atraso, como algo preso por um fio. `fora` (0..1) tira a peça de foco: desfoca e perde cor,
 * para o olho ir ao que está sendo lido. Nunca use `fora` em texto que precisa ser lido.
 */
export const Prof: React.FC<{z?: number; lag?: number; fora?: number; children: React.ReactNode}> = ({z = 0, lag = 0, fora = 0, children}) => {
	const f = useCurrentFrame();
	const cam = useCam();
	let dx = 0;
	let dy = 0;
	if (cam && lag > 0) {
		const now = cam.at(f);
		const then = cam.at(f - lag);
		dx = now.fx - then.fx;
		dy = now.fy - then.fy;
	}
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformStyle: 'preserve-3d', transform: `translate3d(${dx}px, ${dy}px, ${z}px)`, filter: fora > 0.02 ? `blur(${fora * 7}px) saturate(${1 - fora * 0.35})` : undefined, opacity: 1 - fora * 0.25, pointerEvents: 'none'}}>
			{children}
		</div>
	);
};

/**
 * Sombra de contato: fica no papel (z = 0) enquanto a peça sobe. `lift` 0..1 é a altura; com ela a sombra cresce,
 * amolece, clareia e escorrega para longe da luz. A peça em si não leva `box-shadow`: sombra presa à peça não prova
 * que ela saiu do chão.
 */
export const Sombra: React.FC<{x: number; y: number; w: number; h: number; lift: number; radius?: number; rgb?: string; opacity?: number}> = ({x, y, w, h, lift, radius = 22, rgb = '102,50,17', opacity = 1}) => {
	const L = Math.max(0, Math.min(1.3, lift));
	const base: React.CSSProperties = {position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius};
	return (
		<>
			{/* Sombra ambiente: larga e suave, mais presente quanto mais alto. */}
			<div style={{...base, background: `rgba(${rgb},${(0.07 + L * 0.1) * opacity})`, filter: `blur(${16 + L * 38}px)`, transform: `translate(${L * 14}px, ${10 + L * 44}px) scale(${1 + L * 0.05})`}} />
			{/* Núcleo de contato: nítido e escuro no chão, some quando a peça sobe. */}
			<div style={{...base, background: `rgba(${rgb},${(0.26 - L * 0.16) * opacity})`, filter: `blur(${3 + L * 20}px)`, transform: `translate(${L * 6}px, ${3 + L * 16}px) scale(${1 - L * 0.03})`}} />
		</>
	);
};

/**
 * Desfoque na direção do movimento. `vx`, `vy` em px por quadro. Abaixo de `piso` não há filtro; `coef` converte
 * velocidade em desfoque e `max` é o teto (8 px num voo de câmera sobre interface clara; 30 no scroll; 64 no chicote:
 * acima do teto o texto lê como fora de foco). Um filtro por eixo, na direção dominante.
 */
export const Rastro: React.FC<{vx: number; vy: number; coef?: number; max?: number; piso?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({vx, vy, coef = 0.09, max = 8, piso = 8, children, style}) => {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const sx = Math.abs(vx) < piso ? 0 : Math.min(max, Math.abs(vx) * coef);
	const sy = Math.abs(vy) < piso ? 0 : Math.min(max, Math.abs(vy) * coef);
	const on = sx > 0.3 || sy > 0.3;
	return (
		<div style={{position: 'absolute', inset: 0, ...style, filter: on ? `url(#${id})` : undefined}}>
			{on && (
				<svg width="0" height="0" style={{position: 'absolute'}}>
					<filter id={id} x="-100%" y="-100%" width="300%" height="300%">
						<feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
					</filter>
				</svg>
			)}
			{children}
		</div>
	);
};
