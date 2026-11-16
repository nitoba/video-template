// Mix final de uma trilha: música e efeitos em barramentos separados, ganho e passa-baixa automatizados na
// música, saturação suave, fade no fim e loudnorm em duas passadas (-14 LUFS, -2 dBTP).
import {spawnSync} from 'node:child_process';
import {renameSync, unlinkSync} from 'node:fs';
import {SR, writeWav} from './synth.mjs';

const curveAt = (keys, t, log = false) => {
	let k = 0;
	while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
	const [t0, v0] = keys[k];
	const [t1, v1] = keys[k + 1];
	const u = Math.min(1, Math.max(0, (t - t0) / Math.max(1e-6, t1 - t0)));
	const e = u * u * (3 - 2 * u);
	return log ? v0 * (v1 / v0) ** e : v0 + (v1 - v0) * e;
};

/**
 * @param mus barramento de música (createSynth)
 * @param fx barramento de efeitos (createSynth)
 * @param end duração em segundos
 * @param out caminho do .wav
 * @param musicDb [[segundos, dB], ...] ganho da música
 * @param musicLp [[segundos, Hz], ...] corte do passa-baixa da música (16000 = aberto)
 */
export const mixAndWrite = ({mus, fx, end, out, musicDb = [[0, 0], [end, 0]], musicLp = [[0, 16000], [end, 16000]]}) => {
	const m = mus.render();
	const e = fx.render();
	const N = m.L.length;
	const L = new Float32Array(N);
	const R = new Float32Array(N);
	const st = [0, 0, 0, 0];
	for (let n = 0; n < N; n++) {
		const t = n / SR;
		const g = 10 ** (curveAt(musicDb, t) / 20);
		const fc = Math.min(16000, curveAt(musicLp, t, true));
		const k = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
		let ml = m.L[n];
		let mr = m.R[n];
		if (fc < 15000) {
			st[0] += k * st[1];
			st[1] += k * (ml - st[0] - 0.7 * st[1]);
			ml = st[0];
			st[2] += k * st[3];
			st[3] += k * (mr - st[2] - 0.7 * st[3]);
			mr = st[2];
		} else {
			st[0] = ml;
			st[2] = mr;
			st[1] = st[3] = 0;
		}
		const fade = t > end - 1.2 ? Math.max(0, (end - t) / 1.2) : 1;
		L[n] = Math.tanh((ml * g + e.L[n] * 0.9) * 1.05) * fade;
		R[n] = Math.tanh((mr * g + e.R[n] * 0.9) * 1.05) * fade;
	}
	const raw = out.replace('.wav', '.raw.wav');
	writeWav(raw, L, R, end);
	const TARGET = 'I=-14:TP=-2:LRA=11';
	const probe = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', `loudnorm=${TARGET}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8'});
	const meas = JSON.parse(probe.stderr.slice(probe.stderr.lastIndexOf('{'), probe.stderr.lastIndexOf('}') + 1));
	const tmp = out.replace('.wav', '.norm.wav');
	const pass2 = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', `loudnorm=${TARGET}:measured_I=${meas.input_i}:measured_TP=${meas.input_tp}:measured_LRA=${meas.input_lra}:measured_thresh=${meas.input_thresh}:offset=${meas.target_offset}:linear=true`, '-ar', String(SR), '-c:a', 'pcm_s16le', tmp], {encoding: 'utf8'});
	if (pass2.status !== 0) throw new Error(pass2.stderr);
	renameSync(tmp, out);
	unlinkSync(raw);
	console.log(`${out}: ${end.toFixed(2)}s, antes ${meas.input_i} LUFS / ${meas.input_tp} dBTP → -14 LUFS`);
};
