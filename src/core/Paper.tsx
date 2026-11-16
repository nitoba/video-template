// Fundo de papel: fibras sutis e luz suave, na cor que a marca escolher (cores.papel).
import React from 'react';
import {hexToRgb} from './color';
import {NOISE} from './glsl';
import {ShaderCanvas} from './ShaderCanvas';

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uFiber;
${NOISE}
void main() {
	vec2 p = vUv * uRes / 900.0;
	float fib = fbm(vec3(p.x * 3.0, p.y * 16.0, 1.0)) * 0.6 + snoise(vec3(p * 46.0, 2.0)) * 0.2;
	float light = 1.0 - 0.08 * length((vUv - vec2(0.42, 0.62)) * vec2(1.1, 1.0));
	fragColor = vec4(uColor * light * (1.0 - uFiber * fib), 1.0);
}`;

export const Paper: React.FC<{color: string; fiber?: number}> = ({color, fiber = 0.02}) => <ShaderCanvas fragment={FRAG} uniforms={{uColor: hexToRgb(color), uFiber: fiber}} scale={0.75} />;
