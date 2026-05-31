import {AbsoluteFill} from 'remotion';
import type {BlockProps} from './types';
import {BlockRenderer} from './BlockRenderer';

/**
 * 超级块渲染组件
 *
 * 递归渲染子块，根据 {{{row / {{{col 布局方向进行 flexbox 排列
 */
export const SuperBlock: React.FC<BlockProps> = ({block, durationInFrames}) => {
	const layout = block.layout ?? 'row';

	return (
		<AbsoluteFill>
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
				{block.children.map((child) => (
					<div
						key={child.id}
						style={{
							flex: 1,
							minWidth: 0,
							minHeight: 0,
							overflow: 'hidden',
						}}
					>
						<BlockRenderer block={child} durationInFrames={durationInFrames} />
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};
