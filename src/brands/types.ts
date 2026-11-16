// Contrato de uma marca. Um vídeo escolhe a marca em src/videos/<slug>/story.ts e todo o kit
// (fundos, legendas, cursor, fecho com o logo) pega cores, fontes e logo daqui.
import type React from 'react';

/** Paleta de um fundo em shader (Mesh): base escura, faixa, sombra e brilho. */
export type Sky = {a: string; b: string; c: string; d: string};

export type Brand = {
	id: string;
	nome: string;
	cores: {
		/** Destaque de palavras, contorno de foco, cursor. */
		acento: string;
		acentoClaro: string;
		acentoEscuro: string;
		/** Texto claro sobre fundo escuro. */
		textoClaro: string;
		/** Fundo de cartão de legenda (vidro escuro). */
		vidro: string;
		perigo: string;
		ok: string;
		/** Papel claro (cenas de documento). */
		papel: string;
		papelLinha: string;
	};
	/** "r,g,b" do brilho no fundo escuro (Dark). */
	tintaEscura: string;
	ceus: {principal: Sky; alerta: Sky; frio: Sky};
	fontes: {display: string; ui: string; mono: string};
	Logo: React.FC<{width: number; color?: string}>;
	/** Logo em caminhos SVG, para o fecho de partículas. */
	logoParticulas: {paths: string[]; viewBox: [number, number]; cores: [string, string, string]};
	/** Assinatura pequena do rodapé (ex.: IBS). */
	Rodape?: React.FC<{width: number; color?: string}>;
};
