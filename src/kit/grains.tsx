// Grãos: partículas com significado, desenhadas em canvas 2D e determinísticas por quadro.
// Cada grão viaja de uma origem a um destino (ex.: de uma linha copiada à mesma linha no outro atendimento,
// ou de uma palavra até o desenho do logo). Use pouca quantidade e trajetórias organizadas: a partícula
// explica uma relação, não decora a tela. Exemplo completo em src/videos/prova-direcao.
import React, {useLayoutEffect, useRef} from 'react';
import {random, useCurrentFrame} from 'remotion';
import {EASE} from './timeline';

export type Pt = {x: number; y: number};
export type RGB = [number, number, number];
export type GrainSpec = {
	/** Origem e destino, no espaço que `map` converte para a tela (px da captura, por exemplo). */
	a: Pt;
	c: Pt;
	/** Quadro de partida e quadros de viagem. */
	t0: number;
	dur: number;
	size: number;
	/** Altura do arco, em px de tela. */
	lift: number;
	/** Fase da ondulação lateral (grãos da mesma linha com fases próximas formam uma fita). */
	wob: number;
	/** 0 perto, 1 longe: tamanho e opacidade. */
	depth: number;
	/** Cor fixa; sem ela o grão muda de `from` para `to` durante a viagem. */
	color?: RGB;
};

export const hexToRgbTuple = (hex: string): RGB => hex.match(/\w\w/g)!.map((h) => parseInt(h, 16)) as RGB;
const mix3 = (a: RGB, c: RGB, u: number) => a.map((v, i) => Math.round(v + (c[i] - v) * u)) as RGB;

/** Posição do grão no tempo normalizado t: arco quadrático com ondulação lateral. */
export const grainAt = (g: GrainSpec, t: number, A: Pt, C: Pt): Pt => {
	const mx = (A.x + C.x) / 2;
	const my = Math.min(A.y, C.y) - g.lift;
	const x = (1 - t) ** 2 * A.x + 2 * (1 - t) * t * mx + t * t * C.x;
	const y = (1 - t) ** 2 * A.y + 2 * (1 - t) * t * my + t * t * C.y;
	const w = Math.sin(t * Math.PI) * Math.sin(g.wob + t * 5) * 8;
	return {x: x + w * 0.6, y: y + w};
};

type Props = {
	grains: GrainSpec[];
	/** Converte o espaço dos grãos para a tela a cada quadro (acompanha a câmera). */
	map?: (p: Pt) => Pt;
	/** Cores da viagem quando o grão não tem cor fixa. */
	from?: RGB;
	to?: RGB;
	/** Onda na chegada (um a cada três grãos). */
	ripples?: boolean;
	/** Depois de chegar, o grão fica visível por esta fração da viagem e some (ex.: até o logo sólido aparecer). */
	settle?: number;
	glow?: boolean;
	/** Comprimento do rastro, em fração da viagem (0 = sem rastro). */
	tail?: number;
	width?: number;
	height?: number;
};

export const GrainCanvas: React.FC<Props> = ({grains, map = (p) => p, from = [244, 190, 52], to = [229, 96, 31], ripples = true, settle = 0, glow = true, tail = 0.045, width = 1920, height = 1080}) => {
	const f = useCurrentFrame();
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const ctx = ref.current!.getContext('2d')!;
		ctx.clearRect(0, 0, width, height);
		ctx.lineCap = 'round';
		const order = grains.map((_, i) => i).sort((i, j) => grains[j].depth - grains[i].depth);
		for (const i of order) {
			const g = grains[i];
			const raw = (f - g.t0) / g.dur;
			const A = map(g.a);
			const C = map(g.c);
			const near = 1 - g.depth;
			if (ripples && raw >= 1 && raw < 1.6 && i % 3 === 0) {
				const r = (raw - 1) / 0.6;
				ctx.strokeStyle = `rgba(${to[0]},${to[1]},${to[2]},${0.35 * (1 - r)})`;
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(C.x, C.y, 4 + r * 22 * (0.6 + near), 0, Math.PI * 2);
				ctx.stroke();
			}
			if (raw <= 0 || raw >= 1 + settle) continue;
			const t = EASE(Math.min(1, raw));
			const p = grainAt(g, t, A, C);
			const life = raw < 1 ? Math.min(1, raw * 6) * (0.55 + 0.45 * Math.sin(t * Math.PI)) : 1 - (raw - 1) / Math.max(1e-6, settle);
			const [r, gg, bb] = g.color ?? mix3(from, to, Math.min(1, t * 1.3));
			const s = g.size * (0.55 + near * 0.9);
			const alpha = life * (0.35 + near * 0.65);
			if (glow) {
				const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 3);
				halo.addColorStop(0, `rgba(${r},${gg},${bb},${0.18 * alpha})`);
				halo.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
				ctx.fillStyle = halo;
				ctx.beginPath();
				ctx.arc(p.x, p.y, s * 3, 0, Math.PI * 2);
				ctx.fill();
			}
			if (tail > 0 && raw < 1) {
				const q = grainAt(g, EASE(Math.max(0, raw - tail)), A, C);
				const grad = ctx.createLinearGradient(q.x, q.y, p.x, p.y);
				grad.addColorStop(0, `rgba(${r},${gg},${bb},0)`);
				grad.addColorStop(1, `rgba(${r},${gg},${bb},${0.55 * alpha})`);
				ctx.strokeStyle = grad;
				ctx.lineWidth = s * 0.7;
				ctx.beginPath();
				ctx.moveTo(q.x, q.y);
				ctx.lineTo(p.x, p.y);
				ctx.stroke();
			}
			ctx.fillStyle = `rgba(${r},${gg},${bb},${alpha})`;
			ctx.beginPath();
			ctx.arc(p.x, p.y, s / 2, 0, Math.PI * 2);
			ctx.fill();
		}
	});
	return <canvas ref={ref} width={width} height={height} style={{position: 'absolute', inset: 0}} />;
};

/**
 * Pontos dentro de formas SVG (ex.: os caminhos do logo), já na posição de tela onde a forma é desenhada.
 * `box` é o canto e a largura da forma na tela; `viewBox` é o tamanho original dos caminhos.
 */
export const sampleShapePoints = (paths: string[], viewBox: [number, number], box: {x: number; y: number; w: number}, n: number, seed: string): Pt[] => {
	const s = box.w / viewBox[0];
	const h = Math.ceil(viewBox[1] * s);
	const cv = document.createElement('canvas');
	cv.width = Math.ceil(box.w);
	cv.height = h;
	const ctx = cv.getContext('2d')!;
	ctx.setTransform(s, 0, 0, s, 0, 0);
	paths.forEach((d) => ctx.fill(new Path2D(d)));
	const data = ctx.getImageData(0, 0, cv.width, h).data;
	const pts: Pt[] = [];
	for (let y = 0; y < h; y += 3) for (let x = 0; x < cv.width; x += 3) if (data[(y * cv.width + x) * 4 + 3] > 128) pts.push({x: box.x + x, y: box.y + y});
	return Array.from({length: n}, (_, i) => pts[Math.floor(random(`${seed}${i}`) * pts.length)]);
};
