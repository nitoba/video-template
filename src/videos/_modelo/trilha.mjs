// Trilha de __TITULO__ (sintetizada, sem amostras de terceiros), composta sobre os marcos de timeline.json.
// Rode: bun run trilha __SLUG__   (o render também roda antes de começar).
// Guia, seção 7: curva de energia por atos, um tema curto, um único silêncio, som antes da imagem (J-cut) e
// efeitos de interface baixos.
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
const BEAT = 60 / tl.bpm;
const BAR = 4 * BEAT;
const at = (beat) => beat * BEAT;
const END = tl.scenes.reduce((a, s) => a + s.duration, 0) / tl.fps;
const mus = createSynth(END + 3, 510);
const fx = createSynth(END + 3, 520);

// Ré maior com nonas. Troque o tom e o tema por vídeo.
const CHORDS = [
	{root: 26, pad: [62, 66, 69, 73, 76]},
	{root: 23, pad: [59, 62, 66, 69, 73]},
	{root: 31, pad: [55, 59, 62, 66, 69]},
	{root: 33, pad: [57, 61, 64, 66, 71]},
];
const THEME = [74, 78, 81, 86];
const chordAt = (beat) => CHORDS[Math.floor(beat / 4) % 4];
const glass = (m, beat, amp = 0.03, pan = 0) => mus.pluck(m, at(beat), amp, {ratio: 7.01, index: 0.45, decay: 1.6, pan, send: 0.8});
const click = (beat) => {
	fx.hat(at(beat), 0.12, false, 0.15);
	fx.pluck(93, at(beat), 0.024, {ratio: 1, index: 0.3, decay: 0.06, send: 0.1});
};
const groove = (from, to, {kick = 0.44, hat = 0.03, clap = 0, bass = 0.12, pad = 0.024, cut = 1400} = {}) => {
	for (let beat = Math.ceil(from); beat < to; beat++) {
		const c = chordAt(beat);
		if (beat % 4 === 0 || beat === Math.ceil(from)) mus.pad(c.pad, at(beat), Math.min(BAR, at(to - beat)), pad, cut, {attack: 0.2, release: 0.6});
		if (kick && beat % 2 === 0) mus.kick(at(beat), kick);
		if (clap && beat % 4 === 3) mus.clap(at(beat), clap);
		if (hat) mus.hat(at(beat + 0.5), hat, false, 0.25);
		if (bass && beat % 4 === 0) mus.bass(c.root + 12, at(beat), Math.min(BAR * 0.85, at(to - beat)), bass);
	}
};

// Gancho: pad grave, ping e contagem do odômetro.
mus.pad([46, 49, 53, 56], at(0), at(M.virada), 0.03, 500, {attack: 2.2, release: 0.3});
glass(THEME[0], M.gancho, 0.06);
for (let i = 0; i < 30; i++) fx.hat(at(M.numero) + at(3.2) * (i / 30) ** 0.8, 0.012 + i * 0.0012, false, i % 2 ? 0.3 : -0.3);
mus.riser(at(M.virada - 1.5), at(M.virada) - 0.02, 0.16);
// Virada e título.
fx.impact(at(M.virada), 0.6);
groove(M.virada, M.titulo, {kick: 0.7, hat: 0.05, clap: 0.08, bass: 0.15, pad: 0.03, cut: 2200});
fx.whoosh(at(M.titulo - 0.4), 1, 0.2, true);
fx.impact(at(M.titulo), 0.8);
mus.pad([50, 62, 66, 69, 73, 76], at(M.titulo), at(M.app - M.titulo), 0.034, 2200, {attack: 0.05, release: 1});
mus.sparkle(at(M.titulo) + 0.05, THEME, 0.08, 0.05);
// No app.
fx.whoosh(at(M.app - 0.4), 0.9, 0.18, true);
groove(M.app, M.final, {kick: 0.44, hat: 0.03, clap: 0.05, bass: 0.13, cut: 1700});
click(M.clique);
THEME.forEach((m, i) => glass(m, M.resultado + i * 0.33, 0.04, -0.3 + i * 0.2));
// Marca.
mus.pad([50, 57, 62, 69, 74], at(M.final), at(4), 0.03, 1000, {attack: 1.2, release: 0.6});
mus.riser(at(M.final + 1), at(M.logo) - 0.03, 0.2);
fx.impact(at(M.logo), 1);
mus.pluck(26, at(M.logo), 0.24, {ratio: 1, index: 0.5, decay: 4, send: 0.4});
mus.pad([50, 62, 69, 73, 76, 81, 86], at(M.logo), END - at(M.logo), 0.05, 2600, {attack: 0.03, release: 2.5, bright: 1});
mus.sparkle(at(M.logo) + 0.05, [...THEME, 90], 0.07, 0.04);

mkdirSync(resolve(root, 'public', slug), {recursive: true});
mixAndWrite({
	mus,
	fx,
	end: END,
	out: resolve(root, 'public', slug, 'trilha.wav'),
	musicDb: [[0, -3], [at(M.virada), 0], [at(M.app), -1], [at(M.logo), 1], [END, -3]],
	musicLp: [[0, 800], [at(M.virada), 16000], [END, 16000]],
});
