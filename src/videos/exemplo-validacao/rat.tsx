// O RAT (Relatório de Atendimento Técnico) recriado a partir do PDF gerado pelo app: mesma estrutura de campos,
// barra "DESCRIÇÃO DO ATENDIMENTO" e os blocos de assinatura PRODUTOR e CONSULTOR. Os textos são do atendimento
// real; nomes de produtor ficam reduzidos e as assinaturas são traços sintéticos.
import React from 'react';

const RB = 'Roboto, Rubik, sans-serif';
export const RAT_W = 612;
export const RAT_H = 792;

/** Assinatura cursiva sintética (cicloide com floreio), desenhada até `draw` (0..1). */
export const sigPath = (w: number, h: number, seed: number) => {
	const n = 5.5;
	const R = h * 0.17;
	let d = '';
	const N = 160;
	let lx = 0;
	let ly = 0;
	for (let i = 0; i <= N; i++) {
		const t = i / N;
		const th = 2 * Math.PI * n * t;
		const x = t * w * 0.86 - R * Math.sin(th) * (0.8 + 0.25 * Math.sin(t * 9 + seed)) + w * 0.07;
		const y = h / 2 - R * 1.7 * Math.cos(th) * (1 - 0.45 * t) + Math.sin(t * 4 + seed) * h * 0.06 - (t < 0.08 ? (0.08 - t) * h * 4.5 : 0);
		d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
		lx = x;
		ly = y;
	}
	for (let i = 1; i <= 24; i++) {
		const t = i / 24;
		d += `L${(lx + Math.sin(t * Math.PI) * w * 0.12 - t * w * 0.9).toFixed(1)} ${(ly + h * 0.2 * t + Math.sin(t * Math.PI) * h * 0.24).toFixed(1)} `;
	}
	return d;
};
export const Signature: React.FC<{w: number; h: number; seed?: number; draw?: number; color?: string; width?: number}> = ({w, h, seed = 0.3, draw = 1, color = '#1e293b', width = 2.6}) => (
	<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
		<path d={sigPath(w, h, seed)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
	</svg>
);

export type RatData = {data: string; tipo: string; produtor: string; propriedade: string; cidade: string; contrato: string; tecnico: string; situacao: string; recomendacao: string};
export const RAT_WILLIAM: RatData = {
	data: '05/09/2026',
	tipo: 'Diagnóstico',
	produtor: 'V. B. G.',
	propriedade: 'SITIO 2 IRMAOS',
	cidade: 'Rondônia',
	contrato: '209/2026',
	tecnico: 'William',
	situacao: 'Durante a visita à propriedade, foram observados os seguintes pontos relacionados à atividade produtiva e às condições de manejo: a principal atividade desenvolvida na propriedade é a cria e recria.',
	recomendacao: 'Manter o fornecimento de suplemento mineral adequado às exigências das categorias presentes na propriedade. Avaliar periodicamente a qualidade e disponibilidade das pastagens.',
};
export const RAT_KAIQUE: RatData = {
	data: '29/09/2026',
	tipo: 'Reprodutivo',
	produtor: 'Produtor',
	propriedade: 'SITIO BOA SORTE',
	cidade: 'Rondônia',
	contrato: '028/2025',
	tecnico: 'Kaique',
	situacao: 'Durante a visita à propriedade atendida, foi constatado que as pastagens estão em boas condições, apresentando ampla área foliar, excelente cobertura da forragem, pouco solo exposto e baixa infestação de plantas invasoras.',
	recomendacao: 'Oriento ao produtor realizar correções de solo para aumentar taxa de UA/HA diluindo custo operacional da atividade. Oriento ao produtor realizar aquisição de animais com padrão genético mais apurado acelerando assim processo de terminação.',
};

const L: React.CSSProperties = {fontFamily: RB, fontWeight: 700, fontSize: 9.5, color: '#111', letterSpacing: '0.01em'};
const V: React.CSSProperties = {fontFamily: RB, fontSize: 11, color: '#111', lineHeight: 1.3};
/** Destaques que a leitura por IA acende: chave → força 0..1. */
export type Marks = Partial<Record<'contrato' | 'tipo' | 'data' | 'texto' | 'produtor' | 'consultor', number>>;
const Mark: React.FC<{a?: number; color?: string; pad?: number}> = ({a = 0, color = '#ff843f', pad = 4}) =>
	a > 0.01 ? <div style={{position: 'absolute', inset: -pad, borderRadius: 6, border: `2px solid ${color}`, background: `${color}22`, opacity: Math.min(1, a), transform: `scale(${1.08 - 0.08 * Math.min(1, a)})`}} /> : null;

/** Página 1: cabeçalho, campos e descrição. */
export const RatPage1: React.FC<{d: RatData; marks?: Marks}> = ({d, marks = {}}) => (
	<div style={{position: 'relative', width: RAT_W, height: RAT_H, background: '#fff', padding: '34px 30px', boxSizing: 'border-box', fontFamily: RB}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
			<div style={{width: 112, textAlign: 'center'}}>
				<div style={{fontWeight: 800, fontStyle: 'italic', color: '#1d4ed8', fontSize: 12}}>(JBS)</div>
				<div style={{fontWeight: 700, color: '#3f8f2c', fontSize: 13, lineHeight: 1}}>Escritório</div>
				<div style={{fontWeight: 900, color: '#3f8f2c', fontSize: 17, lineHeight: 1}}>VERDE</div>
			</div>
			<div style={{flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 17, lineHeight: 1.2}}>
				RELATÓRIO DE ATENDIMENTO
				<br />
				TÉCNICO
			</div>
		</div>
		<div style={{height: 1, background: '#222', margin: '16px 0 8px'}} />
		<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 6}}>
			<div style={{position: 'relative'}}>
				<Mark a={marks.data} />
				<div style={L}>DATA DO ATENDIMENTO</div>
				<div style={V}>{d.data}</div>
			</div>
			<div style={{textAlign: 'right', position: 'relative'}}>
				<Mark a={marks.tipo} />
				<div style={L}>TIPO DO ATENDIMENTO</div>
				<div style={V}>{d.tipo}</div>
			</div>
			<div>
				<div style={L}>PRODUTOR</div>
				<div style={V}>{d.produtor}</div>
			</div>
			<div style={{textAlign: 'right'}}>
				<div style={L}>PROPRIEDADE</div>
				<div style={V}>{d.propriedade}</div>
			</div>
			<div>
				<div style={L}>CIDADE</div>
				<div style={V}>{d.cidade}</div>
			</div>
			<div style={{textAlign: 'right', position: 'relative'}}>
				<Mark a={marks.contrato} />
				<div style={L}>Nº CONTRATO</div>
				<div style={V}>{d.contrato}</div>
			</div>
			<div>
				<div style={L}>PROJETO</div>
				<div style={V}>ATER - JBS</div>
			</div>
			<div style={{textAlign: 'right'}}>
				<div style={L}>TÉCNICO RESPONSÁVEL</div>
				<div style={V}>{d.tecnico}</div>
			</div>
		</div>
		<div style={{marginTop: 18, background: '#111', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 11.5, padding: '6px 0'}}>DESCRIÇÃO DO ATENDIMENTO</div>
		<div style={{position: 'relative', marginTop: 12}}>
			<Mark a={marks.texto} pad={6} />
			<div style={L}>DESENVOLVIMENTO DA ATIVIDADE</div>
			<div style={{...V, fontSize: 11.5}}>{d.situacao}</div>
			<div style={{...L, marginTop: 12}}>RECOMENDAÇÕES</div>
			<div style={{...V, fontSize: 11.5}}>{d.recomendacao}</div>
		</div>
		{[0, 1, 2, 3, 4, 5, 6].map((i) => (
			<div key={i} style={{height: 7, borderRadius: 3, background: '#e5e7eb', marginTop: 9, width: `${92 - (i % 3) * 14}%`}} />
		))}
	</div>
);

/** Página das assinaturas: bloco PRODUTOR e bloco CONSULTOR. */
export const RatSign: React.FC<{d: RatData; produtor?: number; consultor?: number; marks?: Marks; emptyProdutor?: boolean; pulse?: number}> = ({d, produtor = 1, consultor = 1, marks = {}, emptyProdutor, pulse = 0}) => (
	<div style={{position: 'relative', width: RAT_W, height: RAT_H, background: '#fff', padding: '30px 40px', boxSizing: 'border-box', fontFamily: RB}}>
		{[0, 1, 2, 3].map((i) => (
			<div key={i} style={{height: 7, borderRadius: 3, background: '#e5e7eb', marginTop: 10, width: `${88 - (i % 2) * 22}%`}} />
		))}
		<div style={{height: 1, background: '#222', margin: '26px 0 0'}} />
		{(['produtor', 'consultor'] as const).map((k, i) => {
			const draw = k === 'produtor' ? produtor : consultor;
			const empty = k === 'produtor' && emptyProdutor;
			return (
				<div key={k} style={{position: 'relative', marginTop: i ? 40 : 56, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
					<Mark a={marks[k]} color={empty ? '#dc2626' : '#ff843f'} pad={8} />
					{empty && pulse > 0 && <div style={{position: 'absolute', inset: -8, borderRadius: 8, background: `rgba(220,38,38,${0.1 + 0.08 * pulse})`}} />}
					<div style={{height: 150, display: 'flex', alignItems: 'center'}}>{!empty && <Signature w={300} h={120} seed={k === 'produtor' ? 1.7 : 0.3} draw={draw} />}</div>
					<div style={{width: 330, height: 1.5, background: '#111'}} />
					<div style={{...L, fontSize: 11, marginTop: 4}}>{k === 'produtor' ? 'PRODUTOR' : 'CONSULTOR'}</div>
					<div style={{...V, fontSize: 12}}>{k === 'produtor' ? d.produtor : d.tecnico}</div>
				</div>
			);
		})}
	</div>
);

export const typedSlice = (s: string, f: number, at: number, per = 1.2) => s.slice(0, Math.max(0, Math.floor((f - at) / per)));
