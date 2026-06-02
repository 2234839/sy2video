import {AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, Sequence, staticFile, Img} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {ThemeProvider} from '../theme/context';
import {loadNotoSansSC} from '../theme/fonts';
import {darkTheme} from '../theme/presets';
import {siyuanClient} from '../siyuan/client';
import {TitleCard} from '../templates/TitleCard';
import {TextReveal} from '../templates/TextReveal';

/** 思源资源 URL 辅助 */
const asset = (p: string) => siyuanClient.assetUrl(p);

/** 通过 staticFile 访问 data 目录中的缓存音频 */
const dataAudio = (name: string) => staticFile(`data/20240620185326-hl2ywbv/${name}`);
const audio1 = dataAudio('7月27日 16点02分-20240727160549-1hy91fv.m4a');
const audio2 = dataAudio('7月27日 16点08分-20240727160935-vnxthx6.m4a');
const audio3 = dataAudio('7月27日 16点11分2-20240727161201-gy0q5ml.m4a');

/**
 * 场景时长（秒）= 音频时长 + 少量缓冲
 * audio1: 16.1s, audio2: 11.7s, audio3: 8.6s
 * 过渡: 15帧 × 2次 = 30帧
 */
const FPS = 24;
const SCENE1_SEC = 17;
const SCENE2_SEC = 13;
const SCENE3_SEC = 10;
const TRANSITION_FRAMES = 15;

/** 总帧数 = 各段之和 - 过渡重叠 */
export const VIDEO_OCR_PLUGIN_DURATION = (SCENE1_SEC + SCENE2_SEC + SCENE3_SEC) * FPS - TRANSITION_FRAMES * 2;

/**
 * 截图滑入组件：从右侧滑入居中展示，带投影
 */
const SlideInImage: React.FC<{
	src: string;
	/** 延迟帧数 */
	delay: number;
	/** 图片展示宽度 */
	width: number;
}> = ({src, delay, width}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = interpolate(frame - delay, [0, fps * 0.5], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const translateX = interpolate(progress, [0, 1], [200, 0]);
	const opacity = progress;

	return (
		<div style={{
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: `translate(-50%, -50%) translateX(${translateX}px)`,
			opacity,
		}}>
			<Img
				src={src}
				style={{
					width,
					borderRadius: 12,
					boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
				}}
			/>
		</div>
	);
};

/** 字幕组件：逐句显示，不带末尾标点 */
const Subtitle: React.FC<{
	sentences: Array<{start: number; end: number; text: string}>;
}> = ({sentences}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const currentTimeMs = (frame / fps) * 1000;
	const activeSentence = sentences.find(
		(s) => currentTimeMs >= s.start && currentTimeMs <= s.end + 200,
	);

	if (!activeSentence) return null;

	const progress = Math.min(1, (currentTimeMs - activeSentence.start) / 200);
	const opacity = interpolate(progress, [0, 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div style={{
			position: 'absolute',
			bottom: 80,
			left: 0,
			right: 0,
			textAlign: 'center',
			opacity,
		}}>
			<span style={{
				fontFamily: darkTheme.fontFamily,
				fontSize: 36,
				color: 'white',
				backgroundColor: 'rgba(0,0,0,0.6)',
				padding: '8px 24px',
				borderRadius: 8,
			}}>
				{activeSentence.text}
			</span>
		</div>
	);
};

export const VideoOcrPlugin: React.FC = () => {
	loadNotoSansSC();
	const {fps} = useVideoConfig();

	return (
		<ThemeProvider theme={darkTheme}>
			<AbsoluteFill style={{backgroundColor: '#0f0c29'}}>
				<TransitionSeries>

					{/* === 场景1: 开场 — 标题 + 演示图片 + 旁白1 === */}
					<TransitionSeries.Sequence durationInFrames={fps * SCENE1_SEC}>
						<AbsoluteFill>
							{/* 深色渐变背景 */}
							<AbsoluteFill style={{
								background: 'linear-gradient(135deg, #0f0c29 0%, #1a1640 50%, #0f0c29 100%)',
							}} />

							{/* 标题：前 3s 显示后淡出 */}
							<Sequence durationInFrames={fps * 3}>
								<TitleCard
									title="OCR 插件的神奇之处"
									subtitle="在思源笔记中直接复制图片上的文字"
									backgroundColors={['transparent', 'transparent']}
									color="white"
									fontSize={56}
								/>
							</Sequence>

							{/* 演示图片：标题淡出后滑入 */}
							<SlideInImage
								src={asset('assets/8060262748902705170_387482509_24-06-2024-02-27-29-20240624172800-tka9uug.jpeg')}
								delay={fps * 3}
								width={800}
							/>

							{/* 字幕 */}
							<Sequence>
								<Subtitle sentences={[
									{start: 2200, end: 5800, text: '你是否曾经为手动输入图片上的文字而烦恼'},
									{start: 6600, end: 8400, text: '思源笔记的新插件来了'},
									{start: 8400, end: 11800, text: '现在你可以轻松的从图片中提取文字'},
									{start: 11800, end: 13700, text: '快速的复制到笔记中'},
									{start: 13800, end: 16100, text: '让我们一起来看看这个神奇的工具吧'},
								]} />
							</Sequence>

							<Audio src={audio1} volume={0.9} />
						</AbsoluteFill>
					</TransitionSeries.Sequence>

					{/* 过渡 */}
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
						presentation={fade()}
					/>

					{/* === 场景2: 演示 — OCR 截图 + 旁白2 === */}
					<TransitionSeries.Sequence durationInFrames={fps * SCENE2_SEC}>
						<AbsoluteFill>
							{/* 深色背景 */}
							<AbsoluteFill style={{
								background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 50%, #0f0c29 100%)',
							}} />

							{/* OCR 插件截图：居中展示 */}
							<SlideInImage
								src={asset('assets/68747470733a2f2f74757069616e2e6c692f696d616765732f323032332f31312f31392f363535393930393761623566342e706e67-1-20240727161108-c74j4mn.png')}
								delay={fps * 0.3}
								width={900}
							/>

							{/* 操作步骤标题 */}
							<Sequence from={fps * 0.5}>
								<div style={{
									position: 'absolute',
									top: 80,
									left: 0,
									right: 0,
									textAlign: 'center',
									fontFamily: darkTheme.fontFamily,
								}}>
									<TextReveal text="一键识别，简单高效" mode="typewriter" fontSize={48} color="white" />
								</div>
							</Sequence>

							{/* 字幕 */}
							<Sequence>
								<Subtitle sentences={[
									{start: 1000, end: 2100, text: '打开图片菜单'},
									{start: 2100, end: 4300, text: '点击 OceanPress OCR 按钮'},
									{start: 4300, end: 5000, text: '几秒钟之后'},
									{start: 5000, end: 7100, text: '图片上的文字就识别完毕了'},
									{start: 7100, end: 11700, text: '现在就可以直接从图片中复制文本粘贴到其他地方了'},
								]} />
							</Sequence>

							<Audio src={audio2} volume={0.9} />
						</AbsoluteFill>
					</TransitionSeries.Sequence>

					{/* 过渡 */}
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
						presentation={slide()}
					/>

					{/* === 场景3: 结尾 — 隐私安全 + 总结 === */}
					<TransitionSeries.Sequence durationInFrames={fps * SCENE3_SEC}>
						<AbsoluteFill>
							{/* 渐变背景 */}
							<AbsoluteFill style={{
								background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
							}} />

							{/* 总结文字 */}
							<div style={{
								position: 'absolute',
								top: '50%',
								transform: 'translateY(-50%)',
								left: 120,
								right: 120,
								fontFamily: darkTheme.fontFamily,
							}}>
								<TextReveal
									text="🔒 隐私安全 · 本地识别"
									mode="slide-up"
									fontSize={52}
									color="white"
								/>
								<div style={{height: 40}} />
								<TextReveal
									text="支持 Umi-OCR 本地引擎"
									mode="slide-up"
									fontSize={36}
									color="rgba(255,255,255,0.8)"
								/>
								<div style={{height: 16}} />
								<TextReveal
									text="识别过程不上传任何文档"
									mode="slide-up"
									fontSize={36}
									color="rgba(255,255,255,0.8)"
								/>
							</div>

							{/* 字幕 */}
							<Sequence>
								<Subtitle sentences={[
									{start: 1200, end: 5900, text: '插件支持使用 Umi-OCR 进行本地识别'},
									{start: 5900, end: 6900, text: '没有上传文档'},
									{start: 6900, end: 8200, text: '保证隐私安全'},
								]} />
							</Sequence>

							<Audio src={audio3} volume={0.9} />
						</AbsoluteFill>
					</TransitionSeries.Sequence>

				</TransitionSeries>
			</AbsoluteFill>
		</ThemeProvider>
	);
};
