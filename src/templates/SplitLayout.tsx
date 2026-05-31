import {AbsoluteFill} from 'remotion';

interface SplitLayoutProps {
	/** 分割方向 */
	direction?: 'row' | 'column';
	/** 分割比例（左侧/上方占比，0-1） */
	ratio?: number;
	/** 间距 */
	gap?: number;
	/** 左/上内容 */
	left: React.ReactNode;
	/** 右/下内容 */
	right: React.ReactNode;
}

/**
 * 分屏布局组件
 *
 * 左右或上下分割，内容各占一半（或自定义比例）
 *
 * 用法：
 * ```tsx
 * <SplitLayout ratio={0.6} left={<KenBurnsImage src={url} />} right={<TextReveal text="描述" />} />
 * ```
 */
export const SplitLayout: React.FC<SplitLayoutProps> = ({
	direction = 'row',
	ratio = 0.5,
	gap = 0,
	left,
	right,
}) => {
	return (
		<AbsoluteFill>
			<div
				style={{
					display: 'flex',
					flexDirection: direction === 'row' ? 'row' : 'column',
					width: '100%',
					height: '100%',
					gap,
				}}
			>
				<div
					style={{
						flex: ratio,
						overflow: 'hidden',
						position: 'relative',
					}}
				>
					{left}
				</div>
				<div
					style={{
						flex: 1 - ratio,
						overflow: 'hidden',
						position: 'relative',
					}}
				>
					{right}
				</div>
			</div>
		</AbsoluteFill>
	);
};
