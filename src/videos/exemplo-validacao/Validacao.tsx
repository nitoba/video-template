// "Validação de atendimentos" (card 14210): filme de ~158 s no molde da Central de Inconsistências.
// Um número real abre (3.736 atendimentos concluídos, nenhum conferido); o RAT do William sem a assinatura do
// produtor é o conflito; a IA lê o RAT, as sete verificações viram alertas, o gestor trata tudo na tela do web
// (tema PecTrace da ATER - JBS) e o segundo ato configura a validação no CMS. Animações de apoio em Lottie.
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraRig} from '../../core/CameraRig';
import {Grain} from '../../core/Grain';
import {IbsLogo} from '../../brands/agrotrace';
import {Particles} from '../../core/Particles';
import {PEC_ICON_PATHS, PEC_TEXT_PATHS} from '../../brands/paths-pectrace';
import {PecLogo} from '../../brands/pectrace';
import {samplePathPoints} from '../../core/three-utils';
import {BLUE, Browser, Burst, Cursor, Dark, DISPLAY, Flash, Glass, Hud, Mesh, MONO, Odo, Paper, Pill, pointerAt, Ring, Sky, UI, Words} from './fx';
import {CMS_PTS, CmsReal, cmpPt, Comparacao} from './real';
import {LottieAt} from './lottie';
import {RAT_W, RAT_H, RatData, RatPage1, RatSign, RAT_WILLIAM} from './rat';
import {b, Cam, camAt, curve, EASE, enter, IN, lerp, M, OUT, POP, ramp, sp, toScreen, TOTAL} from './story';
import {Disparo, Dossie, JUST, NAV_BG, Navbar, Page, PEC, Selo, Toast, TOT, VERIF} from './web';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ORANGE: Sky = {a: '#140904', b: '#6b2c0c', c: '#3a1606', d: '#ff9553'};
const RED: Sky = {a: '#140506', b: '#5a1414', c: '#2c0a0a', d: '#ff6b6b'};
const OR = PEC.p450;
const ORL = PEC.p300;

// ---------------- Fundos ----------------
type BgK = 'black' | 'dark' | 'orange' | 'red' | 'paper' | 'blue';
const BGS: [number, BgK][] = [[0, 'black'], [1.5, 'dark'], [M.zip, 'orange'], [M.empty, 'dark'], [M.silence, 'red'], [M.turn, 'orange'], [M.read - 0.5, 'paper'], [M.checks, 'dark'], [M.clock7, 'orange'], [M.painel, 'dark'], [M.rima, 'orange'], [M.cms, 'blue'], [M.final, 'dark']];
const BgOne: React.FC<{k: BgK}> = ({k}) => (k === 'dark' ? <Dark tint="255,132,63" /> : k === 'orange' ? <Mesh sky={ORANGE} /> : k === 'red' ? <Mesh sky={RED} /> : k === 'blue' ? <Mesh sky={BLUE} /> : k === 'paper' ? <Paper /> : <AbsoluteFill style={{background: '#000'}} />);
const Bg: React.FC<{f: number}> = ({f}) => {
	let i = 0;
	for (let j = 0; j < BGS.length; j++) if (f >= b(BGS[j][0])) i = j;
	const u = ramp(f, b(BGS[i][0]), b(BGS[i][0]) + 10);
	return (
		<AbsoluteFill>
			{u < 1 && i > 0 && <BgOne k={BGS[i - 1][1]} />}
			<AbsoluteFill style={{opacity: u}}>
				<BgOne k={BGS[i][1]} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ---------------- 1. O número ----------------
const Hook: React.FC<{f: number}> = ({f}) => {
	if (f >= b(M.pile) + 8) return null;
	const out = ramp(f, b(M.zip) - 0.4, b(M.zip) + 0.4, EASE);
	const v = lerp(0, 3736, ramp(f, b(M.count), b(M.count + 3.2), (x) => 1 - (1 - x) ** 3));
	const inU = ramp(f, b(M.count) - 6, b(M.count) + 4, OUT);
	const z = ramp(f, b(M.none), b(M.none) + 6, OUT);
	const shake = f >= b(M.none) && f < b(M.none) + 12 ? (1 - (f - b(M.none)) / 12) * 10 : 0;
	return (
		<AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 + out * 0.15})`, filter: out > 0 ? `blur(${out * 10}px)` : undefined}}>
			<Ring x={960} y={540} at={b(M.ping)} color={OR} size={16} />
			<div style={{position: 'absolute', left: 150, top: 280, fontFamily: MONO, fontSize: 24, letterSpacing: '0.3em', color: 'rgba(255,174,124,0.9)', opacity: inU}}>ATENDIMENTOS CONCLUÍDOS · ATER - JBS</div>
			<div style={{position: 'absolute', left: 146, top: 330, opacity: inU}}>
				<Odo value={v} decimals={0} size={210} color="#fff" />
			</div>
			<div style={{position: 'absolute', left: 150, top: 640, display: 'flex', alignItems: 'baseline', gap: 26, opacity: z, transform: `translate(${Math.sin(f * 2.3) * shake}px, ${(1 - z) * 30}px)`}}>
				<span style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.3em', color: 'rgba(255,140,140,0.95)'}}>CONFERIDOS</span>
				<span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 130, color: '#ff6b6b', lineHeight: 1, filter: 'drop-shadow(0 0 30px rgba(255,80,80,0.45))'}}>0</span>
			</div>
		</AbsoluteFill>
	);
};

// ---------------- 2. A exportação e o RAT sem assinatura ----------------
const COLS = 22;
const ROWS = 11;
const REDC = {c: 14, r: 5};
const MiniRat: React.FC<{w: number; h: number; red?: number; on: number}> = ({w, h, red = 0, on}) => (
	<div style={{width: w, height: h, borderRadius: 4, background: red > 0.5 ? '#fff5f5' : `rgba(255,255,255,${0.35 + 0.6 * on})`, padding: 5, boxSizing: 'border-box', boxShadow: red > 0.5 ? '0 0 0 3px #ef4444, 0 0 40px #ef4444' : undefined}}>
		<div style={{height: 4, width: '70%', background: '#334155', borderRadius: 2, opacity: 0.6}} />
		{[0, 1, 2, 3].map((i) => (
			<div key={i} style={{height: 3, width: `${90 - i * 12}%`, background: '#94a3b8', borderRadius: 2, marginTop: 4, opacity: 0.6}} />
		))}
		<div style={{display: 'flex', gap: 4, marginTop: 7}}>
			<div style={{flex: 1, height: 9, borderBottom: `1.5px solid ${red > 0.5 ? '#ef4444' : '#334155'}`}} />
			<div style={{flex: 1, height: 9, borderBottom: '1.5px solid #334155'}} />
		</div>
	</div>
);
const Zip: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.zip) || f >= b(M.pile) + 4) return null;
	const k = sp(f, M.zip + 0.2, POP);
	const burst = ramp(f, b(M.pile) - 0.5, b(M.pile), IN);
	return (
		<div style={{position: 'absolute', left: 960, top: 560, transform: `translate(-50%,-50%) scale(${k * (1 + burst * 0.6)})`, opacity: 1 - burst}}>
			<div style={{width: 380, padding: '26px 28px', borderRadius: 18, background: 'rgba(20,9,4,0.88)', boxShadow: `inset 0 0 0 1.5px rgba(255,174,124,0.35), 0 30px 70px -20px #000`, display: 'flex', alignItems: 'center', gap: 20}}>
				<div style={{width: 64, height: 78, borderRadius: 8, background: `linear-gradient(160deg, ${PEC.p400}, ${PEC.p600})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: MONO, fontWeight: 700, fontSize: 18}}>ZIP</div>
				<div>
					<div style={{fontFamily: UI, fontSize: 24, color: '#fff', fontWeight: 500}}>relatorios.zip</div>
					<div style={{fontFamily: UI, fontSize: 18, color: 'rgba(255,225,205,0.75)', marginTop: 4}}>Exportação para a JBS</div>
				</div>
			</div>
		</div>
	);
};
const Grid: React.FC<{f: number; back?: boolean}> = ({f, back}) => {
	const a = back ? b(M.rima) : b(M.pile);
	const e = back ? b(M.cms) : b(M.empty) + 4;
	if (f < a - 4 || f >= e) return null;
	const front = back ? COLS + 6 : lerp(-6, COLS + 6, ramp(f, a, b(M.red), (x) => x));
	const dive = back ? ramp(f, b(M.rima + 0.6), b(M.rima + 3), EASE) * 0.42 : ramp(f, b(M.zoomRat), b(M.empty) + 2, IN);
	const scale = back ? lerp(1, 4.2, dive / 0.42) : lerp(1, 22, dive);
	const CW = 64;
	const CH = 84;
	const W = COLS * CW;
	const H = ROWS * CH;
	const cx = (REDC.c + 0.5) * CW - W / 2;
	const cy = (REDC.r + 0.5) * CH - H / 2;
	const op = ramp(f, a - 4, a + 8) * (back ? 1 - ramp(f, e - 10, e) : 1);
	const gray = back ? 0 : ramp(f, b(M.red), b(M.red) + 8);
	const cells = [];
	for (let r = 0; r < ROWS; r++)
		for (let c = 0; c < COLS; c++) {
			const isRed = c === REDC.c && r === REDC.r;
			const d = front - c - random(`j${c}-${r}`) * 2;
			const on = Math.max(0, Math.min(1, d / 1.2));
			const hot = Math.max(0, 1 - Math.abs(d) / 2.4);
			const flag = back && isRed;
			cells.push(
				<div key={`${c}-${r}`} style={{position: 'absolute', left: c * CW + 5, top: r * CH + 5, opacity: on * (isRed ? 1 : 1 - gray * 0.55), transform: `translateZ(${hot * 30 + (isRed && f >= b(M.red) && !back ? 46 + Math.sin(f * 0.2) * 8 : 0)}px)`}}>
					<MiniRat w={CW - 10} h={CH - 10} red={isRed && (f >= b(M.red) || back) ? 1 : 0} on={on} />
					{flag && (
						<div style={{position: 'absolute', right: -14, top: -14, transform: `scale(${sp(f, M.rima + 1.2, POP)})`}}>
							<Selo st="A" icon="pen-to-square" size={22} />
						</div>
					)}
				</div>,
			);
		}
	const rot = 1 - dive;
	return (
		<AbsoluteFill style={{opacity: op}}>
			<div style={{position: 'absolute', left: 960, top: 600, width: 0, height: 0, perspective: 1600, transformStyle: 'preserve-3d'}}>
				<div style={{position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, transformStyle: 'preserve-3d', transform: `rotateX(${(50 + Math.sin(f * 0.012) * 2) * rot}deg) rotateZ(${(-20 + (f - a) * 0.01) * rot}deg) scale(${scale}) translate(${-cx * dive}px, ${-cy * dive}px)`}}>{cells}</div>
			</div>
		</AbsoluteFill>
	);
};
/** A página de assinaturas do RAT do William, com o bloco do produtor vazio. */
const RatWilliam: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.empty) - 2 || f >= b(M.turn)) return null;
	const k = ramp(f, b(M.empty) - 2, b(M.empty) + 6, OUT);
	const out = ramp(f, b(M.turn) - 0.6, b(M.turn), EASE);
	const pulse = (Math.sin(f * 0.25) + 1) / 2;
	const z = 1 + (f - b(M.empty)) * 0.0006;
	const CX = 1180;
	const stamp = spring({frame: f - b(M.silence) - 4, fps: 30, config: {damping: 9, stiffness: 180, mass: 0.6}});
	return (
		<AbsoluteFill style={{opacity: k * (1 - out)}}>
			<div style={{position: 'absolute', left: CX - (RAT_W * z) / 2, top: 580 - (RAT_H * z) / 2, transform: `scale(${z})`, transformOrigin: '0 0', boxShadow: '0 40px 90px -20px rgba(0,0,0,0.7)'}}>
				<RatSign d={RAT_WILLIAM} emptyProdutor marks={{produtor: ramp(f, b(M.empty) + 4, b(M.empty) + 12)}} pulse={pulse} />
				{f >= b(M.silence) && (
					<div style={{position: 'absolute', left: 80, top: 330, padding: '10px 24px', border: '5px solid #dc2626', borderRadius: 10, color: '#dc2626', fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, letterSpacing: '0.04em', transform: `rotate(-12deg) scale(${lerp(2.2, 1, Math.min(1, stamp))})`, opacity: Math.min(1, stamp * 1.5), background: 'rgba(255,255,255,0.75)'}}>RISCO DE REJEIÇÃO</div>
				)}
			</div>
			<Ring x={CX} y={580 - (RAT_H * z) / 2 + 210 * z} at={b(M.empty) + 6} color="#ef4444" size={40} />
		</AbsoluteFill>
	);
};

// ---------------- 3. Título ----------------
const Title: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.title) - 0.2 || f >= b(M.sync)) return null;
	const out = ramp(f, b(M.sync) - 0.6, b(M.sync), EASE);
	const push = 1 + (f - b(M.title)) * 0.0007;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out, transform: `scale(${push + out * 0.1})`, filter: out > 0 ? `blur(${out * 10}px)` : undefined}}>
			<div style={{display: 'flex', gap: 28, fontFamily: DISPLAY, fontWeight: 800, fontSize: 108, color: '#fff', letterSpacing: '-0.01em', marginTop: 70}}>
				{'Validação de atendimentos'.split(' ').map((w, i) => {
					const s = spring({frame: f - b(M.title) - 3 - i * 5, fps: 30, config: {damping: 14, stiffness: 150, mass: 0.7}});
					return (
						<span key={w} style={{display: 'inline-block', color: i === 2 ? ORL : '#fff', transform: `translateY(${(1 - s) * 70}px)`, opacity: Math.min(1, s), filter: s < 0.98 ? `blur(${(1 - Math.min(1, s)) * 14}px)` : undefined}}>
							{w}
						</span>
					);
				})}
			</div>
			<div style={{marginTop: 18, fontFamily: UI, fontSize: 34, color: 'rgba(255,240,230,0.88)', ...enter(f, M.title + 2.2, {y: 16})}}>
				O erro aparece <span style={{color: ORL}}>antes</span> de chegar à JBS.
			</div>
			<div style={{position: 'absolute', bottom: 64, ...enter(f, M.title + 2.8)}}>
				<PecLogo width={200} color="rgba(255,255,255,0.8)" />
			</div>
		</AbsoluteFill>
	);
};

// ---------------- 4. Sincronização e leitura do RAT ----------------
const RAT_ALFREDO: RatData = {
	data: '17/08/2026',
	tipo: 'Nutricional',
	produtor: 'Produtor',
	propriedade: 'SITIO BOA ESPERANCA',
	cidade: 'Rondônia',
	contrato: '056/2025',
	tecnico: 'Alfredo',
	situacao: 'Propriedade de 51 ha com 7 repartições de pasto e curral. O produtor trabalha com recria e engorda, usa proteinado, proteico energético e ração para acabamento e terminação dos animais.',
	recomendacao: 'Engorda ou terminação (14@ até o abate). Última etapa, focada em acabamento de carcaça. Precisa de pastos de alta qualidade e com alta densidade, pois o volume de consumo é alto.',
};
const Sync: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.sync) - 1 || f >= b(M.read)) return null;
	const op = ramp(f, b(M.sync) - 1, b(M.sync) + 4) * (1 - ramp(f, b(M.read) - 0.8, b(M.read)));
	return (
		<AbsoluteFill style={{opacity: op}}>
			<Words text="O técnico sincroniza. O atendimento entra na fila." at={M.sync + 0.2} out={M.read} y={170} size={64} hot={['sincroniza', 'fila']} accent={ORL} />
		</AbsoluteFill>
	);
};
const Leitura: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.read) - 1 || f >= b(M.checks) + 2) return null;
	const op = ramp(f, b(M.read) - 1, b(M.read) + 6) * (1 - ramp(f, b(M.checks) - 0.6, b(M.checks) + 2));
	const k = sp(f, M.read, {damping: 18, stiffness: 110, mass: 1});
	const scan = ramp(f, b(M.read) + 6, b(M.texto) + 12, (x) => x);
	const marks1 = {contrato: ramp(f, b(M.contrato), b(M.contrato) + 8), data: ramp(f, b(M.contrato) - 0.6, b(M.contrato) + 2) * (1 - ramp(f, b(M.contrato) + 4, b(M.contrato) + 12)), tipo: ramp(f, b(M.texto), b(M.texto) + 6), texto: ramp(f, b(M.texto), b(M.texto) + 8)};
	const marks2 = {produtor: ramp(f, b(M.assin), b(M.assin) + 8), consultor: ramp(f, b(M.assin) + 0.4, b(M.assin) + 10)};
	const Z = 1.17;
	const p1 = {x: 210, y: 128};
	const p2 = {x: 990, y: 128};
	return (
		<AbsoluteFill style={{opacity: op}}>
			{([
				[p1, <RatPage1 key="p1" d={RAT_ALFREDO} marks={marks1} />, -4],
				[p2, <RatSign key="p2" d={RAT_ALFREDO} marks={marks2} />, 4],
			] as [{x: number; y: number}, React.ReactNode, number][]).map(([pp, el, ry], i) => {
				return (
					<div key={i} style={{position: 'absolute', left: pp.x, top: pp.y, width: RAT_W, height: RAT_H, transform: `perspective(2000px) rotateY(${ry * (1 - k * 0.5)}deg) translateY(${(1 - k) * 80}px) scale(${Z})`, transformOrigin: 'top left', opacity: Math.min(1, k * 1.4), boxShadow: '0 40px 80px -30px rgba(67,40,10,0.45), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden'}}>
						{el}
						<div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 112 - 6}%`, height: 3, background: OR, boxShadow: `0 0 24px 6px rgba(255,132,63,0.7)`, opacity: scan > 0 && scan < 1 ? 1 : 0}} />
						<div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 112 - 18}%`, height: '12%', background: 'linear-gradient(transparent, rgba(255,174,124,0.28))', opacity: scan > 0 && scan < 1 ? 1 : 0}} />
					</div>
				);
			})}
			<LottieAt name="ia" at={M.read} x={895} y={40} w={130} h={130} loop />
			<Words text="A IA lê o RAT." at={M.read + 0.3} out={M.contrato} y={72} x={480} width={700} size={54} color="#1f2937" accent={PEC.p600} hot={['IA']} />
			{/* contrato */}
			<Pill at={M.contrato + 0.6} out={M.assin + 0.4} x={p1.x + 360} y={p1.y + 420} text="Impresso no RAT: 056/2025" to={{x: p1.x + 650, y: p1.y + 278}} tone="dark" anchor="center" />
			<Pill at={M.contrato + 1.6} out={M.assin + 0.4} x={p1.x + 360} y={p1.y + 490} text="Vigente no cadastro: 055/2025 · não confere" tone="red" anchor="center" />
			{/* assinaturas */}
			<Pill at={M.assin + 0.6} out={M.compare} x={p2.x - 30} y={p2.y + 270} text="Produtor: assinado" tone="green" anchor="right" to={{x: p2.x + 70, y: p2.y + 280}} />
			<Pill at={M.assin + 1} out={M.compare} x={p2.x - 30} y={p2.y + 610} text="Consultor: assinado" tone="green" anchor="right" to={{x: p2.x + 70, y: p2.y + 620}} />
			{/* comparação com a referência (Lottie) */}
			{f >= b(M.compare) - 1 && f < b(M.checks) && (
				<div style={{position: 'absolute', inset: 0, background: `rgba(251,248,245,${0.85 * ramp(f, b(M.compare) - 1, b(M.compare)) * (1 - ramp(f, b(M.checks) - 0.8, b(M.checks)))})`}} />
			)}
			{f >= b(M.compare) - 0.5 && f < b(M.checks) && (
				<div style={{opacity: ramp(f, b(M.compare) - 0.5, b(M.compare)) * (1 - ramp(f, b(M.checks) - 0.8, b(M.checks)))}}>
					<LottieAt name="assinatura" at={M.compare - 0.3} x={240} y={240} w={1440} h={630} />
					<Words text="A do consultor é comparada com a referência do técnico." at={M.compare + 0.2} out={M.checks - 0.4} y={190} size={50} color="#1f2937" accent={PEC.p600} hot={['referência']} />
				</div>
			)}
		</AbsoluteFill>
	);
};

// ---------------- 5. As sete verificações ----------------
const CHK_ST = ['O', 'A', 'O', 'O', 'A', 'A', 'O'];
const Checks: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.checks) - 0.5 || f >= b(M.clock7)) return null;
	const out = ramp(f, b(M.clock7) - 0.6, b(M.clock7), EASE);
	const al = ramp(f, b(M.alerta), b(M.alerta) + 0.5);
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<Words text="Sete verificações em cada atendimento." at={M.checks + 0.1} out={M.alerta} y={150} size={64} hot={['Sete', 'verificações']} accent={ORL} />
			<Words text="Nada é rejeitado: vira alerta, e o gestor decide." at={M.alerta + 0.2} out={M.clock7} y={150} size={64} hot={['alerta', 'gestor', 'decide']} accent={ORL} />
			<div style={{position: 'absolute', left: 160, right: 160, top: 290, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 18}}>
				{VERIF.map((v, i) => {
					const k = sp(f, M.checks + 0.6 + i * 0.35, POP);
					const st = al > 0.5 && CHK_ST[i] === 'A' ? 'A' : 'O';
					const pop = 1 + 0.25 * Math.max(0, 1 - Math.abs(f - b(M.alerta) - i * 2) / 6) * (CHK_ST[i] === 'A' ? 1 : 0);
					return (
						<div key={v.k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: Math.min(1, k), transform: `translateY(${(1 - k) * 60}px)`}}>
							<div style={{transform: `scale(${pop})`}}>
								<Selo st={st as 'A' | 'O'} icon={v.icon} size={110} />
							</div>
							<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, color: '#fff', textAlign: 'center', lineHeight: 1.1}}>{v.nome}</div>
							<div style={{fontFamily: UI, fontSize: 18, color: v.sev === 'Alta' ? '#fca5a5' : v.sev === 'Média' ? '#fcd34d' : 'rgba(255,240,230,0.7)'}}>Severidade {v.sev.toLowerCase()}</div>
							{['CONTRATO', 'ASSINATURAS', 'ASSINATURA_CONSULTOR', 'PERTINENCIA'].includes(v.k) && <div style={{fontFamily: MONO, fontSize: 14, letterSpacing: '0.2em', color: ORL}}>IA</div>}
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center', gap: 120}}>
				{[
					['POR ATENDIMENTO', <Odo key="s" value={lerp(0, 12, ramp(f, b(M.checks + 3), b(M.checks + 4.6), OUT))} decimals={0} size={96} color="#fff" />, 's'],
					['CUSTO DE IA', <span key="c" style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, color: '#fff'}}>{'<'} 1</span>, 'centavo de dólar'],
				].map(([l, v, u], i) => (
					<div key={i} style={{textAlign: 'center', ...enter(f, M.checks + 3 + i * 0.5, {y: 20})}}>
						<div style={{fontFamily: MONO, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(255,174,124,0.85)'}}>{l}</div>
						<div style={{display: 'flex', alignItems: 'baseline', gap: 12, justifyContent: 'center'}}>
							{v}
							<span style={{fontFamily: UI, fontSize: 30, color: 'rgba(255,240,230,0.8)'}}>{u}</span>
						</div>
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

// ---------------- 6. 07:00: o e-mail ----------------
const EmailCard: React.FC<{f: number; press: number}> = ({f, press}) => (
	<div style={{width: 560, borderRadius: 14, background: '#fff', overflow: 'hidden', boxShadow: '0 40px 90px -20px rgba(0,0,0,0.6)', fontFamily: UI}}>
		<div style={{height: 8, background: NAV_BG}} />
		<div style={{padding: '22px 26px'}}>
			<div style={{fontSize: 12, letterSpacing: '0.12em', color: PEC.p700, fontWeight: 600}}>VALIDAÇÃO DE ATENDIMENTOS</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: '#18181b', marginTop: 2}}>5 novos alertas</div>
			<div style={{fontSize: 15, color: '#52525b', marginTop: 8, lineHeight: 1.4}}>Resumo dos alertas novos da validação automática dos atendimentos de ATER - JBS.</div>
			<div style={{marginTop: 14, borderLeft: `4px solid ${PEC.p500}`, background: PEC.p50, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 36}}>
				{[['5', 'alertas novos'], ['3', 'atendimentos com alerta']].map(([n, t]) => (
					<div key={t}>
						<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: '#18181b'}}>{n}</div>
						<div style={{fontSize: 13, color: '#52525b'}}>{t}</div>
					</div>
				))}
			</div>
			<div style={{marginTop: 16, display: 'inline-flex', padding: '11px 18px', borderRadius: 8, background: PEC.p500, color: '#fff', fontWeight: 600, fontSize: 14.5, transform: `scale(${1 - 0.05 * Math.sin(Math.min(1, press) * Math.PI)})`}}>Abrir a validação de atendimentos</div>
			<div style={{fontSize: 11, letterSpacing: '0.12em', color: PEC.p700, fontWeight: 600, marginTop: 18}}>POR VERIFICAÇÃO</div>
			{[['Cópia e cola', 3], ['Contrato', 1], ['Identificador externo', 1]].map(([n, q]) => (
				<div key={n as string} style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#3f3f46', padding: '6px 0', borderBottom: '1px solid #f4f4f5'}}>
					<span>{n}</span>
					<span style={{fontWeight: 600}}>{q}</span>
				</div>
			))}
			<div style={{fontSize: 12, color: '#71717a', marginTop: 12, textAlign: 'center', lineHeight: 1.4}}>Os alertas pedem conferência: a validação não rejeita nem altera nenhum atendimento.</div>
		</div>
	</div>
);
const Mail: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.clock7) - 0.5 || f >= b(M.painel) + 4) return null;
	const op = ramp(f, b(M.clock7) - 0.5, b(M.clock7)) * (1 - ramp(f, b(M.painel) - 0.4, b(M.painel) + 4));
	const card = sp(f, M.mail + 2, {damping: 16, stiffness: 120, mass: 0.9});
	const lot = 1 - ramp(f, b(M.mail + 1.8), b(M.mail + 2.4));
	const ptr = pointerAt(f, [[M.mail + 3, 1300, 980], [M.mailClick, 800, 667]], [M.mailClick]);
	const zoom = ramp(f, b(M.mailClick) + 4, b(M.painel), IN);
	return (
		<AbsoluteFill style={{opacity: op}}>
			<Hud at={M.clock7 + 0.1} out={M.painel} label="SEX 14/11">
				<span style={{fontFamily: MONO, fontWeight: 700, fontSize: 46, color: '#fff'}}>07:00</span>
			</Hud>
			<Words text="Às 7h, o resumo chega por e-mail." sub="Só quando há alerta novo." at={M.clock7 + 0.3} out={M.mailClick} y={130} size={64} hot={['7h', 'e-mail']} accent={ORL} />
			<div style={{opacity: lot}}>
				<LottieAt name="email" at={M.clock7 + 0.4} x={560} y={250} w={800} h={622} />
			</div>
			{f >= b(M.mail + 1.8) && (
				<div style={{position: 'absolute', left: 960, top: 640, transform: `translate(-50%,-50%) scale(${(0.75 + 0.55 * card) * (1 + zoom * 2.4)})`, transformOrigin: '50% 30%', opacity: Math.min(1, card * 1.5) * (1 - zoom * 0.6)}}>
					<EmailCard f={f} press={f >= b(M.mailClick) ? (f - b(M.mailClick)) / 16 : 0} />
				</div>
			)}
			{f >= b(M.mail + 3) && f < b(M.mailClick) + 6 && (
				<div style={{position: 'absolute', left: ptr.x, top: ptr.y - 60}}>
					<svg width={30} height={36} viewBox="0 0 28 34" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'}}>
						<path d="M2 2 L2 27 L8.5 21 L13 31.5 L17.5 29.5 L13 19.5 L22 19.5 Z" fill="#fff" stroke="#0f172a" strokeWidth={2} strokeLinejoin="round" />
					</svg>
				</div>
			)}
		</AbsoluteFill>
	);
};

// ---------------- 7. O gestor na tela de validação: plano-sequência ----------------
const CAM_APP: [number, Cam][] = [
	[M.painel, {x: 720, y: 405, z: 0.82, rx: 14, ry: -14}],
	[M.painel + 1.6, {x: 720, y: 420, z: 0.9, rx: 4, ry: -4}],
	[M.painel + 3.4, {x: 300, y: 330, z: 1.75, rx: 2, ry: 2}],
	[M.filtroAlta - 0.6, {x: 760, y: 320, z: 1.45}],
	[M.filtroAlta + 0.4, {x: 820, y: 330, z: 1.55}],
	[M.row - 1.6, {x: 760, y: 360, z: 1.18, rx: 2}],
	[M.row - 0.2, {x: 1050, y: 300, z: 1.5}],
	[M.dossie + 0.8, {x: 1080, y: 405, z: 1.12, ry: -3}],
	[M.contr, {x: 1088, y: 430, z: 1.55}],
	[M.copia - 1, {x: 1090, y: 440, z: 1.6}],
	[M.copia + 0.6, {x: 1080, y: 470, z: 1.5}],
	[M.compara - 1.2, {x: 1080, y: 470, z: 1.55}],
	[M.compara - 0.2, {x: 1040, y: 560, z: 1.85}],
	[M.compara + 0.8, {x: 720, y: 405, z: 0.94, rx: 3, ry: -3}],
	[M.compara + 2, {x: cmpPt(434, 0).x, y: 500, z: 1.55}],
	[M.compara + 2.8, {x: cmpPt(1236, 0).x, y: 490, z: 1.55}],
	[M.comparaTopo - 0.1, {x: 720, y: 420, z: 1.05}],
	[M.comparaTopo + 0.8, {x: 720, y: 215, z: 1.3}],
	[M.comparaTopo + 2.4, {x: 720, y: 230, z: 1.36}],
	[M.comparaFim + 0.15, {x: 900, y: 420, z: 1.15}],
	[M.dispensar - 0.3, {x: 1060, y: 420, z: 1.5}],
	[M.justType, {x: 1080, y: 470, z: 1.75}],
	[M.dispOk + 1, {x: 1080, y: 440, z: 1.6}],
	[M.revalidar - 0.4, {x: 1060, y: 300, z: 1.5}],
	[M.revOk + 1, {x: 1070, y: 320, z: 1.55}],
	[M.existentes + 1, {x: 720, y: 405, z: 0.96, rx: 4, ry: -4}],
	[M.porTec, {x: 720, y: 400, z: 1.4}],
	[M.previa + 0.6, {x: 720, y: 470, z: 1.6}],
	[M.validarOk + 0.4, {x: 740, y: 470, z: 1.55}],
	[M.numeros + 1, {x: 720, y: 405, z: 0.78, rx: 10, ry: -10}],
	[M.appEnd, {x: 720, y: 405, z: 0.74, rx: 12, ry: -12}],
];
const SCROLL: [number, number][] = [[M.painel, 0], [M.filtroAlta + 0.5, 0], [M.row - 1.6, 520], [M.existentes, 520], [M.existentes + 1, 0]];
const DSCROLL: [number, number][] = [[M.dossie, 0], [M.copia - 0.6, 0], [M.copia + 0.2, 250], [M.dispensar - 1, 250], [M.dispensar - 0.4, 560], [M.dispOk + 1, 560], [M.revalidar - 1, 560], [M.revalidar - 0.4, 0]];
const ROW0 = 801 - 520;
/** Botão "Comparar lado a lado" da situação encontrada no dossiê, em px da janela (com a rolagem do dossiê em 250). */
const CMP_BTN = {x: 1052, y: 500};
const PTR: [number, number, number][] = [
	[M.painel + 2, 900, 600], [M.filtroAlta - 0.8, 860, 405], [M.filtroAlta, 860, 405], [M.filtroAlta + 1, 900, 500],
	[M.row - 0.6, 1304, ROW0], [M.row, 1304, ROW0], [M.row + 1, 1180, 420],
	[M.compara - 0.7, CMP_BTN.x, CMP_BTN.y], [M.compara, CMP_BTN.x, CMP_BTN.y], [M.compara + 2, 420, 560], [M.compara + 2.8, 1030, 560], [M.comparaTopo + 1, 700, 330],
	[M.comparaFim - 0.8, 1271, 55], [M.comparaFim - 0.2, 1271, 55],
	[M.dispensar - 0.4, 846, 390], [M.dispensar, 846, 390], [M.justType, 900, 470], [M.dispOk - 0.6, 1352, 562], [M.dispOk, 1352, 562],
	[M.revalidar - 0.5, 806, 248], [M.revalidar, 806, 248], [M.revOk - 0.6, 1340, 362], [M.revOk, 1340, 362],
	[M.existentes + 0.6, 1300, 118], [M.existentes + 1.2, 1300, 118], [M.porTec - 0.2, 837, 342], [M.porTec, 837, 342],
	[M.porTec + 1, 720, 415], [M.porTec + 1.3, 720, 415], [M.porTec + 2, 720, 471], [M.porTec + 2.3, 720, 471],
	[M.validarOk - 0.6, 900, 620], [M.validarOk, 900, 620], [M.numeros, 1000, 700],
];
const CLICKS = [M.filtroAlta, M.row, M.compara, M.comparaFim - 0.2, M.dispensar, M.dispOk, M.revalidar, M.revOk, M.existentes + 1.2, M.porTec, M.porTec + 1.3, M.porTec + 2.3, M.validarOk];
const iris = (f: number, at: number, x: number, y: number, dur = 16) => `circle(${ramp(f, b(at), b(at) + dur, EASE) * 1700}px at ${x}px ${y}px)`;
const press = (f: number, k: string, at: number) => ({k, p: f >= b(at) && f < b(at) + 10 ? (f - b(at)) / 10 : 0});
const typed = (f: number, at: number, s: string, per = 1.1) => s.slice(0, Math.max(0, Math.floor((f - b(at)) / per)));

const AppShot: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.painel) - 1 || f >= b(M.appEnd) + 6) return null;
	const cam = camAt(f, CAM_APP);
	const prev = camAt(f - 1, CAM_APP);
	const speed = Math.hypot(cam.x - prev.x, cam.y - prev.y) * cam.z + Math.abs(cam.z - prev.z) * 200;
	const blur = Math.max(0, Math.min(1.2, (speed - 16) * 0.05));
	const scroll = curve(f, SCROLL);
	const ptr = pointerAt(f, PTR, CLICKS);
	const op = ramp(f, b(M.painel) - 1, b(M.painel) + 4) * (1 - ramp(f, b(M.appEnd) - 0.3, b(M.appEnd) + 0.3));
	const filtro = ramp(f, b(M.filtroAlta) + 2, b(M.filtroAlta) + 8);
	const open = ramp(f, b(M.row) + 4, b(M.dossie) + 4, OUT) * (1 - ramp(f, b(M.existentes), b(M.existentes) + 8, EASE));
	const dlg = ramp(f, b(M.existentes + 1.4), b(M.existentes + 1.4) + 8, OUT) * (1 - ramp(f, b(M.validarOk) + 4, b(M.validarOk) + 10, EASE));
	const scr = (x: number, y: number) => toScreen(cam, x, y);
	const pk = [press(f, 'comparar', M.compara), press(f, 'dispensar', M.dispensar), press(f, 'dispOk', M.dispOk), press(f, 'revalidar', M.revalidar), press(f, 'revalidarAgora', M.revOk)].find((p) => p.p > 0);
	return (
		<AbsoluteFill style={{opacity: op}}>
			<Browser cam={cam} url={f < b(M.existentes) ? 'pectrace.com.br/#/dashboard/atendimento/validacao' : 'pectrace.com.br/#/dashboard/atendimento/validacao'} blur={blur}>
				<div style={{position: 'absolute', inset: 0, clipPath: iris(f, M.painel - 0.6, 720, 420, 14)}}>
					<div style={{position: 'absolute', left: 0, top: -scroll, width: 1440}}>
						<Page f={f} s={{at: M.painel, filtro, rowHot: open > 0.05 || (f >= b(M.row) - 6 && f < b(M.existentes)) ? 0 : undefined, press: press(f, 'analisar', M.existentes + 1.2), carousel: 0}} />
					</div>
					<Navbar />
					<Dossie f={f} s={{open, dispensar: ramp(f, b(M.dispensar) + 3, b(M.dispensar) + 9, OUT), just: f >= b(M.justType) ? typed(f, M.justType, JUST) : '', disp: f >= b(M.dispOk) + 4 ? 1 : 0, reval: ramp(f, b(M.revalidar) + 3, b(M.revalidar) + 9, OUT) * (1 - ramp(f, b(M.revOk) + 4, b(M.revOk) + 10)), revalOk: 0, scroll: curve(f, DSCROLL), press: pk}} />
					{f >= b(M.compara) && f < b(M.comparaFim) + 12 && (
						<div style={{position: 'absolute', inset: 0, zIndex: 45, clipPath: f < b(M.comparaFim) ? iris(f, M.compara + 0.1, CMP_BTN.x, CMP_BTN.y, 14) : `circle(${(1 - ramp(f, b(M.comparaFim), b(M.comparaFim) + 12, EASE)) * 1700}px at 1271px 55px)`}}>
							<Comparacao f={f} />
						</div>
					)}
					<Disparo f={f} s={{open: dlg, modo: f >= b(M.porTec) + 3 ? 1 : 0, tec: f >= b(M.porTec + 1.5) ? 1 : 0, periodo: f >= b(M.porTec + 2.5) ? 1 : 0, calc: f >= b(M.previa) ? 1 : f >= b(M.porTec + 2.6) ? 0.5 : 0, n: Math.round(lerp(0, 46, ramp(f, b(M.previa) + 4, b(M.previa + 1.6), OUT))), press: press(f, 'analisarN', M.validarOk)}} />
					<Toast f={f} at={M.dispOk + 0.4} out={M.revalidar} title="Alerta dispensado" desc="A justificativa fica registrada com o seu nome." />
					<Toast f={f} at={M.revOk + 0.4} out={M.existentes} title="Revalidação solicitada" desc="A análise roda em segundo plano. Use Atualizar para ver o novo resultado." tone="info" />
					<Toast f={f} at={M.validarOk + 0.5} out={M.appEnd} title="Análise solicitada para 46 atendimentos" desc="Os resultados aparecem aqui conforme a análise termina. Use Atualizar para acompanhar." tone="info" />
					<Ring x={860} y={405} at={b(M.filtroAlta)} color={OR} size={20} />
					<Burst x={1352} y={562} at={b(M.dispOk)} color={OR} />
					{f >= b(M.painel + 2) && f < b(M.appEnd) && <Cursor x={ptr.x} y={ptr.y} z={cam.z} press={ptr.press} />}
				</div>
			</Browser>

			<Glass at={M.painel + 2} out={M.filtroAlta - 0.4} l1="Prontos para a JBS:" l2={`${TOT.sem} de ${TOT.validados}.`} sub="Os outros 187 têm ao menos um alerta para conferir." y={1000} />
			<Glass at={M.filtroAlta + 0.6} out={M.row} l1="Primeiro," l2="o que é grave." sub="Contrato: 17 atendimentos com alerta." y={1000} />
			<Glass at={M.dossie + 0.6} out={M.contr} l1="Cada atendimento" l2="tem um dossiê." sub="A evidência de cada alerta, no mesmo lugar." y={1000} />
			<Glass at={M.contr + 0.4} out={M.copia - 0.6} l1="Contrato vencido" l2="em setembro de 2025." sub="137/2022 valia até 21/09/2025. A visita foi em 04/08/2026." y={1000} />
			<Glass at={M.dispensar + 0.4} out={M.dispOk + 1} l1="Já conferiu?" l2="Dispensa, com justificativa." sub="De 5 a 2000 caracteres, com nome e data." y={1000} />
			<Glass at={M.revalidar + 0.4} out={M.revOk + 1} l1="Corrigiu o RAT?" l2="Revalida." sub="A IA lê de novo e substitui os resultados." y={1000} />
			<Glass at={M.existentes + 1.4} out={M.previa} l1="E os atendimentos" l2="de antes?" sub="Técnico e período; só concluídos desta certificadora." y={1000} />
			<Glass at={M.previa + 0.4} out={M.numeros} l1="A prévia mostra quantos" l2="antes de gastar IA." sub="Kaique, agosto e setembro: 46 atendimentos." y={1000} />
			<Glass at={M.copia + 0.6} out={M.compara - 0.3} l1="E a recomendação" l2="é a mesma." sub="100% igual a outro atendimento do Kaique, em outra propriedade." y={1000} />
			<Glass at={M.compara + 0.9} out={M.comparaTopo - 0.2} l1="Comparar" l2="lado a lado." sub="Em destaque, os trechos que também estão no outro atendimento." y={1000} />
			<Glass at={M.comparaTopo + 0.4} out={M.comparaFim} l1="1 · Em análise." l2="2 · Origem do texto." sub="Cada janela diz quem é quem, no padrão do dossiê." y={1000} />
		</AbsoluteFill>
	);
};
const Numeros: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.numeros) || f >= b(M.appEnd) + 4) return null;
	const op = ramp(f, b(M.numeros), b(M.numeros) + 8) * (1 - ramp(f, b(M.appEnd) - 0.4, b(M.appEnd) + 4));
	const items: [string, number, string][] = [
		['VALIDADOS EM AGO–SET', 209, 'atendimentos'],
		['TEMPO MÉDIO', 12, 's por atendimento'],
		['FALHAS', 0, 'execuções'],
	];
	return (
		<AbsoluteFill style={{opacity: op, background: `rgba(10,6,3,${0.82 * op})`, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{display: 'flex', gap: 110}}>
				{items.map(([l, n, u], i) => (
					<div key={l} style={{textAlign: 'center', ...enter(f, M.numeros + 0.4 + i * 0.4, {y: 30})}}>
						<div style={{fontFamily: MONO, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(255,174,124,0.85)'}}>{l}</div>
						<Odo value={lerp(0, n, ramp(f, b(M.numeros + 0.4 + i * 0.4), b(M.numeros + 2.4 + i * 0.4), OUT))} decimals={0} size={140} color="#fff" />
						<div style={{fontFamily: UI, fontSize: 26, color: 'rgba(255,240,230,0.8)'}}>{u}</div>
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

// ---------------- 8. Rima: o RAT do William, agora visto ----------------
const Rima: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.rima) || f >= b(M.cms)) return null;
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 330, background: 'linear-gradient(rgba(12,7,4,0.92), rgba(12,7,4,0.7) 60%, rgba(12,7,4,0))', opacity: ramp(f, b(M.rima), b(M.rima) + 10)}} />
			<Words text="O RAT sem assinatura não chega mais à JBS sem ninguém ver." at={M.rima + 0.6} out={M.cms - 0.4} y={140} size={60} hot={['ninguém', 'ver.']} accent={ORL} width={1500} />
			<Pill at={M.rima + 2.2} out={M.cms - 0.4} x={960} y={960} text="05/09 · William · Assinaturas do RAT: alerta para o gestor no mesmo dia" tone="dark" />
		</AbsoluteFill>
	);
};

// ---------------- 9. CMS: telas reais do cadastro do programa ----------------
const CAM_CMS: [number, Cam][] = [
	[M.cms + 2.2, {x: 720, y: 450, z: 0.78, rx: 14, ry: 14}],
	[M.aba - 0.4, {x: 820, y: 330, z: 1.05, rx: 3, ry: 3}],
	[M.aba + 0.2, {x: 1050, y: 230, z: 1.6}],
	[M.aba + 0.9, {x: 720, y: 420, z: 1.3}],
	[M.liberar + 0.2, {x: 720, y: 430, z: 1.55}],
	[M.liberar + 1.2, {x: 720, y: 470, z: 1.05}],
	[M.modo + 0.2, {x: 860, y: 540, z: 1.45}],
	[M.verif - 0.6, {x: 700, y: 520, z: 1.15}],
	[M.verif + 1, {x: 760, y: 560, z: 1.25}],
	[M.limiar - 1.2, {x: 820, y: 470, z: 1.3}],
	[M.limiar + 0.6, {x: 760, y: 470, z: 1.45}],
	[M.limiar + 3, {x: 760, y: 500, z: 1.5}],
	[M.assRef - 0.4, {x: 720, y: 560, z: 1.1}],
	[M.preCarga, {x: 1040, y: 440, z: 1.6}],
	[M.modal - 0.6, {x: 830, y: 700, z: 1.4}],
	[M.modal + 1, {x: 720, y: 430, z: 1.12}],
	[M.dest - 0.2, {x: 720, y: 500, z: 1.2}],
	[M.dest + 1.4, {x: 800, y: 520, z: 1.42}],
	[M.ativar - 0.6, {x: 1000, y: 300, z: 1.6}],
	[M.ativar + 2, {x: 720, y: 330, z: 1.35}],
	[M.ciclo, {x: 720, y: 450, z: 0.8, rx: 10, ry: 10}],
];
const P = CMS_PTS;
const PTR_CMS: [number, number, number][] = [
	[M.cms + 3, 700, 600], [M.aba - 0.4, P.abaValidacao.x, P.abaValidacao.y], [M.aba, P.abaValidacao.x, P.abaValidacao.y],
	[M.liberar - 0.6, P.liberar.x, P.liberar.y], [M.liberar, P.liberar.x, P.liberar.y],
	[M.modo - 0.3, P.silencioso.x, P.silencioso.y], [M.modo + 1.4, P.silencioso.x, P.silencioso.y], [M.modo + 2.6, P.ativo.x, P.ativo.y],
	[M.verif - 0.6, P.menuVerif.x, P.menuVerif.y], [M.verif, P.menuVerif.x, P.menuVerif.y],
	[M.limiar - 0.6, P.ajustar.x, P.ajustar.y], [M.limiar, P.ajustar.x, P.ajustar.y], [M.limiar + 2, 860, 640],
	[M.assRef - 0.6, P.menuAssin.x, P.menuAssin.y], [M.assRef, P.menuAssin.x, P.menuAssin.y], [M.preCarga - 0.3, P.preCarga.x, P.preCarga.y], [M.preCarga + 1.4, P.preCarga.x, P.preCarga.y],
	[M.modal - 0.6, P.kaique.x, P.kaique.y], [M.modal, P.kaique.x, P.kaique.y],
	[M.dest - 1, P.menuEmail.x, P.menuEmail.y], [M.dest - 0.4, P.menuEmail.x, P.menuEmail.y], [M.dest + 1, 760, 560],
	[M.ativar - 0.6, P.ligar.x, P.ligar.y], [M.ativar, P.ligar.x, P.ligar.y], [M.ativar + 1.5, 980, 420],
];
const CLICKS_CMS = [M.aba, M.liberar, M.verif, M.limiar, M.assRef, M.modal, M.dest - 0.4, M.ativar];
const CmsShot: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.cms + 2.2) || f >= b(M.ciclo) + 6) return null;
	const cam = camAt(f, CAM_CMS);
	const prev = camAt(f - 1, CAM_CMS);
	const speed = Math.hypot(cam.x - prev.x, cam.y - prev.y) * cam.z + Math.abs(cam.z - prev.z) * 200;
	const blur = Math.max(0, Math.min(1.2, (speed - 16) * 0.05));
	const ptr = pointerAt(f, PTR_CMS, CLICKS_CMS);
	const op = ramp(f, b(M.cms + 2.2), b(M.cms + 3)) * (1 - ramp(f, b(M.ciclo) - 0.4, b(M.ciclo) + 0.4));
	return (
		<AbsoluteFill style={{opacity: op}}>
			<Browser cam={cam} url="cms.agrotrace.com.br/#/dashboard/programas/certificadora" blur={blur} h={900}>
				<CmsReal f={f} />
				<Ring x={P.liberar.x} y={P.liberar.y} at={b(M.liberar)} color="#2491d3" size={20} />
				<Ring x={P.ligar.x} y={P.ligar.y} at={b(M.ativar)} color="#22c55e" size={22} />
				{f >= b(M.cms + 3) && f < b(M.ciclo) && <Cursor x={ptr.x} y={ptr.y} z={cam.z} press={ptr.press} />}
			</Browser>
			<Glass at={M.aba + 1} out={M.liberar + 1.4} l1="A aba nasce no programa," l2="desligada." sub="Só um usuário master libera e liga a validação." y={1000} />
			<Glass at={M.modo + 0.4} out={M.verif - 0.4} l1="Silencioso ou ativo:" l2="você escolhe." sub="No modo ativo, o resumo sai por e-mail." y={1000} />
			<Glass at={M.verif + 0.6} out={M.limiar - 0.4} l1="Cada verificação" l2="com gravidade e regras." sub="Liga, desliga e escolhe o que entra no e-mail." y={1000} />
			<Glass at={M.limiar + 0.6} out={M.assRef - 0.4} l1="Cópia e cola:" l2="80% em 31 dias." sub="Mudar uma regra reprocessa os já validados." y={1000} />
			<Glass at={M.assRef + 0.6} out={M.modal} l1="As referências saem" l2="dos RATs que já existem." sub="Até cinco amostras por técnico, pré-carregadas pela IA." y={1000} />
			<Glass at={M.modal + 1} out={M.dest - 0.6} l1="O técnico pode" l2="trocar pela dele." sub="Amostra ruim se desativa sem apagar nada. Assinaturas ilustrativas." y={1000} />
			<Glass at={M.dest + 1.2} out={M.ativar} l1="Quem recebe," l2="e a que horas." y={1000} />
			<Glass at={M.ativar + 0.8} out={M.ciclo} l1="Ligou: cada atendimento" l2="novo passa pelas sete." y={1000} />
		</AbsoluteFill>
	);
};
const CmsIntro: React.FC<{f: number}> = ({f}) =>
	f >= b(M.cms) && f < b(M.aba) ? (
		<>
			<Words text="E para ligar em outro programa?" at={M.cms + 0.1} out={M.cms + 2.4} y={480} size={76} hot={['outro', 'programa?']} accent="#93c5fd" />
			<Words text="Tudo pelo CMS, sem deploy." at={M.cms + 2.6} out={M.aba} y={120} size={60} hot={['CMS,', 'sem', 'deploy.']} accent="#93c5fd" />
		</>
	) : null;

// ---------------- 10. O ciclo ----------------
const NODES = [
	['Sincroniza', 'o técnico conclui no app', 'mobile'],
	['A IA lê o RAT', 'contrato, assinaturas, texto', 'sparkles'],
	['Sete verificações', 'em cerca de 12 s', 'list-check'],
	['Alerta', 'nada é rejeitado', 'exclamation-triangle'],
	['Resumo às 7h', 'só quando há alerta', 'envelope'],
	['O gestor decide', 'dispensa ou pede correção', 'user'],
];
const Ciclo: React.FC<{f: number}> = ({f}) => {
	if (f < b(M.ciclo) || f >= b(M.final) + 4) return null;
	const op = ramp(f, b(M.ciclo), b(M.ciclo) + 8) * (1 - ramp(f, b(M.final) - 0.4, b(M.final) + 4));
	const R = 330;
	const spin = ramp(f, b(M.ciclo + 1), b(M.final - 1), (x) => x);
	return (
		<AbsoluteFill style={{opacity: op}}>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<circle cx={960} cy={560} r={R} fill="none" stroke="rgba(147,197,253,0.35)" strokeWidth={3} strokeDasharray={`${2 * Math.PI * R * ramp(f, b(M.ciclo), b(M.ciclo + 2), EASE)} 9999`} transform="rotate(-90 960 560)" />
				<circle cx={960 + R * Math.cos(-Math.PI / 2 + spin * Math.PI * 2 * 1.5)} cy={560 + R * Math.sin(-Math.PI / 2 + spin * Math.PI * 2 * 1.5)} r={12} fill={ORL} style={{filter: `drop-shadow(0 0 14px ${OR})`}} />
			</svg>
			{NODES.map(([t, s, ic], i) => {
				const a = -Math.PI / 2 + (i / NODES.length) * Math.PI * 2;
				const x = 960 + R * Math.cos(a);
				const y = 560 + R * Math.sin(a);
				const k = sp(f, M.ciclo + 0.4 + i * 0.4, POP);
				return (
					<div key={t} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 300}}>
						<div style={{width: 66, height: 66, borderRadius: 99, background: 'rgba(8,16,32,0.92)', boxShadow: `inset 0 0 0 2px ${ORL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<i className={`pi pi-${ic}`} style={{fontSize: 26, color: ORL}} />
						</div>
						<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, color: '#fff', textAlign: 'center'}}>{t}</div>
						<div style={{fontFamily: UI, fontSize: 19, color: 'rgba(220,235,255,0.8)', textAlign: 'center'}}>{s}</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: 750, top: 500, textAlign: 'center', width: 420, ...enter(f, M.ciclo + 2.6, {y: 14})}}>
				<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: '#fff', lineHeight: 1.15}}>Todo atendimento novo passa por aqui.</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------- 11. Marca ----------------
const LOGO_W = 920;
const PX = 1080 / (2 * 14 * Math.tan((17.5 * Math.PI) / 180));
const Final: React.FC<{f: number}> = ({f}) => {
	const {width, height} = useVideoConfig();
	const targets = useMemo(() => samplePathPoints([...PEC_ICON_PATHS, ...PEC_TEXT_PATHS], [413, 78], 6000, LOGO_W / PX, 'validacao-final'), []);
	if (f < b(M.final)) return null;
	const L = b(M.logo);
	const t = f / 30;
	const morph = interpolate(f, [b(M.final) + 10, L - 4], [0, 1], {...clamp, easing: EASE});
	const logo = interpolate(f, [L - 8, L + 12], [0, 1], {...clamp, easing: OUT});
	const flash = interpolate(f, [L - 4, L + 2, L + 30], [0, 0.85, 0], clamp);
	const out = interpolate(f, [TOTAL - 20, TOTAL - 1], [0, 1], {...clamp, easing: EASE});
	const LY = 430;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: interpolate(f, [b(M.final) + 8, b(M.final) + 30], [0, 1], clamp)}}>
				<ThreeCanvas width={width} height={height} camera={{fov: 35, position: [0, 0, 14]}} gl={{preserveDrawingBuffer: true}}>
					<CameraRig position={[0, 0, interpolate(f, [b(M.final), L], [19, 14], {...clamp, easing: OUT})]} lookAt={[0, 0, 0]} />
					<group position={[0, (540 - LY) / PX, 0]}>
						<Particles count={6000} seed="validacao-final" time={t} targets={targets} morph={morph} scatter={interpolate(f, [L + 20, TOTAL], [0, 0.5], clamp)} spread={[24, 14, 18]} size={13} flow={1.2} swirl={1.4} opacity={interpolate(f, [b(M.final) + 8, b(M.final) + 30, L, L + 18], [0, 0.85, 0.85, 0.12], clamp)} colors={['#ff9553', '#ff7c2b', '#ffe0cc']} />
					</group>
				</ThreeCanvas>
			</AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 50% 30% at 50% 40%, rgba(255,149,83,${flash}), rgba(255,124,43,0) 70%)`, mixBlendMode: 'screen'}} />
			<div style={{position: 'absolute', left: (1920 - LOGO_W) / 2, top: LY - (LOGO_W * 78) / 413 / 2, opacity: logo}}>
				<PecLogo width={LOGO_W} color="#fff" />
			</div>
			<Words text="Validação de atendimentos" at={M.logo + 0.9} out={400} y={650} size={60} hot={['atendimentos']} accent={ORL} />
			<Words text="O RAT chega. O erro não passa." at={M.logo + 2} out={400} y={732} size={38} color="rgba(255,240,230,0.9)" />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: ramp(f, b(M.logo + 3.2), b(M.logo + 4))}}>
				<span style={{fontFamily: UI, fontSize: 19, color: 'rgba(255,240,230,0.62)'}}>Dados da base local (ago–set/2026); nomes de produtores omitidos</span>
				<span style={{width: 1, height: 42, background: 'rgba(255,240,230,0.3)'}} />
				<IbsLogo width={90} />
			</div>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</AbsoluteFill>
	);
};

// ---------------- Legendas do primeiro ato ----------------
const Act1Words: React.FC<{f: number}> = ({f}) => (
	<>
		<Words text="A conferência só acontece na exportação." sub="O zip de relatórios vai para a JBS, que lê cada RAT." at={M.zip + 0.6} out={M.red} y={150} size={62} hot={['exportação.']} accent={ORL} />
		<Glass at={M.empty + 0.6} out={M.silence} l1="05/09 · William" l2="sem a assinatura do produtor." sub="SITIO 2 IRMAOS · RAT de diagnóstico." y={1000} tone="red" />
		<Words text="Se a JBS rejeita, o técnico não recebe pela visita." at={M.silence + 0.4} out={M.turn} y={110} size={56} hot={['rejeita,', 'não', 'recebe']} accent="#ff8a8a" />
		<Words text="Agora, cada RAT é conferido assim que chega." at={M.turn + 0.3} out={M.title - 0.2} y={540} size={76} hot={['assim', 'que', 'chega.']} accent={ORL} />
	</>
);

export const Validacao: React.FC = () => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<Bg f={f} />
			<Hook f={f} />
			<Zip f={f} />
			<Grid f={f} />
			<RatWilliam f={f} />
			<Act1Words f={f} />
			<Title f={f} />
			{f >= b(M.title) - 1 && f < b(M.sync) && <LottieAt name="ia" at={M.title} x={890} y={250} w={140} h={140} loop />}
			<Sync f={f} />
			{f >= b(M.sync) - 1 && f < b(M.read) && (
				<div style={{opacity: ramp(f, b(M.sync) - 1, b(M.sync)) * (1 - ramp(f, b(M.read) - 0.8, b(M.read)))}}>
					<LottieAt name="sincronizacao" at={M.sync} x={240} y={300} w={1440} h={600} />
				</div>
			)}
			<Leitura f={f} />
			<Checks f={f} />
			<Mail f={f} />
			<AppShot f={f} />
			<Numeros f={f} />
			<Grid f={f} back />
			<Rima f={f} />
			<CmsIntro f={f} />
			<CmsShot f={f} />
			<Ciclo f={f} />
			<Final f={f} />
			<Flash at={M.none} color="#ff5050" amt={0.35} />
			<Flash at={M.title} color="#ffae7c" amt={0.45} />
			<Flash at={M.dispOk} color="#ffae7c" amt={0.18} />
			<Grain amount={0.022} vignette={0.25} />
			<Sequence from={0} durationInFrames={durationInFrames}>
				<Audio src={staticFile('exemplo-validacao/trilha.wav')} />
			</Sequence>
		</AbsoluteFill>
	);
};
