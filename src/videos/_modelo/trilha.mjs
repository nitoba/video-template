// Trilha de __TITULO__ (sintetizada, sem amostras de terceiros), composta sobre os marcos de timeline.json.
// Rode: bun run trilha __SLUG__   (o render também roda antes de começar). Com narração, o `bun run narrar` abaixa a
// trilha por baixo de cada fala. Guia, seção 7: curva de energia, um tema curto, um silêncio, som antes da imagem e
// foley nos gestos (clique, peça).
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mixAndWrite} from '../../../scripts/lib/mix.mjs';
import {createSynth} from '../../../scripts/lib/synth.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const slug = '__SLUG__';
const tl = JSON.parse(readFileSync(resolve(here, 'timeline.json'), 'utf8'));
const M = tl.marks;
const B = 60 / tl.bpm;
const at = (beat) => beat * B;
const END = tl.scenes.reduce((a, s) => a + s.duration, 0) / tl.fps;
const mus = createSynth(END + 3, 510);
const fx = createSynth(END + 3, 520);

// Ré maior com nonas. Troque o tom e o motivo por vídeo.
const MOTIF = [74, 76, 78, 81, 78, 76, 74, 81];
const CH = [
	{r: 26, pad: [62, 66, 69, 76]},
	{r: 23, pad: [59, 62, 66, 73]},
	{r: 31, pad: [59, 62, 67, 74]},
	{r: 33, pad: [61, 64, 69, 76]},
];
const felt = (m, t, amp = 0.05, pan = 0) => mus.pluck(m, t, amp, {ratio: 1, index: 0.55, decay: 1.4, pan, send: 0.45});
const warm = (m, t, amp = 0.035, pan = 0) => mus.pluck(m, t, amp, {ratio: 2, index: 1.1, decay: 0.9, pan, send: 0.35});
const glass = (m, t, amp = 0.025, pan = 0) => mus.pluck(m, t, amp, {ratio: 7.01, index: 0.5, decay: 1.1, pan, send: 0.8});
const click = (t) => {
	fx.hat(t, 0.09, false, 0.1);
	fx.pluck(80, t, 0.05, {ratio: 2.76, index: 0.7, decay: 0.05, send: 0.1});
};
const bed = (a, b, {kick = 0, pulse = 0.018, pad = 0.016, hats = 0} = {}) => {
	for (let bt = Math.ceil(a); bt < b; bt++) {
		const c = CH[Math.floor(bt / 4) % 4];
		if (bt % 4 === 0 || bt === Math.ceil(a)) mus.pad(c.pad, at(bt), at(Math.min(4, b - bt)), pad, 1300, {attack: 0.6, release: 1.2});
		if (bt % 4 === 0) mus.bass(c.r + 12, at(bt), at(3.6), 0.07);
		if (pulse) warm(c.pad[(bt * 3) % 4] + 12, at(bt + 0.5), pulse, ((bt % 3) - 1) * 0.3);
		if (kick && bt % 2 === 0) mus.kick(at(bt), kick);
		if (hats) fx.hat(at(bt + 0.5), hats, false, bt % 2 ? 0.3 : -0.3);
	}
};

// Gancho: o motivo no piano, a pergunta no silêncio.
mus.pad([50, 57, 62, 66], 0, at(M.titulo), 0.016, 700, {attack: 2.5, release: 0.6});
MOTIF.forEach((m, i) => felt(m, at(M.numero + i * 0.5), 0.045, -0.2 + (i % 2) * 0.4));
glass(86, at(M.pergunta), 0.03);
mus.riser(at(M.titulo - 1.5), at(M.titulo) - 0.03, 0.1);
// Título.
fx.impact(at(M.titulo), 0.6);
mus.kick(at(M.titulo), 0.8);
felt(74, at(M.titulo) + 0.1, 0.09);
felt(81, at(M.titulo) + 0.6, 0.09);
mus.pad([50, 62, 66, 69, 74, 76], at(M.titulo), at(M.app - M.titulo), 0.024, 2200, {attack: 0.05, release: 1.2});
// No app: base com pulso, clique e peça.
fx.whoosh(at(M.app) - 0.1, 0.9, 0.12, true);
bed(M.app, M.fecho, {kick: 0.32, pulse: 0.016, hats: 0.012});
click(at(M.clique));
fx.whoosh(at(M.peca) - 0.05, 0.4, 0.08, true);
warm(78, at(M.peca), 0.045);
warm(83, at(M.peca) + 0.25, 0.04);
// Fecho: recua e assina com as duas primeiras notas do motivo.
mus.riser(at(M.fecho), at(M.logo) - 0.03, 0.1);
mus.pad([50, 57, 62, 66, 69], at(M.fecho), at(M.logo - M.fecho), 0.02, 1000, {attack: 0.6, release: 0.5});
fx.impact(at(M.logo), 0.6);
felt(74, at(M.logo), 0.12, -0.15);
felt(81, at(M.logo) + 0.5, 0.13, 0.15);
mus.pluck(26, at(M.logo), 0.2, {ratio: 1, index: 0.5, decay: 3.5, send: 0.4});
mus.pad([50, 62, 66, 69, 74, 76], at(M.logo), END - at(M.logo), 0.035, 2200, {attack: 0.05, release: 2.2});

mkdirSync(resolve(root, 'public', slug), {recursive: true});
mixAndWrite({
	mus,
	fx,
	end: END,
	out: resolve(root, 'public', slug, 'trilha.wav'),
	musicDb: [[0, -2], [at(M.titulo), 0], [at(M.logo), 1], [END, -2]],
	musicLp: [[0, 3000], [at(M.titulo) - 0.1, 4000], [at(M.titulo), 16000], [END, 16000]],
});
