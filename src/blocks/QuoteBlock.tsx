import {AbsoluteFill} from 'remotion';
import {useAnimationStyle} from '../animations/presets';
import {parseBlockquote} from '../siyuan/kramdown-parser';
import {useTheme} from '../theme/context';
import type {BlockProps} from './types';

/**
 * 引用块渲染组件
 */
export const QuoteBlock: React.FC<BlockProps> = ({block, animation = 'slideInLeft'}) => {
	const animStyle = useAnimationStyle(animation);
	const theme = useTheme();
	const text = parseBlockquote(block.markdown);

	return (
		<AbsoluteFill style={{padding: theme.blockPadding, boxSizing: 'border-box', ...animStyle}}>
			<blockquote
				style={{
					borderLeft: `${theme.quote.borderLeftWidth} ${theme.quote.borderLeftColor}`,
					margin: 0,
					padding: '20px 30px',
					backgroundColor: theme.quote.backgroundColor,
					borderRadius: theme.quote.borderRadius,
				}}
			>
				<p style={{...theme.quote.style, margin: 0}}>
					{text}
				</p>
			</blockquote>
		</AbsoluteFill>
	);
};
