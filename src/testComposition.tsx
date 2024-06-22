import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {
	AbsoluteFill,
	Audio,
	Sequence,
	Series,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {siyuanAsset} from './siyuan';
import {CoveComposition} from './composition/cover';
import {BlockComposition} from './composition/BlockCom';
export const myCompSchema = z.object({});

export const testComposition: React.FC<z.infer<typeof myCompSchema>> = ({}) => {
	const music = siyuanAsset('assets/录音 4-20240620170336-2qjjzih.m4a');
	const audioData = useAudioData(music);
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	if (!audioData) {
		return null;
	}

	const visualization = visualizeAudio({
		fps,
		frame,
		audioData,
		numberOfSamples: 16,
	});
	CoveComposition;
	return (
		<AbsoluteFill>
			<AbsoluteFill className="bg-slate-50">
				<div></div>
			</AbsoluteFill>
			<CoveComposition />
			<Series>
				{/* 封面动画播放时间 */}
				<Series.Sequence durationInFrames={fps * 1}>
					<div></div>
				</Series.Sequence>
				<Series.Sequence durationInFrames={fps * 2}>
					<BlockComposition blockId='20240622103850-90v98k8' delay={0}/>
				</Series.Sequence>
				<Series.Sequence durationInFrames={fps * 7}>
					<AbsoluteFill className="bg-gray-100 items-center justify-center">
						<Audio src={music} startFrom={60} />
						<AbsoluteFill style={{zIndex: 1}}>
							{visualization.map((v) => {
								return (
									<div
										style={{
											width: 1000 * v,
											height: 10,
											backgroundColor: 'green',
										}}
									/>
								);
							})}
						</AbsoluteFill>

						<AbsoluteFill>
							<img
								src={siyuanAsset('assets/image-20240620180007-34ak7ob.png')}
								alt=""
							/>
						</AbsoluteFill>
					</AbsoluteFill>
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
