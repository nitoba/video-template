// Reserva do momento B da apresentação: o resultado esperado do pedido "título palavra por palavra e um número que
// conta de 0 até 128", já com o ajuste "o número só começa depois da última palavra".
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Dust, Grain, Headline, OUT, Odo, Paper, ramp, Stage, useMotion, VideoProvider} from '../../kit';
import {b, BRAND, M, T, TITULO} from './story';

const Cena: React.FC = () => {
	const f = useCurrentFrame();
	const m = useMotion();
	const n = 128 * ramp(f, b(M.numero), b(M.numero) + 48, OUT);
	const k = ramp(f, b(M.numero) - 6, b(M.numero) + 8, OUT);
	return (
		<Stage from={b(M.inicio)} to={b(M.fecho)} enter="zoom" exit="fade">
			<Headline text={TITULO} y={380} size={104} k={1} at={M.inicio} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 24, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>
				<Odo value={n} size={150} color={m.accent} />
				<span style={{fontFamily: m.ui, fontSize: 40, color: m.inkSoft}}>atendimentos conferidos</span>
			</div>
		</Stage>
	);
};

export const Video: React.FC = () => (
	<VideoProvider timeline={T} brand={BRAND}>
		<AbsoluteFill style={{background: BRAND.cores.papel}}>
			<Paper color={BRAND.cores.papel} />
			<Dust />
			<Cena />
			<Grain amount={0.03} vignette={0} />
		</AbsoluteFill>
	</VideoProvider>
);
