import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {siyuanClient} from '../siyuan/client';
import type {BlockProps} from './types';

/**
 * 图片块渲染组件
 *
 * 使用 Remotion <Img> 渲染，支持 Ken Burns 缓慢缩放动画
 */
export const ImageBlock: React.FC<BlockProps> = ({block}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const src = siyuanClient.assetUrl(block.assets.images[0]?.src ?? '');
	if (!src) return null;

	/** Ken Burns 效果：从 100% 缓慢缩放到 115% */
	const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${scale})`,
				}}
			/>
		</AbsoluteFill>
	);
};
