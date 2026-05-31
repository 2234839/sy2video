import {AbsoluteFill} from 'remotion';
import {useAnimationStyle} from '../animations/presets';
import {parseHeading} from '../siyuan/kramdown-parser';
import {useTheme} from '../theme/context';
import type {BlockProps} from './types';

/**
 * 标题块渲染组件
 *
 * 根据 markdown 中的 # 级别映射不同字号
 */
export const HeadingBlock: React.FC<BlockProps> = ({block, animation = 'scaleIn'}) => {
	const animStyle = useAnimationStyle(animation);
	const theme = useTheme();
	const {level, text} = parseHeading(block.markdown);
	const fontSize = theme.heading.sizes[level] ?? theme.heading.sizes[3] ?? 52;

	return (
		<AbsoluteFill style={{padding: theme.blockPadding, boxSizing: 'border-box', ...animStyle}}>
			<h1 style={{fontSize, ...theme.heading.style, margin: 0}}>
				{text}
			</h1>
		</AbsoluteFill>
	);
};
