// __TITULO__. Gerado por `bun run novo`: só a direção visual vem ligada (papel da marca, tema de movimento, poeira,
// grão, legendas). A estrutura não vem pronta: ela nasce do tratamento.md deste vídeo e não deve repetir a dos
// últimos vídeos (guia, "Direção, não fórmula" e "Estruturas já usadas"). Monte as cenas com o kit
// (src/kit/motion.tsx, grains.tsx, plano.tsx) e as receitas do catálogo do guia; troque a cena-exemplo abaixo.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dust, Grain, Headline, Legendas, Paper, Stage, useMotion, VideoProvider} from '../../kit';
import {b, BRAND, LEGENDAS, M, T, TITULO} from './story';

/** Cena-exemplo: apague quando a primeira cena do tratamento existir. */
const Exemplo: React.FC = () => {
	const m = useMotion();
	return (
		<Stage from={b(M.inicio)} to={b(M.fecho)} enter="zoom" exit="fade">
			<Headline text={TITULO} y={420} size={96} k={1} at={M.inicio} />
			<Headline text="Monte as cenas a partir do tratamento.md" y={560} size={36} k={1} at={M.inicio + 2} font={m.ui} weight={500} color={m.inkSoft} />
		</Stage>
	);
};

export const Video: React.FC = () => (
	<VideoProvider timeline={T} brand={BRAND}>
		<AbsoluteFill style={{background: BRAND.cores.papel}}>
			<Paper color={BRAND.cores.papel} />
			<Dust />
			<Exemplo />
			<Legendas itens={LEGENDAS} />
			<Grain amount={0.03} vignette={0} />
		</AbsoluteFill>
	</VideoProvider>
);
