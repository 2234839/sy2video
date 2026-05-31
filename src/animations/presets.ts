import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * 动画预设类型
 */
export type AnimationPreset =
	| 'fadeIn'
	| 'slideInLeft'
	| 'slideInRight'
	| 'slideInUp'
	| 'scaleIn'
	| 'none';

/**
 * 根据预设返回 React CSS 样式对象
 *
 * 动画持续 0.5 秒（基于 24fps = 12 帧）
 */
export function useAnimationStyle(
	preset: AnimationPreset,
): React.CSSProperties {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const durationFrames = Math.round(fps * 0.5);

	switch (preset) {
		case 'fadeIn':
			return {
				opacity: interpolate(frame, [0, durationFrames], [0, 1], {
					extrapolateRight: 'clamp',
				}),
			};

		case 'slideInLeft':
			return {
				opacity: interpolate(frame, [0, durationFrames], [0, 1], {
					extrapolateRight: 'clamp',
				}),
				transform: `translateX(${interpolate(frame, [0, durationFrames], [-80, 0], {extrapolateRight: 'clamp'})}px)`,
			};

		case 'slideInRight':
			return {
				opacity: interpolate(frame, [0, durationFrames], [0, 1], {
					extrapolateRight: 'clamp',
				}),
				transform: `translateX(${interpolate(frame, [0, durationFrames], [80, 0], {extrapolateRight: 'clamp'})}px)`,
			};

		case 'slideInUp':
			return {
				opacity: interpolate(frame, [0, durationFrames], [0, 1], {
					extrapolateRight: 'clamp',
				}),
				transform: `translateY(${interpolate(frame, [0, durationFrames], [60, 0], {extrapolateRight: 'clamp'})}px)`,
			};

		case 'scaleIn': {
			const scale = spring({
				frame,
				fps,
				config: {damping: 15},
				durationInFrames: durationFrames,
			});
			return {
				transform: `scale(${scale})`,
			};
		}

		case 'none':
		default:
			return {};
	}
}
