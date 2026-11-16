// Registro dos vídeos. `bun run novo` acrescenta as linhas abaixo dos marcadores; não apague os marcadores.
import type React from 'react';
import {TOTAL as EXEMPLO_VALIDACAO_TOTAL} from './exemplo-validacao/story';
import {Validacao as ExemploValidacao} from './exemplo-validacao/Validacao';
// <imports>

export type VideoEntry = {id: string; component: React.FC; frames: number};

export const VIDEOS: VideoEntry[] = [
	{id: 'exemplo-validacao', component: ExemploValidacao, frames: EXEMPLO_VALIDACAO_TOTAL},
	// <videos>
];
