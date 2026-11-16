// Trilha do exemplo "Validação de atendimentos" (85,7 BPM, Ré maior com nonas), composta sobre os marcos de
// src/validacao/timeline.json. Toda sintetizada aqui, sem amostras de terceiros.
// - Tema: sete notas subindo, uma por verificação. Nos selos cada uma toca a sua; as que dão alerta respondem com a
//   segunda menor grave. No fim o tema sobe e resolve no Ré agudo, junto da marca.
// - Curva: contagem tensa no número, groove leve na exportação, tensão sem bumbo no RAT sem assinatura, o único
//   silêncio no carimbo, drop na virada, arpejo na leitura da IA, teclas enquanto o gestor trabalha, azul no CMS.
// - Efeitos de interface baixos e só onde contam: cliques, digitação, confirmações.
// - Mix em dois barramentos, filtro automatizado na música, -14 LUFS e -2 dBTP com loudnorm em duas passadas.
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mixAndWrite} from '../../../scripts/lib/mix.mjs';
import {createSynth} from '../../../scripts/lib/synth.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const tl = JSON.parse(readFileSync(resolve(here, 'timeline.json'), 'utf8'));
const M = tl.marks;
const BEAT = 60 / tl.bpm;
const BAR = 4 * BEAT;
const at = (beat) => beat * BEAT;
const END = tl.scenes[0].duration / tl.fps;
const mus = createSynth(END + 3, 410);
const fx = createSynth(END + 3, 420);

const CHORDS = [
	{root: 26, pad: [62, 66, 69, 73, 76]},
	{root: 23, pad: [59, 62, 66, 69, 73]},
	{root: 31, pad: [55, 59, 62, 66, 69]},
	{root: 33, pad: [57, 61, 64, 66, 71]},
];
const DARK = {root: 22, pad: [58, 61, 65, 68]};
const chordAt = (beat) => CHORDS[Math.floor(beat / 4) % 4];
const glass = (m, beat, amp = 0.03, pan = 0) => mus.pluck(m, at(beat), amp, {ratio: 7.01, index: 0.45, decay: 1.6, pan, send: 0.8});
const keys = (m, beat, amp = 0.03, pan = 0, decay = 0.9) => mus.pluck(m, at(beat), amp, {ratio: 1, index: 0.9, decay, pan, send: 0.55});
const click = (beat, amp = 1) => {
	fx.hat(at(beat), 0.12 * amp, false, 0.15);
	fx.pluck(93, at(beat), 0.024 * amp, {ratio: 1, index: 0.3, decay: 0.06, send: 0.1});
};
const pop = (beat, m = 81, amp = 0.035, pan = 0) => fx.pluck(m, at(beat), amp, {ratio: 2, index: 1.8, decay: 0.14, pan, send: 0.3});
const ok = (beat, amp = 0.05) => {
	glass(74, beat, amp, -0.15);
	glass(78, beat + 0.33, amp * 1.1, 0.15);
	glass(86, beat + 0.66, amp * 0.8, 0);
};
const THEME = [74, 76, 78, 81, 83, 85, 86];
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
const arp = (from, to, amp = 0.016, step = 0.25) => {
	for (let k = 0; from + k * step < to; k++) keys(chordAt(from + k * step).pad[k % 5] + 12, from + k * step, amp, k % 2 ? 0.4 : -0.4, 0.22);
};

// ---------------- O número ----------------
mus.pad(DARK.pad.map((m) => m - 12), at(0), at(M.zip), 0.03, 500, {attack: 2.2, release: 0.3});
glass(THEME[0], M.ping, 0.06);
for (let i = 0; i < 30; i++) fx.hat(at(M.count) + at(3.2) * (i / 30) ** 0.8, 0.012 + i * 0.0012, false, i % 2 ? 0.3 : -0.3);
fx.impact(at(M.none), 0.55);
fx.pluck(37, at(M.none), 0.13, {ratio: 1.41, index: 4, decay: 1.2, send: 0.5});
mus.riser(at(M.none + 0.4), at(M.zip) - 0.02, 0.14);

// ---------------- Exportação e o RAT ----------------
fx.whoosh(at(M.zip + 0.1), 0.9, 0.18, true);
pop(M.zip + 0.25, 81, 0.04);
groove(M.zip, M.red, {kick: 0.4, hat: 0.03, bass: 0.11});
arp(M.pile, M.red, 0.014);
fx.whoosh(at(M.pile - 0.2), 1.1, 0.2, true);
fx.impact(at(M.red), 0.35);
for (const [k, a] of [[0, 0.07], [1, 0.045], [2, 0.03]]) fx.pluck(THEME[0] - 12, at(M.red + 0.1 + k), a, {ratio: 1.41, index: 3, decay: 1.1, send: 0.9});
mus.riser(at(M.zoomRat), at(M.empty) - 0.02, 0.16);
fx.whoosh(at(M.empty - 0.5), 1.2, 0.22, true);
fx.impact(at(M.empty), 0.45);
// Tensão: sem bumbo, pulso grave e segunda menor.
for (let beat = M.empty; beat < M.silence - 0.5; beat += 1) mus.bass(DARK.root + 12, at(beat), BEAT * 0.45, beat % 2 ? 0.08 : 0.13);
mus.pad(DARK.pad, at(M.empty), at(M.silence - M.empty) - 0.03, 0.026, 900, {attack: 0.3, release: 0.02});
for (const beat of [M.empty + 1, M.empty + 3]) {
	glass(74, beat, 0.03, -0.2);
	glass(75, beat + 0.5, 0.025, 0.2);
}
// O único silêncio: o carimbo.
fx.impact(at(M.silence) + 0.13, 0.7);
fx.pluck(35, at(M.silence) + 0.13, 0.12, {ratio: 1, index: 2.5, decay: 1.4, send: 0.6});
mus.riser(at(M.turn - 1.2), at(M.turn) - 0.02, 0.14);

// ---------------- Virada e título ----------------
fx.impact(at(M.turn), 0.7);
groove(M.turn, M.title, {kick: 0.78, hat: 0.06, clap: 0.1, bass: 0.17, pad: 0.032, cut: 2400});
arp(M.turn, M.title, 0.018);
mus.riser(at(M.title - 1), at(M.title) - 0.02, 0.2);
fx.whoosh(at(M.title - 0.4), 1.1, 0.22, true);
fx.impact(at(M.title), 0.8);
mus.pad([50, 62, 66, 69, 73, 76], at(M.title), at(M.sync - M.title), 0.036, 2200, {attack: 0.05, release: 1});
mus.sparkle(at(M.title) + 0.05, [74, 78, 81, 86], 0.08, 0.05);

// ---------------- Sincronização e leitura ----------------
groove(M.sync, M.read, {kick: 0.4, hat: 0.03, bass: 0.11});
click(M.sync + 0.55);
for (let i = 0; i < 3; i++) {
	fx.whoosh(at(M.sync + 0.9 + i * 0.31), 0.5, 0.06, true);
	pop(M.sync + 2.4 + i * 0.31, THEME[i * 2], 0.03, 0.4);
}
groove(M.read, M.checks, {kick: 0.46, hat: 0.035, bass: 0.12, cut: 1800});
arp(M.read + 0.5, M.checks, 0.017);
mus.sparkle(at(M.read) + 0.05, [81, 86, 90], 0.08, 0.035);
glass(THEME[1], M.contrato, 0.05, -0.3);
fx.pluck(62, at(M.contrato + 1.6), 0.05, {ratio: 1.41, index: 3, decay: 0.6, send: 0.5});
fx.pluck(63, at(M.contrato + 1.62), 0.04, {ratio: 1.41, index: 3, decay: 0.6, send: 0.5});
glass(THEME[2], M.assin, 0.05, 0.3);
glass(THEME[3], M.compare, 0.05, 0);
ok(M.compare + 3.6, 0.045);
glass(THEME[4], M.texto, 0.05, -0.2);

// ---------------- As sete verificações ----------------
groove(M.checks, M.clock7, {kick: 0.5, hat: 0.04, clap: 0.06, bass: 0.14, cut: 2000});
THEME.forEach((m, i) => mus.pluck(m, at(M.checks + 0.6 + i * 0.35) - 0.02, 0.07, {ratio: 3.5, index: 1.2, decay: 1.4, pan: -0.6 + i * 0.2, send: 0.8}));
for (const i of [1, 4, 5]) {
	fx.pluck(THEME[i] - 23, at(M.alerta) + at(i * 2 / 21), 0.08, {ratio: 1.41, index: 3, decay: 0.7, send: 0.5});
	pop(M.alerta + (i * 2) / 21, THEME[i] + 1, 0.025);
}

// ---------------- 07:00 ----------------
fx.whoosh(at(M.clock7 - 0.4), 0.8, 0.14, true);
for (const [d, m] of [[0, 86], [0.5, 81], [1, 78], [1.5, 74]]) glass(m, M.clock7 + d, 0.045, 0);
mus.pad([50, 62, 66, 69, 76], at(M.clock7), at(M.painel - M.clock7), 0.03, 1600, {attack: 0.6, release: 0.5});
fx.whoosh(at(M.clock7 + 0.6), 0.9, 0.12, true);
pop(M.clock7 + 2.6, 88, 0.05);
click(M.mailClick);
fx.whoosh(at(M.painel - 0.4), 0.9, 0.2, true);
fx.impact(at(M.painel) + 0.05, 0.42);

// ---------------- O gestor na tela ----------------
const HOOK = [[0, 74], [0.5, 78], [1, 81], [2, 86], [3, 81], [3.5, 83], [4, 81], [5, 78], [5.5, 76], [6, 74]];
const hook = (from, to, amp) => {
	for (let s = from; s < to; s += 8) for (const [d, m] of HOOK) if (s + d < to) keys(m, s + d, amp, 0.12, 0.5);
};
groove(M.painel, M.appEnd, {kick: 0.44, hat: 0.03, clap: 0.05, bass: 0.13, cut: 1700});
hook(M.painel + 1, M.numeros, 0.022);
const APP_CLICKS = [M.filtroAlta, M.row, M.compara, M.comparaFim - 0.2, M.dispensar, M.dispOk, M.revalidar, M.revOk, M.existentes + 1.2, M.porTec, M.porTec + 1.3, M.porTec + 2.3, M.validarOk];
APP_CLICKS.forEach((c) => click(c));
fx.whoosh(at(M.row + 0.2), 0.7, 0.1, true);
fx.whoosh(at(M.compara + 0.15), 0.8, 0.14, true);
for (let i = 0; i < 3; i++) glass([74, 78, 81][i], M.compara + 1.6 + i * 0.25, 0.03, -0.3 + i * 0.3);
fx.whoosh(at(M.comparaFim), 0.7, 0.1, false);
for (let k = 0; k < 72; k++) fx.hat(at(M.justType) + k * 0.052 + (k % 5 === 0 ? 0.02 : 0), 0.025, false, (k % 3) * 0.2 - 0.2);
ok(M.dispOk + 0.3, 0.05);
ok(M.revOk + 0.3, 0.035);
for (let k = 0; k < 10; k++) pop(M.previa + 0.2 + k * 0.08, 81 + (k % 4) * 2, 0.012);
ok(M.validarOk + 0.4, 0.05);
mus.riser(at(M.numeros - 0.8), at(M.numeros) - 0.02, 0.12);
fx.impact(at(M.numeros), 0.4);
mus.sparkle(at(M.numeros + 0.4), [74, 78, 81, 86], 0.4, 0.035);

// ---------------- Rima ----------------
fx.whoosh(at(M.rima - 0.3), 1, 0.18, false);
mus.pad([50, 57, 62, 66, 69, 76], at(M.rima), at(M.cms - M.rima), 0.032, 1500, {attack: 0.8, release: 0.6});
glass(74, M.rima + 1.2, 0.05, 0);
glass(86, M.rima + 1.5, 0.04, 0.2);
for (let beat = M.rima + 2; beat < M.cms - 1; beat += 2) mus.kick(at(beat), 0.3);

// ---------------- CMS ----------------
fx.whoosh(at(M.cms - 0.3), 1, 0.18, true);
fx.impact(at(M.cms), 0.35);
groove(M.cms, M.ciclo, {kick: 0.38, hat: 0.026, bass: 0.11, pad: 0.022, cut: 1500});
hook(M.cms + 4, M.ciclo, 0.018);
const CMS_CLICKS = [M.aba, M.liberar, M.verif, M.limiar, M.assRef, M.modal, M.dest - 0.4, M.ativar];
CMS_CLICKS.forEach((c) => click(c, 0.9));
ok(M.liberar + 0.5, 0.035);
THEME.forEach((m, i) => glass(m, M.verif + 0.3 + i * 0.1, 0.018, -0.5 + i * 0.16));
for (let i = 0; i < 3; i++) glass(THEME[3] + i * 2, M.modal + 0.5 + i * 0.2, 0.025, -0.3 + i * 0.3);
ok(M.ativar + 0.4, 0.06);

// ---------------- Ciclo e marca ----------------
groove(M.ciclo, M.final, {kick: 0.5, hat: 0.035, clap: 0.06, bass: 0.13, pad: 0.026, cut: 2200});
for (let i = 0; i < 6; i++) mus.pluck(THEME[i], at(M.ciclo + 0.4 + i * 0.4) - 0.02, 0.05, {ratio: 3.5, index: 1.2, decay: 1, pan: -0.4 + i * 0.16, send: 0.7});
mus.pad([50, 57, 62, 69, 74], at(M.final), at(4), 0.03, 1000, {attack: 1.2, release: 0.6});
mus.riser(at(M.final + 1), at(M.logo) - 0.03, 0.2);
THEME.forEach((m, i) => mus.pluck(m + 12, at(M.logo - 1.4 + i * 0.2), 0.035, {ratio: 3.5, index: 1.1, decay: 0.9, pan: -0.3 + i * 0.1, send: 0.6}));
fx.impact(at(M.logo), 1);
mus.pluck(98, at(M.logo), 0.08, {ratio: 3.5, index: 1.4, decay: 3, send: 0.8});
mus.pluck(26, at(M.logo), 0.24, {ratio: 1, index: 0.5, decay: 4, send: 0.4});
mus.pad([50, 62, 69, 73, 76, 81, 86], at(M.logo), END - at(M.logo), 0.05, 2600, {attack: 0.03, release: 2.5, bright: 1});
mus.sparkle(at(M.logo) + 0.05, [74, 78, 81, 86, 90], 0.07, 0.04);

// ---------------- Mix ----------------
const MUSIC_DB = [[0, -3], [at(M.zip), 0], [at(M.silence) - 0.05, 0], [at(M.silence) + 0.05, -40], [at(M.turn - 1.3), -40], [at(M.turn - 1.2), -1], [at(M.turn), 1], [at(M.sync), -1], [at(M.painel), 0], [at(M.numeros), -1], [at(M.cms), -1.5], [at(M.final), -1], [at(M.logo), 1], [END, -3]];
const MUSIC_LP = [[0, 800], [at(M.none), 1500], [at(M.zip), 16000], [at(M.empty), 1200], [at(M.silence), 1200], [at(M.turn), 16000], [at(M.existentes), 16000], [at(M.existentes + 0.3), 1100], [at(M.existentes + 1.4), 16000], [END, 16000]];
mkdirSync(resolve(root, 'public/exemplo-validacao'), {recursive: true});
mixAndWrite({mus, fx, end: END, out: resolve(root, 'public/exemplo-validacao/trilha.wav'), musicDb: MUSIC_DB, musicLp: MUSIC_LP});
