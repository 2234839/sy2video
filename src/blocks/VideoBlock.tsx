import {AbsoluteFill, Video, useVideoConfig} from 'remotion';
import {siyuanClient} from '../siyuan/client';
import type {BlockProps} from './types';

/**
 * 视频块渲染组件
 *
 * 使用 Remotion <Video> 渲染，支持 startTime/endTime 裁剪
 */
export const VideoBlock: React.FC<BlockProps> = ({block}) => {
	const {fps} = useVideoConfig();
	const src = siyuanClient.assetUrl(block.assets.videos[0]?.src ?? '');
	if (!src) return null;

	const config = block.sy2videoConfig;

	return (
		<AbsoluteFill>
			<Video
				src={src}
				style={{width: '100%', height: '100%', objectFit: 'contain'}}
				startFrom={config?.startTime !== undefined ? config.startTime * fps : undefined}
				endAt={config?.endTime !== undefined ? config.endTime * fps : undefined}
			/>
		</AbsoluteFill>
	);
};
