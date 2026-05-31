import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {useTheme} from '../theme/context';

interface TextRevealProps {
	/** 要显示的文字 */
	text: string;
	/** 字号 */
	fontSize?: number;
	/** 动画模式 */
	mode?: 'fade-in' | 'typewriter' | 'slide-up' | 'word-by-word';
	/** 文字颜色（覆盖主题） */
	color?: string;
	/** 文字对齐 */
	textAlign?: 'left' | 'center' | 'right';
	/** 内边距 */
	padding?: string;
}

/**
 * 文字显示动画组件
 *
 * 支持多种文字出现动画效果
 *
 * 用法：
 * ```tsx
 * <TextReveal text="你好世界" mode="slide-up" fontSize={64} />
 * ```
 */
export const TextReveal: React.FC<TextRevealProps> = ({
	text,
	fontSize = 48,
	mode = 'fade-in',
	color,
	textAlign = 'center',
	padding = '0 120px',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const textColor = color ?? theme.paragraph.style.color;

	const containerStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
		padding,
		boxSizing: 'border-box',
		width: '100%',
		height: '100%',
	};

	const baseTextStyle: React.CSSProperties = {
		fontSize,
		lineHeight: 1.6,
		color: textColor,
		fontFamily: theme.fontFamily,
		margin: 0,
	};

	switch (mode) {
		case 'fade-in': {
			const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
				extrapolateRight: 'clamp',
			});
			return (
				<AbsoluteFill style={containerStyle}>
					<p style={{...baseTextStyle, opacity, textAlign}}>{text}</p>
				</AbsoluteFill>
			);
		}

		case 'typewriter': {
			/** 每秒显示 5 个字 */
			const charsPerSecond = 5;
			const charCount = Math.min(text.length, Math.floor(frame / fps * charsPerSecond));
			return (
				<AbsoluteFill style={containerStyle}>
					<p style={{...baseTextStyle, textAlign}}>
						{text.slice(0, charCount)}
						{charCount < text.length && <span style={{opacity: 0.3}}>|</span>}
					</p>
				</AbsoluteFill>
			);
		}

		case 'slide-up': {
			const translateY = spring({
				frame,
				fps,
				config: {damping: 15},
				durationInFrames: fps * 0.6,
			});
			const y = interpolate(translateY, [0, 1], [60, 0]);
			const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
				extrapolateRight: 'clamp',
			});
			return (
				<AbsoluteFill style={containerStyle}>
					<p style={{...baseTextStyle, textAlign, opacity, transform: `translateY(${y}px)`}}>
						{text}
					</p>
				</AbsoluteFill>
			);
		}

		case 'word-by-word': {
			const words = text.split('');
			return (
				<AbsoluteFill style={containerStyle}>
					<p style={{...baseTextStyle, textAlign}}>
						{words.map((char, i) => {
							/** 每个字符延迟 2 帧 */
							const charOpacity = interpolate(frame - i * 2, [0, fps * 0.2], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							});
							return (
								<span key={i} style={{opacity: charOpacity}}>
									{char}
								</span>
							);
						})}
					</p>
				</AbsoluteFill>
			);
		}
	}
};
