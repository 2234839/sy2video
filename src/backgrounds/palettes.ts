/**
 * 背景风格体系 — 统一调色板
 *
 * 所有背景组件共享的颜色预设，避免各组件各自定义
 */

/** 调色板预设 */
const PALETTES = {
	/** 红橙暖色系 */
	ember: ['#e94560', '#ff6b35', '#f59e0b', '#ef4444'],
	/** 蓝绿冷色系 */
	ocean: ['#06b6d4', '#3b82f6', '#8b5cf6', '#22c55e'],
	/** 绿色自然系 */
	moss: ['#22c55e', '#10b981', '#84cc16', '#14b8a6'],
	/** 紫粉霓虹系 */
	neon: ['#e94560', '#8b5cf6', '#ec4899', '#f43f5e'],
	/** 金橙财富系 */
	gold: ['#f59e0b', '#eab308', '#f97316', '#fbbf24'],
	/** 多彩混合 */
	rainbow: ['#e94560', '#3b82f6', '#22c55e', '#f59e0b'],
	/** 极光宇宙系 — 蓝紫粉柔和色 */
	cosmic: ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#a78bfa'],
	/** 赛博霓虹系 — 青洋红电蓝 */
	cyber: ['#00ffff', '#ff00ff', '#0066ff', '#ff3366'],
	/** 包豪斯原色 — 红蓝黄黑白 */
	bauhaus: ['#e63946', '#457b9d', '#f4d35e', '#1d3557'],
	/** 蒸汽波日落系 — 粉紫橙蓝 */
	vaporwave: ['#ff6b9d', '#c44dff', '#ff9a56', '#45caff', '#ff71ce'],
	/** 蓝图工程系 — 深蓝+青 */
	blueprint: ['#0a1628', '#1a3a5c', '#00b4d8', '#48cae4'],
	/** 孟菲斯粉彩系 — 活泼粉彩 */
	memphis: ['#ff6b6b', '#51e898', '#feca57', '#a29bfe', '#74b9ff'],
} as const;

/** 调色板 key 类型 */
type PaletteKey = keyof typeof PALETTES;

export {PALETTES};
export type {PaletteKey};
