// Registro dos vídeos. `bun run novo` acrescenta as linhas abaixo dos marcadores; não apague os marcadores.
import type React from 'react';
import {TOTAL as EXEMPLO_VALIDACAO_TOTAL} from './exemplo-validacao/story';
import {Validacao as ExemploValidacao} from './exemplo-validacao/Validacao';
import {Prova as ProvaDirecao, TOTAL as PROVA_DIRECAO_TOTAL} from './prova-direcao/Prova';
import {TOTAL as VALIDACAO_ATENDIMENTOS_TOTAL} from './validacao-atendimentos/story';
import {Video as ValidacaoAtendimentos} from './validacao-atendimentos/Video';
import {TOTAL as OLA_TOTAL} from './ola/story';
import {Video as Ola} from './ola/Video';
import {TOTAL as OLA_RESERVA_TOTAL} from './ola-reserva/story';
import {Video as OlaReserva} from './ola-reserva/Video';
import {TOTAL as COMO_FAZEMOS_RESERVA_TOTAL} from './como-fazemos-reserva/story';
import {Video as ComoFazemosReserva} from './como-fazemos-reserva/Video';
import {TOTAL as TRES_ERROS_RESERVA_TOTAL} from './tres-erros-reserva/story';
import {Video as TresErrosReserva} from './tres-erros-reserva/Video';
import {TOTAL as EXEMPLO_SKIA_GSAP_TOTAL, Video as ExemploSkiaGsap} from './exemplo-skia-gsap/Video';
// <imports>

export type VideoEntry = {id: string; component: React.FC; frames: number; width?: number; height?: number};

export const VIDEOS: VideoEntry[] = [
	{id: 'exemplo-validacao', component: ExemploValidacao, frames: EXEMPLO_VALIDACAO_TOTAL},
	{id: 'prova-direcao', component: ProvaDirecao, frames: PROVA_DIRECAO_TOTAL},
	{id: 'validacao-atendimentos', component: ValidacaoAtendimentos, frames: VALIDACAO_ATENDIMENTOS_TOTAL},
	{id: 'ola', component: Ola, frames: OLA_TOTAL},
	{id: 'ola-reserva', component: OlaReserva, frames: OLA_RESERVA_TOTAL},
	{id: 'como-fazemos-reserva', component: ComoFazemosReserva, frames: COMO_FAZEMOS_RESERVA_TOTAL},
	{id: 'tres-erros-reserva', component: TresErrosReserva, frames: TRES_ERROS_RESERVA_TOTAL, width: 1080, height: 1920},
	{id: 'exemplo-skia-gsap', component: ExemploSkiaGsap, frames: EXEMPLO_SKIA_GSAP_TOTAL, width: 1080, height: 1920},
	// <videos>
];
