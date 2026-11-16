#!/usr/bin/env node
// Lottie exportado do LottieFiles Creator com texto embute os glifos (`chars`) e o lottie-web quebra no render
// ("Cannot read properties of undefined (reading 'push')"). Remove `chars` e troca a fonte por uma do sistema.
// Uso: bun run lottie-limpar public/<slug>/lottie/arquivo.json [Fonte]
import {readFileSync, writeFileSync} from 'node:fs';

const [file, fonte = 'Rubik'] = process.argv.slice(2);
if (!file) throw new Error('Uso: bun run lottie-limpar <arquivo.json> [Fonte]');
const j = JSON.parse(readFileSync(file, 'utf8'));
const tinha = 'chars' in j;
delete j.chars;
const antigas = new Set((j.fonts?.list ?? []).map((f) => f.fName));
if (j.fonts?.list?.length) j.fonts = {list: [{fName: fonte, fFamily: fonte, fStyle: 'Regular', ascent: 75, origin: 0}]};
const fix = (o) => {
	if (Array.isArray(o)) o.forEach(fix);
	else if (o && typeof o === 'object') {
		if (typeof o.f === 'string' && antigas.has(o.f)) o.f = fonte;
		for (const k in o) fix(o[k]);
	}
};
fix(j.layers);
writeFileSync(file, JSON.stringify(j));
console.log(`${file}: ${tinha ? 'glifos removidos' : 'sem glifos'}, fonte ${fonte}`);
