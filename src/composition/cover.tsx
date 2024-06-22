import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {siyuanAsset} from '../siyuan';

export const CoveComposition: React.FC = ({}) => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const opacity = interpolate(frame, [0, fps], [1, 0], {
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill
			className="items-center justify-center z-10"
			style={{opacity}}
		>
			<img
				src={siyuanAsset('assets/256-20240518000337-k98qxsr.ico')}
				className="rounded-full max-h-36 mb-24 -mt-20 transition-all duration-75 absolute"
				style={{marginBottom: (1 - opacity) * 10 + 20 + 'vh'}}
			/>
			<div className="text-6xl ">《在思源笔记中直接复制图片上的文字》</div>
		</AbsoluteFill>
	);
};
