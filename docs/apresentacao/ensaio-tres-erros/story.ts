// Marca, timeline e dados do vídeo. Os marcos ficam em timeline.json, em tempos de música (beat = quadros por
// tempo): a imagem (Video.tsx), a trilha (trilha.mjs) e a narração (narracao.json) leem o mesmo arquivo. Crie os
// marcos que a estrutura deste vídeo pedir; não há uma sequência obrigatória.
import {BRANDS, BrandId} from '../../brands';
import {createTimeline, MONO, SAIRA, type MotionTheme} from '../../kit';
import tl from './timeline.json';

export const SLUG = 'tres-erros';
export const TITULO = '3 erros ao criar vídeo com IA';
export const BRAND = BRANDS['agrotrace' as BrandId] ?? BRANDS.agrotrace;
export const T = createTimeline(tl);
export const {M, b, TOTAL} = T;
/** Quadro de um marco mais `sec` segundos. */
export const at = (mark: number, sec = 0) => b(mark) + Math.round(sec * tl.fps);
/** Captura real em public/<slug>/telas/ (JPEG 2x). */
export const tela = (nome: string) => `${SLUG}/telas/${nome}.jpg`;
export const lottie = (nome: string) => `${SLUG}/lottie/${nome}.json`;
/** Legendas da narração: [início, fim, texto] em segundos (`PLAN_ONLY=1 bun run narrar <slug>` dá o encaixe). */
export const LEGENDAS: [number, number, string][] = [];

/** Cores da apresentação (não as verdes da marca): papel, laranja = o que você decide, tinta = fato e erro. */
export const C = {papel: '#FBF6F1', laranja: '#D9561A', tinta: '#23170F', cartao: '#FFFDFB'};
export const TEMA: MotionTheme = {
	ink: C.tinta,
	inkSoft: 'rgba(35,23,15,0.55)',
	accent: C.laranja,
	accentRgb: '217,86,26',
	alert: C.laranja,
	ok: C.tinta,
	paper: C.papel,
	card: C.cartao,
	track: '#EFE5DB',
	shadowRgb: '35,23,15',
	display: SAIRA,
	ui: SAIRA,
	mono: MONO,
	chips: {brand: [C.laranja, 'rgba(217,86,26,0.12)'], red: [C.laranja, 'rgba(217,86,26,0.12)'], green: [C.tinta, 'rgba(35,23,15,0.08)']},
};
