// Efeitos 2D com @remotion/skia. O Skia não anima sozinho: quem chama calcula tudo a partir de useCurrentFrame()
// e passa o estado do quadro. Exige enableSkia() (remotion.config.ts) e LoadSkia() (src/index.ts), já ligados.
import {SkiaCanvas} from '@remotion/skia';
import {Blur, Circle, ColorMatrix, Group, Paint} from '@shopify/react-native-skia';
import React from 'react';

export type Gota = {x: number; y: number; r: number};

/**
 * Líquido (metaballs): círculos desfocados e cortados por um limiar de alfa, então gotas próximas se fundem como
 * água e se separam com um fio. `cola` é o desfoque em px (mais = funde de mais longe); 12 a 24 fica natural.
 */
export const Liquido: React.FC<{
	width: number;
	height: number;
	gotas: Gota[];
	cor: string;
	cola?: number;
	style?: React.CSSProperties;
}> = ({width, height, gotas, cor, cola = 18, style}) => (
	<div style={{width, height, ...style}}>
	<SkiaCanvas width={width} height={height}>
		<Group
			layer={
				<Paint>
					<Blur blur={cola} />
					{/* Alfa × 20 − 9: corta a borda desfocada e deixa a forma nítida, com as pontes entre gotas. */}
					<ColorMatrix matrix={[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, -9]} />
				</Paint>
			}
		>
			{gotas.map((g, i) => (
				<Circle key={i} cx={g.x} cy={g.y} r={g.r} color={cor} />
			))}
		</Group>
	</SkiaCanvas>
	</div>
);
