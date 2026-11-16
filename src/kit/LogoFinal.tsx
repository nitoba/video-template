// Fecho: 6.000 partículas convergem e formam o logo da marca, com clarão, título e assinatura.
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraRig} from '../core/CameraRig';
import {Particles} from '../core/Particles';
import {samplePathPoints} from '../core/three-utils';
import {Words} from './fx';
import {EASE, OUT, ramp, useB, useBrand} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PX = 1080 / (2 * 14 * Math.tan((17.5 * Math.PI) / 180));

/** `from`: tempo em que as partículas aparecem; `logo`: tempo em que o logo assenta (impacto da trilha). */
export const LogoFinal: React.FC<{from: number; logo: number; titulo?: string; destaque?: string[]; frase?: string; nota?: string; logoW?: number; logoY?: number}> = ({from, logo, titulo, destaque = [], frase, nota, logoW = 900, logoY = 430}) => {
	const f = useCurrentFrame();
	const b = useB();
	const brand = useBrand();
	const {width, height, durationInFrames} = useVideoConfig();
	const [vw, vh] = brand.logoParticulas.viewBox;
	const targets = useMemo(() => samplePathPoints(brand.logoParticulas.paths, [vw, vh], 6000, logoW / PX, `final-${brand.id}`), [brand, vw, vh, logoW]);
	if (f < b(from)) return null;
	const L = b(logo);
	const morph = interpolate(f, [b(from) + 10, L - 4], [0, 1], {...clamp, easing: EASE});
	const show = interpolate(f, [L - 8, L + 12], [0, 1], {...clamp, easing: OUT});
	const flash = interpolate(f, [L - 4, L + 2, L + 30], [0, 0.85, 0], clamp);
	const out = interpolate(f, [durationInFrames - 20, durationInFrames - 1], [0, 1], {...clamp, easing: EASE});
	const Logo = brand.Logo;
	const Rodape = brand.Rodape;
	const [r, g, bl] = brand.cores.acento.match(/\w\w/g)!.map((h) => parseInt(h, 16));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: interpolate(f, [b(from) + 8, b(from) + 30], [0, 1], clamp)}}>
				<ThreeCanvas width={width} height={height} camera={{fov: 35, position: [0, 0, 14]}} gl={{preserveDrawingBuffer: true}}>
					<CameraRig position={[0, 0, interpolate(f, [b(from), L], [19, 14], {...clamp, easing: OUT})]} lookAt={[0, 0, 0]} />
					<group position={[0, (540 - logoY) / PX, 0]}>
						<Particles count={6000} seed={`final-${brand.id}`} time={f / 30} targets={targets} morph={morph} scatter={interpolate(f, [L + 20, durationInFrames], [0, 0.5], clamp)} spread={[24, 14, 18]} size={13} flow={1.2} swirl={1.4} opacity={interpolate(f, [b(from) + 8, b(from) + 30, L, L + 18], [0, 0.85, 0.85, 0.12], clamp)} colors={brand.logoParticulas.cores} />
					</group>
				</ThreeCanvas>
			</AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 50% 30% at 50% 40%, rgba(${r},${g},${bl},${flash}), rgba(${r},${g},${bl},0) 70%)`, mixBlendMode: 'screen'}} />
			<div style={{position: 'absolute', left: (1920 - logoW) / 2, top: logoY - (logoW * vh) / vw / 2, opacity: show}}>
				<Logo width={logoW} color="#fff" />
			</div>
			{titulo && <Words text={titulo} at={logo + 0.9} out={9999} y={logoY + 220} size={60} hot={destaque} />}
			{frase && <Words text={frase} at={logo + 2} out={9999} y={logoY + 302} size={38} color={brand.cores.textoClaro} />}
			{(nota || Rodape) && (
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: ramp(f, b(logo + 3.2), b(logo + 4))}}>
					{nota && <span style={{fontFamily: brand.fontes.ui, fontSize: 19, color: brand.cores.textoClaro, opacity: 0.62}}>{nota}</span>}
					{nota && Rodape && <span style={{width: 1, height: 42, background: 'rgba(255,255,255,0.3)'}} />}
					{Rodape && <Rodape width={90} />}
				</div>
			)}
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</AbsoluteFill>
	);
};
