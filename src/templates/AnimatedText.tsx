import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {useTheme} from '../theme/context';

/** 文字动画模式 */
export type TextMode = 'spring-in' | 'typewriter' | 'slide-up' | 'split-in';

/**
 * 增强版文字动画 — 比 TextReveal 更多模式，更精准控制
 *
 * 模式说明：
 * - `spring-in`: spring 物理弹出，适合标题
 * - `typewriter`: 逐字打字，适合代码/命令
 * - `slide-up`: 从下方滑入，适合正文/副标题
 * - `split-in`: 从中间向两侧展开，适合大标题 hook
 *
 * 用法：
 * ```tsx
 * <AnimatedText text="标题" mode="spring-in" fontSize={64} />
 * ```
 */
export const AnimatedText: React.FC<{
	/** 要显示的文字 */
	text: string;
	/** 动画模式 */
	mode?: TextMode;
	/** 字号 */
	fontSize?: number;
	/** 文字颜色 */
	color?: string;
	/** 入场延迟（帧） */
	delay?: number;
	/** 文字对齐 */
	textAlign?: 'left' | 'center' | 'right';
	/** 字重 */
	fontWeight?: number;
}> = ({
	text,
	mode = 'spring-in',
	fontSize = 48,
	color,
	delay = 0,
	textAlign = 'center',
	fontWeight = 600,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const textColor = color ?? '#ffffff';

	const f = frame - delay;

	const baseStyle: React.CSSProperties = {
		fontSize,
		fontWeight,
		color: textColor,
		fontFamily: theme.fontFamily,
		textAlign,
		lineHeight: 1.4,
		margin: 0,
	};

	switch (mode) {
		case 'spring-in': {
			const progress = spring({
				frame: f,
				fps,
				config: {damping: 200},
			});
			const scale = interpolate(progress, [0, 1], [0.8, 1]);
			const translateY = interpolate(progress, [0, 1], [30, 0]);
			return (
				<p style={{
					...baseStyle,
					opacity: progress,
					transform: `translateY(${translateY}px) scale(${scale})`,
				}}>
					{text}
				</p>
			);
		}

		case 'typewriter': {
			/** 每秒显示 N 个字符 */
			const charsPerSecond = fontSize > 40 ? 8 : 15;
			const charCount = Math.min(
				text.length,
				Math.floor(Math.max(0, f) / fps * charsPerSecond),
			);
			return (
				<p style={{...baseStyle, textAlign: 'left'}}>
					{text.slice(0, charCount)}
					{charCount < text.length && (
						<span style={{
							opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
							color: textColor,
						}}>
							▌
						</span>
					)}
				</p>
			);
		}

		case 'slide-up': {
			const progress = spring({
				frame: f,
				fps,
				config: {damping: 200},
			});
			const translateY = interpolate(progress, [0, 1], [40, 0]);
			return (
				<p style={{
					...baseStyle,
					opacity: progress,
					transform: `translateY(${translateY}px)`,
				}}>
					{text}
				</p>
			);
		}

		case 'split-in': {
			const progress = spring({
				frame: f,
				fps,
				config: {damping: 200},
			});
			const scaleX = interpolate(progress, [0, 1], [0, 1]);
			return (
				<p style={{
					...baseStyle,
					opacity: progress,
					transform: `scaleX(${scaleX})`,
					transformOrigin: 'center',
				}}>
					{text}
				</p>
			);
		}
	}
};
