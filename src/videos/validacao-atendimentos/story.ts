// Marca, timeline e legendas do vídeo. A narração é a do vídeo antigo (narracao.json, vozes em public/<slug>/voz/),
// e os marcos de timeline.json foram postos sobre o início de cada fala: imagem, trilha e voz leem o mesmo arquivo.
import {pectrace} from '../../brands/pectrace';
import {createTimeline} from '../../kit';
import tl from './timeline.json';

export const SLUG = 'validacao-atendimentos';
export const BRAND = pectrace;
export const T = createTimeline(tl);
export const {M, b, sp, TOTAL} = T;
export const TIMELINE = tl;
/** Capturas reais (JPEG 2x) em public/validacao-atendimentos/telas/. */
export const tela = (nome: string) => `${SLUG}/telas/${nome}.jpg`;
export const lottie = (nome: string) => `${SLUG}/lottie/${nome}.json`;
/** Segundos para quadros. */
export const s = (sec: number) => Math.round(sec * tl.fps);

/**
 * Legendas: o texto de cada fala como se lê (RAT, CMS, números em algarismos), com o encaixe real da voz em
 * segundos (`PLAN_ONLY=1 bun run narrar validacao-atendimentos`).
 */
export const LEGENDAS: [number, number, string][] = [
	[1.97, 6.13, '3.736 atendimentos concluídos na JBS.'],
	[6.25, 8.82, 'Quantos foram conferidos? Nenhum.'],
	[8.98, 13.56, 'A conferência só acontece na exportação, quando o zip vai para a JBS.'],
	[14.24, 18.99, 'Em 5 de setembro, o RAT do William saiu sem a assinatura do produtor.'],
	[19.71, 24.1, 'Se a JBS rejeita, o técnico não recebe pela visita.'],
	[24.22, 27.27, 'Agora, cada RAT é conferido assim que chega.'],
	[27.39, 32.51, 'Validação de atendimentos. O erro aparece antes de chegar à JBS.'],
	[33.19, 36.68, 'O técnico sincroniza, e o atendimento entra na fila.'],
	[37.68, 42.05, 'A IA lê o RAT: o contrato impresso, as assinaturas e o texto.'],
	[42.28, 46.22, 'A assinatura do consultor é comparada com a referência do técnico.'],
	[46.66, 51.26, 'Sete verificações, em cerca de doze segundos, por menos de um centavo.'],
	[51.48, 54.98, 'Nada é rejeitado: vira alerta, e o gestor decide.'],
	[55.53, 60.13, 'Às sete, o resumo chega por e-mail. Só quando há alerta novo.'],
	[60.35, 62.78, 'Um clique, e o gestor está na validação.'],
	[63.09, 66.98, 'Só 22 de 209 estão prontos para a JBS.'],
	[67.1, 69.67, 'Primeiro, o que é grave: o contrato.'],
	[70.42, 72.4, 'Cada atendimento tem um dossiê.'],
	[72.52, 76.61, 'No Sítio Taismara, o contrato venceu em setembro de 2025.'],
	[76.78, 81.21, 'E a recomendação é a mesma, palavra por palavra, de outra propriedade.'],
	[81.33, 86.1, 'Um clique abre os dois atendimentos lado a lado, com os trechos repetidos em destaque.'],
	[86.52, 89.72, 'Já conferiu? Dispensa, com justificativa.'],
	[92.0, 95.72, 'Corrigiu o RAT? Revalida, e a IA lê de novo.'],
	[96.82, 100.32, 'E os atendimentos de antes? Escolhe o técnico e o período.'],
	[100.76, 104.1, 'A prévia mostra quantos, antes de gastar com IA.'],
	[105.14, 110.68, 'Em agosto e setembro, 209 atendimentos validados, sem nenhuma falha.'],
	[111.71, 116.04, 'E o RAT sem assinatura não chega mais à JBS sem ninguém ver.'],
	[118.29, 120.17, 'E para ligar em outro programa?'],
	[120.29, 122.66, 'Tudo pelo CMS, sem deploy.'],
	[122.78, 127.51, 'A aba nasce no cadastro do programa, desligada. Só um master libera.'],
	[128.14, 133.31, 'Escolhe o modo: silencioso, sem avisar ninguém, ou ativo, com o resumo por e-mail.'],
	[133.62, 137.26, 'Cada verificação tem a sua gravidade e as suas regras.'],
	[138.22, 142.6, 'Cópia e cola: 80% de semelhança, em 31 dias.'],
	[143.04, 146.75, 'As assinaturas de referência saem dos RATs que já existem.'],
	[146.98, 149.23, 'E o técnico pode trocar pela dele.'],
	[151.36, 153.9, 'Quem recebe o resumo, e a que horas.'],
	[156.62, 160.62, 'Ligou: todo atendimento novo passa pelas sete verificações.'],
	[161.44, 167.13, 'Sincroniza, a IA lê, verifica, avisa, e o gestor decide.'],
	[172.5, 177.44, 'Validação de atendimentos. O RAT chega, e o erro não passa.'],
];
