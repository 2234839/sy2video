import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {useTheme} from '../theme/context';
import {SceneShell} from './SceneShell';

/**
 * 标题卡片组件
 *
 * 居中大标题 + 可选副标题，用 SceneShell 包裹获得渐变背景 + 安全区。
 * spring 物理入场，干净专业。
 *
 * 用法：
 * ```tsx
 * <TitleCard title="OCR 插件的神奇之处" subtitle="思源笔记工具介绍" gradientColors={['#0f0c29', '#302b63']} />
 * ```
 */
export const TitleCard: React.FC<{
	/** 主标题 */
	title: string;
	/** 副标题 */
	subtitle?: string;
	/** 背景渐变色数组 */
	gradientColors?: string[];
	/** 文字颜色 */
	color?: string;
	/** 标题字号 */
	fontSize?: number;
}> = ({
	title,
	subtitle,
	gradientColors,
	color,
	fontSize = 72,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const textColor = color ?? '#ffffff';

	/** 标题 spring 入场 */
	const titleProgress = spring({
		frame,
		fps,
		config: {damping: 200},
	});

	const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

	/** 副标题延迟入场 */
	const subProgress = spring({
		frame: frame - fps * 0.3,
		fps,
		config: {damping: 200},
	});

	const content = (
		<>
			<h1
				style={{
					fontSize,
					fontWeight: 800,
					color: textColor,
					fontFamily: theme.fontFamily,
					textAlign: 'center',
					margin: 0,
					opacity: titleProgress,
					transform: `translateY(${titleY}px)`,
					lineHeight: 1.3,
				}}
			>
				{title}
			</h1>
			{subtitle && (
				<p
					style={{
						fontSize: Math.round(fontSize * 0.4),
						color: textColor,
						opacity: subProgress * 0.7,
						fontFamily: theme.fontFamily,
						marginTop: 24,
						textAlign: 'center',
						fontWeight: 400,
					}}
				>
					{subtitle}
				</p>
			)}
		</>
	);

	if (gradientColors && gradientColors.length >= 2) {
		return (
			<SceneShell gradientColors={gradientColors}>
				{content}
			</SceneShell>
		);
	}

	return (
		<AbsoluteFill style={{backgroundColor: theme.background}}>
			<AbsoluteFill
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '150px 60px 170px',
					boxSizing: 'border-box',
				}}
			>
				{content}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
