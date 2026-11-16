// Telas reais capturadas (Chrome DevTools em escala 2, ver docs/guia-de-producao.md, seção 4) dentro do
// Browser. Cada tela é uma imagem; a troca é um fade curto. O que muda depois de um clique que gravaria dados
// vira um remendo desenhado por cima, no vídeo.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {ramp, useB} from './timeline';

export const Shot: React.FC<{src: string; w: number; h: number; o?: number; x?: number; y?: number}> = ({src, w, h, o = 1, x = 0, y = 0}) =>
	o <= 0.001 ? null : <Img src={staticFile(src)} style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o}} />;

/**
 * Sequência de telas: [[tempo, caminho em public/], ...] em tempos crescentes. Desenha a tela da vez em
 * (x, y, w, h) e faz fade de `fade` quadros a partir da anterior.
 */
export const ShotSeq: React.FC<{keys: [number, string][]; w: number; h: number; x?: number; y?: number; fade?: number; bg?: string}> = ({keys, w, h, x = 0, y = 0, fade = 7, bg}) => {
	const f = useCurrentFrame();
	const b = useB();
	let i = 0;
	for (let j = 0; j < keys.length; j++) if (f >= b(keys[j][0])) i = j;
	const u = ramp(f, b(keys[i][0]), b(keys[i][0]) + fade);
	return (
		<div style={{position: 'absolute', inset: 0, background: bg}}>
			{i > 0 && u < 1 && <Shot src={keys[i - 1][1]} w={w} h={h} x={x} y={y} />}
			<Shot src={keys[i][1]} w={w} h={h} x={x} y={y} o={i > 0 ? u : 1} />
		</div>
	);
};

/** Captura de proporção diferente da janela: encaixa por altura e centra. Devolve a caixa e o conversor de pontos. */
export const fitShot = (capW: number, capH: number, winW = 1440, winH = 810) => {
	const k = Math.min(winW / capW, winH / capH);
	const w = capW * k;
	const h = capH * k;
	const x = (winW - w) / 2;
	const y = (winH - h) / 2;
	return {x, y, w, h, k, pt: (px: number, py: number) => ({x: x + px * k, y: y + py * k})};
};
