// Telas reais capturadas do CMS e do web (Chrome DevTools, viewport 1440×900 no CMS e 1680×1050 no web, escala 2)
// em public/validacao/{cms,web}. Os nomes de técnicos e produtores foram abreviados no DOM antes da captura, e as
// assinaturas reais trocadas por traços sintéticos. Cada tela é uma imagem; troca de tela é um fade curto, e o que
// muda depois de um clique que gravaria dados (ligar a validação) é um remendo desenhado por cima.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {UI} from './fx';
import {b, M, ramp} from './story';

export type ShotKey = '00-lista' | '01-cadastro' | '02-funcionamento' | '03-verificacoes' | '03b-verificacoes-copia' | '04-regras-copia' | '05-email' | '06-assinaturas' | '07-modal-tecnico' | '08-liberar';
const Shot: React.FC<{src: string; w: number; h: number; o?: number; y?: number}> = ({src, w, h, o = 1, y = 0}) =>
	o <= 0.001 ? null : <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: y, width: w, height: h, opacity: o}} />;

/** Sequência de telas: [início em tempos, tela]. A tela entra com fade de `fade` quadros. */
const Seq: React.FC<{f: number; keys: [number, string][]; w: number; h: number; fade?: number; dir: string}> = ({f, keys, w, h, fade = 7, dir}) => {
	let i = 0;
	for (let j = 0; j < keys.length; j++) if (f >= b(keys[j][0])) i = j;
	const u = ramp(f, b(keys[i][0]), b(keys[i][0]) + fade);
	return (
		<>
			{i > 0 && u < 1 && <Shot src={`exemplo-validacao/${dir}/${keys[i - 1][1]}.jpg`} w={w} h={h} />}
			<Shot src={`exemplo-validacao/${dir}/${keys[i][1]}.jpg`} w={w} h={h} o={i > 0 ? u : 1} />
		</>
	);
};

// ---------------- CMS ----------------
export const CMS_KEYS: [number, ShotKey][] = [
	[0, '01-cadastro'],
	[M.aba + 0.3, '08-liberar'],
	[M.liberar + 0.5, '02-funcionamento'],
	[M.verif + 0.2, '03-verificacoes'],
	[M.limiar - 1.4, '03b-verificacoes-copia'],
	[M.limiar + 0.3, '04-regras-copia'],
	[M.assRef + 0.2, '06-assinaturas'],
	[M.modal + 0.3, '07-modal-tecnico'],
	[M.dest - 0.4, '05-email'],
];
/** Elementos clicados no CMS, em px da tela de 1440×900 (medidos na captura). */
export const CMS_PTS = {
	abaValidacao: {x: 1180, y: 190},
	liberar: {x: 720, y: 449},
	silencioso: {x: 592, y: 512},
	ativo: {x: 1015, y: 512},
	menuVerif: {x: 277, y: 452},
	ajustar: {x: 1157, y: 411},
	menuAssin: {x: 277, y: 530},
	preCarga: {x: 1133, y: 416},
	kaique: {x: 827, y: 821},
	menuEmail: {x: 285, y: 491},
	ligar: {x: 1155, y: 277},
};
const Tag: React.FC<{bg: string; c: string; icon: string; t: string}> = ({bg, c, icon, t}) => (
	<span style={{display: 'inline-flex', alignItems: 'center', gap: 5, height: 29, padding: '0 10px', borderRadius: 12, background: bg, color: c, fontFamily: 'Roboto, ' + UI, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap'}}>
		<i className={`pi pi-${icon}`} style={{fontSize: 12}} />
		{t}
	</span>
);
/** Depois do clique em "Ligar validação": etiquetas e botão como o componente mostra a validação ligada. */
const Ligada: React.FC<{f: number}> = ({f}) => {
	const u = ramp(f, b(M.ativar) + 6, b(M.ativar) + 12);
	if (u <= 0) return null;
	return (
		<div style={{opacity: u}}>
			<div style={{position: 'absolute', left: 250, top: 304, width: 330, height: 34, background: '#fff'}} />
			<div style={{position: 'absolute', left: 254, top: 306, display: 'flex', alignItems: 'center', gap: 8}}>
				<Tag bg="#dcfce7" c="#15803d" icon="check-circle" t="Ligada" />
				<Tag bg="#e0f2fe" c="#0369a1" icon="bell" t="Avisando por e-mail" />
				<span style={{fontFamily: 'Roboto, ' + UI, fontSize: 14, color: '#475569'}}>desde 16/11/2026</span>
			</div>
			<div style={{position: 'absolute', left: 1070, top: 250, width: 172, height: 50, background: '#fff'}} />
			<div style={{position: 'absolute', left: 1062, top: 256, height: 42, padding: '0 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Roboto, ' + UI, fontSize: 16}}>
				<i className="pi pi-power-off" style={{fontSize: 14}} /> Desligar validação
			</div>
		</div>
	);
};
export const CmsReal: React.FC<{f: number}> = ({f}) => (
	<div style={{position: 'absolute', inset: 0, background: '#fff'}}>
		<Seq f={f} keys={CMS_KEYS} w={1440} h={900} dir="cms" />
		<Ligada f={f} />
	</div>
);

// ---------------- Web: comparação lado a lado ----------------
// Capturas de 1680×1050 mostradas em 1296×810 (cabem na janela de 1440×810), centradas.
export const CMP = {x: 72, w: 1296, h: 810, k: 1296 / 1680};
export const Comparacao: React.FC<{f: number}> = ({f}) => (
	<div style={{position: 'absolute', inset: 0, background: '#5b5550'}}>
		<div style={{position: 'absolute', left: CMP.x, top: 0, width: CMP.w, height: CMP.h}}>
			<Seq f={f} keys={[[0, 'w04-comparacao'], [M.comparaTopo, 'w05-comparacao-topo']]} w={CMP.w} h={CMP.h} fade={10} dir="web" />
		</div>
	</div>
);
/** Ponto da captura do web (px de 1680×1050) para px da janela. */
export const cmpPt = (x: number, y: number) => ({x: CMP.x + x * CMP.k, y: y * CMP.k});
