import {AbsoluteFill, Audio, useVideoConfig} from 'remotion';
import {BlockRenderer} from '../blocks/BlockRenderer';
import {siyuanClient} from '../siyuan/client';
import type {SegmentPlan} from '../siyuan/types';
import type {SuperBlockLayout} from '../siyuan/block-types';

/**
 * 分段渲染组件
 *
 * 渲染一个超级块分段：
 * - 超级块的子块通过 BlockRenderer 递归渲染
 * - 音频资源叠加到分段上
 */
export const SegmentComposition: React.FC<{
	segment: SegmentPlan;
	layout: SuperBlockLayout;
}> = ({segment, layout}) => {
	const {fps} = useVideoConfig();
	const {children, config} = segment;

	/** 收集所有子块中的音频 */
	const audioElements = collectAudioElements(children);

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<div
				style={{
					display: 'flex',
					flexDirection: layout === 'row' ? 'row' : 'column',
					width: '100%',
					height: '100%',
					gap: 16,
					padding: 16,
					boxSizing: 'border-box',
				}}
			>
				{children.map((child) => (
					<div
						key={child.id}
						style={{
							flex: 1,
							minWidth: 0,
							minHeight: 0,
							overflow: 'hidden',
							position: 'relative',
						}}
					>
						<BlockRenderer
							block={child}
							durationInFrames={fps * segment.durationSeconds}
						/>
					</div>
				))}
			</div>

			{/* 音频叠加 */}
			{audioElements.map((audio, i) => (
				<Audio
					key={i}
					src={siyuanClient.assetUrl(audio)}
					startFrom={config.startTime !== undefined ? config.startTime * fps : undefined}
					endAt={config.endTime !== undefined ? config.endTime * fps : undefined}
				/>
			))}
		</AbsoluteFill>
	);
};

/**
 * 递归收集所有音频资源路径
 */
function collectAudioElements(blocks: import('../siyuan/types').ParsedBlock[]): string[] {
	const result: string[] = [];
	for (const block of blocks) {
		for (const audio of block.assets.audios) {
			result.push(audio.src);
		}
		result.push(...collectAudioElements(block.children));
	}
	return result;
}
