// Animações Lottie feitas no LottieFiles Creator (MCP) e exportadas para public/validacao/*.json.
// Cada uma começa num tempo da música e roda presa ao quadro do vídeo.
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import React, {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, Sequence, staticFile} from 'remotion';
import {b} from './story';

const cache: Record<string, LottieAnimationData> = {};
const useLottie = (name: string) => {
	const [data, setData] = useState<LottieAnimationData | null>(cache[name] ?? null);
	const [handle] = useState(() => (cache[name] ? null : delayRender(`lottie ${name}`)));
	useEffect(() => {
		if (cache[name]) return;
		fetch(staticFile(`exemplo-validacao/${name}.json`))
			.then((r) => r.json())
			.then((j) => {
				cache[name] = j;
				setData(j);
				if (handle !== null) continueRender(handle);
			})
			.catch((e) => cancelRender(e));
	}, [handle, name]);
	return data;
};

/** Toca `name` a partir do tempo `at` (em tempos da música), na caixa (x, y, w, h) em px de tela. */
export const LottieAt: React.FC<{name: 'assinatura' | 'sincronizacao' | 'email' | 'ia'; at: number; x: number; y: number; w: number; h: number; loop?: boolean; speed?: number; style?: React.CSSProperties}> = ({name, at, x, y, w, h, loop, speed = 1, style}) => {
	const data = useLottie(name);
	if (!data) return null;
	return (
		<Sequence from={b(at)} layout="none">
			<div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>
				<Lottie animationData={data} loop={loop} playbackRate={speed} style={{width: '100%', height: '100%'}} />
			</div>
		</Sequence>
	);
};
