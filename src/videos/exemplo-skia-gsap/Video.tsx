// Referência das duas ferramentas novas do kit, num 9:16 de 5 s:
// - @remotion/gsap: a entrada da tela (cabeçalho e cartões em stagger) numa linha do tempo só;
// - @remotion/skia: gotas que caem, se fundem como líquido e viram uma poça (Liquido, src/kit/skia.tsx).
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {RUBIK} from '../../core/fonts';
import {type Gota, Liquido} from '../../kit/skia';

export const TOTAL = 150;
const W = 1080;
const H = 1920;
const PAPEL = '#F6F5F1';
const FOLHA = '#2F5D3A';
const AGUA = '#4A90C8';
const TINTA = '#1E2B21';

const TAREFAS = ['Samambaia', 'Jiboia', 'Costela-de-adão'];

const Entrada: React.FC = () => {
	// Uma linha do tempo pausada; o Remotion leva até o quadro atual. Sem callbacks, play nem random.
	const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline
			.from(selector('[data-titulo]'), {y: 60, opacity: 0, duration: 0.6, ease: 'power3.out'})
			.from(selector('[data-sub]'), {y: 30, opacity: 0, duration: 0.5, ease: 'power3.out'}, '-=0.35')
			.addLabel('cartoes', '-=0.2')
			.from(selector('[data-cartao]'), {y: 120, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out'}, 'cartoes')
			.from(selector('[data-gota-icone]'), {scale: 0, duration: 0.5, ease: 'back.out(2)'}, 'cartoes+=0.35');
	});

	return (
		<div ref={scope} style={{position: 'absolute', left: 96, right: 96, top: 220, fontFamily: RUBIK, color: TINTA}}>
			<div data-titulo style={{fontSize: 96, fontWeight: 600, lineHeight: 1.05}}>
				Hoje
			</div>
			<div data-sub style={{fontSize: 40, color: '#7A857C', marginTop: 16}}>
				3 plantas na rotina
			</div>
			<div style={{marginTop: 72, display: 'flex', flexDirection: 'column', gap: 28}}>
				{TAREFAS.map((t, i) => (
					<div
						key={t}
						data-cartao
						style={{
							background: '#FFFFFF',
							borderRadius: 44,
							padding: '40px 44px',
							fontSize: 44,
							fontWeight: 500,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							boxShadow: '0 18px 40px rgba(30,43,33,0.08)',
						}}
					>
						{t}
						<div
							data-gota-icone={i === 0 ? '' : undefined}
							style={{width: 64, height: 64, borderRadius: 32, background: i === 0 ? AGUA : '#DCE7D9'}}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

// Três gotas saem do botão da Samambaia, caem com aceleração e se fundem numa poça na base.
const gotasDoQuadro = (f: number): Gota[] => {
	const origemX = W - 96 - 44 - 32;
	const origemY = 220 + 96 + 56 + 72 + 72;
	const chao = H - 420;
	const gotas: Gota[] = [0, 1, 2].map((i) => {
		const inicio = 55 + i * 9;
		const t = interpolate(f, [inicio, inicio + 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const queda = Easing.in(Easing.quad)(t);
		const nasce = interpolate(f, [inicio - 8, inicio], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		return {
			x: interpolate(queda, [0, 1], [origemX, W / 2 + (i - 1) * 70]),
			y: interpolate(queda, [0, 1], [origemY, chao]),
			r: 34 * nasce * (1 - 0.25 * t),
		};
	});
	// A poça cresce conforme as gotas chegam e se espalha em três bolhas que se fundem.
	const poca = interpolate(f, [85, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const bolhas: Gota[] = [-1, 0, 1].map((k) => ({x: W / 2 + k * 150 * poca, y: chao + 30, r: 70 * poca}));
	return [...gotas, ...bolhas];
};

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: PAPEL}}>
			<Entrada />
			<Liquido width={W} height={H} gotas={gotasDoQuadro(f)} cor={AGUA} style={{position: 'absolute', inset: 0}} />
			<div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', fontFamily: RUBIK, fontSize: 40, color: FOLHA, opacity: interpolate(f, [115, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
				Samambaia regada
			</div>
		</AbsoluteFill>
	);
};
