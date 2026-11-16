import 'primeicons/primeicons.css';
import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {VIDEOS} from './videos';

// Garante que a fonte de ícones do PrimeIcons esteja carregada antes de capturar quadros.
const iconFont = delayRender('primeicons');
document.fonts.load('16px primeicons').then(() => continueRender(iconFont));

export const RemotionRoot: React.FC = () => (
	<>
		{VIDEOS.map((v) => (
			<Composition key={v.id} id={v.id} component={v.component} durationInFrames={v.frames} fps={30} width={1920} height={1080} />
		))}
	</>
);
