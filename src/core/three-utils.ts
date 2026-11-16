import {useThree} from '@react-three/fiber';
import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, random} from 'remotion';
import * as THREE from 'three';

/**
 * Libera o render só depois que o canvas redesenhar com o recurso assíncrono:
 * o ThreeCanvas do Remotion só avança quando o frame muda.
 */
export const useAdvanceWhenReady = (ready: boolean, handle: number) => {
	const advance = useThree((s) => s.advance);
	useEffect(() => {
		if (!ready) return;
		advance(performance.now());
		continueRender(handle);
	}, [ready, advance, handle]);
};

/** Carrega várias texturas (dentro do ThreeCanvas) segurando o render até todas estarem prontas. */
export const useImageTextures = (srcs: string[]): THREE.Texture[] | null => {
	const [handle] = useState(() => delayRender(`textures ${srcs.length}`));
	const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
	useEffect(() => {
		const loader = new THREE.TextureLoader();
		Promise.all(
			srcs.map(
				(src) =>
					new Promise<THREE.Texture>((resolve, reject) => {
						loader.load(
							src,
							(t) => {
								t.colorSpace = THREE.SRGBColorSpace;
								t.anisotropy = 8;
								t.generateMipmaps = true;
								t.minFilter = THREE.LinearMipmapLinearFilter;
								resolve(t);
							},
							undefined,
							reject,
						);
					}),
			),
		)
			.then((t) => setTextures(t))
			.catch((e) => cancelRender(e));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useAdvanceWhenReady(textures !== null, handle);
	return textures;
};

/**
 * Amostra pontos dentro de um path SVG (rasterizado via Path2D).
 * Retorna coordenadas centradas, com a largura informada em unidades 3D.
 */
export const samplePathPoints = (
	paths: string[],
	viewBox: [number, number],
	count: number,
	worldWidth: number,
	seed: string,
): Float32Array => {
	const res = 1400 / viewBox[0];
	const cw = Math.ceil(viewBox[0] * res);
	const ch = Math.ceil(viewBox[1] * res);
	const canvas = document.createElement('canvas');
	canvas.width = cw;
	canvas.height = ch;
	const ctx = canvas.getContext('2d', {willReadFrequently: true})!;
	ctx.scale(res, res);
	ctx.fillStyle = '#fff';
	for (const p of paths) ctx.fill(new Path2D(p));
	const data = ctx.getImageData(0, 0, cw, ch).data;
	const filled: number[] = [];
	const step = 2;
	for (let y = 0; y < ch; y += step) {
		for (let x = 0; x < cw; x += step) {
			if (data[(y * cw + x) * 4 + 3] > 128) filled.push(x, y);
		}
	}
	const n = filled.length / 2;
	const out = new Float32Array(count * 3);
	const k = worldWidth / cw;
	for (let i = 0; i < count; i++) {
		const idx = Math.floor(random(`${seed}-${i}`) * n);
		const jx = (random(`${seed}-jx-${i}`) - 0.5) * step;
		const jy = (random(`${seed}-jy-${i}`) - 0.5) * step;
		out[i * 3] = (filled[idx * 2] + jx - cw / 2) * k;
		out[i * 3 + 1] = -(filled[idx * 2 + 1] + jy - ch / 2) * k;
		out[i * 3 + 2] = (random(`${seed}-z-${i}`) - 0.5) * 0.04 * worldWidth;
	}
	return out;
};
