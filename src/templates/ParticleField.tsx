/**
 * ParticleField — 动态粒子/网格背景
 *
 * 视觉特征：
 * - 随机分布的光点/粒子
 * - 缓慢漂移动画
 * - 半透明，作为场景的动态背景层
 * - 不依赖 Canvas，纯 CSS/React 实现
 *
 * 适用场景：替代静态渐变背景，营造科技感/深度感
 */
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

/** 单个粒子的属性 */
interface Particle {
	/** 初始 X 位置（百分比 0-100） */
	x: number;
	/** 初始 Y 位置（百分比 0-100） */
	y: number;
	/** 粒子大小（px） */
	size: number;
	/** 漂移速度倍数 */
	speed: number;
	/** 初始透明度 */
	opacity: number;
}

/** 基于种子的伪随机 */
const seededRandom = (seed: number): number => {
	const x = Math.sin(seed) * 43758.5453123;
	return x - Math.floor(x);
};

/** 生成固定粒子数组（基于 seed，确保帧间一致性） */
const generateParticles = (count: number, seed: number): Particle[] => {
	const particles: Particle[] = [];
	for (let i = 0; i < count; i++) {
		particles.push({
			x: seededRandom(seed + i * 1.1) * 100,
			y: seededRandom(seed + i * 2.3 + 100) * 100,
			/** 粒子大小：2-7px，部分粒子特别大作为"亮星" */
			size: seededRandom(seed + i * 3.7 + 200) > 0.85
				? seededRandom(seed + i * 3.7 + 200) * 8 + 4
				: seededRandom(seed + i * 3.7 + 200) * 4 + 1.5,
			speed: seededRandom(seed + i * 5.1 + 300) * 0.5 + 0.2,
			/** 透明度：0.15-0.7，确保粒子清晰可见 */
			opacity: seededRandom(seed + i * 7.9 + 400) * 0.55 + 0.15,
		});
	}
	return particles;
};

/** 粒子数量预设 */
const PRESET_COUNTS = {
	/** 稀疏 — 适合文字多的场景 */
	sparse: 50,
	/** 中等 — 通用 */
	medium: 100,
	/** 密集 — 适合开场/冲击场景 */
	dense: 180,
} as const;

const ParticleField: React.FC<{
	/** 粒子颜色 */
	color?: string;
	/** 粒子密度预设 */
	density?: 'sparse' | 'medium' | 'dense';
	/** 自定义粒子数量（覆盖 density） */
	count?: number;
	/** 随机种子（确保帧间一致性） */
	seed?: number;
	/** 整体透明度倍数 */
	opacityMultiplier?: number;
}> = ({
	color = '#ffffff',
	density = 'medium',
	count,
	seed = 42,
	opacityMultiplier = 1,
}) => {
	const frame = useCurrentFrame();
	const particleCount = count ?? PRESET_COUNTS[density];
	const particles = generateParticles(particleCount, seed);

	return (
		<AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
			{particles.map((p, i) => {
				/** 每个粒子独立漂移，基于正弦波 */
				const driftX = Math.sin(frame * 0.02 * p.speed + i) * 3;
				const driftY = Math.cos(frame * 0.015 * p.speed + i * 0.7) * 2;

				/** 呼吸效果：透明度随时间微微波动 */
				const breathe = interpolate(
					Math.sin(frame * 0.03 + i * 0.5),
					[-1, 1],
					[0.6, 1],
				);

				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${p.x}%`,
							top: `${p.y}%`,
							width: p.size,
							height: p.size,
							borderRadius: '50%',
							backgroundColor: color,
							opacity: p.opacity * breathe * opacityMultiplier,
							transform: `translate(${driftX}px, ${driftY}px)`,
							/** 发光：大粒子有更明显的 glow */
	boxShadow: `0 0 ${p.size * 3}px ${p.size * 1.5}px ${color}40, 0 0 ${p.size}px ${color}`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

export {ParticleField};
