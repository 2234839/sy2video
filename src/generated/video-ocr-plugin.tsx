/**
 * 视频：在思源笔记中直接复制图片上的文字（OCR 插件介绍）
 *
 * 来源文档: 20240620185326-hl2ywbv
 *
 * 视觉方案：
 * - Segment 1: 标题卡片 — 深色渐变背景 + 主标题
 * - Segment 2: 开场介绍 — 全屏图片 + 叠加旁白文字
 * - Segment 3: 特色介绍 — 左图右文分屏
 * - Segment 4: 演示展示 — 左视频右文字
 */
import {AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {ThemeProvider} from '../theme/context';
import {loadNotoSansSC} from '../theme/fonts';
import {darkTheme} from '../theme/presets';
import {siyuanClient} from '../siyuan/client';
import {KenBurnsImage} from '../templates/KenBurnsImage';
import {TitleCard} from '../templates/TitleCard';
import {SplitLayout} from '../templates/SplitLayout';
import {GradientBackground} from '../templates/GradientBackground';

/** 思源资源 URL 辅助函数 */
const asset = (path: string) => siyuanClient.assetUrl(path);

// ========== 各段落组件 ==========

/** Segment 1: 标题卡片 (5秒) */
const Segment1Title: React.FC = () => (
	<TitleCard
		title="在思源笔记中直接复制图片上的文字"
		subtitle="OCR 插件介绍"
		backgroundColors={['#0f0c29', '#302b63', '#24243e']}
		fontSize={64}
	/>
);

/** Segment 2: 开场介绍 — 全屏图片 + 叠加文字 (8秒) */
const Segment2Intro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const textOpacity = interpolate(frame - fps * 0.5, [0, fps * 0.5], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill>
			<KenBurnsImage
				src={asset('assets/8060262748902705170_387482509_24-06-2024-02-27-29-20240624172800-tka9uug.jpeg')}
				direction="zoom-in"
			/>
			<AbsoluteFill
				style={{
					background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
					display: 'flex',
					alignItems: 'flex-end',
					padding: '60px 80px',
					boxSizing: 'border-box',
				}}
			>
				<p
					style={{
						fontSize: 42,
						lineHeight: 1.8,
						color: '#ffffff',
						fontFamily: darkTheme.fontFamily,
						margin: 0,
						opacity: textOpacity,
						maxWidth: '70%',
					}}
				>
					你是否曾经为手动输入图片上的文字而烦恼？思源笔记的新插件来了！现在，你可以轻松从图片中提取文字，快速复制到笔记中。
				</p>
			</AbsoluteFill>
			<Audio src={asset('assets/7月27日 16点02分-20240727160549-1hy91fv.m4a')} />
		</AbsoluteFill>
	);
};

/** Segment 3: 特色介绍 — 左图右文 (8秒) */
const Segment3Features: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	/** 两条特色逐条出现 */
	const item1Opacity = interpolate(frame - fps * 0.3, [0, fps * 0.4], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const item1Y = interpolate(frame - fps * 0.3, [0, fps * 0.4], [30, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const item2Opacity = interpolate(frame - fps * 0.8, [0, fps * 0.4], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const item2Y = interpolate(frame - fps * 0.8, [0, fps * 0.4], [30, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SplitLayout
			ratio={0.5}
			left={
				<KenBurnsImage
					src={asset('assets/68747470733a2f2f74757069616e2e6c692f696d616765732f323032332f31312f31392f363535393930393761623566342e706e67-1-20240727161108-c74j4mn.png')}
					direction="zoom-out"
				/>
			}
			right={
				<GradientBackground colors={['#1a1a2e', '#16213e']}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							padding: '60px 80px',
							height: '100%',
							boxSizing: 'border-box',
							gap: 40,
						}}
					>
						<div style={{opacity: item1Opacity, transform: `translateY(${item1Y}px)`}}>
							<h2 style={{fontSize: 36, color: '#60a5fa', fontFamily: darkTheme.fontFamily, margin: '0 0 12px 0'}}>
								✅ 本地化
							</h2>
							<p style={{fontSize: 28, color: '#d4d4d4', fontFamily: darkTheme.fontFamily, margin: 0, lineHeight: 1.6}}>
								支持 umi-ocr 本地 OCR 识别，准确率超高，不用担心隐私图片上传。
							</p>
						</div>
						<div style={{opacity: item2Opacity, transform: `translateY(${item2Y}px)`}}>
							<h2 style={{fontSize: 36, color: '#60a5fa', fontFamily: darkTheme.fontFamily, margin: '0 0 12px 0'}}>
								🔗 无缝集成
							</h2>
							<p style={{fontSize: 28, color: '#d4d4d4', fontFamily: darkTheme.fontFamily, margin: 0, lineHeight: 1.6}}>
								与思源笔记完美融合，操作简单，无需切换应用。
							</p>
						</div>
					</div>
				</GradientBackground>
			}
		/>
	);
};

/** Segment 4: 演示展示 — 左视频右文字 (8秒) */
const Segment4Demo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const textProgress = spring({
		frame: frame - fps * 0.3,
		fps,
		config: {damping: 15},
		durationInFrames: fps * 0.5,
	});
	const textY = interpolate(textProgress, [0, 1], [40, 0]);

	return (
		<SplitLayout
			ratio={0.6}
			left={
				<AbsoluteFill style={{backgroundColor: '#000'}}>
					<video
						src={asset('assets/20240626-1217-58.9070625-20240626201830-n40fq94.mp4')}
						style={{width: '100%', height: '100%', objectFit: 'contain'}}
						muted
						autoPlay
					/>
				</AbsoluteFill>
			}
			right={
				<GradientBackground colors={['#1e293b', '#0f172a']}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							padding: '60px',
							height: '100%',
							boxSizing: 'border-box',
						}}
					>
						<h2 style={{fontSize: 36, color: '#f59e0b', fontFamily: darkTheme.fontFamily, margin: '0 0 20px 0'}}>
							⚡ 一键识别
						</h2>
						<p
							style={{
								fontSize: 28,
								color: '#e2e8f0',
								fontFamily: darkTheme.fontFamily,
								margin: 0,
								lineHeight: 1.8,
								transform: `translateY(${textY}px)`,
								opacity: textProgress,
							}}
						>
							打开图片菜单，点击 OceanPress OCR 按钮，几秒钟之后图片上的文字就识别完毕了，现在就可以直接从图片中复制文本粘贴到其他地方了。
						</p>
					</div>
				</GradientBackground>
			}
		/>
	);
};

// ========== 完整视频组合 ==========

/**
 * OCR 插件介绍视频
 *
 * 4 个段落，fade/slide 过渡
 */
export const VideoOcrPlugin: React.FC = () => {
	loadNotoSansSC();

	const {fps} = useVideoConfig();

	return (
		<ThemeProvider theme={darkTheme}>
			<AbsoluteFill>
				<TransitionSeries>
					{/* Segment 1: 标题卡片 5秒 */}
					<TransitionSeries.Sequence durationInFrames={fps * 5}>
						<Segment1Title />
					</TransitionSeries.Sequence>

					{/* 过渡: fade */}
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: 15})}
						presentation={fade()}
					/>

					{/* Segment 2: 开场介绍 8秒 */}
					<TransitionSeries.Sequence durationInFrames={fps * 8}>
						<Segment2Intro />
					</TransitionSeries.Sequence>

					{/* 过渡: slide */}
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: 15})}
						presentation={slide()}
					/>

					{/* Segment 3: 特色介绍 8秒 */}
					<TransitionSeries.Sequence durationInFrames={fps * 8}>
						<Segment3Features />
					</TransitionSeries.Sequence>

					{/* 过渡: fade */}
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: 15})}
						presentation={fade()}
					/>

					{/* Segment 4: 演示展示 8秒 */}
					<TransitionSeries.Sequence durationInFrames={fps * 8}>
						<Segment4Demo />
					</TransitionSeries.Sequence>
				</TransitionSeries>
			</AbsoluteFill>
		</ThemeProvider>
	);
};

/** 总时长 = 5+8+8+8 = 29秒，减去 3×15帧过渡 = 29*24-45 = 651帧 */
export const VIDEO_OCR_PLUGIN_DURATION = 29 * 24 - 45;
