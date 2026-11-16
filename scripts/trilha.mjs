#!/usr/bin/env node
// Gera public/<slug>/trilha.wav rodando src/videos/<slug>/trilha.mjs. Uso: bun run trilha <slug>
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
const f = slug && resolve(root, 'src/videos', slug, 'trilha.mjs');
if (!f || !existsSync(f)) {
	console.error('Uso: bun run trilha <slug> (src/videos/<slug>/trilha.mjs precisa existir)');
	process.exit(1);
}
process.exit(spawnSync('node', [f], {stdio: 'inherit'}).status ?? 1);
