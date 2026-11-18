// Reserva do momento C da apresentação (docs/apresentacao/roteiro-demo.md): a prova de 15 s de "Como fazemos
// vídeos". Forma "um objeto atravessa o vídeo": o pedido em português passa por código, quadros, correção e resultado.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card, Dust, EASE, Grain, Headline, OUT, Odo, Paper, pop, ramp, shake, Stage, typed, useMotion, VideoProvider} from '../../kit';
import {b, BRAND, M, T} from './story';

const PEDIDO = 'O título entra palavra por palavra e um número conta de 0 até 128.';
const CODIGO: [string, string][] = [
	['k', 'export const Cena = () => {'],
	['', '  const f = useCurrentFrame();'],
	['', '  const n = 128 * ramp(f, b(M.numero), b(M.numero) + 48);'],
	['', '  return <Stage from={b(M.inicio)} to={b(M.fecho)}>'],
	['', '    <Headline text={TITULO} at={M.inicio} />'],
	['', '    <Odo value={n} size={150} />'],
	['k', '  </Stage>;'],
	['k', '};'],
];

/** Ato 1 e 2: o pedido é digitado e depois sobe para dar lugar ao código que a IA escreve. */
const PedidoECodigo: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const m = useMotion();
	const kPedido = pop(f, b(M.pedido), {damping: 14, stiffness: 140, mass: 0.8}, fps);
	const sobe = ramp(f, b(M.codigo), b(M.codigo) + 22, EASE);
	const kCod = pop(f, b(M.codigo) + 8, {damping: 15, stiffness: 120, mass: 0.9}, fps);
	const txt = typed(PEDIDO, f, b(M.pedido) + 12, b(M.pedido) + 80);
	const cursor = Math.floor(f / 8) % 2 === 0 && txt.length < PEDIDO.length + 1;
	return (
		<Stage from={b(M.pedido)} to={b(M.quadros)} enter="zoom" exit="left">
			<Headline text={f < b(M.codigo) ? 'Tudo começa com uma frase.' : 'A IA escreve o código.'} y={150} size={56} k={1} at={f < b(M.codigo) ? M.pedido : M.codigo} />
			<div style={{position: 'absolute', inset: 0, transform: `translateY(${-sobe * 200}px) scale(${1 - sobe * 0.18})`}}>
				<Card x={300} y={430} w={1320} k={kPedido}>
					<div style={{fontFamily: m.mono, fontSize: 22, letterSpacing: 2, color: m.accent, fontWeight: 600}}>PEDIDO</div>
					<div style={{fontFamily: m.ui, fontSize: 44, lineHeight: 1.3, color: m.ink, marginTop: 12, minHeight: 116}}>
						{txt}
						<span style={{opacity: cursor ? 1 : 0, color: m.accent}}>▍</span>
					</div>
				</Card>
			</div>
			{kCod > 0.001 && (
				<div style={{position: 'absolute', left: 360, top: 560, width: 1200, padding: '34px 44px', borderRadius: 22, background: '#1c120c', opacity: Math.min(1, kCod * 1.6), transform: `translateY(${(1 - kCod) * 60}px) rotate(${(1 - kCod) * 3}deg)`, boxShadow: '0 30px 70px rgba(60,30,10,0.25)'}}>
					{CODIGO.map(([kind, line], i) => {
						const u = ramp(f, b(M.codigo) + 12 + i * 5, b(M.codigo) + 22 + i * 5, OUT);
						return (
							<div key={i} style={{fontFamily: m.mono, fontSize: 26, lineHeight: 1.55, whiteSpace: 'pre', color: kind === 'k' ? '#f2a679' : '#f3e6da', opacity: u, transform: `translateX(${(1 - u) * 24}px)`}}>
								{line}
							</div>
						);
					})}
				</div>
			)}
		</Stage>
	);
};

const Mini: React.FC<{op: number; dy: number}> = ({op, dy}) => {
	const m = useMotion();
	return <div style={{fontFamily: m.display, fontWeight: 700, fontSize: 40, color: m.ink, textAlign: 'center', marginTop: 70, opacity: op, transform: `translateY(${dy}px)`}}>Validação de atendimentos</div>;
};

/** Ato 3: três quadros parados; o diretor circula o primeiro e escreve a correção. */
const Quadros: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const m = useMotion();
	const xs = [150, 720, 1290];
	const estados: [number, number, string][] = [
		[0.12, 30, 'quadro 0'],
		[0.55, 12, 'quadro 15'],
		[1, 0, 'quadro 30'],
	];
	const draw = ramp(f, b(M.nota), b(M.nota) + 18, EASE);
	const kNota = pop(f, b(M.nota) + 14, {damping: 10, stiffness: 180, mass: 0.6}, fps);
	const {x: sx, y: sy} = shake(f, b(M.nota) + 14, 6);
	const per = 2 * Math.PI * Math.sqrt((300 ** 2 + 200 ** 2) / 2);
	return (
		<Stage from={b(M.quadros)} to={b(M.fix)} enter="right" exit="up">
			<Headline text={f < b(M.nota) ? 'Você olha os quadros.' : '…e diz o que está errado.'} y={150} size={56} k={1} at={f < b(M.nota) ? M.quadros : M.nota} />
			{estados.map(([op, dy, label], i) => (
				<Card key={i} x={xs[i]} y={380} w={480} h={300} k={pop(f, b(M.quadros) + 6 + i * 5, {damping: 14, stiffness: 140, mass: 0.8}, fps)}>
					<div style={{fontFamily: m.mono, fontSize: 20, letterSpacing: 2, color: m.accent, fontWeight: 600}}>{label.toUpperCase()}</div>
					<Mini op={op} dy={dy} />
				</Card>
			))}
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<ellipse cx={390} cy={530} rx={300} ry={200} fill="none" stroke={m.alert} strokeWidth={6} strokeLinecap="round" strokeDasharray={per} strokeDashoffset={per * (1 - draw)} transform="rotate(-4 390 530)" />
			</svg>
			{kNota > 0.001 && (
				<div style={{position: 'absolute', left: 250, top: 770, padding: '16px 28px', borderRadius: 14, background: '#fde8e8', color: m.alert, fontFamily: m.ui, fontWeight: 600, fontSize: 38, transform: `translate(${sx}px, ${sy}px) rotate(${-3 + (1 - kNota) * -10}deg) scale(${kNota})`, transformOrigin: '20% 0%'}}>
					“A entrada está rápida demais.”
				</div>
			)}
		</Stage>
	);
};

/** Ato 4: o resultado corrigido, com a entrada mais lenta, e a frase-guia. */
const Resultado: React.FC = () => {
	const f = useCurrentFrame();
	const m = useMotion();
	const n = 128 * ramp(f, b(M.fix) + 36, b(M.fix) + 90, OUT);
	const kn = ramp(f, b(M.fix) + 30, b(M.fix) + 44, OUT);
	return (
		<>
			<Stage from={b(M.fix)} to={b(M.fecho)} enter="down" exit="zoom">
				<Headline text="Validação de atendimentos" y={360} size={110} k={1} at={M.fix + 0.4} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 530, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 24, opacity: kn, transform: `translateY(${(1 - kn) * 30}px)`}}>
					<Odo value={n} size={150} color={m.accent} />
					<span style={{fontFamily: m.ui, fontSize: 40, color: m.inkSoft}}>atendimentos conferidos</span>
				</div>
			</Stage>
			<Stage from={b(M.fecho)} to={b(M.fim) + 40} enter="zoom" exit="fade">
				<Headline text="Quem decide o que é bom" y={400} size={92} k={1} at={M.fecho} />
				<Headline text="é quem dirige." y={520} size={92} k={1} at={M.fecho + 1} color={m.accent} />
			</Stage>
		</>
	);
};

export const Video: React.FC = () => (
	<VideoProvider timeline={T} brand={BRAND}>
		<AbsoluteFill style={{background: BRAND.cores.papel}}>
			<Paper color={BRAND.cores.papel} />
			<Dust />
			<PedidoECodigo />
			<Quadros />
			<Resultado />
			<Grain amount={0.03} vignette={0} />
		</AbsoluteFill>
	</VideoProvider>
);
