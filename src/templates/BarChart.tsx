/**
 * BarChart — 动态条形图/数据可视化
 *
 * 视觉特征：
 * - 条形从底部生长动画
 * - 支持 label + 数值显示
 * - 可自定义颜色、方向（水平/垂直）
 * - 条形有 spring 弹性动画
 *
 * 适用场景：数据对比、效果展示、技术指标
 */
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';

/** 单条数据 */
interface BarData {
	/** 条形标签 */
	label: string;
	/** 数值（用于计算条形长度比例） */
	value: number;
	/** 条形颜色 */
	color: string;
	/** 显示的数值文本（如 "~50MB"），不填则显示 value */
	displayValue?: string;
}

const BarChart: React.FC<{
	/** 条形数据 */
	bars: BarData[];
	/** 方向 */
	direction?: 'horizontal' | 'vertical';
	/** 条形高度（水平模式）或宽度（垂直模式） */
	barThickness?: number;
	/** 条形间距 */
	gap?: number;
	/** 整体最大宽度/高度（px） */
	maxLength?: number;
	/** 数值最大值（用于计算比例，不填则取 bars 中最大值） */
	maxValue?: number;
	/** 入场延迟（帧） */
	delay?: number;
	/** 每条之间的 stagger 间隔帧数 */
	stagger?: number;
	/** 标签字号 */
	labelFontSize?: number;
	/** 数值字号 */
	valueFontSize?: number;
	/** 字体族 */
	fontFamily?: string;
}> = ({
	bars,
	direction = 'horizontal',
	barThickness = 48,
	gap = 16,
	maxLength = 600,
	maxValue: maxValueProp,
	delay = 0,
	stagger = 8,
	labelFontSize = 20,
	valueFontSize = 24,
	fontFamily = 'Noto Sans SC, sans-serif',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const maxValue = maxValueProp ?? Math.max(...bars.map(b => b.value));
	const isHorizontal = direction === 'horizontal';

	return (
		<div style={{
			display: 'flex',
			flexDirection: isHorizontal ? 'column' : 'row',
			gap,
			width: '100%',
		}}>
			{bars.map((bar, i) => {
				const barDelay = delay + i * stagger;
				const progress = spring({
					frame: frame - barDelay,
					fps,
					config: {damping: 200, stiffness: 150},
				});

				/** 条形长度 = 占比 × maxLength × 动画进度 */
				const barLength = (bar.value / maxValue) * maxLength * progress;

				/** 数值透明度：条形长到 80% 时才出现 */
				const valueOpacity = interpolate(progress, [0.6, 0.9], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});

				const displayText = bar.displayValue ?? bar.value.toLocaleString();

				return (
					<div
						key={bar.label}
						style={{
							display: 'flex',
							flexDirection: isHorizontal ? 'row' : 'column',
							alignItems: isHorizontal ? 'center' : 'stretch',
							gap: isHorizontal ? 12 : 8,
						}}
					>
						{/* 标签 */}
						<div style={{
							fontSize: labelFontSize,
							color: 'rgba(255,255,255,0.6)',
							fontFamily,
							whiteSpace: 'nowrap',
							minWidth: isHorizontal ? 100 : undefined,
							textAlign: isHorizontal ? 'right' : 'center',
						}}>
							{bar.label}
						</div>

						{/* 条形 */}
						<div style={{
							display: 'flex',
							alignItems: isHorizontal ? 'center' : 'flex-end',
							position: 'relative',
						}}>
							<div style={{
								width: isHorizontal ? barLength : barThickness,
								height: isHorizontal ? barThickness : barLength,
								backgroundColor: bar.color,
								borderRadius: isHorizontal ? '0 8px 8px 0' : '8px 8px 0 0',
								transition: 'none',
								boxShadow: `0 0 20px ${bar.color}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
								position: 'relative',
								overflow: 'hidden',
							}}>
								{/* 条形内部高光 */}
								<div style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									height: '40%',
									background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
									borderRadius: 'inherit',
								}} />
							</div>

							{/* 数值 */}
							<div style={{
								fontSize: valueFontSize,
								fontWeight: 700,
								color: bar.color,
								fontFamily,
								opacity: valueOpacity,
								marginLeft: isHorizontal ? 12 : 0,
								marginTop: isHorizontal ? 0 : 8,
								fontVariantNumeric: 'tabular-nums',
								whiteSpace: 'nowrap',
							}}>
								{displayText}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export {BarChart};
export type {BarData};
