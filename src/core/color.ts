/** "#rrggbb" para [r, g, b] em 0..1 (uniforms de shader). */
export const hexToRgb = (hex: string): [number, number, number] => {
	const h = hex.replace('#', '');
	return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
};
