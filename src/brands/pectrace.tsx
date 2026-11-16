// PecTrace (laranja). Tokens pec-* do design-system.pen; é o tema dos programas PEC (ex.: ATER - JBS).
import React from 'react';
import {MONO, RUBIK, SAIRA} from '../core/fonts';
import {IbsLogo} from './agrotrace';
import {PEC_ICON_PATHS, PEC_TEXT_PATHS, PEC_VIEWBOX} from './paths-pectrace';
import type {Brand} from './types';

export const PecLogo: React.FC<{width: number; color?: string; iconColor?: string}> = ({width, color = '#fff', iconColor}) => (
	<svg width={width} height={(width * 78) / 413} viewBox={PEC_VIEWBOX}>
		{PEC_ICON_PATHS.map((d) => (
			<path key={d.slice(0, 16)} d={d} fill={iconColor ?? color} />
		))}
		{PEC_TEXT_PATHS.map((d) => (
			<path key={d.slice(0, 16)} d={d} fill={color} />
		))}
	</svg>
);

/** Escala pec-* (laranja). */
export const PEC = {p50: '#fff8f4', p100: '#ffe0cc', p200: '#ffc7a4', p300: '#ffae7c', p400: '#ff9553', p450: '#ff843f', p500: '#ff7c2b', p600: '#d96925', p700: '#b3571e', p800: '#8c4418', p900: '#663211', navbarStart: '#ff843f', navbarEnd: '#f15a24'};

export const pectrace: Brand = {
	id: 'pectrace',
	nome: 'PecTrace',
	cores: {acento: PEC.p300, acentoClaro: PEC.p200, acentoEscuro: PEC.p700, textoClaro: '#fff0e6', vidro: 'rgba(20,10,5,0.84)', perigo: '#dc2626', ok: '#16a34a', papel: '#fbf8f5', papelLinha: '90,50,20'},
	tintaEscura: '255,132,63',
	ceus: {
		principal: {a: '#140904', b: '#6b2c0c', c: '#3a1606', d: '#ff9553'},
		alerta: {a: '#140506', b: '#5a1414', c: '#2c0a0a', d: '#ff6b6b'},
		frio: {a: '#060d1c', b: '#123d6b', c: '#0b2340', d: '#5db4ff'},
	},
	fontes: {display: SAIRA, ui: RUBIK, mono: MONO},
	Logo: PecLogo,
	logoParticulas: {paths: [...PEC_ICON_PATHS, ...PEC_TEXT_PATHS], viewBox: [413, 78], cores: ['#ff9553', '#ff7c2b', '#ffe0cc']},
	Rodape: IbsLogo,
};
