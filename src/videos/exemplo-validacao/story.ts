// Marcos em tempos de música (85,7 BPM, 1 tempo = 21 quadros), lidos também pela trilha e pela narração.
import {Easing, interpolate, spring} from 'remotion';
import tl from './timeline.json';

export const M = tl.marks;
export const b = (beat: number) => Math.round(beat * tl.beat);
export const TOTAL = tl.scenes[0].duration;
export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN = Easing.bezier(0.55, 0, 1, 0.45);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (a: number, c: number, u: number) => a + (c - a) * u;
export const ramp = (f: number, a: number, c: number, easing?: (x: number) => number) => interpolate(f, [a, c], [0, 1], {...clamp, easing});
/** Mola a partir de um tempo. */
export const sp = (f: number, at: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {damping: 15, stiffness: 130, mass: 0.8}) => spring({frame: f - b(at), fps: 30, config: cfg});
export const POP = {damping: 11, stiffness: 170, mass: 0.7};
export const SOFT = {damping: 20, stiffness: 90, mass: 1};
/** Entrada de camada: sobe, cresce e perde o desfoque. */
export const enter = (f: number, at: number, o: {y?: number; x?: number; s?: number; blur?: number; z?: number} = {}) => {
	const k = sp(f, at);
	const u = Math.min(1, k);
	return {
		opacity: u,
		transform: `translate(${(1 - k) * (o.x ?? 0)}px, ${(1 - k) * (o.y ?? 24)}px) scale(${lerp(o.s ?? 0.96, 1, k)})`,
		filter: u < 0.99 ? `blur(${(1 - u) * (o.blur ?? 8)}px)` : undefined,
	} as const;
};
/** Curva por chaves: [[tempo, valor], ...]. */
export const curve = (f: number, keys: [number, number][], easing = EASE) => {
	if (f <= b(keys[0][0])) return keys[0][1];
	for (let i = 1; i < keys.length; i++) if (f < b(keys[i][0])) return lerp(keys[i - 1][1], keys[i][1], ramp(f, b(keys[i - 1][0]), b(keys[i][0]), easing));
	return keys[keys.length - 1][1];
};

export type Cam = {x: number; y: number; z: number; rx?: number; ry?: number; rz?: number};
/** Câmera por chaves. A cada chave o movimento acontece entre a chave anterior e ela. */
export const camAt = (f: number, keys: [number, Cam][]): Cam => {
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
export const S = 1920 / 1440;
export const toScreen = (c: Cam, x: number, y: number) => ({x: 960 + (x - c.x) * S * c.z, y: 540 + (y - c.y) * S * c.z});

