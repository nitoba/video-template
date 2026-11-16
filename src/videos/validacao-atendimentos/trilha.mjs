// Trilha da Validação de atendimentos (versão narrada, 78 BPM, Ré maior): piano abafado e plucks quentes sob a voz,
// com acentos nos marcos. O `bun run narrar` abaixa a trilha por baixo de cada fala.
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
const copyBeat = (i) => M.copiaChega + (i * tl.copiaDur) / (N - 1);
const mus = createSynth(END + 3, 1301);
const fx = createSynth(END + 3, 1302);

const felt = (m, t, amp = 0.05, pan = 0) => mus.pluck(m, t, amp, {ratio: 1, index: 0.55, decay: 1.4, pan, send: 0.45});
const warm = (m, t, amp = 0.035, pan = 0) => mus.pluck(m, t, amp, {ratio: 2, index: 1.1, decay: 0.9, pan, send: 0.35});
const glass = (m, t, amp = 0.025, pan = 0) => mus.pluck(m, t, amp, {ratio: 7.01, index: 0.5, decay: 1.1, pan, send: 0.8});
const click = (t) => {
	fx.hat(t, 0.09, false, 0.1);
	fx.pluck(80, t, 0.05, {ratio: 2.76, index: 0.7, decay: 0.05, send: 0.1});
};
const MOTIF = [74, 76, 78, 81, 78, 76, 74, 81, 83, 81, 78, 76, 74, 71, 69, 74];
const CH = [
	{r: 26, pad: [62, 66, 69, 76]},
	{r: 23, pad: [59, 62, 66, 73]},
	{r: 31, pad: [59, 62, 67, 74]},
	{r: 33, pad: [61, 64, 69, 76]},
];
const MIN = [
	{r: 23, pad: [59, 62, 66, 71]},
	{r: 19, pad: [55, 59, 62, 67]},
	{r: 26, pad: [57, 62, 66, 69]},
	{r: 21, pad: [57, 61, 64, 69]},
];
/** Base por tempos [a, b): pad a cada compasso, baixo, pulsos de pluck e, se `kick`, bumbo leve. */
const bed = (a, b, {chords = CH, kick = 0, pulse = 0.018, pad = 0.016, hats = 0} = {}) => {
	for (let bt = Math.ceil(a); bt < b; bt++) {
		const k = Math.floor(bt / 4);
		const c = chords[k % 4];
		if (bt % 4 === 0 || bt === Math.ceil(a)) mus.pad(c.pad, at(bt), at(Math.min(4, b - bt)), pad, 1300, {attack: 0.6, release: 1.2});
		if (bt % 4 === 0) mus.bass(c.r + 12, at(bt), at(3.6), 0.07);
		if (pulse) warm(c.pad[(bt * 3) % 4] + 12, at(bt + 0.5), pulse, ((bt % 3) - 1) * 0.3);
		if (kick && bt % 2 === 0) mus.kick(at(bt), kick);
		if (hats) fx.hat(at(bt + 0.5), hats, false, bt % 2 ? 0.3 : -0.3);
	}
};

// 1–2. O problema: grade de atendimentos, zip, o RAT do William.
mus.pad([50, 57, 62, 66], 0, at(M.rat), 0.016, 700, {attack: 3, release: 1});
for (let i = 0; i < 8; i++) glass([86, 88, 90, 93][i % 4], at(M.numero) + i * 0.18, 0.012, -0.5 + i * 0.14);
fx.whoosh(at(M.zip) + 0.6, 1.6, 0.12, false);
bed(M.rat, M.titulo, {chords: MIN, pulse: 0.012, pad: 0.018});
fx.impact(at(M.volta) + 0.15, 0.45);
mus.riser(at(M.agora) + 0.4, at(M.titulo) - 0.05, 0.1);
// 3. Título.
fx.impact(at(M.titulo), 0.7);
mus.kick(at(M.titulo), 0.8);
felt(74, at(M.titulo) + 0.1, 0.09);
felt(81, at(M.titulo) + 0.6, 0.09);
mus.pad([50, 62, 66, 69, 74, 76], at(M.titulo), at(M.sync - M.titulo), 0.026, 2200, {attack: 0.05, release: 1.4});
// 4–7. Como funciona e o dia a dia do gestor: base com pulso leve.
bed(M.sync, M.copia, {kick: 0.32, pulse: 0.016, hats: 0.012});
[M.zonaContrato, M.zonaAssin, M.zonaTexto].forEach((m, i) => glass([81, 85, 88][i], at(m), 0.025));
for (let i = 0; i < 7; i++) warm([74, 76, 78, 81, 83, 86, 88][i], at(M.sete) + i * 0.16 * (30 / 23) * B, 0.025, -0.45 + i * 0.15);
fx.impact(at(M.alerta), 0.3);
click(at(M.clique) + 0.7);
fx.whoosh(at(M.lista) - 0.2, 0.8, 0.1, true);
warm(78, at(M.contratoPeca), 0.04);
warm(83, at(M.contratoPeca) + 0.25, 0.035);
// 8. A cópia: o original toca o motivo palavra a palavra, a cópia repete o mesmo motivo, mais rápido.
mus.pad([50, 57, 62, 66], at(M.copia), at(M.lado - M.copia), 0.014, 700, {attack: 1, release: 0.4});
for (let i = 0; i < N; i++) felt(MOTIF[i % 16], at(wordBeat(i)), 0.04, -0.2);
for (let i = 0; i < N; i++) felt(MOTIF[i % 16], at(copyBeat(i)), 0.035, 0.3);
fx.impact(at(M.copiaMarca), 0.35);
fx.whoosh(at(M.lado) - 0.1, 0.9, 0.12, true);
bed(M.lado, M.cms, {kick: 0.3, pulse: 0.016, hats: 0.012});
for (let i = 0; i < 14; i++) glass([86, 88, 90, 93][i % 4], at(M.liga) + 0.3 + i * 0.2, 0.014, -0.5 + i / 14);
click(at(M.dispClick));
click(at(M.dispOk) - 0.25);
click(at(M.revClick));
warm(86, at(M.revOk), 0.04);
for (let i = 0; i < 12; i++) glass([86, 88, 90, 93][i % 4], at(M.numeros) + 0.8 + i * 0.2, 0.012, -0.4 + i / 15);
// 9. CMS: mais leve, sem bumbo.
fx.whoosh(at(M.cms) - 0.2, 0.9, 0.1, false);
bed(M.cms, M.ciclo, {pulse: 0.014, pad: 0.014});
click(at(M.liberarClick));
warm(78, at(M.reguaPeca), 0.04);
warm(83, at(M.reguaPeca) + 0.25, 0.035);
click(at(M.ligarClick));
fx.impact(at(M.ligarClick) + 0.2, 0.3);
// 10. O ciclo cresce até o fecho.
bed(M.ciclo, M.final, {kick: 0.4, pulse: 0.02, hats: 0.016, pad: 0.02});
['cSync', 'cIa', 'cVerif', 'cAvisa', 'cDecide'].forEach((k, i) => warm([74, 78, 81, 83, 86][i], at(M[k]), 0.04));
mus.riser(at(M.final) - 2, at(M.final) - 0.05, 0.12);
// 11. Fecho e assinatura (as duas primeiras notas do motivo).
fx.impact(at(M.final), 0.6);
mus.pad([50, 57, 62, 66, 69], at(M.final), at(M.logo - M.final), 0.02, 1200, {attack: 0.3, release: 0.6});
fx.impact(at(M.logo), 0.6);
felt(74, at(M.logo), 0.12, -0.15);
felt(81, at(M.logo) + 0.5, 0.13, 0.15);
mus.pluck(26, at(M.logo), 0.2, {ratio: 1, index: 0.5, decay: 3.5, send: 0.4});
mus.pad([50, 62, 66, 69, 74, 76], at(M.logo), END - at(M.logo), 0.035, 2200, {attack: 0.05, release: 2.2});

mkdirSync(resolve(root, 'public/validacao-atendimentos'), {recursive: true});
mixAndWrite({
	mus,
	fx,
	end: END,
	out: resolve(root, 'public/validacao-atendimentos/trilha.wav'),
	musicDb: [[0, -2], [at(M.titulo), 0], [at(M.cms), -2], [at(M.ciclo), 0], [at(M.logo), 1], [END, -2]],
	musicLp: [[0, 3000], [at(M.titulo) - 0.1, 4000], [at(M.titulo), 16000], [at(M.copia), 6000], [at(M.lado), 16000], [END, 16000]],
});
