// Momento A da apresentação (docs/apresentacao/roteiro-demo.md): Remotion puro, sem o kit, de propósito.
// Ao vivo: arrastar a barra de tempo e trocar [0, 30] por [0, 60] para mostrar que o vídeo é uma função do quadro.
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Video = () => {
	const f = useCurrentFrame(); // 0, 1, 2…
	const o = interpolate(f, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
	const y = interpolate(f, [0, 30], [40, 0], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: '#fbf6f1', justifyContent: 'center', alignItems: 'center'}}>
			<h1 style={{fontFamily: 'Rubik, sans-serif', fontSize: 200, color: '#23170f', opacity: o, transform: `translateY(${y}px)`}}>Olá</h1>
		</AbsoluteFill>
	);
};
