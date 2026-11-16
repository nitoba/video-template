import React, {useMemo} from 'react';
import {random} from 'remotion';
import * as THREE from 'three';
import {NOISE} from './glsl';
import {hexToRgb} from './color';

const VERT = /* glsl */ `
${NOISE}
attribute vec3 aTarget;
attribute float aRand;
uniform float uTime;
uniform float uMorph;
uniform float uScatter;
uniform float uSize;
uniform float uFlow;
uniform float uSwirl;
uniform float uPixelRatio;
varying float vRand;
varying float vMorph;

vec3 curl(vec3 p) {
	float e = 0.1;
	vec3 dx = vec3(e, 0.0, 0.0);
	vec3 dy = vec3(0.0, e, 0.0);
	vec3 dz = vec3(0.0, 0.0, e);
	float x = snoise(p + dy) - snoise(p - dy) - snoise(p + dz) + snoise(p - dz);
	float y = snoise(p + dz) - snoise(p - dz) - snoise(p + dx) + snoise(p - dx);
	float z = snoise(p + dx) - snoise(p - dx) - snoise(p + dy) + snoise(p - dy);
	return vec3(x, y, z) / (2.0 * e);
}

void main() {
	vRand = aRand;
	float t = uTime;
	vec3 p = position;
	// Rotação em espiral ao redor do eixo Y (vórtice).
	float ang = uSwirl * t * (0.4 + aRand * 0.6) / (0.6 + length(p.xz) * 0.15);
	p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz;
	// Deriva por curl noise: fluxo orgânico de pólen.
	p += curl(p * 0.18 + vec3(0.0, t * 0.05, aRand * 3.0)) * uFlow;

	// Formação: cada partícula chega com atraso próprio.
	float d = aRand * 0.45;
	float m = smoothstep(d, d + 0.55, uMorph);
	m = m * m * (3.0 - 2.0 * m);
	vMorph = m;
	vec3 target = aTarget + curl(aTarget * 0.8 + t * 0.25) * 0.015 * (1.0 + uScatter * 30.0);
	vec3 pos = mix(p, target, m);
	// Dispersão após a formação.
	pos += normalize(aTarget + vec3(0.001, 0.0, 0.0) + (vec3(aRand, fract(aRand * 7.3), fract(aRand * 13.1)) - 0.5)) * uScatter * (1.0 + aRand * 4.0);

	vec4 mv = modelViewMatrix * vec4(pos, 1.0);
	gl_Position = projectionMatrix * mv;
	float twinkle = 0.75 + 0.25 * sin(t * (2.0 + aRand * 4.0) + aRand * 40.0);
	gl_PointSize = uSize * (0.35 + aRand * 0.9) * twinkle * uPixelRatio * (10.0 / -mv.z) * mix(1.0, 0.55, m);
}`;

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uOpacity;
varying float vRand;
varying float vMorph;
void main() {
	vec2 c = gl_PointCoord - 0.5;
	float r = length(c);
	float core = smoothstep(0.5, 0.0, r);
	float glow = pow(core, 2.2);
	vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.9, vRand));
	col = mix(col, uColorC, vMorph * 0.65);
	gl_FragColor = vec4(col * (0.6 + glow * 1.4), glow * uOpacity);
}`;

type Props = {
	count: number;
	seed: string;
	time: number;
	// Dimensão da nuvem inicial (x, y, z).
	spread?: [number, number, number];
	center?: [number, number, number];
	targets?: Float32Array;
	morph?: number;
	scatter?: number;
	size?: number;
	flow?: number;
	swirl?: number;
	opacity?: number;
	colors?: [string, string, string];
};

export const Particles: React.FC<Props> = ({
	count,
	seed,
	time,
	spread = [30, 18, 20],
	center = [0, 0, 0],
	targets,
	morph = 0,
	scatter = 0,
	size = 3,
	flow = 1.2,
	swirl = 0,
	opacity = 1,
	colors = ['#ADF182', '#7AE936', '#DFFACF'],
}) => {
	const geometry = useMemo(() => {
		const g = new THREE.BufferGeometry();
		const pos = new Float32Array(count * 3);
		const rnd = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			pos[i * 3] = center[0] + (random(`${seed}x${i}`) - 0.5) * spread[0];
			pos[i * 3 + 1] = center[1] + (random(`${seed}y${i}`) - 0.5) * spread[1];
			pos[i * 3 + 2] = center[2] + (random(`${seed}z${i}`) - 0.5) * spread[2];
			rnd[i] = random(`${seed}r${i}`);
		}
		g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
		g.setAttribute('aTarget', new THREE.BufferAttribute(targets ?? pos.slice(), 3));
		return g;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [count, seed, targets]);

	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: VERT,
				fragmentShader: FRAG,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				uniforms: {
					uTime: {value: 0},
					uMorph: {value: 0},
					uScatter: {value: 0},
					uSize: {value: size},
					uFlow: {value: flow},
					uSwirl: {value: swirl},
					uPixelRatio: {value: 1},
					uOpacity: {value: opacity},
					uColorA: {value: new THREE.Color()},
					uColorB: {value: new THREE.Color()},
					uColorC: {value: new THREE.Color()},
				},
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const u = material.uniforms;
	u.uTime.value = time;
	u.uMorph.value = morph;
	u.uScatter.value = scatter;
	u.uSize.value = size;
	u.uFlow.value = flow;
	u.uSwirl.value = swirl;
	u.uOpacity.value = opacity;
	u.uColorA.value.setRGB(...hexToRgb(colors[0]));
	u.uColorB.value.setRGB(...hexToRgb(colors[1]));
	u.uColorC.value.setRGB(...hexToRgb(colors[2]));

	return <points geometry={geometry} material={material} frustumCulled={false} />;
};
