// Animações Lottie (feitas no LottieFiles Creator e salvas em public/<slug>/lottie/*.json) presas ao quadro do
// vídeo, a partir de um tempo da música. Ver docs/guia-de-producao.md, seção 5.
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import React, {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, Sequence, staticFile} from 'remotion';
import {useB} from './timeline';

const cache: Record<string, LottieAnimationData> = {};
const useLottie = (src: string) => {
	const [data, setData] = useState<LottieAnimationData | null>(cache[src] ?? null);
	const [handle] = useState(() => (cache[src] ? null : delayRender(`lottie ${src}`)));
	useEffect(() => {
		if (cache[src]) return;
		fetch(staticFile(src))
			.then((r) => r.json())
			.then((j) => {
				cache[src] = j;
				setData(j);
				if (handle !== null) continueRender(handle);
			})
			.catch((e) => cancelRender(e));
	}, [handle, src]);
	return data;
};

/** Toca `src` (caminho em public/) a partir do tempo `at`, na caixa (x, y, w, h) em px de tela. */
export const LottieAt: React.FC<{src: string; at: number; x: number; y: number; w: number; h: number; loop?: boolean; speed?: number; style?: React.CSSProperties}> = ({src, at, x, y, w, h, loop, speed = 1, style}) => {
	const b = useB();
	const data = useLottie(src);
	if (!data) return null;
	return (
		<Sequence from={b(at)} layout="none">
			<div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>
				<Lottie animationData={data} loop={loop} playbackRate={speed} style={{width: '100%', height: '100%'}} />
			</div>
		</Sequence>
	);
};
