// Marcas disponíveis. Marca nova: copie agrotrace.tsx, troque cores, céus, logo e registre aqui.
import {agrotrace} from './agrotrace';
import {pectrace} from './pectrace';
import type {Brand} from './types';

export const BRANDS = {agrotrace, pectrace} satisfies Record<string, Brand>;
export type BrandId = keyof typeof BRANDS;
export type {Brand, Sky} from './types';
