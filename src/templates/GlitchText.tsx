/**
 * GlitchText — 故障风文字效果
 *
 * 视觉特征：
 * - RGB 色彩分离（红/蓝/绿通道偏移）
 * - 随机横向撕裂/抖动
 * - 扫描线叠加
 * - 文字出现时有短暂故障，然后稳定
 *
 * 适用场景：标题/关键词强调、冲击性数字、技术感开场
 */
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

/** Glitch 随机种子的伪随机函数 */
const pseudoRandom = (seed: number): number => {
	const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
	return x - Math.floor(x);
};

const GlitchText: React.FC<{
	/** 要显示的文字 */
	text: string;
	/** 字号 */
	fontSize?: number;
	/** 文字颜色 */
	color?: string;
	/** 入场延迟（帧数） */
	delay?: number;
	/** 故障效果持续时间（帧），之后文字稳定显示 */
	glitchDuration?: number;
	/** 是否使用粗体 */
	fontWeight?: number;
	/** 字体族 */
	fontFamily?: string;
}> = ({
	text,
	fontSize = 72,
	color = '#ffffff',
	delay = 0,
	glitchDuration = 30,
	fontWeight = 800,
	fontFamily = 'Noto Sans SC, sans-serif',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const localFrame = frame - delay;

	/** 入场 spring */
	const entryProgress = spring({
		frame: localFrame,
		fps,
		config: {damping: 200, stiffness: 200},
	});

	/** 故障强度：入场后强故障，glitchDuration 帧内衰减到 0 */
	const glitchIntensity = localFrame > 0
		? interpolate(localFrame, [0, glitchDuration], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
		: 0;

	/** 每帧随机横向偏移 */
	const sliceOffset = glitchIntensity * pseudoRandom(localFrame * 13.37) * 20 - 10;

	/** RGB 分离偏移量 */
	const redOffset = glitchIntensity * (pseudoRandom(localFrame * 7.13) * 8 - 4);
	const blueOffset = glitchIntensity * (pseudoRandom(localFrame * 11.23) * 8 - 4);

	/** 扫描线闪烁 */
	const scanlineOpacity = 0.05 + glitchIntensity * 0.1;

	/** 随机选择要"撕裂"的区域 */
	const shouldSliceTop = pseudoRandom(localFrame * 3.7) > 0.6 && glitchIntensity > 0.1;
	const shouldSliceBottom = pseudoRandom(localFrame * 5.3) > 0.6 && glitchIntensity > 0.1;

	/** 撕裂偏移 */
	const sliceTopOffset = shouldSliceTop ? glitchIntensity * (pseudoRandom(localFrame * 9.1) * 30 - 15) : 0;
	const sliceBottomOffset = shouldSliceBottom ? glitchIntensity * (pseudoRandom(localFrame * 17.3) * 30 - 15) : 0;

	const textShadow = `
		${redOffset}px 0 rgba(255, 0, 0, 0.7),
		${-blueOffset}px 0 rgba(0, 100, 255, 0.7),
		0 0 ${glitchIntensity * 20}px rgba(255, 255, 255, ${glitchIntensity * 0.3})
	`;

	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			{/* 扫描线背景 */}
			<div style={{
				position: 'absolute',
				inset: 0,
				background: `repeating-linear-gradient(
					0deg,
					transparent,
					transparent 2px,
					rgba(0, 0, 0, ${scanlineOpacity}) 2px,
					rgba(0, 0, 0, ${scanlineOpacity}) 4px
				)`,
				pointerEvents: 'none',
				zIndex: 1,
			}} />

			{/* 主文字容器 */}
			<div style={{
				position: 'relative',
				opacity: entryProgress,
				transform: `scale(${0.8 + entryProgress * 0.2}) translateX(${sliceOffset}px)`,
				zIndex: 2,
			}}>
				{/* 顶部撕裂区域 */}
				<div style={{
					overflow: 'hidden',
					height: '35%',
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					transform: `translateX(${sliceTopOffset}px)`,
					clipPath: 'inset(0 0 0 0)',
				}}>
					<span style={{
						fontSize,
						fontWeight,
						color,
						fontFamily,
						textShadow,
						whiteSpace: 'nowrap',
						display: 'block',
						clipPath: 'inset(0 0 65% 0)',
					}}>
						{text}
					</span>
				</div>

				{/* 底部撕裂区域 */}
				<div style={{
					overflow: 'hidden',
					height: '35%',
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					transform: `translateX(${sliceBottomOffset}px)`,
				}}>
					<span style={{
						fontSize,
						fontWeight,
						color,
						fontFamily,
						textShadow,
						whiteSpace: 'nowrap',
						display: 'block',
						clipPath: 'inset(65% 0 0 0)',
					}}>
						{text}
					</span>
				</div>

				{/* 完整文字 */}
				<span style={{
					fontSize,
					fontWeight,
					color,
					fontFamily,
					textShadow,
					whiteSpace: 'nowrap',
					letterSpacing: -1,
				}}>
					{text}
				</span>
			</div>
		</AbsoluteFill>
	);
};

export {GlitchText};
