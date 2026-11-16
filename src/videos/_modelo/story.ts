// Marca, timeline e dados do vídeo. Os marcos ficam em timeline.json, em tempos de música (beat = quadros por
// tempo): a imagem (Video.tsx), a trilha (trilha.mjs) e a narração (narracao.json) leem o mesmo arquivo.
// Roteiro e direção: tratamento.md. Linguagem e movimento: docs/guia-de-producao.md e src/kit/motion.tsx.
import {BRANDS, BrandId} from '../../brands';
import {createTimeline, type Rect} from '../../kit';
import tl from './timeline.json';

export const SLUG = '__SLUG__';
export const TITULO = '__TITULO__';
export const BRAND = BRANDS['__BRAND__' as BrandId] ?? BRANDS.agrotrace;
export const T = createTimeline(tl);
export const {M, b, TOTAL} = T;
/** Quadro de um marco mais `sec` segundos. */
export const at = (mark: number, sec = 0) => b(mark) + Math.round(sec * tl.fps);
export const tela = (nome: string) => `${SLUG}/telas/${nome}.jpg`;

/**
 * A captura real da tela (JPEG 2x em public/<slug>/telas/) e o tamanho dela em px. Enquanto não houver, fica a
 * tela ilustrativa que o `bun run novo` copiou.
 */
export const TELA = {src: tela('ilustrativa'), w: 3360, h: 2100};
/** O trecho clicado (o botão, em px da captura). */
export const ALVO: Rect = {x: 2460, y: 175, w: 560, h: 90};
/**
 * Recortes da captura que viram camadas 3D: [x, y, w, h, z]. Corte pelo que a tela tem (cabeçalho, linhas,
 * cartões, gaveta, modal); o trecho da fala ganha z maior e vem à frente.
 */
export const FAIXAS: [number, number, number, number, number][] = [
	[0, 0, 3360, 140, 20],
	[120, 300, 3120, 250, 24],
	[120, 600, 3120, 250, 34],
	[120, 900, 3120, 250, 24],
	[120, 1200, 3120, 250, 34],
	[120, 1500, 3120, 250, 24],
	[ALVO.x, ALVO.y, ALVO.w, ALVO.h, 110],
];
/** Legendas da narração: [início, fim, texto] em segundos (`PLAN_ONLY=1 bun run narrar <slug>` dá o encaixe). */
export const LEGENDAS: [number, number, string][] = [];
