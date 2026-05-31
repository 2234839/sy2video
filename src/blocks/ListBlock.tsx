import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {useAnimationStyle} from '../animations/presets';
import {parseListItems, stripInlineMarkdown} from '../siyuan/kramdown-parser';
import {useTheme} from '../theme/context';
import type {BlockProps} from './types';

/**
 * 列表块渲染组件
 *
 * 支持有序/无序/任务列表，逐项淡入动画
 */
export const ListBlock: React.FC<BlockProps> = ({block, animation = 'fadeIn'}) => {
	const animStyle = useAnimationStyle(animation);
	const theme = useTheme();
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const items = parseListItems(block.markdown);

	return (
		<AbsoluteFill style={{padding: theme.blockPadding, boxSizing: 'border-box', ...animStyle}}>
			<ul style={{listStyle: 'none', padding: 0, margin: 0}}>
				{items.map((item, i) => {
					/** 每个列表项延迟 3 帧出现 */
					const itemOpacity = interpolate(frame - i * 3, [0, fps * 0.3], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});

					return (
						<li
							key={i}
							style={{
								...theme.list.itemStyle,
								opacity: itemOpacity,
								display: 'flex',
								alignItems: 'flex-start',
								gap: 12,
							}}
						>
							{item.checked !== undefined ? (
								<span style={{fontSize: theme.list.checkboxFontSize}}>
									{item.checked ? '✅' : '⬜'}
								</span>
							) : item.ordered ? (
								<span style={{minWidth: theme.list.orderedMinWidth}}>{i + 1}.</span>
							) : (
								<span style={{minWidth: theme.list.bulletMinWidth}}>•</span>
							)}
							<span>{stripInlineMarkdown(item.text)}</span>
						</li>
					);
				})}
			</ul>
		</AbsoluteFill>
	);
};
