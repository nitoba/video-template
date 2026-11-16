// Marca, timeline e dados do vídeo. Os marcos ficam em timeline.json, em tempos de música (beat = quadros por
// tempo): a imagem, a trilha (trilha.mjs) e a narração (narracao.json) leem o mesmo arquivo.
import {BRANDS, BrandId} from '../../brands';
import {Cam, createTimeline} from '../../kit';
import tl from './timeline.json';

export const SLUG = '__SLUG__';
export const TITULO = '__TITULO__';
export const BRAND = BRANDS['__BRAND__' as BrandId] ?? BRANDS.agrotrace;
export const T = createTimeline(tl);
export const {M, b, TOTAL} = T;

/**
 * Capturas reais em public/<slug>/telas/ (JPEG 2x, 1440 de largura), na ordem em que aparecem:
 * [[tempo, 'slug/telas/01.jpg'], ...]. Vazio mostra uma tela ilustrativa no lugar.
 */
export const TELAS: [number, string][] = [];
/** Ponto clicado na tela, em px da captura (medido com getBoundingClientRect na captura). */
export const ALVO = {x: 1180, y: 118};

export const CAM: [number, Cam][] = [
	[M.app - 0.4, {x: 720, y: 405, z: 0.82, rx: 12, ry: -12}],
	[M.app + 1.6, {x: 720, y: 405, z: 0.95, rx: 3, ry: -3}],
	[M.clique - 0.6, {x: ALVO.x - 120, y: ALVO.y + 80, z: 1.6}],
	[M.resultado + 1, {x: 720, y: 360, z: 1.15}],
	[M.final - 0.2, {x: 720, y: 405, z: 0.85, rx: 10, ry: -10}],
];
