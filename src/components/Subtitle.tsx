/**
 * 双语字幕通用组件
 *
 * 放在 TransitionSeries 外面，基于全局帧数计算当前应显示的句子。
 * 必须加 zIndex: 999，否则会被 TransitionSeries 内的 AbsoluteFill 场景层压住。
 *
 * ★ 自动适配横竖屏：
 * - 竖屏：字号放大、左右撑满（仅留 24px 边距）
 * - 横屏：字号适中、居中显示
 */
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {useTheme} from '../theme/context';
import {useAspectRatio} from '../hooks/useAspectRatio';

/** 单条字幕数据 */
export interface SubtitleSentence {
	/** 中文字幕 */
	text: string;
	/** 英文字幕（可选，不提供则只显示中文） */
	en?: string;
	/** 起始时间（毫秒） */
	start: number;
	/** 结束时间（毫秒） */
	end: number;
}

/**
 * 双语字幕叠加层
 *
 * 用法：放在 TransitionSeries 外面
 * ```tsx
 * <Subtitle sentences={SUBS} />
 * ```
 */
export const Subtitle: React.FC<{
	/** 字幕句子列表 */
	sentences: SubtitleSentence[];
}> = ({sentences}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const ratio = useAspectRatio();

	const isPortrait = ratio === 'portrait';

	/** 竖屏字号更大 */
	const cnFontSize = isPortrait ? 40 : 32;
	const enFontSize = isPortrait ? 34 : 28;

	/** 竖屏左右边距更小 */
	const sideMargin = isPortrait ? 24 : 60;

	const ms = (frame / fps) * 1000;

	/** +200ms 尾部缓冲，避免句子间闪烁 */
	const active = sentences.find(
		(s) => ms >= s.start && ms <= s.end + 200,
	);
	if (!active) return null;

	/** 200ms 淡入 */
	const progress = Math.min(1, (ms - active.start) / 200);
	const opacity = interpolate(progress, [0, 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const hasEn = active.en !== undefined;

	return (
		<div
			style={{
				position: 'absolute',
				bottom: isPortrait ? 40 : 60,
				left: sideMargin,
				right: sideMargin,
				opacity,
				textAlign: 'center',
				zIndex: 999,
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					display: 'inline-flex',
					flexDirection: 'column',
					alignItems: 'center',
					backgroundColor: 'rgba(0,0,0,0.6)',
					borderRadius: 12,
					padding: hasEn ? '14px 36px 12px' : '12px 32px',
					gap: hasEn ? 8 : 0,
				}}
			>
				<span
					style={{
						fontFamily: theme.fontFamily,
						fontSize: cnFontSize,
						color: 'white',
						lineHeight: 1.4,
					}}
				>
					{active.text}
				</span>
				{hasEn && (
					<>
						{/* 分隔线 */}
						<div
							style={{
								width: '60%',
								height: 1,
								backgroundColor: 'rgba(255,255,255,0.25)',
							}}
						/>
						<span
							style={{
								fontFamily: theme.fontFamily,
								fontSize: enFontSize,
								color: 'rgba(255,255,255,0.75)',
								lineHeight: 1.4,
							}}
						>
							{active.en}
						</span>
					</>
				)}
			</div>
		</div>
	);
};
