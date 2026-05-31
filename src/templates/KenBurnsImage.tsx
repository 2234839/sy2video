import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

interface KenBurnsImageProps {
	/** 图片 URL */
	src: string;
	/** 缩放方向 */
	direction?: 'zoom-in' | 'zoom-out';
	/** 起始缩放比例 */
	fromScale?: number;
	/** 结束缩放比例 */
	toScale?: number;
	/** 图片适应方式 */
	objectFit?: 'cover' | 'contain';
}

/**
 * Ken Burns 效果图片组件
 *
 * 全屏图片 + 缓慢缩放动画，经典视频特效
 *
 * 用法：
 * ```tsx
 * <KenBurnsImage src={imageUrl} direction="zoom-in" />
 * ```
 */
export const KenBurnsImage: React.FC<KenBurnsImageProps> = ({
	src,
	direction = 'zoom-in',
	fromScale: customFrom,
	toScale: customTo,
	objectFit = 'cover',
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const fromScale = customFrom ?? (direction === 'zoom-in' ? 1 : 1.15);
	const toScale = customTo ?? (direction === 'zoom-in' ? 1.15 : 1);

	const scale = interpolate(frame, [0, durationInFrames], [fromScale, toScale]);

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit,
					transform: `scale(${scale})`,
				}}
			/>
		</AbsoluteFill>
	);
};
