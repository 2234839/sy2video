import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

/**
 * 渐变背景组件
 *
 * 多色渐变 + 可选角度动画（缓慢旋转）。
 * 修正了 animated 模式：角度从 angle 缓慢旋转到 angle+30，
 * 营造微妙的视觉变化而不做花哨效果。
 *
 * 用法：
 * ```tsx
 * <GradientBackground colors={['#0f2027', '#2c5364']} angle={135} animated>
 *   <TitleCard title="标题" />
 * </GradientBackground>
 * ```
 */
export const GradientBackground: React.FC<{
	/** 渐变颜色数组（至少 2 个） */
	colors: string[];
	/** 渐变角度（度） */
	angle?: number;
	/** 是否启用角度缓慢旋转动画 */
	animated?: boolean;
	/** 子内容 */
	children?: React.ReactNode;
}> = ({
	colors,
	angle = 135,
	animated = false,
	children,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	/** 动画模式：角度缓慢偏移 30 度 */
	const animatedAngle = animated
		? angle + interpolate(frame, [0, durationInFrames], [0, 30])
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
