import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

interface GradientBackgroundProps {
	/** 渐变颜色数组（至少 2 个） */
	colors: string[];
	/** 渐变角度（度） */
	angle?: number;
	/** 是否动画（颜色缓慢偏移） */
	animated?: boolean;
	/** 子内容 */
	children?: React.ReactNode;
}

/**
 * 渐变背景组件
 *
 * 支持多色渐变 + 可选动画效果
 *
 * 用法：
 * ```tsx
 * <GradientBackground colors={['#667eea', '#764ba2']} angle={135}>
 *   <TextReveal text="标题" />
 * </GradientBackground>
 * ```
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
	colors,
	angle = 135,
	animated = false,
	children,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	/** 动画模式下渐变角度缓慢旋转 */
	const animatedAngle = animated
		? angle + interpolate(frame, [0, durationInFrames], [0, 40])
		: angle;

	const gradientColors = colors.length >= 2
		? colors.join(', ')
		: '#000000, #333333';

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(${animatedAngle}deg, ${gradientColors})`,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};
