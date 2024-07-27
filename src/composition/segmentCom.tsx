import {useMemo} from 'react';
import {
	AbsoluteFill,
	Audio,
	cancelRender,
	Img,
	useVideoConfig,
	Video,
} from 'remotion';
import {BlockComposition} from './BlockCom';
import {siyuanAsset} from '../siyuan';

export const SegmentComposition: React.FC<{el: HTMLElement}> = (props) => {
	const {width, height, fps, durationInFrames} = useVideoConfig();
	if (!props.el.firstChild) {
		cancelRender(new Error(`没有用于展示的块 ${props.el.innerHTML}`));
	}
	const firstChild = props.el.firstChild as HTMLElement;
	const blockId = firstChild.dataset.nodeId!;
	const audio = useMemo(() => {
		const audioEL = props.el.querySelectorAll<HTMLAudioElement>(
			`[data-type="NodeAudio"] audio`,
		);

		return [...audioEL].map((el) => ({src: siyuanAsset(el.dataset.src!)}));
	}, [props]);

	const isImg =
		0 &&
		firstChild.textContent?.replaceAll(/\s|\u200b/g, '').length === 0 &&
		firstChild.querySelector('img');
	const url = siyuanAsset(firstChild.querySelector('img')?.dataset.src ?? '');
	const isVideo =
		firstChild.textContent?.replaceAll(/\s|\u200b/g, '').length === 0 &&
		firstChild.querySelector('video');
	const videoUrl = siyuanAsset(
		firstChild.querySelector('video')?.dataset.src ?? '',
	);

	const sy2videoConfig =
		firstChild.attributes.getNamedItem('custom-sy2video')?.value;
	const config: {
		/** 总播放时长 */
		startTime?: number;
		endTime?: number;
	} = JSON.parse(sy2videoConfig || '{}');

	console.log('[segment config]', config);

	return (
		<AbsoluteFill className="bg-gray-100 items-center justify-center">
			{isImg ? (
				<Img src={url} />
			) : isVideo ? (
				<Video
					src={videoUrl}
					startFrom={
						config.startTime !== undefined ? config.startTime * fps : undefined
					}
					endAt={
						config.endTime !== undefined ? config.endTime * fps : undefined
					}
				/>
			) : (
				<BlockComposition blockId={blockId} delay={5_000} />
			)}

			{audio.map((el) => (
				<Audio
					src={el.src}
					key={el.src}
					startFrom={
						config.startTime !== undefined ? config.startTime * fps : undefined
					}
					endAt={
						config.endTime !== undefined ? config.endTime * fps : undefined
					}
				/>
			))}
		</AbsoluteFill>
	);
};
