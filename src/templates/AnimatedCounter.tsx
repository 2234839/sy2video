import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {useTheme} from '../theme/context';

/**
 * 数字计数动画 — 从 0 计数到目标值
 *
 * spring 弹出 + interpolate 平滑计数，tabular-nums 防数字跳动。
 * 用于统计数据、金额、百分比等大数字展示。
 *
 * 用法：
 * ```tsx
 * <AnimatedCounter target={20000} prefix="¥" suffix="+" fontSize={120} color="#f59e0b" />
 * ```
 */
export const AnimatedCounter: React.FC<{
	/** 目标数字 */
	target: number;
	/** 前缀（如 ¥） */
	prefix?: string;
	/** 后缀（如 +、万） */
	suffix?: string;
	/** 字号 */
	fontSize?: number;
	/** 数字颜色 */
	color?: string;
	/** 描述文字 */
	description?: string;
	/** 描述文字颜色 */
	descriptionColor?: string;
	/** 入场延迟（帧） */
	delay?: number;
	/** 计数持续时间（帧） */
	duration?: number;
}> = ({
	target,
	prefix = '',
	suffix = '',
	fontSize = 120,
	color = '#f59e0b',
	description,
	descriptionColor = '#94a3b8',
	delay = 0,
	duration,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();

	const f = frame - delay;
	const countDuration = duration ?? fps * 1.5;

	/** 整体入场 spring */
	const entrance = spring({
		frame: f,
		fps,
		config: {damping: 200},
	});

	/** 计数值 — 从 0 到 target，持续 countDuration 帧 */
	const countValue = interpolate(
		Math.max(0, f),
		[0, countDuration],
		[0, target],
		{extrapolateRight: 'clamp'},
	);

	const scale = interpolate(entrance, [0, 1], [0.7, 1]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				opacity: entrance,
				transform: `scale(${scale})`,
			}}
		>
			<span
				style={{
					fontSize,
					fontWeight: 800,
					color,
					fontFamily: theme.fontFamily,
					fontVariantNumeric: 'tabular-nums',
					letterSpacing: -2,
					lineHeight: 1,
				}}
			>
				{prefix}
				{Math.round(countValue).toLocaleString()}
				{suffix}
			</span>
			{description && (
				<span
					style={{
						fontSize: Math.round(fontSize * 0.3),
						color: descriptionColor,
						marginTop: 16,
						fontFamily: theme.fontFamily,
					}}
				>
					{description}
				</span>
			)}
		</div>
	);
};
