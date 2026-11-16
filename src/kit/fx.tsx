// Linguagem visual reaproveitável (nascida na Central de Inconsistências e na Validação de atendimentos):
// fundos em shader, tipografia cinética, legenda em vidro, HUD, odômetro, pílula com linha-guia, janela do app
// sob uma câmera 3D, cursor, foco e efeitos de evento. Cores e fontes vêm da marca; tempos, do vídeo.
import React from 'react';
import {AbsoluteFill, random, spring, useCurrentFrame} from 'remotion';
import type {Sky} from '../brands';
import {hexToRgb} from '../core/color';
import {NOISE} from '../core/glsl';
import {ShaderCanvas} from '../core/ShaderCanvas';
import {Cam, EASE, OUT, ramp, S, useB, useBrand} from './timeline';

// ---------------- Fundos ----------------
const MESH = /* glsl */ `
uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uD;
${NOISE}
void main() {
	vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
	float t = uTime * 0.11;
	vec2 q = p + vec2(snoise(vec3(p * 0.8, t)), snoise(vec3(p * 0.8 + 7.3, t * 1.2))) * 0.38;
	float band = sin((q.x * 1.1 + q.y * 1.9) * 2.4 + t * 2.6) * 0.5 + 0.5;
	vec3 col = mix(uA, uB, smoothstep(0.15, 0.95, band));
	col = mix(col, uC, smoothstep(0.35, 1.0, snoise(vec3(q * 1.2 + 2.0, t * 0.9)) * 0.5 + 0.5) * 0.55);
	vec2 g = q - vec2(0.45 * sin(t * 1.7), 0.25 * cos(t * 1.3));
	col += uD * exp(-dot(g, g) * 3.2) * 0.3;
	col *= mix(0.55, 1.0, smoothstep(1.35, 0.25, length(p * vec2(0.9, 1.0))));
	fragColor = vec4(col, 1.0);
}`;
/** Fundo em shader com a paleta de um céu da marca. */
export const Mesh: React.FC<{sky: Sky}> = ({sky}) => {
	const f = useCurrentFrame();
	return <ShaderCanvas fragment={MESH} uniforms={{uTime: f / 30, uA: hexToRgb(sky.a), uB: hexToRgb(sky.b), uC: hexToRgb(sky.c), uD: hexToRgb(sky.d)}} scale={0.5} />;
};
/** Fundo escuro com brilho da marca e grade de pontos. */
export const Dark: React.FC = () => {
	const f = useCurrentFrame();
	const tint = useBrand().tintaEscura;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#0b0a08'}}>
			<div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 42% 58% at ${8 + Math.sin(f * 0.012) * 6}% ${100 + Math.cos(f * 0.01) * 8}%, rgba(${tint},0.17), rgba(${tint},0) 70%), radial-gradient(ellipse 34% 44% at ${92 - Math.sin(f * 0.009) * 5}% ${4 + Math.sin(f * 0.013) * 6}%, rgba(${tint},0.12), rgba(${tint},0) 70%)`}} />
			<div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '36px 36px'}} />
		</div>
	);
};
/** Papel claro quadriculado (cenas de documento). */
export const Paper: React.FC = () => {
	const {papel, papelLinha} = useBrand().cores;
	return (
		<div style={{position: 'absolute', inset: 0, background: papel}}>
			<div style={{position: 'absolute', inset: -120, backgroundImage: `linear-gradient(rgba(${papelLinha},0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(${papelLinha},0.05) 1px, transparent 1px)`, backgroundSize: '64px 64px'}} />
		</div>
	);
};
export type BgKind = 'black' | 'dark' | 'principal' | 'alerta' | 'frio' | 'paper';
/** Troca de fundo nos tempos dados, com fade de 10 quadros: [[tempo, tipo], ...]. */
export const Backdrop: React.FC<{keys: [number, BgKind][]}> = ({keys}) => {
	const f = useCurrentFrame();
	const b = useB();
	const brand = useBrand();
	const one = (k: BgKind) => (k === 'dark' ? <Dark /> : k === 'paper' ? <Paper /> : k === 'black' ? <AbsoluteFill style={{background: '#000'}} /> : <Mesh sky={brand.ceus[k]} />);
	let i = 0;
	for (let j = 0; j < keys.length; j++) if (f >= b(keys[j][0])) i = j;
	const u = ramp(f, b(keys[i][0]), b(keys[i][0]) + 10);
	return (
		<AbsoluteFill>
			{u < 1 && i > 0 && one(keys[i - 1][1])}
			<AbsoluteFill style={{opacity: u}}>{one(keys[i][1])}</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ---------------- Tipografia ----------------
/** Frase montada palavra a palavra; sai com desfoque. As palavras em `hot` ficam na cor de destaque. */
export const Words: React.FC<{text: string; at: number; out: number; hot?: string[]; x?: number; y: number; size?: number; color?: string; accent?: string; width?: number; sub?: string}> = ({text, at, out, hot = [], x = 960, y, size = 68, color = '#fff', accent, width = 1560, sub}) => {
	const f = useCurrentFrame();
	const b = useB();
	const brand = useBrand();
	const gone = ramp(f, b(out) - 10, b(out), EASE);
	if (f < b(at) - 2 || gone >= 1) return null;
	const hotset = new Set(hot);
	const ac = accent ?? brand.cores.acento;
	return (
		<div style={{position: 'absolute', left: x - width / 2, top: y, width, textAlign: 'center', transform: 'translateY(-50%)'}}>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.27}px`, fontFamily: brand.fontes.display, fontWeight: 700, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.01em'}}>
				{text.split(' ').map((w, i) => {
					const s = spring({frame: f - b(at) - i * 3, fps: 30, config: {damping: 15, stiffness: 150, mass: 0.7}});
					const k = Math.min(1, s);
					return (
						<span key={i} style={{display: 'inline-block', color: hotset.has(w.replace(/[.,?:!]/g, '')) ? ac : color, opacity: k * (1 - gone), transform: `translateY(${(1 - s) * 0.5 * size - gone * 0.2 * size}px)`, filter: k < 0.99 || gone > 0 ? `blur(${(1 - k) * 12 + gone * 10}px)` : undefined}}>
							{w}
						</span>
					);
				})}
			</div>
			{sub && <div style={{marginTop: size * 0.34, fontFamily: brand.fontes.ui, fontSize: 28, color: color === '#fff' ? brand.cores.textoClaro : '#475569', opacity: ramp(f, b(at) + 14, b(at) + 26) * (1 - gone), transform: `translateY(${(1 - ramp(f, b(at) + 14, b(at) + 26, OUT)) * 14}px)`}}>{sub}</div>}
		</div>
	);
};
/** Legenda em cartão de vidro sobre a interface (canto inferior esquerdo). */
export const Glass: React.FC<{at: number; out: number; l1: string; l2?: string; sub?: string; x?: number; y?: number; tone?: 'brand' | 'red' | 'amber'}> = ({at, out, l1, l2, sub, x = 70, y = 1000, tone = 'brand'}) => {
	const f = useCurrentFrame();
	const b = useB();
	const brand = useBrand();
	const gone = ramp(f, b(out) - 8, b(out), EASE);
	if (f < b(at) - 2 || gone >= 1) return null;
	const k = spring({frame: f - b(at), fps: 30, config: {damping: 17, stiffness: 140, mass: 0.8}});
	const c = {brand: brand.cores.acento, red: '#ff6b6b', amber: '#fbbf24'}[tone];
	const line = (t: string, d: number, color: string) => {
		const u = spring({frame: f - b(at) - d, fps: 30, config: {damping: 18, stiffness: 150, mass: 0.7}});
		return (
			<div style={{overflow: 'hidden'}}>
				<div style={{transform: `translateY(${(1 - u) * 110}%)`, color}}>{t}</div>
			</div>
		);
	};
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translateY(-100%) translateX(${(1 - k) * -40 - gone * 30}px)`, opacity: Math.min(1, k) * (1 - gone), maxWidth: 620, padding: '22px 30px 24px', borderRadius: 16, background: brand.cores.vidro, backdropFilter: 'blur(18px)', boxShadow: '0 30px 70px -20px rgba(0,0,0,0.65), inset 0 0 0 1.5px rgba(255,255,255,0.12)'}}>
			<div style={{fontFamily: brand.fontes.display, fontWeight: 700, fontSize: 46, lineHeight: 1.1}}>
				{line(l1, 2, '#fff')}
				{l2 && line(l2, 6, c)}
			</div>
			{sub && <div style={{marginTop: 10, fontFamily: brand.fontes.ui, fontSize: 24, lineHeight: 1.35, color: brand.cores.textoClaro, opacity: ramp(f, b(at) + 14, b(at) + 24) * 0.85}}>{sub}</div>}
		</div>
	);
};
const Dig: React.FC<{v: number; h: number}> = ({v, h}) => (
	<span style={{display: 'inline-block', height: h, overflow: 'hidden', verticalAlign: 'top', width: '0.66em', textAlign: 'center'}}>
		<span style={{display: 'block', transform: `translateY(${-v * h}px)`}}>
			{Array.from({length: 11}, (_, i) => (
				<span key={i} style={{display: 'block', height: h, lineHeight: `${h}px`}}>
					{i % 10}
				</span>
			))}
		</span>
	</span>
);
/** Odômetro de número brasileiro (ponto de milhar, vírgula decimal): cada dígito rola de verdade. */
export const Odo: React.FC<{value: number; decimals?: number; size: number; color?: string; style?: React.CSSProperties; minInt?: number; snap?: boolean}> = ({value, decimals = 0, size, color = '#fff', style, minInt = 1, snap}) => {
	const brand = useBrand();
	const scaled = Math.round(Math.max(0, value) * 10 ** decimals * 100) / 100;
	const whole = Math.floor(scaled);
	const fr = snap ? 0 : scaled - whole;
	const s = String(whole).padStart(decimals + minInt, '0');
	const h = size * 1.14;
	const items: React.ReactNode[] = [];
	for (let i = 0; i < s.length; i++) {
		const p = s.length - 1 - i;
		const d = Number(s[i]);
		const lower = (whole % 10 ** p) / 10 ** p;
		const near = p === 0 ? fr : lower >= (10 ** p - 1) / 10 ** p && fr > 0 ? fr : 0;
		items.push(<Dig key={i} v={d + near} h={h} />);
		if (decimals > 0 && p === decimals) items.push(<span key={`c${i}`} style={{lineHeight: `${h}px`, opacity: 0.85}}>,</span>);
		else if (p > decimals && (p - decimals) % 3 === 0) items.push(<span key={`p${i}`} style={{lineHeight: `${h}px`, opacity: 0.85}}>.</span>);
	}
	return <span style={{display: 'inline-flex', fontFamily: brand.fontes.display, fontWeight: 800, fontSize: size, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', ...style}}>{items}</span>;
};
/** HUD no canto superior direito: rótulo mono e valor (ex.: relógio "07:00"). */
export const Hud: React.FC<{at: number; out: number; label: string; children: React.ReactNode; x?: number; y?: number}> = ({at, out, label, children, x = 1860, y = 44}) => {
	const f = useCurrentFrame();
	const b = useB();
	const brand = useBrand();
	const k = spring({frame: f - b(at), fps: 30, config: {damping: 17, stiffness: 140}});
	const gone = ramp(f, b(out) - 8, b(out), EASE);
	if (k <= 0.01 || gone >= 1) return null;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translateX(-100%) translateY(${(1 - k) * -24}px)`, opacity: Math.min(1, k) * (1 - gone), padding: '14px 22px 12px', borderRadius: 14, textAlign: 'right', background: brand.cores.vidro, boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.12)'}}>
			<div style={{fontFamily: brand.fontes.mono, fontSize: 13, letterSpacing: '0.24em', color: brand.cores.acento, marginBottom: 2}}>{label}</div>
			{children}
		</div>
	);
};
/** Pílula de explicação, com linha-guia opcional até o ponto `to` (px de tela). */
export const Pill: React.FC<{at: number; out: number; x: number; y: number; text: string; to?: {x: number; y: number}; tone?: 'brand' | 'red' | 'dark'; anchor?: 'left' | 'right' | 'center'}> = ({at, out, x, y, text, to, tone = 'dark', anchor = 'center'}) => {
	const f = useCurrentFrame();
	const b = useB();
	const brand = useBrand();
	const s = spring({frame: f - b(at), fps: 30, config: {damping: 12, stiffness: 170, mass: 0.6}});
	const o = ramp(f, b(out) - 8, b(out));
	if (s <= 0.01 || o >= 1) return null;
	const u = Math.min(1, s);
	const col = tone === 'red' ? '#ef4444' : brand.cores.acento;
	const tx = anchor === 'left' ? '0' : anchor === 'right' ? '-100%' : '-50%';
	return (
		<>
			{to && (
				<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: u * (1 - o)}}>
					<line x1={x} y1={y} x2={x + (to.x - x) * u} y2={y + (to.y - y) * u} stroke={col} strokeWidth={2.5} />
					<circle cx={to.x} cy={to.y} r={7 * u} fill={col} />
				</svg>
			)}
			<div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%) scale(${0.7 + u * 0.3})`, opacity: Math.min(1, s * 2) * (1 - o), padding: '12px 22px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: brand.fontes.ui, fontWeight: 500, fontSize: 25, color: tone === 'brand' ? '#111' : '#fff', background: tone === 'brand' ? brand.cores.acentoClaro : tone === 'red' ? '#dc2626' : brand.cores.vidro, boxShadow: '0 16px 34px -12px rgba(0,0,0,0.7)'}}>
				{text}
			</div>
		</>
	);
};

// ---------------- Janela do app e câmera ----------------
const CHROME = 34;
/**
 * Janela de navegador (1440 de largura × h) sob uma câmera. Dentro dela, tudo é em px do app.
 * Com perspectiva o Chromium rasteriza em escala 1 e o texto borra no zoom: a janela é desenhada em Q× e a
 * transformação só reduz.
 */
export const Browser: React.FC<{cam: Cam; url: string; children: React.ReactNode; blur?: number; opacity?: number; breathe?: number; h?: number}> = ({cam, url, children, blur = 0, opacity = 1, breathe = 1, h = 810}) => {
	const f = useCurrentFrame();
	const s = S * cam.z;
	const hx = Math.sin(f * 0.031) * 3 * breathe;
	const hy = Math.cos(f * 0.024) * 2.4 * breathe;
	const hr = Math.sin(f * 0.019) * 0.5 * breathe;
	const Q = 2.5;
	return (
		<div style={{position: 'absolute', inset: 0, opacity}}>
			<div style={{position: 'absolute', left: 960 + hx, top: 540 + hy, width: 1440 * Q, height: (h + CHROME) * Q, transformOrigin: '0 0', transform: `perspective(2600px) rotateX(${cam.rx ?? 0}deg) rotateY(${(cam.ry ?? 0) + hr}deg) rotateZ(${cam.rz ?? 0}deg) scale(${s / Q}) translate(${-cam.x * Q}px, ${-(cam.y + CHROME) * Q}px)`, borderRadius: 12 * Q, overflow: 'hidden', background: '#fafafa', boxShadow: `0 ${(50 * Q) / s}px ${(120 * Q) / s}px -${(24 * Q) / s}px rgba(0,0,0,0.6)`, filter: blur > 0.15 ? `blur(${blur * Q}px)` : undefined}}>
				<div style={{zoom: Q, width: 1440, height: h + CHROME}}>
					<div style={{height: CHROME, background: '#141414', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px'}}>
						{['#ff5f57', '#febc2e', '#28c840'].map((c) => (
							<span key={c} style={{width: 11, height: 11, borderRadius: 9, background: c}} />
						))}
						<span style={{marginLeft: 18, height: 21, flex: 1, maxWidth: 620, borderRadius: 6, background: '#262626', color: '#bbb', fontFamily: 'sans-serif', fontSize: 12, display: 'flex', alignItems: 'center', padding: '0 12px'}}>{url}</span>
					</div>
					<div style={{position: 'relative', width: 1440, height: h, overflow: 'hidden'}}>{children}</div>
				</div>
			</div>
		</div>
	);
};
/** Cursor dentro da janela (px do app), com tamanho constante na tela e onda no clique. */
export const Cursor: React.FC<{x: number; y: number; z: number; press?: number; o?: number}> = ({x, y, z, press = 0, o = 1}) => {
	const brand = useBrand();
	const rgb = hexToRgb(brand.cores.acentoEscuro).map((v) => Math.round(v * 255)).join(',');
	if (o <= 0.01) return null;
	return (
		<div style={{position: 'absolute', left: x, top: y, opacity: o, transform: `scale(${1.12 / (S * z)})`, transformOrigin: '0 0', zIndex: 90}}>
			{press > 0 && press < 1 && <div style={{position: 'absolute', left: -50 * press - 4, top: -50 * press - 4, width: 100 * press + 8, height: 100 * press + 8, borderRadius: 999, border: `4px solid rgba(${rgb},${1 - press})`}} />}
			<svg width={28} height={34} viewBox="0 0 28 34" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))', transform: `scale(${1 - Math.sin(Math.min(1, press * 3) * Math.PI) * 0.18})`, transformOrigin: '0 0'}}>
				<path d="M2 2 L2 27 L8.5 21 L13 31.5 L17.5 29.5 L13 19.5 L22 19.5 Z" fill="#fff" stroke="#0f172a" strokeWidth={2} strokeLinejoin="round" />
			</svg>
		</div>
	);
};
/** Foco: escurece a janela menos a caixa, com contorno (px do app). */
export const Spot: React.FC<{box: {x: number; y: number; w: number; h: number}; a: number; color?: string; w?: number; h?: number}> = ({box, a, color, w = 1440, h = 810}) => {
	const brand = useBrand();
	if (a <= 0.005) return null;
	const id = `s${Math.round(box.x)}${Math.round(box.y)}`;
	return (
		<svg width={w} height={h} style={{position: 'absolute', inset: 0, zIndex: 40}}>
			<defs>
				<mask id={id}>
					<rect width={w} height={h} fill="white" />
					<rect x={box.x} y={box.y} width={box.w} height={box.h} rx={12} fill="black" />
				</mask>
			</defs>
			<rect width={w} height={h} fill={`rgba(4,8,6,${a * 0.72})`} mask={`url(#${id})`} />
			<rect x={box.x} y={box.y} width={box.w} height={box.h} rx={12} fill="none" stroke={color ?? brand.cores.acento} strokeWidth={2} opacity={Math.min(1, a * 1.5)} />
		</svg>
	);
};
/** Ondas de evento num ponto (quadro `at`, não tempo). */
export const Ring: React.FC<{x: number; y: number; at: number; color?: string; size?: number}> = ({x, y, at, color, size = 30}) => {
	const f = useCurrentFrame();
	const brand = useBrand();
	return (
		<>
			{[0, 7].map((d) => {
				const u = (f - at - d) / 36;
				if (u < 0 || u > 1) return null;
				const r = size * (0.5 + u * 3);
				return <div key={d} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, border: `${4 - u * 3}px solid ${color ?? brand.cores.acento}`, opacity: (1 - u) ** 1.4, zIndex: 60}} />;
			})}
		</>
	);
};
/** Faíscas radiais (quadro `at`). */
export const Burst: React.FC<{x: number; y: number; at: number; color?: string; radius?: number; count?: number; seed?: string}> = ({x, y, at, color, radius = 150, count = 26, seed = 'b'}) => {
	const f = useCurrentFrame();
	const brand = useBrand();
	const c = color ?? brand.cores.acento;
	const t = (f - at) / 30;
	if (t < 0 || t > 1) return null;
	return (
		<>
			{Array.from({length: count}, (_, i) => {
				const a = random(`${seed}a${i}`) * Math.PI * 2;
				const d = radius * (0.4 + random(`${seed}d${i}`) * 0.8) * (1 - (1 - t) ** 3);
				const sz = 3 + random(`${seed}s${i}`) * 6;
				return <span key={i} style={{position: 'absolute', zIndex: 60, left: x + Math.cos(a) * d - sz / 2, top: y + Math.sin(a) * d - sz / 2 + t * t * 26, width: sz, height: sz, borderRadius: 9, background: c, boxShadow: `0 0 ${sz * 2}px ${c}`, opacity: 1 - t}} />;
			})}
		</>
	);
};
/** Clarão de tela inteira num tempo. */
export const Flash: React.FC<{at: number; color?: string; len?: number; amt?: number}> = ({at, color = '#fff', len = 10, amt = 0.8}) => {
	const f = useCurrentFrame();
	const b = useB();
	const u = (f - b(at)) / len;
	if (u < 0 || u > 1) return null;
	return <div style={{position: 'absolute', inset: 0, background: color, opacity: amt * (1 - u) ** 2, mixBlendMode: 'screen', zIndex: 80}} />;
};
/** Recorte circular que se abre de um ponto (troca de tela "por íris"); use em clipPath. */
export const iris = (f: number, startFrame: number, x: number, y: number, dur = 16) => `circle(${ramp(f, startFrame, startFrame + dur, EASE) * 1700}px at ${x}px ${y}px)`;
