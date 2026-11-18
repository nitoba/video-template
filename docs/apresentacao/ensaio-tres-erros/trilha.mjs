// Trilha de "3 erros ao criar vídeo com IA" (sintetizada, 90 BPM, Lá menor com sétima → Dó). Quase sempre vai ser
// vista sem som: a música só reforça. Curva: capa só com pad e pluck; o erro 1 traz a bateria leve; a bagunça é
// percussiva (cada peça um toc, sem tom); o briefing põe as peças no lugar com notas que sobem e resolvem.
// Rode: bun run trilha tres-erros
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mixAndWrite} from '../../../scripts/lib/mix.mjs';
import {createSynth} from '../../../scripts/lib/synth.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const slug = 'tres-erros';
const tl = JSON.parse(readFileSync(resolve(here, 'timeline.json'), 'utf8'));
const M = tl.marks;
const B = 60 / tl.bpm;
const at = (beat) => beat * B;
const F = 1 / tl.fps;
const END = tl.scenes.reduce((a, s) => a + s.duration, 0) / tl.fps;
const mus = createSynth(END + 3, 3101);
const fx = createSynth(END + 3, 3102);

const felt = (m, t, amp = 0.06, pan = 0) => mus.pluck(m, t, amp, {ratio: 1, index: 0.55, decay: 1.3, pan, send: 0.45});
const warm = (m, t, amp = 0.035, pan = 0) => mus.pluck(m, t, amp, {ratio: 2, index: 1.1, decay: 0.8, pan, send: 0.3});
// Foley: tecla (curta, aguda), toc de madeira (grave, seco), estalo da etiqueta.
const tecla = (t, amp = 0.025) => fx.pluck(96, t, amp, {ratio: 3.1, index: 0.5, decay: 0.025, send: 0.05});
const toc = (t, amp = 0.07, pan = 0) => fx.pluck(55, t, amp, {ratio: 2.76, index: 1.4, decay: 0.07, pan, send: 0.12});

// Capa (0 → erro1): Lám7 em pad, o cursor pisca em tique leve.
mus.pad([57, 64, 67, 72], at(0), at(M.erro1 + 0.5), 0.017, 900, {attack: 0.05, release: 1.2});
mus.bass(45, at(0), at(3.4), 0.05);
felt(76, at(0), 0.07);
felt(79, at(0.75), 0.05, 0.2);
felt(84, at(1.5), 0.05, -0.2);
for (let k = 0; k * 14 * F < at(M.digita); k += 2) fx.hat(k * 14 * F, 0.012, false, 0.3);
// O 3 vira contador e o quadro cresce: um sopro curto, sem impacto.
fx.whoosh(at(M.sai) + 0.35, 0.6, 0.08, true);

// Erro 1: groove leve entra. Fá maj7 (a mesma cor, mais incerta).
mus.pad([53, 60, 64, 69], at(M.erro1), at(M.risca - M.erro1), 0.015, 1100, {attack: 0.3, release: 0.6});
mus.bass(41, at(M.erro1), at(2), 0.06);
for (let bt = M.erro1; bt < M.erro2; bt += 1) {
	mus.kick(at(bt), 0.32);
	mus.hat(at(bt + 0.5), 0.03);
}
// Digitação: uma tecla por letra.
const pedido = 'faz um vídeo top';
for (let i = 0; i < pedido.length; i++) if (pedido[i] !== ' ') tecla(at(M.digita) + ((i + 0.5) / pedido.length) * 22 * F, 0.022 + (i % 3) * 0.004);
// Enter: tecla mais pesada.
toc(at(M.cai) - 3 * F, 0.05);
// A bagunça: cada peça que pousa é um toc sem tom (9 peças, alternando o lado).
for (let i = 0; i < 9; i++) toc(at(M.cai) + (8 + i * 2) * F, 0.045 + (i % 2) * 0.02, (i % 3) - 1);
// O risco: um traço de caneta.
fx.whoosh(at(M.risca) + 0.12, 0.28, 0.05, false);
// Correção: Dó maior entra junto com as palavras laranja.
mus.pad([48, 55, 60, 64, 67], at(M.corrige), at(M.erro2 - M.corrige + 0.5), 0.018, 1600, {attack: 0.15, release: 1});
mus.bass(36, at(M.corrige), at(2.5), 0.07);
// Etiquetas: três estalos que sobem.
[72, 76, 79].forEach((m, i) => {
	toc(at(M.etiquetas) + (i * 6 + 9) * F, 0.04);
	warm(m, at(M.etiquetas) + (i * 6 + 9) * F, 0.03, (i - 1) * 0.3);
});
// Arrumação: cada peça útil que vai ao lugar toca uma nota do arpejo de Dó, e resolve no Dó agudo.
[60, 64, 67, 72, 76, 79].forEach((m, i) => felt(m + 12, at(M.arruma) + (i * 2 + 8) * F, 0.045, (i % 2 ? 0.25 : -0.25)));
felt(84, at(M.arruma) + 0.75, 0.06);
// Saída para o erro 2.
fx.whoosh(at(M.erro2) + 0.25, 0.5, 0.08, true);

mkdirSync(resolve(root, 'public', slug), {recursive: true});
mixAndWrite({mus, fx, end: END, out: resolve(root, 'public', slug, 'trilha.wav'), musicDb: [[0, -3], [END, -3]], musicLp: [[0, 5000], [at(M.erro1), 9000], [END, 9000]]});
