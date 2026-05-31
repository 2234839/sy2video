import {AbsoluteFill} from 'remotion';
import {useTheme} from '../theme/context';
import type {BlockProps} from './types';

/**
 * 未知块类型的降级渲染组件
 *
 * 显示块类型和原始内容，用于调试和未支持的块类型
 */
export const FallbackBlock: React.FC<BlockProps> = ({block}) => {
	const theme = useTheme();

	return (
		<AbsoluteFill
			style={{
				padding: theme.blockPadding,
				boxSizing: 'border-box',
				backgroundColor: theme.fallback.backgroundColor,
			}}
		>
			<div style={{...theme.fallback.labelStyle, marginBottom: 16}}>
				⚠ 未支持的块类型: {block.type}
			</div>
			<pre
				style={{
					...theme.fallback.contentStyle,
					whiteSpace: 'pre-wrap',
					wordBreak: 'break-all',
					margin: 0,
				}}
			>
				{block.content}
			</pre>
		</AbsoluteFill>
	);
};
