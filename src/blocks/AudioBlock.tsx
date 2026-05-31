import {Audio} from 'remotion';
import {siyuanClient} from '../siyuan/client';
import type {BlockProps} from './types';

/**
 * 音频块渲染组件
 *
 * 只渲染音频（无可见 UI），音频叠加在当前分段上
 */
export const AudioBlock: React.FC<BlockProps> = ({block}) => {
	const src = siyuanClient.assetUrl(block.assets.audios[0]?.src ?? '');
	if (!src) return null;

	const config = block.sy2videoConfig;

	return (
		<Audio
			src={src}
			startFrom={config?.startTime !== undefined ? config.startTime * 24 : undefined}
			endAt={config?.endTime !== undefined ? config.endTime * 24 : undefined}
		/>
	);
};
