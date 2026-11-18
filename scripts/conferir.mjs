#!/usr/bin/env node
// Conferência medida do MP4 renderizado (o que o olho deixa passar numa folha de quadros):
// trechos parados ou em deriva lenta, quadros vazios, saltos e pops de um quadro, silêncios, LUFS e pico real.
// Uso: bun run conferir <slug | arquivo.mp4>   PARADO=0.5 (s) · SALTO=0.08 (0..1) · SILENCIO=0.4 (s)
// Os tempos saem em segundos e em tempos da música, prontos para `bun run folha <slug> <tempos...>`.
// É um relatório, não um veredito: corte seco e silêncio planejado aparecem aqui e estão certos.
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv[2];
if (!arg) throw new Error('Uso: bun run conferir <slug | arquivo.mp4>');
const isFile = arg.endsWith('.mp4');
const slug = isFile ? null : arg;
const file = isFile ? resolve(arg) : [`${slug}-narrado.mp4`, `${slug}.mp4`].map((f) => resolve(root, 'out', f)).find(existsSync);
if (!file || !existsSync(file)) throw new Error(`Não achei o MP4 de "${arg}" em out/. Rode bun run render ${arg}.`);
const tlPath = slug && resolve(root, 'src/videos', slug, 'timeline.json');
const tl = tlPath && existsSync(tlPath) ? JSON.parse(readFileSync(tlPath, 'utf8')) : null;
const PARADO = Number(process.env.PARADO ?? 0.5);
const SALTO = Number(process.env.SALTO ?? 0.08);
const SILENCIO = Number(process.env.SILENCIO ?? 0.4);

const run = (cmd, args) => {
	const r = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 1 << 28});
	if (r.status !== 0) throw new Error(r.stderr.slice(-2000));
	return r;
};
const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]).stdout);
const vs = probe.streams.find((s) => s.codec_type === 'video');
const as = probe.streams.find((s) => s.codec_type === 'audio');
const [fn, fd] = vs.r_frame_rate.split('/').map(Number);
const fps = fn / fd;
const frames = Number(vs.nb_frames);
const beat = tl?.beat;
/** Segundos, e o tempo da música entre parênteses quando há timeline. */
const at = (s) => `${s.toFixed(2).padStart(7)} s${beat ? ` (tempo ${((s * fps) / beat).toFixed(1)})` : ''}`;
const marks = tl ? Object.entries(tl.marks).map(([k, v]) => [k, (v * beat) / fps]) : [];
/** Marco mais próximo, para dizer em que momento do roteiro o achado cai. */
const near = (s) => {
	if (!marks.length) return '';
	const [k, t] = marks.reduce((a, m) => (Math.abs(m[1] - s) < Math.abs(a[1] - s) ? m : a));
	return `  ~ ${k}${s >= t ? '+' : '−'}${Math.abs(s - t).toFixed(1)} s`;
};

console.log(`\n${file.replace(root + '/', '')}`);
const esperado = tl ? tl.scenes.reduce((a, s) => a + s.duration, 0) : null;
console.log(`imagem  ${vs.width}×${vs.height} · ${fps} fps · ${frames} quadros (${(frames / fps).toFixed(2)} s)${esperado !== null ? (esperado === frames ? ' · bate com a timeline' : ` · ATENÇÃO: a timeline pede ${esperado}`) : ''}`);

// Uma passada de vídeo em 320 px: mudança de cena por quadro, faixa de luminância e trechos congelados.
const v = run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-an', '-vf', `scale=320:-2,freezedetect=n=0.002:d=${PARADO},signalstats,select='gte(scene,0)',metadata=print:file=-`, '-f', 'null', '-']).stdout;
const fr = [];
let cur = null;
for (const line of v.split('\n')) {
	const head = /pts_time:([\d.]+)/.exec(line);
	if (head) {
		cur = {t: Number(head[1])};
		fr.push(cur);
		continue;
	}
	const kv = /^lavfi\.([\w.]+)=(.+)$/.exec(line);
	if (kv && cur) cur[kv[1]] = Number(kv[2]);
}

const parados = [];
let open = null;
for (const f of fr) {
	if (f['freezedetect.freeze_start'] !== undefined) open = f['freezedetect.freeze_start'];
	if (f['freezedetect.freeze_end'] !== undefined && open !== null) {
		parados.push([open, f['freezedetect.freeze_end']]);
		open = null;
	}
}
if (open !== null) parados.push([open, frames / fps]);
const somaParado = parados.reduce((a, [x, y]) => a + y - x, 0);
console.log(`\nTrechos parados ou em deriva lenta (quase nada muda por ${PARADO} s ou mais): ${parados.length ? `${parados.length}, somando ${somaParado.toFixed(1)} s (${Math.round((100 * somaParado) / (frames / fps))}% do vídeo)` : 'nenhum'}`);
for (const [a, c] of parados) console.log(`  ${at(a)} → ${c.toFixed(2)} s  (${(c - a).toFixed(2)} s)${near(a)}`);

// Quadro vazio: a imagem inteira numa faixa estreita de luminância (papel sem nada, preto, clarão).
const vazios = [];
for (const f of fr) {
	const flat = f['signalstats.YMAX'] - f['signalstats.YMIN'] < 28;
	const last = vazios[vazios.length - 1];
	if (!flat) continue;
	if (last && f.t - last[1] < 1.5 / fps) last[1] = f.t;
	else vazios.push([f.t, f.t]);
}
console.log(`\nQuadros vazios (fundo liso, sem sujeito): ${vazios.length || 'nenhum'}`);
for (const [a, c] of vazios) console.log(`  ${at(a)}  ${Math.round((c - a) * fps) + 1} quadro(s)${near(a)}`);

// Salto: a diferença para o quadro anterior dispara sozinha. Dois saltos colados são um pop de um quadro
// (algo aparece e some); um salto isolado é corte seco ou chave fora de ordem (câmera, cursor, rolagem).
const sc = fr.map((f) => f.scene_score ?? 0);
const saltos = [];
for (let i = 2; i < sc.length - 2; i++) {
	const viz = Math.max(sc[i - 2], sc[i + 2], 0.004);
	if (sc[i] >= SALTO && sc[i] > 3 * viz) saltos.push(i);
}
const pops = [];
const cortes = [];
for (let k = 0; k < saltos.length; k++) {
	if (saltos[k + 1] - saltos[k] <= 2) {
		pops.push(saltos[k]);
		k++;
	} else cortes.push(saltos[k]);
}
console.log(`\nPops de um quadro (aparece e some): ${pops.length || 'nenhum'}`);
for (const i of pops) console.log(`  ${at(fr[i].t)}  quadro ${i}${near(fr[i].t)}`);
console.log(`Saltos isolados (corte seco planejado, ou chave fora de ordem): ${cortes.length || 'nenhum'}`);
for (const i of cortes) console.log(`  ${at(fr[i].t)}  quadro ${i}  força ${sc[i].toFixed(2)}${near(fr[i].t)}`);

if (as) {
	const e = run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-vn', '-af', `silencedetect=n=-50dB:d=${SILENCIO},ebur128=peak=true`, '-f', 'null', '-']).stderr;
	const sum = e.slice(e.lastIndexOf('Summary'));
	const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(sum)?.[1]);
	const TP = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(sum)?.[1]);
	const LRA = Number(/LRA:\s+(-?[\d.]+) LU/.exec(sum)?.[1]);
	const okI = Math.abs(I + 14) <= 1;
	const okTP = TP <= -1;
	console.log(`\nsom     ${I} LUFS ${okI ? '(alvo −14, ok)' : '(ATENÇÃO: alvo −14 ± 1)'} · pico real ${TP} dBTP ${okTP ? '(ok)' : '(ATENÇÃO: acima de −1 depois do AAC)'} · LRA ${LRA} LU`);
	const sil = [...e.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
	console.log(`Silêncios de ${SILENCIO} s ou mais (o guia pede um, planejado): ${sil.length || 'nenhum'}`);
	for (const [a, c] of sil) console.log(`  ${at(a)} → ${c.toFixed(2)} s  (${(c - a).toFixed(2)} s)${near(a)}`);
	// O AAC atrasa o áudio (priming). Com edit list o player compensa; sem ela, o som chega tarde.
	const lag = Number(as.start_time) - Number(vs.start_time);
	if (Math.abs(lag) > 0.5 / fps) console.log(`ATENÇÃO: o áudio começa ${(lag * 1000).toFixed(0)} ms ${lag > 0 ? 'depois' : 'antes'} da imagem (${(lag * fps).toFixed(1)} quadro).`);
} else console.log('\nsom     ATENÇÃO: o arquivo não tem áudio.');
console.log('');
