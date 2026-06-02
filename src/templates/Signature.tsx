import {useCurrentFrame, useVideoConfig, spring, interpolate, staticFile} from 'remotion';
import {useTheme} from '../theme/context';

/** 崮生真实头像路径 */
const AVATAR = staticFile('崮生/崮生帐号头像.png');

/**
 * 崮生签名组件 — 视频结尾品牌标识
 *
 * 所有视频结尾复用：崮生头像 + "崮生 · AI-native Toolmaker"
 * spring 入场，保持品牌一致性。
 *
 * 用法：
 * ```tsx
 * <Signature delay={FPS * 3} />
 * ```
 */
export const Signature: React.FC<{
	/** 入场延迟（帧） */
	delay?: number;
}> = ({delay = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {damping: 200},
	});

	const translateY = interpolate(progress, [0, 1], [20, 0]);

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				opacity: progress,
				transform: `translateY(${translateY}px)`,
			}}
		>
			<img
				src={AVATAR}
				style={{
					width: 32,
					height: 32,
					borderRadius: '50%',
					border: '1.5px solid rgba(255,255,255,0.3)',
				}}
			/>
			<span
				style={{
					fontSize: 20,
					color: '#64748b',
					fontFamily: theme.fontFamily,
				}}
			>
				崮生 · AI-native Toolmaker
			</span>
		</div>
	);
};
