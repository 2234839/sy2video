/**
 * GeometricShapes — 几何色块背景
 *
 * 视觉特征：
 * - 大面积、高饱和度的几何色块（圆、三角、矩形、圆环）
 * - 色彩大胆醒目，用几何图形撑起画面氛围
 * - 缓慢漂浮/旋转，极其克制
 * - 不再是"含蓄暗示"，而是"大胆存在"
 *
 * 适用场景：替代粒子/渐变，作为场景的视觉锚点
 */
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** 单个几何形状的配置 */
interface ShapeConfig {
	/** 形状类型 */
	type: 'circle' | 'triangle' | 'rect' | 'ring';
	/** 中心 X（%） */
	x: number;
	/** 中心 Y（%） */
	y: number;
	/** 尺寸（px） */
	size: number;
	/** 填充颜色 */
	color: string;
	/** 透明度 */
	opacity: number;
	/** 旋转角度偏移（度） */
	rotation: number;
	/** 是否有描边而非填充 */
	outlined?: boolean;
	/** 描边宽度 */
	strokeWidth?: number;
}

/** 预设调色板 — 大胆鲜艳的颜色组合 */
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
} as const;

/** 基于种子的伪随机 */
const seededRandom = (seed: number): number => {
	const x = Math.sin(seed) * 43758.5453123;
	return x - Math.floor(x);
};

/** 生成一组形状配置 */
const generateShapes = (
	palette: keyof typeof PALETTES | string[],
	seed: number,
	count: number,
): ShapeConfig[] => {
	const colors = Array.isArray(palette) ? palette : PALETTES[palette];
	const shapes: ShapeConfig[] = [];
	const types: ShapeConfig['type'][] = ['circle', 'triangle', 'rect', 'ring'];

	for (let i = 0; i < count; i++) {
		const colorIndex = Math.floor(seededRandom(seed + i * 1.7) * colors.length);
		const typeIndex = Math.floor(seededRandom(seed + i * 3.1 + 50) * types.length);
		const isOutlined = seededRandom(seed + i * 5.3 + 100) > 0.6;

		shapes.push({
			type: types[typeIndex],
			x: seededRandom(seed + i * 2.1 + 200) * 100,
			y: seededRandom(seed + i * 4.3 + 300) * 100,
			/** 尺寸：100-500px 的大色块 */
			size: seededRandom(seed + i * 6.7 + 400) * 400 + 100,
			color: colors[colorIndex],
			/** 透明度：0.08-0.3，让色块真正可见 */
			opacity: seededRandom(seed + i * 8.1 + 500) * 0.22 + 0.08,
			rotation: seededRandom(seed + i * 9.3 + 600) * 360,
			outlined: isOutlined,
			strokeWidth: isOutlined ? 2 + Math.floor(seededRandom(seed + i * 11.1 + 700) * 3) : 0,
		});
	}

	return shapes;
};

/** 渲染单个形状 */
const Shape: React.FC<{
	config: ShapeConfig;
	frame: number;
	index: number;
}> = ({config, frame, index}) => {
	/** 极其缓慢的漂移 — 每 200 帧移动 10px */
	const driftX = Math.sin(frame * 0.005 + index * 2.1) * 10;
	const driftY = Math.cos(frame * 0.004 + index * 1.7) * 8;

	/** 极其缓慢的旋转 — 每 300 帧转 10° */
	const rotation = config.rotation + Math.sin(frame * 0.003 + index) * 10;

	const commonStyle: React.CSSProperties = {
		position: 'absolute',
		left: `${config.x}%`,
		top: `${config.y}%`,
		width: config.size,
		height: config.size,
		opacity: config.opacity,
		transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) rotate(${rotation}deg)`,
		transition: 'none',
	};

	switch (config.type) {
		case 'circle':
			return (
				<div style={{
					...commonStyle,
					borderRadius: '50%',
					backgroundColor: config.outlined ? 'transparent' : config.color,
					border: config.outlined ? `${config.strokeWidth}px solid ${config.color}` : 'none',
				}} />
			);

		case 'triangle':
			return (
				<div style={{
					...commonStyle,
					width: 0,
					height: 0,
					borderLeft: `${config.size / 2}px solid transparent`,
					borderRight: `${config.size / 2}px solid transparent`,
					borderBottom: `${config.size}px solid ${config.color}`,
					backgroundColor: 'transparent',
					opacity: config.opacity,
				}} />
			);

		case 'rect':
			return (
				<div style={{
					...commonStyle,
					backgroundColor: config.outlined ? 'transparent' : config.color,
					border: config.outlined ? `${config.strokeWidth}px solid ${config.color}` : 'none',
					borderRadius: 8,
				}} />
			);

		case 'ring':
			return (
				<div style={{
					...commonStyle,
					borderRadius: '50%',
					backgroundColor: 'transparent',
					border: `${3 + (config.size / 80)}px solid ${config.color}`,
				}} />
			);

		default:
			return null;
	}
};

const GeometricShapes: React.FC<{
	/** 调色板预设或自定义颜色数组 */
	palette?: keyof typeof PALETTES | string[];
	/** 形状数量（默认 8） */
	count?: number;
	/** 随机种子 */
	seed?: number;
	/** 整体透明度倍数 */
	opacityMultiplier?: number;
}> = ({
	palette = 'rainbow',
	count = 8,
	seed = 42,
	opacityMultiplier = 1,
}) => {
	const frame = useCurrentFrame();
	const shapes = generateShapes(palette, seed, count);

	return (
		<AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
			{shapes.map((shape, i) => (
				<Shape key={i} config={{
					...shape,
					opacity: shape.opacity * opacityMultiplier,
				}} frame={frame} index={i} />
			))}
		</AbsoluteFill>
	);
};

export {GeometricShapes};
export type {ShapeConfig};
