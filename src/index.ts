import {LoadSkia} from '@shopify/react-native-skia/lib/module/web';
import {registerRoot} from 'remotion';

// lib/module/web é o mesmo LoadSkia da documentação (src/web), já compilado: o src/web quebra o tsc ao puxar tipos do React Native.
// O Skia (WebAssembly) carrega antes do registerRoot; só então o Root, que pode usar <SkiaCanvas>, é importado.
(async () => {
	await LoadSkia();
	const {RemotionRoot} = await import('./Root');
	registerRoot(RemotionRoot);
})();
