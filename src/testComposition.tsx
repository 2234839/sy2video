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
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
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
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={fps * 1}>
					<CoveComposition />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={slide({direction: 'from-right'})}
					timing={linearTiming({durationInFrames: fps/2})}
				/>
				<TransitionSeries.Sequence durationInFrames={fps * 4}>
					<BlockComposition blockId="20240622103850-90v98k8" delay={6_000} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={slide({direction: 'from-right'})}
					timing={linearTiming({durationInFrames: fps})}
				/>
				<TransitionSeries.Sequence durationInFrames={fps * 7}>
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
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
