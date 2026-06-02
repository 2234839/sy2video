/**
 * 背景风格体系 — 类型定义
 *
 * 每种背景风格由两层组成：
 * 1. Base 层 — 纯色或渐变底色
 * 2. Atmosphere 层 — 装饰性叠加（几何色块/极光/网格等）
 *
 * 可选第三层 Grain — 胶片颗粒噪点纹理
 */

/** Base 层：纯色或渐变 */
interface BaseLayer {
	/** 纯色背景 */
	readonly type: 'solid' | 'gradient';
	/** 纯色色值（type='solid' 时必填） */
	readonly color?: string;
	/** 渐变颜色数组（type='gradient' 时必填，至少 2 个） */
	readonly colors?: string[];
	/** 渐变角度 */
	readonly angle?: number;
}

/** Atmosphere 层：装饰性叠加组件的配置 */
interface AtmosphereLayer {
	/** 组件标识名，对应 SceneBackground 内部的分发逻辑 */
	readonly component:
		| 'GeometricShapes'
		| 'AuroraMesh'
		| 'NeonGrid'
		| 'BauhausClean'
		| 'VaporwaveSunset'
		| 'BlueprintLine'
		| 'MemphisRetro'
		| 'none';
	/** 传递给组件的 props（组件特定） */
	readonly props: Record<string, unknown>;
}

/** Grain 层：胶片颗粒噪点 */
interface GrainLayer {
	/** 噪点强度 0-1 */
	readonly intensity: number;
}

/** 完整的背景风格预设 */
interface BackgroundPreset {
	/** 唯一标识 */
	readonly id: string;
	/** 英文名 */
	readonly name: string;
	/** 中文名 */
	readonly nameZh: string;
	/** 简短描述 */
	readonly description: string;
	/** Base 层配置 */
	readonly base: BaseLayer;
	/** Atmosphere 层配置（可选，none 表示无装饰） */
	readonly atmosphere?: AtmosphereLayer;
	/** Grain 层配置（可选） */
	readonly grain?: GrainLayer;
}

export type {BaseLayer, AtmosphereLayer, GrainLayer, BackgroundPreset};
