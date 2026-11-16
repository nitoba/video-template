// Registro dos vídeos. `bun run novo` acrescenta as linhas abaixo dos marcadores; não apague os marcadores.
import type React from 'react';
import {TOTAL as EXEMPLO_VALIDACAO_TOTAL} from './exemplo-validacao/story';
import {Validacao as ExemploValidacao} from './exemplo-validacao/Validacao';
import {Prova as ProvaDirecao, TOTAL as PROVA_DIRECAO_TOTAL} from './prova-direcao/Prova';
import {TOTAL as VALIDACAO_ATENDIMENTOS_TOTAL} from './validacao-atendimentos/story';
import {Video as ValidacaoAtendimentos} from './validacao-atendimentos/Video';
// <imports>

export type VideoEntry = {id: string; component: React.FC; frames: number};

export const VIDEOS: VideoEntry[] = [
	{id: 'exemplo-validacao', component: ExemploValidacao, frames: EXEMPLO_VALIDACAO_TOTAL},
	{id: 'prova-direcao', component: ProvaDirecao, frames: PROVA_DIRECAO_TOTAL},
	{id: 'validacao-atendimentos', component: ValidacaoAtendimentos, frames: VALIDACAO_ATENDIMENTOS_TOTAL},
	// <videos>
];
