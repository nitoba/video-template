// Agrotrace (verde). Tokens do design-system.pen.
import React from 'react';
import {MONO, RUBIK, SAIRA} from '../core/fonts';
import {IBS_PATH, IBS_VIEWBOX, WORDMARK_PATH, WORDMARK_VIEWBOX} from './paths-agrotrace';
import type {Brand} from './types';

const Wordmark: React.FC<{width: number; color?: string}> = ({width, color = '#fff'}) => (
	<svg width={width} height={(width * 32) / 170} viewBox={WORDMARK_VIEWBOX}>
		<path d={WORDMARK_PATH} fill={color} />
	</svg>
);
export const IbsLogo: React.FC<{width: number; color?: string}> = ({width, color = '#fff'}) => (
	<svg width={width} height={(width * 49) / 83} viewBox={IBS_VIEWBOX}>
		<path d={IBS_PATH} fill={color} />
	</svg>
);

export const agrotrace: Brand = {
	id: 'agrotrace',
	nome: 'Agrotrace',
	cores: {acento: '#93ED5C', acentoClaro: '#ADF182', acentoEscuro: '#43801E', textoClaro: '#ebf5e6', vidro: 'rgba(5,16,9,0.84)', perigo: '#dc2626', ok: '#16a34a', papel: '#f7faf4', papelLinha: '31,58,14'},
	tintaEscura: '122,233,54',
	ceus: {
		principal: {a: '#04140a', b: '#25621b', c: '#0d4404', d: '#93ED5C'},
		alerta: {a: '#140506', b: '#5a1414', c: '#2c0a0a', d: '#ff6b6b'},
		frio: {a: '#060d1c', b: '#123d6b', c: '#0b2340', d: '#5db4ff'},
	},
	fontes: {display: SAIRA, ui: RUBIK, mono: MONO},
	Logo: Wordmark,
	logoParticulas: {paths: [WORDMARK_PATH], viewBox: [170, 32], cores: ['#93ED5C', '#68C62E', '#DFFACF']},
	Rodape: IbsLogo,
};
