import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {useTheme} from '../theme/context';

/**
 * 毛玻璃卡片 — 通用信息容器
 *
 * 半透明背景 + 细边框 + backdrop-blur，内置 spring 从下方滑入。
 * 用于展示特性、数据、引用等信息块。
 *
 * 用法：
 * ```tsx
 * <GlassCard delay={FPS}>
 *   <h2>标题</h2>
 *   <p>描述文字</p>
 * </GlassCard>
 * ```
 */
export const GlassCard: React.FC<{
	/** 卡片内容 */
	children: React.ReactNode;
	/** 入场延迟（帧） */
	delay?: number;
	/** 内边距 */
	padding?: string;
	/** 圆角 */
	borderRadius?: number;
}> = ({children, delay = 0, padding = '24px 32px', borderRadius = 16}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {damping: 200},
	});

	const translateY = interpolate(progress, [0, 1], [24, 0]);

	return (
		<div
			style={{
				backgroundColor: 'rgba(255, 255, 255, 0.05)',
				border: '1px solid rgba(255, 255, 255, 0.1)',
				borderRadius,
				padding,
				backdropFilter: 'blur(10px)',
				opacity: progress,
				transform: `translateY(${translateY}px)`,
				fontFamily: theme.fontFamily,
			}}
		>
			{children}
		</div>
	);
};
