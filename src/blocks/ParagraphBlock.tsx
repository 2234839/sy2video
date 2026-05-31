import {AbsoluteFill} from 'remotion';
import {useAnimationStyle} from '../animations/presets';
import {stripInlineMarkdown} from '../siyuan/kramdown-parser';
import {useTheme} from '../theme/context';
import type {BlockProps} from './types';

/**
 * 段落块渲染组件
 *
 * 渲染纯文本段落，支持粗体/斜体/链接等内联标记的纯文本展示
 */
export const ParagraphBlock: React.FC<BlockProps> = ({block, animation = 'fadeIn'}) => {
	const animStyle = useAnimationStyle(animation);
	const theme = useTheme();
	const text = stripInlineMarkdown(block.markdown);

	return (
		<AbsoluteFill style={{padding: theme.blockPadding, boxSizing: 'border-box', ...animStyle}}>
			<p style={{...theme.paragraph.style, margin: 0}}>
				{text}
			</p>
		</AbsoluteFill>
	);
};
