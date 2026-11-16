#!/usr/bin/env node
// Narração (ElevenLabs; tomadas em public/<slug>/voz/raw/NN-a.mp3 e NN-b.mp3, geradas pela skill narracao).
// Corta o silêncio das bordas, encaixa cada fala na janela de src/videos/<slug>/narracao.json (acelera no máximo
// 10% e, se ainda não couber, empurra a próxima), nivela a -18 LUFS e mistura com a trilha, que abaixa por baixo
// da voz. Gera public/<slug>/trilha-narrada.wav e out/<slug>-narrado.mp4 (sem recodificar a imagem de out/<slug>.mp4).
// Uso: bun run narrar <slug>   PLAN_ONLY=1 só imprime o encaixe · TAKES="7:b,12:b" troca tomadas · STEMS=1 salva voz e trilha
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
if (!slug) throw new Error('Uso: bun run narrar <slug>');
const V = resolve(root, 'src/videos', slug);
const tl = JSON.parse(readFileSync(resolve(V, 'timeline.json'), 'utf8'));
const END = tl.scenes.reduce((a, s) => a + s.duration, 0) / tl.fps;
const narr = JSON.parse(readFileSync(resolve(V, 'narracao.json'), 'utf8'));
const MUSIC = resolve(root, 'public', slug, 'trilha.wav');
const OUT = resolve(root, 'public', slug, 'trilha-narrada.wav');
const MAX_TEMPO = 1.1;
// As janelas estão em segundos do corte com `beatBase` quadros por tempo (ao alongar a timeline, mude só o beat).
const K = tl.beat / (narr.beatBase ?? tl.beat);
const GAP = 0.12;
const VOICE_LUFS = -18;
const run = (cmd, args) => {
	const r = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 1 << 26});
	if (r.status !== 0) throw new Error(r.stderr);
	return r;
};
const dur = (f) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim());
const lufs = (f) => {
	const e = run('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128', '-f', 'null', '-']).stderr;
	return Number(/I:\s+(-?[\d.]+) LUFS/.exec(e.slice(e.lastIndexOf('Summary')))?.[1]);
};
const falas = narr.falas;
if (!falas.length) throw new Error(`Sem falas em src/videos/${slug}/narracao.json`);
let prevEnd = 0;
const plan = falas.map(({n, ini, fim}) => {
	const id = String(n).padStart(2, '0');
	const take = Object.fromEntries((process.env.TAKES ?? '').split(',').filter(Boolean).map((s) => s.split(':')))[String(n)] ?? 'a';
	const raw = resolve(root, 'public', slug, 'voz/raw', `${id}-${take}.mp3`);
	const file = resolve(root, 'public', slug, 'voz', `${id}.wav`);
	if (!existsSync(file) || process.env.RETRIM || process.env.TAKES)
		run('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse', '-ar', '48000', file]);
	const d = dur(file);
	const start = Math.max(ini * K, prevEnd + GAP);
	const tempo = Math.min(MAX_TEMPO, Math.max(1, d / Math.max(0.1, fim * K - start)));
	const end = start + d / tempo;
	prevEnd = end;
	return {n, id, file, ini: ini * K, fim: fim * K, start, end, tempo, gain: VOICE_LUFS - lufs(file)};
});
const last = plan[plan.length - 1];
for (const p of plan) console.log(`${p.id}  ${p.start.toFixed(2).padStart(6)} → ${p.end.toFixed(2).padStart(6)}  janela até ${p.fim.toFixed(1).padStart(5)}  ${p.tempo.toFixed(2)}×${p.end > p.fim + 0.05 ? `  PASSOU ${(p.end - p.fim).toFixed(2)} s` : ''}${p.start > p.ini + 0.05 ? `  ATRASOU ${(p.start - p.ini).toFixed(2)} s` : ''}`);
if (process.env.PLAN_ONLY) process.exit(0);
if (last.end > END - 0.05) throw new Error(`a última fala termina em ${last.end.toFixed(2)} s, depois do vídeo (${END})`);

const DUCK = 1 - 10 ** (-16 / 20);
const ramp = ({start, end}) => `min(clip((t-${(start - 0.25).toFixed(3)})/0.25,0,1),clip((${(end + 0.5).toFixed(3)}-t)/0.5,0,1))`;
// Filtro em blocos: um volume por fala, porque uma expressão só com 48 falas passa do que o ffmpeg avalia bem.
const duck = plan.map((p) => `volume='1-${DUCK.toFixed(4)}*${ramp(p)}':eval=frame:enable='between(t,${(p.start - 0.3).toFixed(3)},${(p.end + 0.55).toFixed(3)})'`).join(',');
const stems = Boolean(process.env.STEMS);
const args = ['-v', 'error', '-y', '-i', MUSIC];
plan.forEach((p) => args.push('-i', p.file));
const delays = plan.map((p, i) => {
	const ms = Math.round(p.start * 1000);
	const sp = p.tempo > 1.001 ? `atempo=${p.tempo.toFixed(3)},` : '';
	return `[${i + 1}:a]aresample=48000,${sp}volume=${p.gain.toFixed(2)}dB,adelay=${ms}|${ms},aformat=channel_layouts=stereo[v${i}]`;
});
const graph = [
	...delays,
	`${plan.map((_, i) => `[v${i}]`).join('')}amix=inputs=${plan.length}:normalize=0,highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120,apad=whole_dur=${END}${stems ? ',asplit=2[vo][vo2]' : '[vo]'}`,
	`[0:a]aresample=48000,volume=-10dB,${duck}${stems ? ',asplit=2[m][m2]' : '[m]'}`,
	`[m][vo]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-14:TP=-3:LRA=11,atrim=0:${END}[outa]`,
].join(';');
args.push('-filter_complex', graph, '-map', '[outa]', '-ar', '48000', '-c:a', 'pcm_s16le', OUT);
if (stems) args.push('-map', '[vo2]', '-ar', '48000', resolve(root, 'out', `${slug}-stem-voz.wav`), '-map', '[m2]', '-ar', '48000', resolve(root, 'out', `${slug}-stem-trilha.wav`));
run('ffmpeg', args);
run('ffmpeg', ['-v', 'error', '-y', '-i', resolve(root, 'out', `${slug}.mp4`), '-i', OUT, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', resolve(root, 'out', `${slug}-narrado.mp4`)]);
console.log(`out/${slug}-narrado.mp4 pronto`);
