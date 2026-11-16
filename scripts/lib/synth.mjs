// Sintetizador offline compartilhado pelas trilhas (no espírito do Tone.js, mas sem Web Audio):
// pads em wavetable, plucks FM, bateria, whooshes, riser, impacto, Freeverb e mix final em WAV.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';

export const SR = 48000;

/** Lê um timeline.json e calcula o início absoluto de cada cena (descontando as transições). */
export const loadTimeline = (path) => {
	const tl = JSON.parse(readFileSync(path, 'utf8'));
	// "stretch" desacelera a cena inteira (Sequence com playbackRate 1/stretch).
	for (const s of tl.scenes) s.duration = Math.round(s.duration * (s.stretch ?? 1));
	const starts = tl.scenes.map((_, i) => tl.scenes.slice(0, i).reduce((a, s, j) => a + s.duration - tl.transitions[j].duration, 0));
	const totalFrames = tl.scenes.reduce((a, s) => a + s.duration, 0) - tl.transitions.reduce((a, t) => a + t.duration, 0);
	const scene = Object.fromEntries(tl.scenes.map((s, i) => [s.id, starts[i]]));
	const stretch = Object.fromEntries(tl.scenes.map((s) => [s.id, s.stretch ?? 1]));
	return {tl, starts, totalFrames, scene, stretch, sec: (frame) => frame / tl.fps};
};

export const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// Wavetable de serra limitada em banda.
const TABLE = 4096;
const saw = new Float32Array(TABLE);
for (let h = 1; h <= 40; h++) for (let i = 0; i < TABLE; i++) saw[i] += (Math.sin((2 * Math.PI * h * i) / TABLE) / h) * 0.6;
const readSaw = (ph) => {
	const x = (ph - Math.floor(ph)) * TABLE;
	const i = x | 0;
	const f = x - i;
	return saw[i] * (1 - f) + saw[(i + 1) % TABLE] * f;
};

export const createSynth = (durationSec, seedInit = 1337) => {
	const N = Math.ceil(durationSec * SR);

	// Barramentos.
	const dryL = new Float32Array(N);
	const dryR = new Float32Array(N);
	const padL = new Float32Array(N);
	const padR = new Float32Array(N);
	const revL = new Float32Array(N);
	const revR = new Float32Array(N);
	const duck = new Float32Array(N).fill(1);

	// PRNG determinístico.
	let seed = seedInit;
	const rnd = () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};

	const write = (busL, busR, i, v, pan, send = 0) => {
		if (i < 0 || i >= N) return;
		const l = Math.cos(((pan + 1) * Math.PI) / 4);
		const r = Math.sin(((pan + 1) * Math.PI) / 4);
		busL[i] += v * l;
		busR[i] += v * r;
		if (send) {
			revL[i] += v * l * send;
			revR[i] += v * r * send;
		}
	};

	// Pad: 3 serras desafinadas por nota em filtro SVF com envelope lento.
	const pad = (notes, t0, dur, amp = 0.05, cutoff = 1400, opts = {}) => {
		const {attack = 1.2, release = 1.8, bright = 0} = opts;
		const s0 = Math.floor(t0 * SR);
		const len = Math.floor((dur + release) * SR);
		notes.forEach((m, n) => {
			const detunes = [-0.09, 0, 0.11];
			detunes.forEach((d, k) => {
				const f = mtof(m + d);
				let ph = rnd();
				let lp = 0;
				let bp = 0;
				const pan = (k - 1) * 0.6 + (n % 2 ? 0.15 : -0.15);
				for (let j = 0; j < len; j++) {
					const t = j / SR;
					const env = Math.min(1, t / attack) * (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
					ph += f / SR;
					const x = readSaw(ph);
					const fc = cutoff * (0.6 + 0.4 * Math.sin(t * 0.7 + n)) + bright * t * 200;
					const g = 2 * Math.sin((Math.PI * Math.min(fc, 8000)) / SR);
					lp += g * bp;
					const hp = x - lp - 0.5 * bp;
					bp += g * hp;
					write(padL, padR, s0 + j, lp * env * amp, pan, 0.6);
				}
			});
		});
	};

	// Pluck FM (marimba/sino).
	const pluck = (m, t0, amp = 0.12, opts = {}) => {
		const {ratio = 3.5, index = 2.2, decay = 0.9, pan = 0, send = 0.35} = opts;
		const f = mtof(m);
		const s0 = Math.floor(t0 * SR);
		const len = Math.floor(decay * 4 * SR);
		for (let j = 0; j < len; j++) {
			const t = j / SR;
			const env = Math.exp(-t / (decay * 0.35)) * Math.min(1, t * 400);
			const modEnv = Math.exp(-t / (decay * 0.12));
			const v = Math.sin(2 * Math.PI * f * t + index * modEnv * Math.sin(2 * Math.PI * f * ratio * t));
			write(dryL, dryR, s0 + j, v * env * amp, pan, send);
		}
	};

	const kick = (t0, amp = 0.9) => {
		const s0 = Math.floor(t0 * SR);
		const len = Math.floor(0.6 * SR);
		let ph = 0;
		for (let j = 0; j < len; j++) {
			const t = j / SR;
			const f = 45 + 110 * Math.exp(-t * 28);
			ph += f / SR;
			const env = Math.exp(-t * 6.5);
			const click = (rnd() * 2 - 1) * Math.exp(-t * 400) * 0.25;
			write(dryL, dryR, s0 + j, (Math.sin(2 * Math.PI * ph) * env + click) * amp, 0, 0.03);
			// Sidechain: abaixa o pad.
			if (s0 + j < N) duck[s0 + j] = Math.min(duck[s0 + j], 1 - 0.6 * Math.exp(-t * 7));
		}
	};

	const hat = (t0, amp = 0.08, open = false, pan = 0.25) => {
		const s0 = Math.floor(t0 * SR);
		const dec = open ? 0.18 : 0.035;
		const len = Math.floor(dec * 6 * SR);
		let prev = 0;
		for (let j = 0; j < len; j++) {
			const t = j / SR;
			const n = rnd() * 2 - 1;
			const hp = n - prev;
			prev = n;
			write(dryL, dryR, s0 + j, hp * Math.exp(-t / dec) * amp, pan, 0.08);
		}
	};

	const clap = (t0, amp = 0.18) => {
		const s0 = Math.floor(t0 * SR);
		const len = Math.floor(0.4 * SR);
		let lp = 0;
		let bp = 0;
		const g = 2 * Math.sin((Math.PI * 1400) / SR);
		for (let j = 0; j < len; j++) {
			const t = j / SR;
			const bursts = [0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 90) : 0), 0) + Math.exp(-t * 14) * 0.5;
			const x = rnd() * 2 - 1;
			lp += g * bp;
			const hp = x - lp - 0.4 * bp;
			bp += g * hp;
			write(dryL, dryR, s0 + j, bp * bursts * amp, -0.1, 0.4);
		}
	};

	const bass = (m, t0, dur, amp = 0.22) => {
		const f = mtof(m);
		const s0 = Math.floor(t0 * SR);
		const len = Math.floor((dur + 0.05) * SR);
		let ph = 0;
		let lp = 0;
		for (let j = 0; j < len; j++) {
			const t = j / SR;
			ph += f / SR;
			const env = Math.min(1, t * 300) * Math.exp(-t * 3.2) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.05) : 1);
			const x = Math.sin(2 * Math.PI * ph) * 0.8 + readSaw(ph) * 0.35;
			lp += (x - lp) * 0.08;
			write(dryL, dryR, s0 + j, lp * env * amp, 0, 0);
		}
	};

	// Whoosh: ruído em passa-banda varrendo a frequência e o pan.
	const whoosh = (tc, dur = 0.9, amp = 0.35, up = true) => {
		const s0 = Math.floor((tc - dur * 0.6) * SR);
		const len = Math.floor(dur * SR);
		let lp = 0;
		let bp = 0;
		for (let j = 0; j < len; j++) {
			const u = j / len;
			const env = Math.sin(Math.PI * u) ** 2;
			const fc = up ? 300 + 5200 * u * u : 5500 - 5000 * u;
			const g = 2 * Math.sin((Math.PI * fc) / SR);
			const x = rnd() * 2 - 1;
			lp += g * bp;
			const hp = x - lp - 0.6 * bp;
			bp += g * hp;
			write(dryL, dryR, s0 + j, bp * env * amp, -0.8 + 1.6 * u, 0.5);
		}
	};

	const riser = (t0, t1, amp = 0.18) => {
		const s0 = Math.floor(t0 * SR);
		const len = Math.floor((t1 - t0) * SR);
		let ph = 0;
		let lp = 0;
		let bp = 0;
		for (let j = 0; j < len; j++) {
			const u = j / len;
			const env = u ** 2.2;
			const f = 180 + 900 * u * u;
			ph += f / SR;
			const fc = 400 + 7000 * u * u;
			const g = 2 * Math.sin((Math.PI * fc) / SR);
			const x = rnd() * 2 - 1;
			lp += g * bp;
			const hp = x - lp - 0.5 * bp;
			bp += g * hp;
			write(dryL, dryR, s0 + j, (bp * 0.7 + Math.sin(2 * Math.PI * ph) * 0.15) * env * amp, Math.sin(u * 20) * 0.3, 0.5);
		}
	};

	const impact = (t0, amp = 1) => {
		kick(t0, amp);
		const s0 = Math.floor(t0 * SR);
		const len = Math.floor(3 * SR);
		let lp = 0;
		for (let j = 0; j < len; j++) {
			const t = j / SR;
			const boom = Math.sin(2 * Math.PI * (38 * t + (20 * (1 - Math.exp(-t * 5))) / 5)) * Math.exp(-t * 1.6);
			const x = rnd() * 2 - 1;
			lp += (x - lp) * 0.05;
			write(dryL, dryR, s0 + j, (boom * 0.7 + lp * Math.exp(-t * 3) * 1.2) * amp * 0.6, 0, 0.7);
		}
	};

	const sparkle = (t0, notes, step = 0.06, amp = 0.05) =>
		notes.forEach((m, i) => pluck(m, t0 + i * step, amp, {ratio: 7.01, index: 1.2, decay: 1.2, pan: -0.6 + (1.2 * i) / notes.length, send: 0.7}));

	// Reverb estilo Freeverb (8 combs + 4 allpass por canal).
	const reverb = (input, offset) => {
		const out = new Float32Array(N);
		const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({buf: new Float32Array(Math.floor((d + offset) * (SR / 44100))), i: 0, f: 0}));
		const aps = [556, 441, 341, 225].map((d) => ({buf: new Float32Array(Math.floor((d + offset) * (SR / 44100))), i: 0}));
		const fb = 0.86;
		const damp = 0.3;
		for (let n = 0; n < N; n++) {
			const x = input[n] * 0.015;
			let y = 0;
			for (const c of combs) {
				const o = c.buf[c.i];
				c.f = o * (1 - damp) + c.f * damp;
				c.buf[c.i] = x + c.f * fb;
				c.i = (c.i + 1) % c.buf.length;
				y += o;
			}
			for (const a of aps) {
				const b = a.buf[a.i];
				a.buf[a.i] = y + b * 0.5;
				a.i = (a.i + 1) % a.buf.length;
				y = b - y;
			}
			out[n] = y;
		}
		return out;
	};

	/**
	 * Mixa os barramentos com a curva de intensidade ([segundos, dB] com interpolação suave),
	 * saturação leve e pico em −1 dBFS, e grava um WAV PCM 16-bit estéreo de `end` segundos.
	 */
	const finish = ({curve, end, outPath}) => {
		const wetL = reverb(revL, 0);
		const wetR = reverb(revR, 23);
		const auto = new Float32Array(N);
		let k = 0;
		for (let n = 0; n < N; n++) {
			const t = n / SR;
			while (k < curve.length - 2 && t > curve[k + 1][0]) k++;
			const [t0, d0] = curve[k];
			const [t1, d1] = curve[k + 1];
			const u = Math.min(1, Math.max(0, (t - t0) / Math.max(1e-6, t1 - t0)));
			auto[n] = d0 + (d1 - d0) * (u * u * (3 - 2 * u));
		}

		const outL = new Float32Array(N);
		const outR = new Float32Array(N);
		let peak = 0;
		for (let n = 0; n < N; n++) {
			const d = duck[n];
			const g = 10 ** (auto[n] / 20);
			outL[n] = Math.tanh((dryL[n] + padL[n] * d + wetL[n] * 0.9) * 1.1) * g;
			outR[n] = Math.tanh((dryR[n] + padR[n] * d + wetR[n] * 0.9) * 1.1) * g;
			peak = Math.max(peak, Math.abs(outL[n]), Math.abs(outR[n]));
		}
		const gain = 0.89 / peak;
		const fadeStart = Math.floor((end - 0.8) * SR);
		const fadeEnd = Math.floor((end + 2.5) * SR);

		const len = Math.min(N, Math.floor(end * SR));
		const buf = Buffer.alloc(44 + len * 4);
		buf.write('RIFF', 0);
		buf.writeUInt32LE(36 + len * 4, 4);
		buf.write('WAVEfmt ', 8);
		buf.writeUInt32LE(16, 16);
		buf.writeUInt16LE(1, 20);
		buf.writeUInt16LE(2, 22);
		buf.writeUInt32LE(SR, 24);
		buf.writeUInt32LE(SR * 4, 28);
		buf.writeUInt16LE(4, 32);
		buf.writeUInt16LE(16, 34);
		buf.write('data', 36);
		buf.writeUInt32LE(len * 4, 40);
		for (let n = 0; n < len; n++) {
			const f = n < fadeStart ? 1 : Math.max(0, 1 - (n - fadeStart) / (fadeEnd - fadeStart));
			buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outL[n] * gain * f)) * 32767), 44 + n * 4);
			buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outR[n] * gain * f)) * 32767), 46 + n * 4);
		}
		mkdirSync(dirname(outPath), {recursive: true});
		writeFileSync(outPath, buf);
		console.log(`${outPath.split('/').pop()}: ${(len / SR).toFixed(2)}s, pico ${peak.toFixed(2)} → ganho ${gain.toFixed(2)}`);
	};

	/** Mixa os barramentos (com reverb e sidechain) e devolve as amostras em float, sem ganho final. */
	const render = () => {
		const wetL = reverb(revL, 0);
		const wetR = reverb(revR, 23);
		const L = new Float32Array(N);
		const R = new Float32Array(N);
		for (let n = 0; n < N; n++) {
			L[n] = dryL[n] + padL[n] * duck[n] + wetL[n] * 0.9;
			R[n] = dryR[n] + padR[n] * duck[n] + wetR[n] * 0.9;
		}
		return {L, R};
	};

	return {N, rnd, pad, pluck, kick, hat, clap, bass, whoosh, riser, impact, sparkle, finish, render};
};

/** Grava amostras float como WAV PCM 16-bit estéreo, com pico em −1 dBFS. */
export const writeWav = (outPath, L, R, seconds) => {
	const len = Math.min(L.length, Math.floor(seconds * SR));
	let peak = 1e-6;
	for (let n = 0; n < len; n++) peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
	const gain = 0.89 / peak;
	const buf = Buffer.alloc(44 + len * 4);
	buf.write('RIFF', 0);
	buf.writeUInt32LE(36 + len * 4, 4);
	buf.write('WAVEfmt ', 8);
	buf.writeUInt32LE(16, 16);
	buf.writeUInt16LE(1, 20);
	buf.writeUInt16LE(2, 22);
	buf.writeUInt32LE(SR, 24);
	buf.writeUInt32LE(SR * 4, 28);
	buf.writeUInt16LE(4, 32);
	buf.writeUInt16LE(16, 34);
	buf.write('data', 36);
	buf.writeUInt32LE(len * 4, 40);
	for (let n = 0; n < len; n++) {
		buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[n] * gain)) * 32767), 44 + n * 4);
		buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[n] * gain)) * 32767), 46 + n * 4);
	}
	mkdirSync(dirname(outPath), {recursive: true});
	writeFileSync(outPath, buf);
};
