/**
 * NoiseGrain — 胶片颗粒噪点叠层
 *
 * 视觉特征：
 * - 微妙的噪点纹理，模拟胶片颗粒感
 * - 透明度极低(3-8%)，不干扰内容
 * - 可叠加在任何背景风格上
 * - 每隔几帧更新噪点图案，模拟真实胶片抖动
 *
 * 适用场景：纪录片、个人故事、任何需要"有机/真实感"的视频
 * 可以作为 modifier 叠加在任意背景上
 */
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {seededRandom} from './utils';

/**
 * 用 seededRandom 生成一个伪随机噪点 SVG data URL
 * 每 N 帧切换一次图案，避免逐帧计算开销
 */
const generateNoiseSvg = (seed: number, blockSize: number): string => {
	/** 生成 blockCount × blockCount 的噪点网格 */
	const blockCount = 8;
	const parts: string[] = [];

	for (let y = 0; y < blockCount; y++) {
		for (let x = 0; x < blockCount; x++) {
			const brightness = Math.floor(seededRandom(seed + y * blockCount + x) * 255);
			parts.push(`<rect x="${x * blockSize}" y="${y * blockSize}" width="${blockSize}" height="${blockSize}" fill="rgb(${brightness},${brightness},${brightness})"/>`);
		}
	}

	return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${blockCount * blockSize}" height="${blockCount * blockSize}">${parts.join('')}</svg>`)}`;
};

const NoiseGrain: React.FC<{
	/** 噪点强度 0-1（默认 0.04 — 极微妙） */
	intensity?: number;
	/** 噪点更新间隔帧数（默认 3 — 每 3 帧换一次图案） */
	updateInterval?: number;
	/** 随机种子 */
	seed?: number;
}> = ({
	intensity = 0.04,
	updateInterval = 3,
	seed = 42,
}) => {
	const frame = useCurrentFrame();
	/** 每 N 帧切换噪点图案 */
	const noiseSeed = seed + Math.floor(frame / updateInterval);
	const noiseUrl = generateNoiseSvg(noiseSeed, 32);

	return (
		<AbsoluteFill style={{
			pointerEvents: 'none',
			overflow: 'hidden',
			zIndex: 100,
		}}>
			<div style={{
				position: 'absolute',
				inset: 0,
				backgroundImage: `url("${noiseUrl}")`,
				backgroundSize: '256px 256px',
				backgroundRepeat: 'repeat',
				opacity: intensity,
				mixBlendMode: 'overlay',
			}} />
		</AbsoluteFill>
	);
};

export {NoiseGrain};
