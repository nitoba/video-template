#!/usr/bin/env node
// Cria um vídeo novo a partir de src/videos/_modelo e registra a composição.
// Uso: bun run novo <slug> --marca <agrotrace|pectrace> --titulo "Título do vídeo"
import {spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const opt = (k, d) => {
	const i = args.indexOf(`--${k}`);
	return i >= 0 ? args[i + 1] : d;
};
const marca = opt('marca', 'agrotrace');
const titulo = opt('titulo', slug ? slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) : '');
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
	console.error('Uso: bun run novo <slug-em-kebab-case> --marca agrotrace|pectrace --titulo "Título"');
	process.exit(1);
}
const marcas = readFileSync(resolve(root, 'src/brands/index.ts'), 'utf8');
if (!new RegExp(`\\b${marca}\\b`).test(marcas.match(/BRANDS = \{([^}]*)\}/)?.[1] ?? '')) {
	console.error(`Marca "${marca}" não existe em src/brands/index.ts.`);
	process.exit(1);
}
const dir = resolve(root, 'src/videos', slug);
if (existsSync(dir)) {
	console.error(`Já existe: src/videos/${slug}`);
	process.exit(1);
}

cpSync(resolve(root, 'src/videos/_modelo'), dir, {recursive: true});
for (const f of readdirSync(dir)) {
	const p = resolve(dir, f);
	writeFileSync(p, readFileSync(p, 'utf8').replaceAll('__SLUG__', slug).replaceAll('__TITULO__', titulo).replaceAll('__BRAND__', marca));
}
for (const sub of ['telas', 'lottie', 'voz/raw']) mkdirSync(resolve(root, 'public', slug, sub), {recursive: true});
// Tela ilustrativa: o modelo já monta as camadas sobre ela até chegar a captura real.
cpSync(resolve(root, 'public/_modelo/telas/ilustrativa.jpg'), resolve(root, 'public', slug, 'telas/ilustrativa.jpg'));

const ident = slug.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const UP = slug.toUpperCase().replace(/-/g, '_');
const reg = resolve(root, 'src/videos/index.ts');
let s = readFileSync(reg, 'utf8');
s = s.replace('// <imports>', `import {TOTAL as ${UP}_TOTAL} from './${slug}/story';\nimport {Video as ${ident}} from './${slug}/Video';\n// <imports>`);
s = s.replace('\t// <videos>', `\t{id: '${slug}', component: ${ident}, frames: ${UP}_TOTAL},\n\t// <videos>`);
writeFileSync(reg, s);

const r = spawnSync('node', [resolve(dir, 'trilha.mjs')], {stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`
Vídeo criado: src/videos/${slug} (marca ${marca}).
Próximos passos (siga a skill novo-video e docs/guia-de-producao.md):
  1. Preencha src/videos/${slug}/tratamento.md e aprove; faça a prova de 15–20 s e aprove.
  2. Detalhe roteiro.md (narração). Capturas reais em public/${slug}/telas/ (seção 4 do guia) e TELAS em story.ts.
  3. Marcos em timeline.json; narração em narracao.json; trilha em trilha.mjs.
  4. bun run dev  ·  bun run folha ${slug} 5 20 40  ·  bun run render ${slug}`);
