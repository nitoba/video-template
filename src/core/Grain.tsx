// Grão de filme e vinheta por cima de tudo (última camada da composição).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {NOISE} from './glsl';
import {ShaderCanvas} from './ShaderCanvas';

const GRAIN = /* glsl */ `
uniform float uTime;
uniform float uAmount;
uniform float uVignette;
${NOISE}
void main() {
	vec2 uv = vUv;
	float g = hash12(gl_FragCoord.xy + fract(uTime * 7.13) * 917.0) - 0.5;
	float v = smoothstep(0.35, 1.15, length((uv - 0.5) * vec2(1.25, 1.0)));
	fragColor = vec4(vec3(0.5 + g), uAmount);
	fragColor = mix(fragColor, vec4(0.0, 0.0, 0.0, 1.0), v * uVignette);
}`;

export const Grain: React.FC<{amount?: number; vignette?: number}> = ({amount = 0.022, vignette = 0.25}) => {
	const frame = useCurrentFrame();
	return <ShaderCanvas fragment={GRAIN} uniforms={{uTime: frame, uAmount: amount, uVignette: vignette}} scale={0.5} style={{mixBlendMode: 'overlay', pointerEvents: 'none'}} />;
};
