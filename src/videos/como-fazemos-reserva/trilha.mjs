// Trilha de Como fazemos vídeos (sintetizada, sem amostras de terceiros), composta sobre os marcos de timeline.json.
// Rode: bun run trilha como-fazemos-reserva   (o render também roda antes de começar). Esta é só uma base neutra: componha a
// curva de energia da estrutura deste vídeo (guia, seção 7), com foley nos gestos e um silêncio onde a história
// pede. Exemplos completos: src/videos/validacao-atendimentos/trilha.mjs e src/videos/prova-direcao/trilha.mjs.
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mixAndWrite} from '../../../scripts/lib/mix.mjs';
import {createSynth} from '../../../scripts/lib/synth.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const slug = 'como-fazemos-reserva';
const tl = JSON.parse(readFileSync(resolve(here, 'timeline.json'), 'utf8'));
const M = tl.marks;
const B = 60 / tl.bpm;
const at = (beat) => beat * B;
const END = tl.scenes.reduce((a, s) => a + s.duration, 0) / tl.fps;
const mus = createSynth(END + 3, 510);
const fx = createSynth(END + 3, 520);

const CH = [
	{r: 26, pad: [62, 66, 69, 76]},
	{r: 23, pad: [59, 62, 66, 73]},
	{r: 31, pad: [59, 62, 67, 74]},
	{r: 33, pad: [61, 64, 69, 76]},
];
const felt = (m, t, amp = 0.05, pan = 0) => mus.pluck(m, t, amp, {ratio: 1, index: 0.55, decay: 1.4, pan, send: 0.45});
const warm = (m, t, amp = 0.03, pan = 0) => mus.pluck(m, t, amp, {ratio: 2, index: 1.1, decay: 0.9, pan, send: 0.35});
const totalBeats = END / B;
for (let bt = 0; bt < totalBeats - 2; bt++) {
	const c = CH[Math.floor(bt / 4) % 4];
	if (bt % 4 === 0) mus.pad(c.pad, at(bt), at(4), 0.016, 1200, {attack: 0.8, release: 1.4});
	if (bt % 4 === 0) mus.bass(c.r + 12, at(bt), at(3.6), 0.06);
	warm(c.pad[(bt * 3) % 4] + 12, at(bt + 0.5), 0.014, ((bt % 3) - 1) * 0.3);
}
felt(74, at(M.inicio), 0.08);
felt(81, at(M.inicio) + 0.5, 0.08);
fx.impact(at(M.inicio), 0.3);

mkdirSync(resolve(root, 'public', slug), {recursive: true});
mixAndWrite({mus, fx, end: END, out: resolve(root, 'public', slug, 'trilha.wav'), musicDb: [[0, -3], [END, -3]], musicLp: [[0, 6000], [END, 6000]]});
