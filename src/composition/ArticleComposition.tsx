import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import type {ArticleCompProps} from './schemas';
import {SegmentComposition} from './SegmentComposition';
import {ThemeProvider} from '../theme/context';
import {loadNotoSansSC} from '../theme/fonts';
import {lightTheme} from '../theme/presets';
import {DEFAULT_TRANSITION_FRAMES} from './transitions';
import type {TransitionType} from './transitions';
import type {SegmentPlan} from '../siyuan/types';

/**
 * 文章级视频组合组件
 *
 * 用 TransitionSeries 串联所有超级块分段，
 * ThemeProvider 提供全局主题
 */
export const ArticleComposition: React.FC<ArticleCompProps> = (props) => {
	const {fps} = useVideoConfig();

	/** 加载中文字体（幂等操作） */
	loadNotoSansSC();

	const theme = props.resolvedTheme ?? lightTheme;
	const transitionType = props.transition ?? 'none';
	const transitionDuration = props.transitionDurationFrames ?? DEFAULT_TRANSITION_FRAMES;
	const segments = props.segments ?? [];

	return (
		<ThemeProvider theme={theme}>
			<AbsoluteFill style={{backgroundColor: theme.background}}>
				<TransitionSeries>
					{buildSeriesItems(segments, fps, transitionType, transitionDuration)}
				</TransitionSeries>
			</AbsoluteFill>
		</ThemeProvider>
	);
};

/**
 * 根据过渡类型创建对应的 TransitionSeries.Transition
 */
function renderTransition(
	key: string,
	type: TransitionType,
	durationFrames: number,
): React.ReactNode {
	const timing = linearTiming({durationInFrames: durationFrames});

	switch (type) {
		case 'fade':
			return <TransitionSeries.Transition key={key} timing={timing} presentation={fade()} />;
		case 'slide':
			return <TransitionSeries.Transition key={key} timing={timing} presentation={slide()} />;
		case 'wipe':
			return <TransitionSeries.Transition key={key} timing={timing} presentation={wipe()} />;
		case 'none':
		default:
			return null;
	}
}

/**
 * 构建 TransitionSeries 的子元素数组（Sequence + Transition 交替）
 */
function buildSeriesItems(
	segments: SegmentPlan[],
	fps: number,
	transitionType: TransitionType,
	transitionDuration: number,
): React.ReactNode[] {
	if (!segments.length) return [];

	const items: React.ReactNode[] = [];

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];

		items.push(
			<TransitionSeries.Sequence
				key={segment.id}
				durationInFrames={fps * segment.durationSeconds}
			>
				<SegmentComposition segment={segment} layout={segment.layout} />
			</TransitionSeries.Sequence>,
		);

		/** 在分段之间插入过渡（不在最后一个之后） */
		if (i < segments.length - 1 && transitionType !== 'none') {
			items.push(renderTransition(`t-${segment.id}`, transitionType, transitionDuration));
		}
	}

	return items;
}
