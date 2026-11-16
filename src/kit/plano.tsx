// Câmera 2D contínua sobre uma captura real: (fx, fy) em px da captura vão para o centro do quadro, s é a escala.
// Anime a View por um único movimento (ex.: recuo do detalhe ao contexto) e ancore anotações com `planoToScreen`,
// assim selos, contornos e grãos acompanham a câmera. Exemplo em src/videos/prova-direcao.
import React from 'react';
import {Img, staticFile} from 'remotion';

export type View = {fx: number; fy: number; s: number};

export const planoToScreen = (v: View, x: number, y: number) => ({x: 960 + (x - v.fx) * v.s, y: 540 + (y - v.fy) * v.s});

/** View que põe o ponto (x, y) da captura na posição (sx, sy) da tela, na escala s (casamento de corte). */
export const viewMatching = (x: number, y: number, sx: number, sy: number, s: number): View => ({fx: x - (sx - 960) / s, fy: y - (sy - 540) / s, s});

export const lerpView = (a: View, c: View, u: number, scaleEase: (x: number) => number = (x) => x): View => ({fx: a.fx + (c.fx - a.fx) * u, fy: a.fy + (c.fy - a.fy) * u, s: a.s + (c.s - a.s) * scaleEase(u)});

/** A captura como uma folha sobre o fundo: canto arredondado e sombra na cor da tinta da marca. */
export const Plano: React.FC<{src: string; v: View; w?: number; h?: number; opacity?: number; shadow?: string}> = ({src, v, w = 3360, h = 2100, opacity = 1, shadow = '102,50,17'}) => (
	<Img src={staticFile(src)} style={{position: 'absolute', left: 960 - v.fx * v.s, top: 540 - v.fy * v.s, width: w * v.s, height: h * v.s, borderRadius: 22 * v.s, opacity, boxShadow: `0 ${50 * v.s}px ${160 * v.s}px rgba(${shadow},0.22), 0 0 0 1px rgba(${shadow},0.08)`}} />
);
