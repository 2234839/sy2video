import {useMemo} from 'react';
import {AbsoluteFill, Audio, cancelRender, Img, Video} from 'remotion';
import {BlockComposition} from './BlockCom';
import {siyuanAsset} from '../siyuan';

export const SegmentComposition: React.FC<{el: HTMLElement}> = (props) => {
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

	const isImg =0 &&
		firstChild.textContent?.replaceAll(/\s|\u200b/g, '').length === 0 &&
		firstChild.querySelector('img');
	const url = siyuanAsset(firstChild.querySelector('img')?.dataset.src ?? '');
	const isVideo =
		firstChild.textContent?.replaceAll(/\s|\u200b/g, '').length === 0 &&
		firstChild.querySelector('video');
	const videoUrl = siyuanAsset(
		firstChild.querySelector('video')?.dataset.src ?? '',
	);

	console.log('[firstChild]', videoUrl);
	return (
		<AbsoluteFill className="bg-gray-100 items-center justify-center">
			{isImg ? (
				<Img src={url} />
			) : isVideo ? (
				<Video src={videoUrl} />
			) : (
				<BlockComposition blockId={blockId} delay={5_000} />
			)}

			{audio.map((el) => (
				<Audio src={el.src} key={el.src} />
			))}
		</AbsoluteFill>
	);
};
