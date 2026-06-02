/**
 * 背景风格体系 — 预设配置
 *
 * 每种风格的完整配置：base 层 + atmosphere 层 + grain 层
 * AI 生成视频时通过 preset id 选用风格
 */
import type {BackgroundPreset} from './types';

/** 所有可用的背景风格预设 */
const BACKGROUND_PRESETS: Record<string, BackgroundPreset> = {
	/** 几何色块 — 当前默认风格，大色块几何漂浮 */
	'geometric-bold': {
		id: 'geometric-bold',
		name: 'Geometric Bold',
		nameZh: '几何色块',
		description: '大色块几何漂浮，高饱和度，科技感',
		base: {type: 'solid', color: '#0a0a0a'},
		atmosphere: {
			component: 'GeometricShapes',
			props: {palette: 'ember', count: 6, seed: 42, opacityMultiplier: 1.0},
		},
	},

	/** 极光流彩 — 柔和渐变色团，高端感 */
	'aurora-mesh': {
		id: 'aurora-mesh',
		name: 'Aurora Mesh',
		nameZh: '极光流彩',
		description: '柔和渐变色团叠加融合，像极光般流动',
		base: {type: 'gradient', colors: ['#050510', '#0a0a2e', '#10051a'], angle: 135},
		atmosphere: {
			component: 'AuroraMesh',
			props: {palette: 'cosmic', count: 5, seed: 42, opacityMultiplier: 1.0},
		},
	},

	/** 赛博网格 — 透视网格 + 霓虹色（预留，暂未实现组件） */
	'neon-grid': {
		id: 'neon-grid',
		name: 'Neon Grid',
		nameZh: '赛博网格',
		description: '透视网格线 + 霓虹色，赛博朋克风',
		base: {type: 'solid', color: '#05050f'},
		atmosphere: {
			component: 'none',
			props: {},
		},
	},

	/** 包豪斯极简 — 精准几何，原色系（预留） */
	'bauhaus-clean': {
		id: 'bauhaus-clean',
		name: 'Bauhaus Clean',
		nameZh: '包豪斯极简',
		description: '极少精准几何，仅红蓝黄，严肃学术风',
		base: {type: 'solid', color: '#fafafa'},
		atmosphere: {
			component: 'none',
			props: {},
		},
	},

	/** 蒸汽波日落 — 水平渐变 + 大太阳（预留） */
	'vaporwave-sunset': {
		id: 'vaporwave-sunset',
		name: 'Vaporwave Sunset',
		nameZh: '蒸汽波日落',
		description: '水平渐变条带 + 大太阳，梦幻怀旧',
		base: {type: 'gradient', colors: ['#ff71ce', '#b967ff', '#01cdfe', '#05ffa1'], angle: 180},
		atmosphere: {
			component: 'none',
			props: {},
		},
	},

	/** 蓝图线条 — 工程蓝图风（预留） */
	'blueprint-line': {
		id: 'blueprint-line',
		name: 'Blueprint Line',
		nameZh: '蓝图线条',
		description: '深蓝底 + 白色网格 + 几何描边，工程蓝图风',
		base: {type: 'solid', color: '#0a1628'},
		atmosphere: {
			component: 'none',
			props: {},
		},
	},

	/** 孟菲斯复古 — 活泼粉彩（预留） */
	'memphis-retro': {
		id: 'memphis-retro',
		name: 'Memphis Retro',
		nameZh: '孟菲斯复古',
		description: '小型活泼形状散布，粉彩色，友好轻松',
		base: {type: 'solid', color: '#faf5ee'},
		atmosphere: {
			component: 'none',
			props: {},
		},
	},
};

export {BACKGROUND_PRESETS};
