import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useVideoConfig} from 'remotion';

export type Uniform = number | [number, number] | [number, number, number] | [number, number, number, number];

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 vUv;
void main() {
	vUv = a_pos * 0.5 + 0.5;
	gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const compile = (gl: WebGL2RenderingContext, src: string, type: number) => {
	const sh = gl.createShader(type)!;
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		throw new Error(`Shader: ${gl.getShaderInfoLog(sh)}\n${src}`);
	}
	return sh;
};

type Props = {
	// Corpo do fragment shader (GLSL ES 3.0). Recebe vUv, uRes, uTime e os uniforms declarados.
	fragment: string;
	uniforms: Record<string, Uniform>;
	// Fator de resolução interna: shaders pesados podem rodar abaixo de 1.
	scale?: number;
	style?: React.CSSProperties;
};

/**
 * Canvas WebGL2 de tela cheia guiado pelo frame atual (determinístico para o render).
 * Equivalente minimalista a um quad do OGL.
 */
export const ShaderCanvas: React.FC<Props> = ({fragment, uniforms, scale = 1, style}) => {
	const {width, height} = useVideoConfig();
	const ref = useRef<HTMLCanvasElement>(null);
	const state = useRef<{gl: WebGL2RenderingContext; prog: WebGLProgram; locs: Map<string, WebGLUniformLocation | null>} | null>(null);
	const w = Math.round(width * scale);
	const h = Math.round(height * scale);

	const fullFrag = useMemo(
		() => `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uRes;
${fragment}`,
		[fragment],
	);

	useLayoutEffect(() => {
		const canvas = ref.current!;
		const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: true})!;
		const prog = gl.createProgram()!;
		gl.attachShader(prog, compile(gl, VERT, gl.VERTEX_SHADER));
		gl.attachShader(prog, compile(gl, fullFrag, gl.FRAGMENT_SHADER));
		gl.linkProgram(prog);
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
		const loc = gl.getAttribLocation(prog, 'a_pos');
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
		state.current = {gl, prog, locs: new Map()};
		return () => {
			// Libera o contexto na hora: o Chrome limita ~16 contextos por página.
			gl.getExtension('WEBGL_lose_context')?.loseContext();
			state.current = null;
		};
	}, [fullFrag]);

	useLayoutEffect(() => {
		const s = state.current;
		if (!s) return;
		const {gl, prog, locs} = s;
		gl.viewport(0, 0, w, h);
		gl.useProgram(prog);
		const get = (name: string) => {
			if (!locs.has(name)) locs.set(name, gl.getUniformLocation(prog, name));
			return locs.get(name)!;
		};
		gl.uniform2f(get('uRes'), w, h);
		for (const [name, v] of Object.entries(uniforms)) {
			const l = get(name);
			if (typeof v === 'number') gl.uniform1f(l, v);
			else if (v.length === 2) gl.uniform2fv(l, v);
			else if (v.length === 3) gl.uniform3fv(l, v);
			else gl.uniform4fv(l, v);
		}
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	});

	return (
		<canvas
			ref={ref}
			width={w}
			height={h}
			style={{position: 'absolute', inset: 0, width: '100%', height: '100%', ...style}}
		/>
	);
};
