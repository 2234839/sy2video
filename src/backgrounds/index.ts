/**
 * 背景风格体系 — 统一导出
 */

// 类型
export type {BackgroundPreset, BaseLayer, AtmosphereLayer, GrainLayer} from './types';

// 工具
export {seededRandom} from './utils';

// 调色板
export {PALETTES} from './palettes';
export type {PaletteKey} from './palettes';

// 预设
export {BACKGROUND_PRESETS} from './presets';

// 组件
export {SceneBackground} from './SceneBackground';
export {AuroraMesh} from './AuroraMesh';
export {NoiseGrain} from './NoiseGrain';
