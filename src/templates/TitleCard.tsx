import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {useTheme} from '../theme/context';
import {GradientBackground} from './GradientBackground';

interface TitleCardProps {
	/** 主标题 */
	title: string;
	/** 副标题 */
	subtitle?: string;
	/** 背景颜色数组（渐变） */
	backgroundColors?: string[];
	/** 文字颜色 */
	color?: string;
	/** 字号 */
	fontSize?: number;
}

/**
 * 标题卡片组件
 *
 * 居中大标题 + 可选副标题 + 渐变背景，适合章节封面
 *
 * 用法：
 * ```tsx
 * <TitleCard title="OCR 插件的神奇之处" subtitle="思源笔记工具介绍" backgroundColors={['#0f0c29', '#302b63']} />
 * ```
 */
export const TitleCard: React.FC<TitleCardProps> = ({
	title,
	subtitle,
	backgroundColors,
	color,
	fontSize = 72,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const textColor = color ?? '#ffffff';

	/** 标题滑入动画 */
	const titleProgress = spring({
		frame,
		fps,
		config: {damping: 15, mass: 0.8},
		durationInFrames: fps * 0.8,
	});

	const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
	const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

	/** 副标题延迟出现 */
	const subtitleOpacity = interpolate(frame - fps * 0.3, [0, fps * 0.4], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const content = (
		<AbsoluteFill
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '80px 160px',
				boxSizing: 'border-box',
			}}
		>
			<h1
				style={{
					fontSize,
					fontWeight: 'bold',
					color: textColor,
					fontFamily: theme.fontFamily,
					textAlign: 'center',
					margin: 0,
					opacity: titleOpacity,
					transform: `translateY(${titleY}px)`,
				}}
			>
				{title}
			</h1>
			{subtitle && (
				<p
					style={{
						fontSize: fontSize * 0.4,
						color: textColor,
						opacity: subtitleOpacity * 0.7,
						fontFamily: theme.fontFamily,
						marginTop: 24,
						textAlign: 'center',
					}}
				>
					{subtitle}
				</p>
			)}
		</AbsoluteFill>
	);

	if (backgroundColors && backgroundColors.length >= 2) {
		return (
			<GradientBackground colors={backgroundColors} animated>
				{content}
			</GradientBackground>
		);
	}

	return (
		<AbsoluteFill style={{backgroundColor: theme.background}}>
			{content}
		</AbsoluteFill>
	);
};
