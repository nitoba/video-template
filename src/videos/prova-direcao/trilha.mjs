// Trilha da prova PecTrace (90 BPM, Ré maior com nonas): piano abafado e plucks quentes, foley de papel.
// Ideia sonora: a cópia repete o mesmo motivo do original, mais rápido. Silêncio antes da virada.
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mixAndWrite} from '../../../scripts/lib/mix.mjs';
import {createSynth} from '../../../scripts/lib/synth.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const tl = JSON.parse(readFileSync(resolve(here, 'timeline.json'), 'utf8'));
const M = tl.marks;
const B = 60 / tl.bpm;
const at = (beat) => beat * B;
const END = tl.scenes.reduce((a, s) => a + s.duration, 0) / tl.fps;
const N = tl.texto.split(' ').length;
const wordBeat = (i) => M.escreve + (i * tl.escrita) / (N - 1);
const copyBeat = (i) => M.copia + (i * tl.copiaDur) / (N - 1);
const mus = createSynth(END + 3, 1201);
const fx = createSynth(END + 3, 1202);

const felt = (m, t, amp = 0.06, pan = 0) => mus.pluck(m, t, amp, {ratio: 1, index: 0.55, decay: 1.3, pan, send: 0.45});
const warm = (m, t, amp = 0.04, pan = 0) => mus.pluck(m, t, amp, {ratio: 2, index: 1.1, decay: 0.9, pan, send: 0.35});
const paper = (t, amp = 0.03) => fx.hat(t, amp, true, -0.15);
const tap = (t, amp = 0.05) => fx.pluck(80, t, amp, {ratio: 2.76, index: 0.7, decay: 0.05, send: 0.1});
// Motivo: uma nota por palavra, em arpejo de Ré maior com nona.
const MOTIF = [74, 76, 78, 81, 78, 76, 74, 81, 83, 81, 78, 76, 74, 71, 69, 74];
const note = (i) => MOTIF[i % MOTIF.length];

// Ato 1: o original é escrito, palavra a palavra.
mus.pad([50, 57, 62, 66], at(0), at(M.marca - 0.5), 0.016, 600, {attack: 2.5, release: 0.5});
for (let i = 0; i < N; i++) {
	felt(note(i), at(wordBeat(i)), 0.045, -0.2);
	tap(at(wordBeat(i)) - 0.01, 0.02);
}
// A cópia: o mesmo motivo, comprimido, do outro lado do estéreo.
for (let i = 0; i < N; i++) felt(note(i), at(copyBeat(i)), 0.04, 0.3);
paper(at(M.copia) - 0.05, 0.05);
// Silêncio curto e a virada: o marca-texto passa nas duas linhas.
fx.whoosh(at(M.marca) + 0.35, 0.7, 0.12, false);
fx.hat(at(M.marca), 0.05, true, -0.4);
fx.hat(at(M.marca) + 0.02, 0.05, true, 0.4);
fx.impact(at(M.marca), 0.45);
mus.kick(at(M.marca), 0.7);
mus.pad([38, 50, 57, 62, 66, 69], at(M.marca), at(M.revela - M.marca), 0.028, 1500, {attack: 0.02, release: 0.6});
warm(81, at(M.titulo), 0.05);
warm(86, at(M.titulo + 0.5), 0.05);

// Ato 2: a música entra junto da revelação.
mus.riser(at(M.revela - 1), at(M.revela) - 0.03, 0.08);
fx.whoosh(at(M.revela) - 0.1, 0.9, 0.16, true);
const CH = [
	{r: 26, pad: [62, 66, 69, 76]},
	{r: 23, pad: [59, 62, 66, 73]},
	{r: 31, pad: [59, 62, 67, 74]},
	{r: 33, pad: [61, 64, 69, 76]},
];
for (let bt = M.revela; bt < M.fecho - 0.5; bt += 0.5) {
	const c = CH[Math.floor((bt - M.revela) / 4) % 4];
	const k = bt - M.revela;
	if (k % 4 === 0) mus.pad(c.pad, at(bt), at(4), 0.02, 1400, {attack: 0.4, release: 1});
	if (k % 1 === 0) mus.kick(at(bt), k % 2 === 0 ? 0.42 : 0.26);
	fx.hat(at(bt + 0.25), 0.016, false, k % 1 ? 0.3 : -0.3);
	if (k % 1 === 0) mus.bass(c.r + 12, at(bt), at(0.8), 0.1);
	warm(c.pad[(k * 2) % 4] + 12, at(bt), 0.022, ((k * 2) % 3) * 0.3 - 0.3);
}
// Grãos ligando um atendimento ao outro.
for (let i = 0; i < 14; i++) mus.pluck([86, 88, 90, 93][i % 4], at(M.liga + 0.4 + i * 0.22), 0.018, {ratio: 7.01, index: 0.5, decay: 1, pan: -0.5 + (i / 14), send: 0.8});

// Ato 3: corte seco, clique no foco, a peça sobe e conta até 100.
tap(at(M.prova), 0.08);
fx.hat(at(M.foco), 0.12, false, 0.1);
tap(at(M.foco), 0.06);
fx.whoosh(at(M.peca) - 0.05, 0.4, 0.08, true);
warm(78, at(M.peca), 0.05);
for (let i = 0; i < 20; i++) fx.hat(at(M.peca) + 0.27 + i * 0.043, 0.012 + i * 0.001, false, i % 2 ? 0.2 : -0.2);
warm(86, at(M.peca) + 1.15, 0.06);

// Fecho: recua, frase, logo com a assinatura (as duas primeiras notas do motivo).
mus.riser(at(M.fecho), at(M.logo) - 0.03, 0.08);
mus.pad([50, 57, 62, 66, 69], at(M.fecho), at(M.logo - M.fecho), 0.02, 900, {attack: 0.8, release: 0.4});
fx.impact(at(M.logo), 0.6);
felt(74, at(M.logo), 0.12, -0.15);
felt(81, at(M.logo + 0.5), 0.13, 0.15);
mus.pluck(26, at(M.logo), 0.2, {ratio: 1, index: 0.5, decay: 3.5, send: 0.4});
mus.pad([50, 62, 66, 69, 74, 76], at(M.logo), END - at(M.logo), 0.035, 2200, {attack: 0.05, release: 2.2});

mkdirSync(resolve(root, 'public/prova-direcao'), {recursive: true});
mixAndWrite({
	mus,
	fx,
	end: END,
	out: resolve(root, 'public/prova-direcao/trilha.wav'),
	musicDb: [[0, -1], [at(M.marca - 0.6), -1], [at(M.marca - 0.3), -12], [at(M.marca), 0], [at(M.revela), 0], [at(M.fecho), -2], [at(M.logo), 1], [END, -2]],
	musicLp: [[0, 4000], [at(M.revela) - 0.1, 5000], [at(M.revela), 16000], [at(M.fecho), 7000], [at(M.logo), 16000], [END, 16000]],
});
