// Tela "Validação de atendimentos" do web, recriada a partir dos templates de
// apps/web/.../atendimento/validacao (textos de PT.json, classes Tailwind do componente) no tema PecTrace,
// que é o da ATER - JBS. Tudo em px do app (1440 de largura); a página rola por `scroll`.
import React from 'react';
import {PEC as P} from '../../brands/pectrace';
import {DISPLAY, Odo, UI} from './fx';
import {b, EASE, enter, lerp, M, OUT, POP, ramp, sp} from './story';

export const NAV_H = 60;
const SUR = {50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 900: '#18181b'};
const RED = {50: '#fef2f2', 200: '#fecaca', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c'};
const GRN = {50: '#f0fdf4', 200: '#bbf7d0', 500: '#22c55e', 700: '#15803d'};
const SKY = {50: '#f0f9ff', 400: '#38bdf8', 500: '#0ea5e9', 700: '#0369a1'};
const AMB = {50: '#fffbeb', 200: '#fde68a', 700: '#b45309', 900: '#78350f'};
const NAV_BG = `linear-gradient(90deg, ${P.navbarStart} 0%, ${P.navbarEnd} 100%)`;
const I: React.FC<{n: string; s?: number; c?: string; style?: React.CSSProperties}> = ({n, s = 14, c, style}) => <i className={`pi pi-${n}`} style={{fontSize: s, color: c, ...style}} />;

// ---------------- Verificações e selos ----------------
export const VERIF = [
	{k: 'RAT_AUSENTE', nome: 'RAT ausente', curto: 'RAT', icon: 'file-pdf', sev: 'Alta'},
	{k: 'CONTRATO', nome: 'Contrato', curto: 'Contrato', icon: 'file-check', sev: 'Alta'},
	{k: 'ASSINATURAS', nome: 'Assinaturas do RAT', curto: 'Assinaturas', icon: 'pen-to-square', sev: 'Alta'},
	{k: 'ASSINATURA_CONSULTOR', nome: 'Assinatura do consultor', curto: 'Consultor', icon: 'user-edit', sev: 'Média'},
	{k: 'COPIA_E_COLA', nome: 'Cópia e cola', curto: 'Cópia e cola', icon: 'copy', sev: 'Média'},
	{k: 'IDENTIFICADOR_EXTERNO', nome: 'Identificador externo', curto: 'Identificador', icon: 'hashtag', sev: 'Média'},
	{k: 'PERTINENCIA', nome: 'Pertinência da recomendação', curto: 'Pertinência', icon: 'comments', sev: 'Baixa'},
] as const;
export type St = 'A' | 'O' | 'I' | 'D' | 'N';
export const Selo: React.FC<{st: St; icon: string; size?: number; pop?: number}> = ({st, icon, size = 28, pop = 1}) => {
	const sty: Record<St, React.CSSProperties> = {
		A: {border: `1px solid ${RED[600]}`, background: RED[600], color: '#fff'},
		O: {border: `1px solid ${GRN[200]}`, background: GRN[50], color: GRN[700]},
		I: {border: `1px dashed ${SKY[400]}`, background: SKY[50], color: SKY[700]},
		D: {border: `1px solid ${SUR[200]}`, background: SUR[100], color: SUR[500]},
		N: {border: `1px dashed ${SUR[300]}`, background: 'transparent', color: SUR[400]},
	};
	return (
		<span style={{width: size, height: size, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', transform: `scale(${pop})`, ...sty[st]}}>
			<I n={icon} s={size * 0.5} />
		</span>
	);
};
export const Regua: React.FC<{s: string; size?: number; f?: number; at?: number; gap?: number; pops?: number[]}> = ({s, size = 28, f = 0, at, gap = 6, pops}) => (
	<div style={{display: 'flex', gap}}>
		{s.split(',').map((st, i) => (
			<Selo key={i} st={st as St} icon={VERIF[i].icon} size={size} pop={at !== undefined ? Math.min(1, sp(f, at + i * 0.12, POP)) : pops ? pops[i] : 1} />
		))}
	</div>
);

// ---------------- Navbar PecTrace (como na tela real do web, programa ATER - JBS) ----------------
const MENU: [string, string, boolean?][] = [['Home', 'home'], ['Formulários', 'file-edit', true], ['Cadastros', 'database', true], ['Agenda', 'calendar'], ['Operações', 'briefcase', true], ['Mapas', 'map', true], ['Resultados', 'chart-bar', true], ['Configurações', 'cog', true]];
export const Navbar: React.FC = () => (
	<div style={{position: 'absolute', left: 0, top: 0, width: 1440, height: NAV_H, background: NAV_BG, display: 'flex', alignItems: 'center', padding: '0 14px', boxSizing: 'border-box', gap: 4, zIndex: 20, fontFamily: 'Roboto, ' + UI}}>
		<div style={{width: 118, color: '#fff', lineHeight: 1.05}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 15, letterSpacing: '0.01em'}}>
				<I n="verified" s={13} c="#fff" /> PECTRACE
			</div>
			<div style={{fontSize: 10, opacity: 0.9, marginTop: 2, letterSpacing: '0.04em'}}>ATER - JBS | 2025</div>
		</div>
		<span style={{width: 1, height: 34, background: 'rgba(255,255,255,0.3)', margin: '0 6px'}} />
		{MENU.map(([t, ic, dd]) => (
			<span key={t} style={{display: 'inline-flex', alignItems: 'center', gap: 5, height: 32, padding: '0 9px', borderRadius: 8, color: '#fff', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', background: t === 'Operações' ? '#8f2f10' : 'transparent'}}>
				<I n={ic} s={11} c="rgba(255,255,255,0.85)" />
				{t}
				{dd && <I n={t === 'Operações' ? 'chevron-up' : 'chevron-down'} s={8} c="#fff" />}
			</span>
		))}
		<div style={{flex: 1}} />
		{['chevron-left', 'chevron-right'].map((n) => (
			<span key={n} style={{width: 22, height: 22, borderRadius: 6, background: n === 'chevron-left' ? '#8f2f10' : 'rgba(143,47,16,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<I n={n} s={9} c="#fff" />
			</span>
		))}
		<span style={{height: 24, padding: '0 10px', borderRadius: 99, background: '#8f2f10', color: '#fff', fontSize: 10.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 4}}>
			<I n="sparkles" s={9} c="#ffae7c" /> agrotraceIA
		</span>
		<span style={{height: 24, padding: '0 10px', borderRadius: 99, background: '#8f2f10', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', marginLeft: 4}}>CMS</span>
		<div style={{position: 'relative', width: 34, height: 34, borderRadius: 99, background: '#f4f4f5', marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<I n="user" s={16} c="#a1a1aa" />
			<span style={{position: 'absolute', right: -5, top: -5, minWidth: 16, height: 16, borderRadius: 99, background: '#dc2626', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #f15a24'}}>14</span>
		</div>
	</div>
);

// ---------------- Dados (banco local, calibração de ago–set/2026) ----------------
export const TOT = {validados: 209, sem: 22, com: 187, inc: 0};
export const CARDS = [
	{i: 0, n: 1, p: 0, inc: 0},
	{i: 1, n: 17, p: 8, inc: 0},
	{i: 2, n: 2, p: 1, inc: 1},
	{i: 3, n: 0, p: 0, inc: 1},
	{i: 4, n: 165, p: 79, inc: 0},
	{i: 5, n: 74, p: 35, inc: 0},
	{i: 6, n: 47, p: 22, inc: 1},
];
export const TECS = [
	{n: 'Thadeu', i: 'TH', a: 52, t: 58},
	{n: 'Alfredo', i: 'AL', a: 45, t: 48},
	{n: 'Kaique', i: 'KA', a: 44, t: 46},
];
export type Row = {id: number; tipo: string; ex: string; tec: string; prop: string; s: string; mot: [string, string]; mais: number};
export const ROWS_CONTRATO: Row[] = [
	{id: 60290, tipo: 'Nutricional', ex: '04/08/2026', tec: 'Kaique', prop: 'SITIO TAISMARA', s: 'O,A,O,O,A,A,O', mot: ['Contrato', 'A propriedade tem contrato cadastrado, mas nenhum vigente na data de execução'], mais: 2},
	{id: 63157, tipo: 'Diagnóstico', ex: '12/09/2026', tec: 'William', prop: 'Três irmaos', s: 'O,A,A,O,A,A,O', mot: ['Contrato', 'RAT sem número de contrato: o vigente é outro'], mais: 3},
	{id: 61038, tipo: 'Nutricional', ex: '17/08/2026', tec: 'Alfredo', prop: 'SITIO BOA ESPERANCA', s: 'O,A,O,O,A,A,O', mot: ['Contrato', 'O RAT traz 056/2025, mas o vigente na data de execução é 055/2025'], mais: 2},
	{id: 63175, tipo: 'Sanitário', ex: '14/09/2026', tec: 'William', prop: 'Nv Paraiso', s: 'O,A,O,O,A,A,O', mot: ['Contrato', 'A propriedade tem contrato cadastrado, mas nenhum vigente'], mais: 2},
	{id: 61625, tipo: 'Reprodutivo', ex: '27/08/2026', tec: 'Thadeu', prop: 'ESTANCIA FLOR DA SERRA', s: 'O,A,O,O,A,O,A', mot: ['Contrato', 'A propriedade tem contrato cadastrado, mas nenhum vigente'], mais: 2},
	{id: 63083, tipo: 'Nutricional', ex: '27/08/2026', tec: 'Clayton', prop: 'SITIO COLORADO', s: 'O,A,O,O,A,O,O', mot: ['Contrato', 'A propriedade não tem nenhum contrato cadastrado'], mais: 1},
];
export const ROWS_TODOS: Row[] = [
	{id: 64304, tipo: 'Reprodutivo', ex: '29/09/2026', tec: 'Kaique', prop: 'SITIO BOA SORTE', s: 'O,O,O,O,A,A,A', mot: ['Cópia e cola', 'Recomendação e situação encontrada iguais às do atendimento #64093'], mais: 2},
	{id: 64093, tipo: 'Reprodutivo', ex: '28/09/2026', tec: 'Kaique', prop: 'SITIO CASTOR', s: 'O,O,O,O,A,A,A', mot: ['Cópia e cola', 'Recomendação e situação encontrada iguais às do atendimento #64091'], mais: 2},
	{id: 63175, tipo: 'Sanitário', ex: '14/09/2026', tec: 'William', prop: 'Nv Paraiso', s: 'O,A,O,O,A,A,O', mot: ['Contrato', 'A propriedade tem contrato cadastrado, mas nenhum vigente'], mais: 2},
	{id: 63157, tipo: 'Diagnóstico', ex: '12/09/2026', tec: 'William', prop: 'Três irmaos', s: 'O,A,A,O,A,A,O', mot: ['Contrato', 'RAT sem número de contrato: o vigente é outro'], mais: 3},
	{id: 62180, tipo: 'Diagnóstico', ex: '05/09/2026', tec: 'William', prop: 'SITIO 2 IRMAOS', s: 'O,O,A,O,A,O,O', mot: ['Assinaturas do RAT', 'Assinatura ausente no RAT: o bloco do produtor está sem assinatura'], mais: 1},
	{id: 61625, tipo: 'Reprodutivo', ex: '27/08/2026', tec: 'Thadeu', prop: 'ESTANCIA FLOR DA SERRA', s: 'O,A,O,O,A,O,A', mot: ['Contrato', 'A propriedade tem contrato cadastrado, mas nenhum vigente'], mais: 2},
];

// ---------------- Peças ----------------
const Btn: React.FC<{label: string; icon?: string; primary?: boolean; outlined?: boolean; w?: number; press?: number; small?: boolean}> = ({label, icon, primary, outlined, w, press = 0, small}) => (
	<div style={{width: w, height: small ? 32 : 38, padding: '0 14px', boxSizing: 'border-box', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: UI, fontWeight: 500, fontSize: small ? 13 : 14, whiteSpace: 'nowrap', background: primary ? P.p500 : '#fff', color: primary ? '#fff' : outlined ? P.p700 : SUR[700], border: primary ? `1px solid ${P.p500}` : `1px solid ${outlined ? P.p300 : SUR[300]}`, transform: `scale(${1 - 0.04 * Math.sin(Math.min(1, press) * Math.PI)})`, filter: press > 0 && press < 1 ? 'brightness(0.92)' : undefined}}>
		{icon && <I n={icon} s={small ? 12 : 14} />}
		{label}
	</div>
);
const Sec: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, children, style}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 12, border: `1px solid ${SUR[200]}`, background: '#fff', boxSizing: 'border-box', ...style}}>{children}</div>
);
const H2: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: SUR[900]}}>{children}</div>;
const Help: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontFamily: UI, fontSize: 12.5, color: SUR[500], marginTop: 2}}>{children}</div>;

export type PageState = {
	at: number; // início da montagem (tempo)
	filtro: number; // 0..1 filtro "Verificação: Contrato" aplicado
	rowHot?: number; // linha destacada (índice)
	press?: {k: string; p: number}; // botão pressionado
	carousel?: number; // deslocamento do carrossel em cartões
	tab?: 'com' | 'todos';
};

/** Página inteira (altura ~1320). */
export const Page: React.FC<{f: number; s: PageState}> = ({f, s}) => {
	const A = s.at;
	const e = (d: number, o: Parameters<typeof enter>[2] = {}) => enter(f, A + d, {y: 10, blur: 4, ...o});
	const roll = (to: number, d: number, dur = 1.6) => Math.round(lerp(0, to, ramp(f, b(A + d), b(A + d + dur), OUT)));
	const heroN = roll(TOT.sem, 1.2);
	const barU = ramp(f, b(A + 1.4), b(A + 2.6), EASE);
	const rows = s.filtro > 0.5 ? ROWS_CONTRATO : ROWS_TODOS;
	const pr = (k: string) => (s.press?.k === k ? s.press.p : 0);
	const cx = s.carousel ?? 0;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1440, height: 1340, background: SUR[50], fontFamily: UI}}>
			{/* Cabeçalho */}
			<div style={{position: 'absolute', left: 32, top: 72, fontSize: 12, color: SUR[500], ...e(0)}}>
				Atendimento <I n="angle-right" s={10} /> <span style={{color: SUR[700]}}>Validação de atendimentos</span>
			</div>
			<div style={{position: 'absolute', left: 32, top: 96, display: 'flex', alignItems: 'center', gap: 14, ...e(0.1)}}>
				<div style={{width: 44, height: 44, borderRadius: 12, background: P.p50, color: P.p700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<I n="verified" s={22} />
				</div>
				<div>
					<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, color: SUR[900], lineHeight: 1.1}}>Validação de atendimentos</div>
					<div style={{fontSize: 13, color: SUR[500]}}>ATER - JBS</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 640, top: 99, height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${SUR[200]}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SUR[700], ...e(0.3, {x: 20, y: 0})}}>
				<span style={{width: 8, height: 8, borderRadius: 9, background: GRN[500], boxShadow: `0 0 0 ${3 + 3 * Math.sin(f * 0.15)}px rgba(34,197,94,0.18)`}} />
				Validação automática ativa desde 12/11/2026 · Modo ativo
			</div>
			<div style={{position: 'absolute', left: 1086, top: 99, ...e(0.35, {x: 20, y: 0})}}>
				<Btn label="Atualizar" icon="refresh" outlined w={112} press={pr('atualizar')} />
			</div>
			<div style={{position: 'absolute', left: 1208, top: 99, ...e(0.4, {x: 20, y: 0})}}>
				<Btn label="Analisar atendimentos" icon="sparkles" primary w={200} press={pr('analisar')} />
			</div>

			{/* Resumo */}
			<Sec x={32} y={164} w={1376} h={292} style={e(0.5, {y: 20})}>
				<div style={{position: 'absolute', left: 20, top: 16}}>
					<H2>Resumo da validação</H2>
					<Help>Pela data em que a validação rodou. Vale para os totais e para a lista.</Help>
				</div>
				<div style={{position: 'absolute', right: 20, top: 18, width: 288, height: 36, borderRadius: 8, border: `1px solid ${SUR[300]}`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', boxSizing: 'border-box', fontSize: 13, color: SUR[700]}}>
					<I n="calendar" s={13} c={SUR[500]} /> 01/08/2026 - 30/09/2026
				</div>
				{/* Hero */}
				<div style={{position: 'absolute', left: 20, top: 72, width: 352, height: 200, borderRadius: 12, padding: 20, boxSizing: 'border-box', background: NAV_BG, color: '#fff', ...e(0.9, {s: 0.94, y: 16})}}>
					<div style={{fontSize: 14, opacity: 0.85}}>Prontos para a JBS</div>
					<div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
						<span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, lineHeight: 1.05, transform: `scale(${1 + 0.12 * Math.max(0, 1 - Math.abs(f - b(A + 2.8)) / 8)})`, display: 'inline-block', transformOrigin: 'left center'}}>{heroN}</span>
						<span style={{fontSize: 14, opacity: 0.9}}>de {roll(TOT.validados, 1.2)} validados</span>
					</div>
					<div style={{fontSize: 12.5, opacity: 0.85, marginTop: -2}}>seguiriam para a JBS sem alerta</div>
					<div style={{marginTop: 12, height: 12, borderRadius: 99, background: '#fff', padding: 2, boxSizing: 'border-box', display: 'flex', gap: 2}}>
						<div style={{width: `${(TOT.sem / TOT.validados) * 100 * barU}%`, background: GRN[500], borderRadius: 99}} />
						<div style={{width: `${(TOT.com / TOT.validados) * 100 * barU}%`, background: RED[600], borderRadius: 99}} />
					</div>
					<div style={{display: 'flex', gap: 6, marginTop: 12}}>
						{[`Sem alerta · ${TOT.sem}`, `Com alerta · ${TOT.com}`, `Inconclusivos · ${TOT.inc}`].map((t, i) => (
							<span key={t} style={{height: 26, padding: '0 10px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', fontSize: 11.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', ...e(1.6 + i * 0.1, {y: 6, s: 0.9})}}>{t}</span>
						))}
					</div>
				</div>
				{/* Carrossel de verificações */}
				<div style={{position: 'absolute', left: 392, top: 72, width: 964, height: 200, overflow: 'hidden'}}>
					<div style={{position: 'absolute', left: -cx * 326, top: 0, display: 'flex', gap: 14}}>
						{CARDS.map((c, i) => {
							const v = VERIF[c.i];
							const alert = c.n > 0;
							const active = s.filtro > 0.5 && c.i === 1;
							return (
								<div key={v.k} style={{width: 312, height: 200, borderRadius: 12, boxSizing: 'border-box', padding: 18, border: `1px solid ${active ? P.p400 : SUR[200]}`, background: active ? P.p50 : '#fff', boxShadow: active ? `0 0 0 3px ${P.p100}` : undefined, ...e(1.1 + Math.min(i, 3) * 0.12, {y: 18})}}>
									<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
										<span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: alert ? RED[50] : c.inc ? SKY[50] : GRN[50], color: alert ? RED[700] : c.inc ? SKY[700] : GRN[700]}}>
											<I n={v.icon} s={11} /> {alert ? 'Em alerta' : c.inc ? 'Inconclusiva' : 'Sem alertas'}
										</span>
										<span style={{fontSize: 11, color: SUR[500]}}>{TOT.validados} avaliados</span>
									</div>
									<div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12}}>
										<span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, color: alert ? RED[700] : SUR[900]}}>{roll(c.n, 1.3 + Math.min(i, 3) * 0.12)}</span>
										<span style={{fontSize: 13, color: SUR[500]}}>em alerta</span>
									</div>
									<div style={{height: 6, borderRadius: 9, background: SUR[100], marginTop: 6}}>
										<div style={{height: 6, borderRadius: 9, width: `${Math.max(c.p, 1) * ramp(f, b(A + 1.6), b(A + 2.8), EASE)}%`, background: alert ? RED[600] : GRN[500]}} />
									</div>
									<div style={{fontSize: 11.5, color: SUR[500], marginTop: 6}}>
										{c.p}% dos validados{c.inc ? <span style={{color: SKY[700]}}> · {c.inc} inconclusivo</span> : null}
									</div>
									<div style={{fontSize: 14, fontWeight: 600, color: SUR[900], marginTop: 12}}>{v.nome}</div>
									<div style={{fontSize: 12.5, color: P.p700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6}}>
										{active ? (
											<>
												<I n="filter" s={11} /> Filtrando a lista
											</>
										) : (
											<>
												Ver atendimentos <I n="arrow-right" s={11} />
											</>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</Sec>

			{/* Técnicos */}
			<Sec x={32} y={472} w={1376} h={112} style={e(0.7, {y: 20})}>
				<div style={{position: 'absolute', left: 20, top: 14}}>
					<H2>Técnicos</H2>
					<Help>Atendimentos com alerta de cada técnico, entre os validados. Clique para filtrar a lista.</Help>
				</div>
				<div style={{position: 'absolute', left: 20, top: 66, display: 'flex', gap: 40}}>
					{TECS.map((t, i) => (
						<div key={t.n} style={{display: 'flex', alignItems: 'center', gap: 10, width: 300, ...e(1.4 + i * 0.1, {x: -10, y: 0})}}>
							<div style={{width: 36, height: 36, borderRadius: 99, background: P.p100, color: P.p800, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{t.i}</div>
							<div style={{flex: 1}}>
								<div style={{fontSize: 13.5, fontWeight: 500, color: SUR[900]}}>{t.n}</div>
								<div style={{fontSize: 12, color: SUR[500]}}>
									{t.a} de {t.t} com alerta
								</div>
								<div style={{height: 4, borderRadius: 9, background: SUR[100], marginTop: 3}}>
									<div style={{height: 4, borderRadius: 9, width: `${(t.a / t.t) * 100 * ramp(f, b(A + 1.8), b(A + 2.8), EASE)}%`, background: RED[600]}} />
								</div>
							</div>
						</div>
					))}
				</div>
				<div style={{position: 'absolute', right: 20, top: 66}}>
					<Btn label="Ver todos (8)" small />
				</div>
			</Sec>

			{/* Mesa */}
			<Sec x={32} y={600} w={1376} h={720} style={e(0.9, {y: 20})}>
				<div style={{position: 'absolute', left: 20, top: 16, display: 'flex', alignItems: 'center', gap: 10}}>
					<H2>Atendimentos para conferir</H2>
					<span style={{padding: '2px 9px', borderRadius: 99, background: SUR[100], fontSize: 12, fontWeight: 600, color: SUR[700]}}>{s.filtro > 0.5 ? 17 : TOT.com}</span>
				</div>
				<div style={{position: 'absolute', left: 20, top: 42}}>
					<Help>Abra o dossiê para ver as evidências, dispensar um alerta ou revalidar.</Help>
				</div>
				<div style={{position: 'absolute', left: 20, top: 74, display: 'flex', padding: 3, borderRadius: 10, background: SUR[100]}}>
					{[['Com alerta', s.filtro > 0.5 ? 17 : TOT.com], ['Dispensados', 0], ['Inconclusivos', 0], ['Todos', s.filtro > 0.5 ? 17 : TOT.validados]].map(([t, n], i) => (
						<span key={t} style={{padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: i === 0 ? '#fff' : 'transparent', color: i === 0 ? P.p700 : SUR[600], boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.08)' : undefined}}>
							{t} <span style={{opacity: 0.7}}>{n}</span>
						</span>
					))}
				</div>
				<div style={{position: 'absolute', left: 470, top: 77}}>
					<Btn label="Filtros" icon="filter" small />
				</div>
				{s.filtro > 0.01 && (
					<div style={{position: 'absolute', left: 570, top: 80, display: 'flex', gap: 8, alignItems: 'center', opacity: s.filtro, transform: `scale(${0.97 + 0.03 * s.filtro})`}}>
						<span style={{display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 99, border: `1px solid ${P.p200}`, background: P.p50, color: P.p700, fontSize: 12, fontWeight: 600}}>
							Verificação: Contrato <I n="times" s={10} />
						</span>
						<span style={{fontSize: 12.5, color: SUR[600], display: 'inline-flex', alignItems: 'center', gap: 6}}>
							<I n="filter-slash" s={12} /> Limpar filtros
						</span>
					</div>
				)}
				<div style={{position: 'absolute', left: 20, right: 20, top: 124, height: 36, borderRadius: 8, background: SUR[50], display: 'grid', gridTemplateColumns: '32px 170px 210px 1fr 130px 90px', alignItems: 'center', padding: '0 12px', fontSize: 12, fontWeight: 600, color: SUR[500]}}>
					<span style={{width: 14, height: 14, border: `1.5px solid ${SUR[300]}`, borderRadius: 4}} />
					<span>Atendimento</span>
					<span>Técnico e propriedade</span>
					<span>Verificações</span>
					<span>Validado em</span>
					<span>Ações</span>
				</div>
				{rows.map((r, i) => {
					const hot = s.rowHot === i;
					const key = `${s.filtro > 0.5 ? 'c' : 't'}${i}`;
					return (
						<div key={key} style={{position: 'absolute', left: 20, right: 20, top: 166 + i * 76, height: 70, borderBottom: `1px solid ${SUR[100]}`, display: 'grid', gridTemplateColumns: '32px 170px 210px 1fr 130px 90px', alignItems: 'center', padding: '0 12px', background: hot ? P.p50 : '#fff', borderRadius: hot ? 8 : 0, ...enter(f, (s.filtro > 0.5 ? M.filtroAlta + 0.4 : A + 1.2) + Math.min(i, 7) * 0.08, {y: 8, blur: 3})}}>
							<span style={{width: 14, height: 14, border: `1.5px solid ${SUR[300]}`, borderRadius: 4}} />
							<div>
								<div style={{fontSize: 15, fontWeight: 600, color: P.p700}}>#{r.id}</div>
								<div style={{display: 'flex', gap: 6, alignItems: 'center', marginTop: 2}}>
									<span style={{fontSize: 11, padding: '1px 6px', borderRadius: 5, background: SUR[100], color: SUR[600]}}>{r.tipo}</span>
								</div>
								<div style={{fontSize: 11, color: SUR[500], marginTop: 2}}>Executado em {r.ex}</div>
							</div>
							<div>
								<div style={{fontSize: 13.5, fontWeight: 500, color: SUR[900]}}>{r.tec}</div>
								<div style={{fontSize: 12, color: SUR[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200}}>{r.prop}</div>
							</div>
							<div style={{minWidth: 0}}>
								<Regua s={r.s} />
								<div style={{fontSize: 13, color: SUR[700], marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 520, display: 'flex', alignItems: 'center', gap: 6}}>
									<span style={{fontWeight: 600, color: RED[700]}}>{r.mot[0]}</span>
									<span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>· {r.mot[1]}</span>
									<span style={{flex: 'none', padding: '1px 6px', borderRadius: 6, background: SUR[100], fontSize: 11.5, fontWeight: 600}}>+{r.mais}</span>
								</div>
							</div>
							<span style={{fontSize: 12.5, color: SUR[600]}}>13/11/2026</span>
							<div style={{display: 'flex', gap: 8}}>
								<span style={{width: 36, height: 36, borderRadius: 99, border: `1px solid ${hot ? P.p400 : SUR[200]}`, background: hot ? P.p100 : '#fff', color: P.p700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<I n="folder-open" s={14} />
								</span>
								<span style={{width: 36, height: 36, borderRadius: 99, border: `1px solid ${SUR[200]}`, color: SUR[600], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<I n="external-link" s={13} />
								</span>
							</div>
						</div>
					);
				})}
			</Sec>
		</div>
	);
};

// ---------------- Dossiê (drawer) ----------------
export const DRAWER_W = 704;
export type DossieState = {open: number; dispensar: number; just: string; disp: number; reval: number; revalOk: number; scroll: number; press?: {k: string; p: number}};
const Ev: React.FC<{rows: [string, React.ReactNode][]}> = ({rows}) => (
	<div style={{marginTop: 10, borderRadius: 6, border: `1px solid ${SUR[200]}`, background: SUR[50], padding: '10px 12px', display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: 8, columnGap: 12}}>
		{rows.map(([l, v]) => (
			<React.Fragment key={l}>
				<div style={{fontSize: 11.5, color: SUR[500]}}>{l}</div>
				<div style={{fontSize: 13, color: SUR[900]}}>{v}</div>
			</React.Fragment>
		))}
	</div>
);
const Comparar: React.FC<{press?: number}> = ({press = 0}) => (
	<div style={{marginTop: 8}}>
		<span style={{display: 'inline-flex', alignItems: 'center', gap: 7, height: 30, padding: '0 11px', borderRadius: 6, border: `1px solid ${SUR[300]}`, background: '#fff', color: SUR[700], fontSize: 12.5, fontWeight: 500, transform: `scale(${1 - 0.05 * Math.sin(Math.min(1, press) * Math.PI)})`, filter: press > 0 && press < 1 ? 'brightness(0.94)' : undefined}}>
			<I n="clone" s={12} /> Comparar lado a lado
		</span>
	</div>
);
const Bar: React.FC<{p: number; u: number}> = ({p, u}) => (
	<div style={{position: 'relative', height: 6, maxWidth: 300, borderRadius: 9, background: SUR[200], marginTop: 6}}>
		<div style={{height: 6, borderRadius: 9, width: `${p * u}%`, background: RED[500]}} />
		<div style={{position: 'absolute', left: '80%', top: -2, width: 2, height: 10, background: SUR[900]}} />
	</div>
);
const Tag: React.FC<{k: 'A' | 'D' | 'O'}> = ({k}) => {
	const m = {A: [RED[50], RED[200], RED[700], 'exclamation-triangle', 'Alerta'], D: [SUR[100], SUR[200], SUR[600], 'check', 'Dispensado'], O: [GRN[50], GRN[200], GRN[700], 'check-circle', 'OK']}[k];
	return (
		<span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, border: `1px solid ${m[1]}`, background: m[0], color: m[2], fontSize: 11.5, fontWeight: 700}}>
			<I n={m[3]} s={11} /> {m[4]}
		</span>
	);
};
const Bloco: React.FC<{i: number; st: 'A' | 'D'; sev: string; motivo: string; children?: React.ReactNode; style?: React.CSSProperties; pop?: number}> = ({i, st, sev, motivo, children, style, pop = 1}) => (
	<div style={{borderRadius: 8, border: `1px solid ${SUR[200]}`, padding: 16, background: '#fff', ...style}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
			<Selo st={st} icon={VERIF[i].icon} size={28} pop={pop} />
			<span style={{fontSize: 14, fontWeight: 700, color: SUR[900]}}>{VERIF[i].nome}</span>
			<Tag k={st} />
			<span style={{fontSize: 12, fontWeight: 600, color: sev === 'Alta' ? RED[700] : sev === 'Média' ? AMB[700] : SUR[500]}}>Severidade: {sev}</span>
			<span style={{flex: 1}} />
			<span style={{fontSize: 11.5, color: SUR[500]}}>Validado em 13/11/2026</span>
		</div>
		<div style={{fontSize: 13.5, color: SUR[700], marginTop: 10, lineHeight: 1.4}}>{motivo}</div>
		{children}
	</div>
);
export const JUST = 'Propriedade ainda sem código na planilha da JBS; cadastro já solicitado.';

export const Dossie: React.FC<{f: number; s: DossieState}> = ({f, s}) => {
	if (s.open <= 0.001) return null;
	const x = 1440 - DRAWER_W * s.open;
	const pr = (k: string) => (s.press?.k === k ? s.press.p : 0);
	const u = ramp(f, b(M.copia), b(M.copia + 1.2), EASE);
	const idSt: 'A' | 'D' = s.disp > 0.5 ? 'D' : 'A';
	const idPop = 1 + 0.25 * Math.max(0, 1 - Math.abs(f - b(M.dispOk) - 4) / 6);
	return (
		<>
			<div style={{position: 'absolute', inset: 0, background: `rgba(9,9,11,${0.4 * s.open})`, zIndex: 30}} />
			<div style={{position: 'absolute', left: x, top: 0, width: DRAWER_W, height: 810, background: '#fff', zIndex: 31, boxShadow: '-24px 0 60px -20px rgba(0,0,0,0.4)', fontFamily: UI, overflow: 'hidden'}}>
				<div style={{height: 76, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', borderBottom: `1px solid ${SUR[200]}`}}>
					<div style={{width: 40, height: 40, borderRadius: 12, background: P.p50, color: P.p700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<I n="folder-open" s={18} />
					</div>
					<div style={{flex: 1}}>
						<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: SUR[900]}}>Atendimento #60290</div>
						<div style={{fontSize: 12.5, color: SUR[500]}}>Dossiê do atendimento · 1 de 17</div>
					</div>
					{['angle-up', 'angle-down', 'times'].map((n) => (
						<span key={n} style={{width: 34, height: 34, borderRadius: 99, border: `1px solid ${SUR[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: SUR[600]}}>
							<I n={n} s={13} />
						</span>
					))}
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 76, bottom: 0, overflow: 'hidden'}}>
					<div style={{position: 'absolute', left: 24, right: 24, top: 18 - s.scroll}}>
						<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 10, columnGap: 20}}>
							{[['Técnico', 'Kaique'], ['Propriedade', 'SITIO TAISMARA'], ['Tipo', 'Nutricional'], ['Datas', 'Executado em 04/08/2026 · concluído em 04/08/2026']].map(([l, v]) => (
								<div key={l}>
									<div style={{fontSize: 11.5, color: SUR[500]}}>{l}</div>
									<div style={{fontSize: 13.5, color: SUR[900], fontWeight: 500}}>{v}</div>
								</div>
							))}
						</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18}}>
							<Regua s={`O,A,O,O,A,${idSt},O`} size={36} pops={[1, 1, 1, 1, 1, idPop, 1].map((v, i) => Math.min(1, sp(f, M.dossie + 0.3 + i * 0.1, POP)) * v)} />
							<span style={{fontSize: 12.5, color: SUR[600]}}>{s.disp > 0.5 ? '2 alertas, 1 dispensado, 4 OK' : '3 alertas, 4 OK'}</span>
						</div>
						<div style={{display: 'flex', gap: 10, marginTop: 14}}>
							<Btn label="Revalidar" icon="refresh" outlined small press={pr('revalidar')} />
							<Btn label="Abrir atendimento" icon="external-link" small />
							<Btn label="Atualizar" icon="sync" small />
						</div>
						{s.reval > 0.01 && (
							<div style={{marginTop: 12, borderRadius: 8, border: `1px solid ${AMB[200]}`, background: AMB[50], color: AMB[900], padding: 12, fontSize: 13, lineHeight: 1.4, opacity: s.reval, transform: `scale(${0.97 + 0.03 * s.reval})`, transformOrigin: 'top left'}}>
								<div style={{display: 'flex', gap: 8}}>
									<I n="exclamation-triangle" s={14} style={{marginTop: 2}} />
									<span>Revalidar usa IA, tem custo e substitui os resultados atuais deste atendimento. Alertas dispensados voltam a aparecer se o problema continuar.</span>
								</div>
								<div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10}}>
									<Btn label="Cancelar" small />
									<Btn label="Revalidar agora" primary small press={pr('revalidarAgora')} />
								</div>
							</div>
						)}
						<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 22}}>
							<I n="chevron-down" s={12} c={SUR[500]} />
							<span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: SUR[900]}}>Com alerta</span>
							<span style={{padding: '1px 8px', borderRadius: 99, background: SUR[100], fontSize: 12, fontWeight: 600}}>{s.disp > 0.5 ? 2 : 3}</span>
						</div>
						<div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12}}>
							<Bloco i={1} st="A" sev="Alta" motivo="A propriedade tem contrato cadastrado, mas nenhum vigente na data de execução (04/08/2026): 137/2022 (21/09/2022 a 21/09/2025)." style={enter(f, M.dossie + 0.6, {y: 10})}>
								<Ev rows={[['Data de execução', '04/08/2026'], ['Contrato vigente', <span style={{color: RED[700], fontWeight: 600}}>Nenhum na data de execução</span>], ['Contratos da propriedade', '137/2022 · vigência de 21/09/2022 a 21/09/2025'], ['Número impresso no RAT', 'O RAT não traz número de contrato']]} />
							</Bloco>
							<Bloco i={4} st="A" sev="Média" motivo="Recomendação e situação encontrada iguais às do atendimento #60090 de 28/07/2026 (em outra propriedade): recomendação 100% e situação 100% semelhantes. Limiar de 80%, janela de 31 dias." style={enter(f, M.dossie + 0.75, {y: 10})}>
								<Ev
									rows={[
										['Atendimentos comparados', '33 do mesmo técnico, de 04/07/2026 a 04/08/2026'],
										['Limiar de alerta', '80% ou mais de semelhança'],
										[
											'Situação encontrada',
											<div>
												<span style={{color: RED[700]}}>100% semelhante ao atendimento #60096 de 29/07/2026 (outra propriedade)</span> <span style={{color: RED[700], fontWeight: 600}}>Abrir #60096</span>
												<Comparar press={pr('comparar')} />
												<Bar p={100} u={u} />
											</div>,
										],
										[
											'Recomendação',
											<div>
												<span style={{color: RED[700]}}>100% semelhante ao atendimento #60090 de 28/07/2026 (outra propriedade)</span> <span style={{color: RED[700], fontWeight: 600}}>Abrir #60090</span>
												<Comparar />
												<Bar p={100} u={u} />
											</div>,
										],
									]}
								/>
							</Bloco>
							<Bloco i={5} st={idSt} sev="Média" motivo="A propriedade está sem identificador externo preenchido." style={enter(f, M.dossie + 0.9, {y: 10})} pop={idPop}>
								{s.disp > 0.5 ? (
									<div style={{marginTop: 10, borderRadius: 6, background: SUR[100], padding: 12, fontSize: 13, color: SUR[700], display: 'flex', gap: 8, ...enter(f, M.dispOk + 0.2, {y: 6})}}>
										<I n="check-circle" s={14} c={GRN[700]} style={{marginTop: 2}} />
										<div>
											<div style={{fontWeight: 600}}>Dispensado por Gestor ATER em 13/11/2026</div>
											<div style={{fontStyle: 'italic', marginTop: 2}}>“{JUST}”</div>
										</div>
									</div>
								) : (
									<>
										<div style={{marginTop: 10}}>
											<Btn label="Dispensar alerta" icon="check-circle" outlined small press={pr('dispensar')} />
										</div>
										{s.dispensar > 0.01 && (
											<div style={{marginTop: 10, borderRadius: 6, border: `1px solid ${SUR[200]}`, background: SUR[50], padding: 12, opacity: s.dispensar, transform: `scale(${0.97 + 0.03 * s.dispensar})`, transformOrigin: 'top left'}}>
												<div style={{fontSize: 12.5, fontWeight: 600, color: SUR[700]}}>Justificativa</div>
												<div style={{marginTop: 6, height: 76, borderRadius: 6, border: `1px solid ${s.just ? P.p400 : SUR[300]}`, boxShadow: s.just ? `0 0 0 3px ${P.p100}` : undefined, background: '#fff', padding: 10, boxSizing: 'border-box', fontSize: 13, color: s.just ? SUR[900] : SUR[400]}}>
													{s.just || 'Explique por que este alerta pode ser dispensado.'}
													{s.just && <span style={{display: 'inline-block', width: 1.5, height: 15, background: SUR[900], marginLeft: 1, verticalAlign: 'middle', opacity: Math.floor(f / 8) % 2}} />}
												</div>
												<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: SUR[500], marginTop: 4}}>
													<span>De 5 a 2000 caracteres.</span>
													<span>{s.just.length}/2000</span>
												</div>
												<div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8}}>
													<Btn label="Cancelar" small />
													<Btn label="Dispensar" icon="check" primary small press={pr('dispOk')} />
												</div>
											</div>
										)}
									</>
								)}
							</Bloco>
						</div>
						<div style={{height: 200}} />
					</div>
				</div>
			</div>
		</>
	);
};

// ---------------- Analisar atendimentos (disparo manual) ----------------
export type DisparoState = {open: number; modo: number; tec: number; periodo: number; calc: number; n: number; press?: {k: string; p: number}};
export const DIALOG = {x: 464, y: 120, w: 512};
export const Disparo: React.FC<{f: number; s: DisparoState}> = ({f, s}) => {
	if (s.open <= 0.001) return null;
	const pr = (k: string) => (s.press?.k === k ? s.press.p : 0);
	const field = (label: string, v: string, on: number, icon: string) => (
		<div style={{marginTop: 12}}>
			<div style={{fontSize: 12.5, fontWeight: 600, color: SUR[700]}}>{label}</div>
			<div style={{marginTop: 6, height: 38, borderRadius: 8, border: `1px solid ${on > 0.5 ? P.p400 : SUR[300]}`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', fontSize: 13.5, color: on > 0.5 ? SUR[900] : SUR[400]}}>
				<I n={icon} s={13} c={SUR[500]} />
				<span style={{flex: 1}}>{v}</span>
				<I n="chevron-down" s={11} c={SUR[500]} />
			</div>
		</div>
	);
	return (
		<>
			<div style={{position: 'absolute', inset: 0, background: `rgba(9,9,11,${0.45 * s.open})`, zIndex: 40}} />
			<div style={{position: 'absolute', left: DIALOG.x, top: DIALOG.y, width: DIALOG.w, borderRadius: 12, background: '#fff', zIndex: 41, padding: 22, boxSizing: 'border-box', fontFamily: UI, opacity: s.open, transform: `scale(${0.94 + 0.06 * s.open})`, boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5)'}}>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: SUR[900], flex: 1}}>Analisar atendimentos</div>
					<I n="times" s={13} c={SUR[500]} />
				</div>
				<div style={{fontSize: 13, color: SUR[600], marginTop: 8, lineHeight: 1.4}}>Roda a validação em atendimentos concluídos que já existem, por exemplo para conferir o histórico. Os resultados aparecem nesta tela.</div>
				<div style={{marginTop: 12, borderRadius: 8, border: `1px solid ${AMB[200]}`, background: AMB[50], color: AMB[900], padding: 10, fontSize: 12.5, lineHeight: 1.4, display: 'flex', gap: 8}}>
					<I n="exclamation-triangle" s={13} style={{marginTop: 2}} />
					<span>
						<b>A análise usa IA e tem custo.</b> Cada atendimento com RAT gera uma consulta ao modelo de IA. Confira a quantidade antes de confirmar.
					</span>
				</div>
				<div style={{fontSize: 12.5, fontWeight: 600, color: SUR[700], marginTop: 14}}>O que analisar</div>
				<div style={{display: 'flex', marginTop: 6, borderRadius: 8, border: `1px solid ${SUR[300]}`, overflow: 'hidden'}}>
					{['Selecionados na lista (0)', 'Por técnico e período'].map((t, i) => {
						const on = i === 1 ? s.modo : 1 - s.modo;
						return (
							<span key={t} style={{flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, background: on > 0.5 ? P.p500 : '#fff', color: on > 0.5 ? '#fff' : SUR[700]}}>
								{t}
							</span>
						);
					})}
				</div>
				{s.modo > 0.5 && (
					<>
						{field('Técnico', s.tec > 0.5 ? 'Kaique' : 'Escolha o técnico', s.tec, 'user')}
						{field('Período de execução', s.periodo > 0.5 ? '01/08/2026 - 30/09/2026' : 'dd/mm/aaaa - dd/mm/aaaa', s.periodo, 'calendar')}
						<div style={{fontSize: 11.5, color: SUR[500], marginTop: 6}}>Pela data de execução do atendimento. Só entram atendimentos concluídos desta certificadora.</div>
					</>
				)}
				<div style={{marginTop: 14, minHeight: 80, borderRadius: 8, background: SUR[50], display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 12, boxSizing: 'border-box'}}>
					{s.calc <= 0 ? (
						<span style={{fontSize: 13, color: SUR[500], textAlign: 'center'}}>Escolha o técnico e o período para ver quantos atendimentos serão analisados.</span>
					) : s.calc < 1 ? (
						<span style={{fontSize: 13, color: SUR[600], display: 'flex', gap: 8, alignItems: 'center'}}>
							<I n="spinner" s={14} style={{transform: `rotate(${f * 14}deg)`, display: 'inline-block'}} /> Calculando a quantidade…
						</span>
					) : (
						<div style={{textAlign: 'center', ...enter(f, M.previa + 0.4, {y: 6, s: 0.9})}}>
							<div style={{display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'center'}}>
								<Odo value={s.n} decimals={0} size={40} color={SUR[900]} />
								<span style={{fontSize: 14, color: SUR[700]}}>atendimentos serão analisados</span>
							</div>
							<div style={{fontSize: 11.5, color: SUR[500]}}>Ignorados: 0 (não concluídos ou de outra certificadora).</div>
						</div>
					)}
				</div>
				<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16}}>
					<Btn label="Cancelar" small />
					<Btn label={s.calc >= 1 ? `Analisar ${s.n}` : 'Analisar'} icon="sparkles" primary small press={pr('analisarN')} />
				</div>
			</div>
		</>
	);
};

export const Toast: React.FC<{f: number; at: number; out: number; title: string; desc: string; tone?: 'ok' | 'info'}> = ({f, at, out, title, desc, tone = 'ok'}) => {
	const k = sp(f, at, {damping: 16, stiffness: 160, mass: 0.7});
	const o = 1 - ramp(f, b(out) - 6, b(out));
	if (f < b(at) || o <= 0) return null;
	const c = tone === 'ok' ? GRN : SKY;
	return (
		<div style={{position: 'absolute', right: 20, top: 72, width: 380, zIndex: 60, borderRadius: 10, background: c[50], border: `1px solid ${tone === 'ok' ? GRN[200] : '#bae6fd'}`, padding: '12px 14px', fontFamily: UI, display: 'flex', gap: 10, opacity: Math.min(1, k) * o, transform: `translateX(${(1 - k) * 60}px)`, boxShadow: '0 16px 40px -16px rgba(0,0,0,0.3)'}}>
			<I n={tone === 'ok' ? 'check-circle' : 'info-circle'} s={16} c={c[700]} style={{marginTop: 2}} />
			<div>
				<div style={{fontSize: 14, fontWeight: 600, color: c[700]}}>{title}</div>
				<div style={{fontSize: 12.5, color: SUR[700], marginTop: 2, lineHeight: 1.35}}>{desc}</div>
			</div>
		</div>
	);
};
export {GRN, RED, SUR, P as PEC, NAV_BG, AMB};
