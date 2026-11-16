// Marca, timeline e dados do vídeo. Os marcos ficam em timeline.json, em tempos de música (beat = quadros por
// tempo): a imagem (Video.tsx), a trilha (trilha.mjs) e a narração (narracao.json) leem o mesmo arquivo. Crie os
// marcos que a estrutura deste vídeo pedir; não há uma sequência obrigatória.
import {BRANDS, BrandId} from '../../brands';
import {createTimeline} from '../../kit';
import tl from './timeline.json';

export const SLUG = '__SLUG__';
export const TITULO = '__TITULO__';
export const BRAND = BRANDS['__BRAND__' as BrandId] ?? BRANDS.agrotrace;
export const T = createTimeline(tl);
export const {M, b, TOTAL} = T;
/** Quadro de um marco mais `sec` segundos. */
export const at = (mark: number, sec = 0) => b(mark) + Math.round(sec * tl.fps);
/** Captura real em public/<slug>/telas/ (JPEG 2x). */
export const tela = (nome: string) => `${SLUG}/telas/${nome}.jpg`;
export const lottie = (nome: string) => `${SLUG}/lottie/${nome}.json`;
/** Legendas da narração: [início, fim, texto] em segundos (`PLAN_ONLY=1 bun run narrar <slug>` dá o encaixe). */
export const LEGENDAS: [number, number, string][] = [];
