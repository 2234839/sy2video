/**
 * AuroraMesh — 极光流彩背景
 *
 * 视觉特征：
 * - 大型柔和渐变色团叠加融合
 * - 像 macOS Monterey 壁纸 / Stripe 官网背景
 * - 色团沿正弦路径缓慢飘动
 * - mix-blend-mode: screen 实现自然的颜色混合
 * - 整体感觉高端、流畅、有质感
 *
 * 适用场景：产品介绍、教程、高端感内容
 */
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {seededRandom} from './utils';
import {PALETTES} from './palettes';
import type {PaletteKey} from './palettes';

/** 单个色团的配置 */
interface BlobConfig {
	/** 中心 X（%） */
	x: number;
	/** 中心 Y（%） */
	y: number;
	/** 半径（px） */
	radius: number;
	/** 渐变颜色 */
	color: string;
	/** 透明度 */
	opacity: number;
	/** 漂移速度系数 */
	speedX: number;
	/** 漂移速度系数 */
	speedY: number;
	/** 漂移相位偏移 */
	phaseX: number;
	/** 漂移相位偏移 */
	phaseY: number;
}

/** 生成色团配置 */
const generateBlobs = (
	palette: PaletteKey | string[],
	seed: number,
	count: number,
): BlobConfig[] => {
	const colors = Array.isArray(palette) ? palette : PALETTES[palette];
	const blobs: BlobConfig[] = [];

	for (let i = 0; i < count; i++) {
		const colorIndex = Math.floor(seededRandom(seed + i * 1.3) * colors.length);
		blobs.push({
			x: seededRandom(seed + i * 2.1 + 100) * 80 + 10,
			y: seededRandom(seed + i * 3.7 + 200) * 80 + 10,
			/** 半径 200-600px — 大色团才能营造"极光"感 */
			radius: seededRandom(seed + i * 5.1 + 300) * 400 + 200,
			color: colors[colorIndex],
			/** 透明度 0.15-0.4 — 比几何色块更"实"才能融合 */
			opacity: seededRandom(seed + i * 7.3 + 400) * 0.25 + 0.15,
			speedX: seededRandom(seed + i * 9.1 + 500) * 0.003 + 0.001,
			speedY: seededRandom(seed + i * 11.3 + 600) * 0.002 + 0.001,
			phaseX: seededRandom(seed + i * 13.7 + 700) * Math.PI * 2,
			phaseY: seededRandom(seed + i * 15.1 + 800) * Math.PI * 2,
		});
	}

	return blobs;
};

const AuroraMesh: React.FC<{
	/** 调色板预设或自定义颜色数组 */
	palette?: PaletteKey | string[];
	/** 色团数量（默认 5） */
	count?: number;
	/** 随机种子 */
	seed?: number;
	/** 整体透明度倍数 */
	opacityMultiplier?: number;
}> = ({
	palette = 'cosmic',
	count = 5,
	seed = 42,
	opacityMultiplier = 1,
}) => {
	const frame = useCurrentFrame();
	const blobs = generateBlobs(palette, seed, count);

	return (
		<AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
			{blobs.map((blob, i) => {
				/** 缓慢飘动 — 正弦波驱动 */
				const driftX = Math.sin(frame * blob.speedX + blob.phaseX) * 80;
				const driftY = Math.cos(frame * blob.speedY + blob.phaseY) * 60;

				/** 缓慢呼吸 — 半径微微变化 */
				const breathe = 1 + Math.sin(frame * 0.005 + i * 1.5) * 0.1;
				const radius = blob.radius * breathe;

				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${blob.x}%`,
							top: `${blob.y}%`,
							width: radius * 2,
							height: radius * 2,
							transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px)`,
							borderRadius: '50%',
							background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
							opacity: blob.opacity * opacityMultiplier,
							mixBlendMode: 'screen',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

export {AuroraMesh};
