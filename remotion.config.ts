import {Config} from '@remotion/cli/config';

// GPU (ANGLE) para Three.js, shaders GLSL e GL Transitions.
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
// Mais abas estouram a memória de GPU (perda de contexto WebGL).
Config.setConcurrency(3);
