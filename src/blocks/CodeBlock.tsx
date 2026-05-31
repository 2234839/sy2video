import {AbsoluteFill} from 'remotion';
import {useAnimationStyle} from '../animations/presets';
import {parseCodeBlock} from '../siyuan/kramdown-parser';
import {useTheme} from '../theme/context';
import type {BlockProps} from './types';

/**
 * 代码块渲染组件
 *
 * 使用等宽字体，深色背景，显示语言标签
 * 后续可集成 Shiki 进行语法高亮
 */
export const CodeBlock: React.FC<BlockProps> = ({block, animation = 'fadeIn'}) => {
	const animStyle = useAnimationStyle(animation);
	const theme = useTheme();
	const {lang, code} = parseCodeBlock(block.markdown);

	return (
		<AbsoluteFill style={{padding: theme.blockPadding, boxSizing: 'border-box', ...animStyle}}>
			<div
				style={{
					backgroundColor: theme.code.containerBg,
					borderRadius: theme.code.containerBorderRadius,
					overflow: 'hidden',
				}}
			>
				{lang && (
					<div
						style={{
							padding: '8px 16px',
							backgroundColor: theme.code.headerBg,
							color: theme.code.headerColor,
							fontSize: theme.code.headerFontSize,
							fontFamily: theme.code.codeStyle.fontFamily,
						}}
					>
						{lang}
					</div>
				)}
				<pre
					style={{
						padding: 24,
						margin: 0,
						...theme.code.codeStyle,
						overflow: 'hidden',
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-all',
					}}
				>
					{code}
				</pre>
			</div>
		</AbsoluteFill>
	);
};
