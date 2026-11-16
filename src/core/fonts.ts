// Fontes carregadas uma vez para todos os vídeos. As marcas escolhem entre elas (brands/*.tsx).
import {loadFont as loadJetBrains} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadRoboto} from '@remotion/google-fonts/Roboto';
import {loadFont as loadRubik} from '@remotion/google-fonts/Rubik';
import {loadFont as loadSaira} from '@remotion/google-fonts/Saira';

const w = ['400', '500', '600', '700', '800'] as const;
export const SAIRA = loadSaira('normal', {weights: [...w, '900'], subsets: ['latin', 'latin-ext']}).fontFamily;
export const RUBIK = loadRubik('normal', {weights: ['300', ...w], subsets: ['latin', 'latin-ext']}).fontFamily;
export const ROBOTO = loadRoboto('normal', {weights: ['400', '500', '700'], subsets: ['latin', 'latin-ext']}).fontFamily;
export const MONO = loadJetBrains('normal', {weights: ['400', '500', '700'], subsets: ['latin']}).fontFamily;
