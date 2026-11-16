// Tempo do vídeo em tempos de música. Cada vídeo tem um timeline.json (fps, bpm, beat em quadros, marcos em
// tempos) lido pela imagem, pela trilha e pela narração. `createTimeline` devolve os ajudantes já presos ao
// beat do vídeo; `VideoProvider` entrega beat e marca para os componentes do kit.
import React, {createContext, useContext} from 'react';
import {Easing, interpolate, spring} from 'remotion';
import type {Brand} from '../brands';

export type TimelineJson = {fps: number; width: number; height: number; bpm: number; beat: number; scenes: {id: string; duration: number}[]; transitions: unknown[]; marks: Record<string, number>};

export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN = Easing.bezier(0.55, 0, 1, 0.45);
export const POP = {damping: 11, stiffness: 170, mass: 0.7};
export const SOFT = {damping: 20, stiffness: 90, mass: 1};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (a: number, c: number, u: number) => a + (c - a) * u;
/** 0..1 entre os quadros a e c. */
export const ramp = (f: number, a: number, c: number, easing?: (x: number) => number) => interpolate(f, [a, c], [0, 1], {...clamp, easing});

/** Câmera sobre a janela do app: (x, y) em px do app vão para o centro do quadro; z é o zoom. */
export type Cam = {x: number; y: number; z: number; rx?: number; ry?: number; rz?: number};
/** Escala da janela de 1440 px de largura no quadro de 1920. */
export const S = 1920 / 1440;
export const toScreen = (c: Cam, x: number, y: number) => ({x: 960 + (x - c.x) * S * c.z, y: 540 + (y - c.y) * S * c.z});

export const createTimeline = <M extends Record<string, number>>(tl: TimelineJson & {marks: M}) => {
	const b = (beat: number) => Math.round(beat * tl.beat);
	const TOTAL = tl.scenes.reduce((a, s) => a + s.duration, 0);
	/** Mola a partir de um tempo. */
	const sp = (f: number, at: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {damping: 15, stiffness: 130, mass: 0.8}) => spring({frame: f - b(at), fps: tl.fps, config: cfg});
	/** Entrada de camada: sobe, cresce e perde o desfoque. */
	const enter = (f: number, at: number, o: {y?: number; x?: number; s?: number; blur?: number} = {}) => {
		const k = sp(f, at);
		const u = Math.min(1, k);
		return {opacity: u, transform: `translate(${(1 - k) * (o.x ?? 0)}px, ${(1 - k) * (o.y ?? 24)}px) scale(${lerp(o.s ?? 0.96, 1, k)})`, filter: u < 0.99 ? `blur(${(1 - u) * (o.blur ?? 8)}px)` : undefined} as const;
	};
	/** Curva por chaves [[tempo, valor], ...] (tempos crescentes). */
	const curve = (f: number, keys: [number, number][], easing = EASE) => {
		if (f <= b(keys[0][0])) return keys[0][1];
		for (let i = 1; i < keys.length; i++) if (f < b(keys[i][0])) return lerp(keys[i - 1][1], keys[i][1], ramp(f, b(keys[i - 1][0]), b(keys[i][0]), easing));
		return keys[keys.length - 1][1];
	};
	/** Câmera por chaves [[tempo, Cam], ...] (tempos crescentes; o movimento acontece entre uma chave e a seguinte). */
	const camAt = (f: number, keys: [number, Cam][]): Cam => {
		if (f <= b(keys[0][0])) return keys[0][1];
		for (let i = 1; i < keys.length; i++) {
			if (f < b(keys[i][0])) {
				const [a, c] = [keys[i - 1][1], keys[i][1]];
				const u = ramp(f, b(keys[i - 1][0]), b(keys[i][0]), EASE);
				return {x: lerp(a.x, c.x, u), y: lerp(a.y, c.y, u), z: a.z * (c.z / a.z) ** u, rx: lerp(a.rx ?? 0, c.rx ?? 0, u), ry: lerp(a.ry ?? 0, c.ry ?? 0, u), rz: lerp(a.rz ?? 0, c.rz ?? 0, u)};
			}
		}
		return keys[keys.length - 1][1];
	};
	/** Cursor por chaves [[tempo, x, y], ...] e cliques (tempos): posição e força do clique 0..1. */
	const pointerAt = (f: number, keys: [number, number, number][], clicks: number[]) => {
		let x = keys[0][1];
		let y = keys[0][2];
		for (let i = 1; i < keys.length; i++) {
			const u = ramp(f, b(keys[i - 1][0]), b(keys[i][0]), EASE);
			if (u <= 0) break;
			x = lerp(keys[i - 1][1], keys[i][1], u);
			y = lerp(keys[i - 1][2], keys[i][2], u);
		}
		const c = clicks.find((k) => f >= b(k) && f < b(k) + 16);
		return {x, y, press: c !== undefined ? (f - b(c)) / 16 : 0};
	};
	/** Velocidade da câmera vira desfoque de movimento (0..1,2). */
	const motionBlur = (f: number, keys: [number, Cam][]) => {
		const c = camAt(f, keys);
		const p = camAt(f - 1, keys);
		const speed = Math.hypot(c.x - p.x, c.y - p.y) * c.z + Math.abs(c.z - p.z) * 200;
		return Math.max(0, Math.min(1.2, (speed - 16) * 0.05));
	};
	return {tl, M: tl.marks, b, TOTAL, FPS: tl.fps, sp, enter, curve, camAt, pointerAt, motionBlur};
};
export type Timeline = ReturnType<typeof createTimeline>;

const Ctx = createContext<{b: (beat: number) => number; brand: Brand} | null>(null);
export const VideoProvider: React.FC<{timeline: {b: (beat: number) => number}; brand: Brand; children: React.ReactNode}> = ({timeline, brand, children}) => <Ctx.Provider value={{b: timeline.b, brand}}>{children}</Ctx.Provider>;
const useCtx = () => {
	const v = useContext(Ctx);
	if (!v) throw new Error('Componente do kit fora de <VideoProvider>.');
	return v;
};
/** Conversor de tempos em quadros do vídeo atual. */
export const useB = () => useCtx().b;
/** Marca do vídeo atual. */
export const useBrand = () => useCtx().brand;
