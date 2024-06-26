import {useMemo} from 'react';
import {AbsoluteFill, Audio, cancelRender} from 'remotion';
import {BlockComposition} from './BlockCom';
import {siyuanAsset} from '../siyuan';

export const SegmentComposition: React.FC<{el: HTMLElement}> = (props) => {
	if (!props.el.firstChild) {
		cancelRender(new Error(`没有用于展示的块 ${props.el.innerHTML}`));
	}
	const blockId = (props.el.firstChild as HTMLElement).dataset.nodeId!;
	const audio = useMemo(() => {
		const audioEL = props.el.querySelectorAll<HTMLAudioElement>(
			`[data-type="NodeAudio"] audio`,
		);

		return [...audioEL].map((el) => ({src: siyuanAsset(el.dataset.src!)}));
	}, [props]);
	return (
		<AbsoluteFill className="bg-gray-100 items-center justify-center">
			<BlockComposition blockId={blockId} delay={3_000} />
			{audio.map((el) => (
				<Audio src={el.src} />
			))}
		</AbsoluteFill>
	);
};
