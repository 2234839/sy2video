import { TransitionSeries } from '@remotion/transitions';
import { useMemo } from 'react';
import {
	useVideoConfig
} from 'remotion';
import { z } from 'zod';
import { type siyuanArticleInfoRes } from '../siyuan';
import { SegmentComposition } from './segmentCom';

export const ArticleCompSchema = z.object({
	articleId: z.string(),
	// titleColor: zColor(),
	// logoColor: zColor(),
});

export const ArticleComposition: React.FC<
	z.infer<typeof ArticleCompSchema> & {
		article?: siyuanArticleInfoRes;
		segments?: {
			blockId: string;
			time: number;
		}[];
	}
> = (props) => {
	const {width, height, fps} = useVideoConfig();
	const articleDom = useMemo(() => {
		const articleDom = document.createElement('div');
		articleDom.innerHTML = props.article!.data.content;
		return articleDom;
	}, [props]);
	const segments = useMemo(() => {
		return [
			...articleDom.querySelectorAll<HTMLElement>(
				`[data-type="NodeSuperBlock"]`,
			),
		];
	}, [props]);

	return (
		<TransitionSeries style={{fontSize: 'clamp(1.5rem, 6vw, 300rem)'}}>
			{(props.segments ?? []).map((segment, i) => (
				<TransitionSeries.Sequence
					durationInFrames={fps * segment.time}
					key={segments[i].dataset.nodeId}
				>
					<SegmentComposition el={segments[i]} />
				</TransitionSeries.Sequence>
			))}
		</TransitionSeries>
	);
};
