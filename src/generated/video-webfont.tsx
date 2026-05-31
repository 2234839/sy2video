/**
 * 视频：群友没有早日知道我的开源项目，白花两万多流量费用
 *
 * 来源文档: 20260527150214-1aagcdc
 *
 * 视觉方案：
 * - Segment 1: 标题卡片 — 深色渐变背景，制造悬念
 * - Segment 2: 痛点展示 — 聊天截图全屏 + 底部渐变遮罩叠加文字
 * - Segment 3: 方案介绍 — 左侧聊天截图 + 右侧核心卖点
 * - Segment 4: 行动号召 — 渐变背景 + 网址 + 关键数据
 */
import {
	AbsoluteFill,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {ThemeProvider} from '../theme/context';
import {loadNotoSansSC} from '../theme/fonts';
import {darkTheme} from '../theme/presets';
import {siyuanClient} from '../siyuan/client';
import {TitleCard} from '../templates/TitleCard';
import {GradientBackground} from '../templates/GradientBackground';

/** 思源资源 URL 辅助 */
const asset = (path: string) => siyuanClient.assetUrl(path);

/** 聊天截图资源路径 */
const CHAT_IMG_1 = asset(
	'assets/image-20260527150653-p0er4x6.webp',
);
const CHAT_IMG_2 = asset(
	'assets/image-20260527151536-u03ueqn.webp',
);

// ========== 各段落组件 ==========

/** Segment 1: 标题卡片 (4秒) */
const Segment1Title: React.FC = () => (
	<TitleCard
		title="群友白花了两万多"
		subtitle="字体流量费用，本可以省下的…"
		backgroundColors={['#0f0c29', '#302b63', '#24243e']}
		fontSize={72}
	/>
);

/** Segment 2: 痛点展示 — 聊天截图全屏 + 叠加文字 (6秒) */
const Segment2Pain: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	/** 截图淡入 */
	const imgOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	/** 底部文字延迟出现 */
	const textOpacity = interpolate(
		frame - fps * 1.0,
		[0, fps * 0.5],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{/* 聊天截图居中展示 */}
			<AbsoluteFill
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: imgOpacity,
				}}
			>
				<img
					src={CHAT_IMG_1}
					style={{
						maxWidth: '90%',
						maxHeight: '85%',
						objectFit: 'contain',
						borderRadius: 12,
						boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
					}}
				/>
			</AbsoluteFill>

			{/* 底部渐变遮罩 + 文字 */}
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)',
					display: 'flex',
					alignItems: 'flex-end',
					padding: '50px 80px',
					boxSizing: 'border-box',
				}}
			>
				<p
					style={{
						fontSize: 38,
						lineHeight: 1.8,
						color: '#ffffff',
						fontFamily: darkTheme.fontFamily,
						margin: 0,
						opacity: textOpacity,
					}}
				>
					一位群友说，他们之前字体流量一个月花了两万多块钱。
					中文字体动辄几十上百 MB，用户量一多，流量账单就炸了。
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Segment 3: 方案介绍 — 左图右文 (6秒) */
const Segment3Solution: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	/** 卖点逐条出现 */
	const item1Progress = spring({
		frame: frame - fps * 0.5,
		fps,
		config: {damping: 15},
		durationInFrames: fps * 0.4,
	});
	const item1Y = interpolate(item1Progress, [0, 1], [30, 0]);

	const item2Progress = spring({
		frame: frame - fps * 1.5,
		fps,
		config: {damping: 15},
		durationInFrames: fps * 0.4,
	});
	const item2Y = interpolate(item2Progress, [0, 1], [30, 0]);

	const item3Progress = spring({
		frame: frame - fps * 2.5,
		fps,
		config: {damping: 15},
		durationInFrames: fps * 0.4,
	});
	const item3Y = interpolate(item3Progress, [0, 1], [30, 0]);

	return (
		<AbsoluteFill style={{display: 'flex', flexDirection: 'row'}}>
			{/* 左侧：聊天截图 */}
			<div
				style={{
					flex: 0.55,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#111',
					position: 'relative',
				}}
			>
				<img
					src={CHAT_IMG_2}
					style={{
						maxWidth: '92%',
						maxHeight: '88%',
						objectFit: 'contain',
						borderRadius: 8,
					}}
				/>
			</div>

			{/* 右侧：核心卖点 */}
			<GradientBackground colors={['#1a1a2e', '#16213e']}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						padding: '50px 60px',
						height: '100%',
						boxSizing: 'border-box',
						gap: 32,
					}}
				>
					<div
						style={{
							opacity: item1Progress,
							transform: `translateY(${item1Y}px)`,
						}}
					>
						<h2
							style={{
								fontSize: 34,
								color: '#60a5fa',
								fontFamily: darkTheme.fontFamily,
								margin: '0 0 8px 0',
							}}
						>
							⚡ 毫秒级裁剪
						</h2>
						<p
							style={{
								fontSize: 24,
								color: '#d4d4d4',
								fontFamily: darkTheme.fontFamily,
								margin: 0,
								lineHeight: 1.6,
							}}
						>
							动态字体子集化，只加载用到的字符，大幅缩减文件体积
						</p>
					</div>

					<div
						style={{
							opacity: item2Progress,
							transform: `translateY(${item2Y}px)`,
						}}
					>
						<h2
							style={{
								fontSize: 34,
								color: '#34d399',
								fontFamily: darkTheme.fontFamily,
								margin: '0 0 8px 0',
							}}
						>
							📦 多格式支持
						</h2>
						<p
							style={{
								fontSize: 24,
								color: '#d4d4d4',
								fontFamily: darkTheme.fontFamily,
								margin: 0,
								lineHeight: 1.6,
							}}
						>
							支持 TTF 和 WOFF2 格式，兼容各种使用场景
						</p>
					</div>

					<div
						style={{
							opacity: item3Progress,
							transform: `translateY(${item3Y}px)`,
						}}
					>
						<h2
							style={{
								fontSize: 34,
								color: '#f59e0b',
								fontFamily: darkTheme.fontFamily,
								margin: '0 0 8px 0',
							}}
						>
							🏆 2020 年阮一峰推荐
						</h2>
						<p
							style={{
								fontSize: 24,
								color: '#d4d4d4',
								fontFamily: darkTheme.fontFamily,
								margin: 0,
								lineHeight: 1.6,
							}}
						>
							开源项目，已服务大量用户，稳定可靠
						</p>
					</div>
				</div>
			</GradientBackground>
		</AbsoluteFill>
	);
};

/** Segment 4: 行动号召 — 网址 + 关键数据 (4秒) */
const Segment4CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	/** 网址弹入 */
	const urlProgress = spring({
		frame,
		fps,
		config: {damping: 12, mass: 0.8},
		durationInFrames: fps * 0.6,
	});
	const urlScale = interpolate(urlProgress, [0, 1], [0.8, 1]);

	/** 副文字延迟 */
	const subOpacity = interpolate(
		frame - fps * 0.5,
		[0, fps * 0.4],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<GradientBackground colors={['#0f0c29', '#302b63', '#24243e']} animated>
			<AbsoluteFill
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 24,
				}}
			>
				<p
					style={{
						fontSize: 28,
						color: 'rgba(255,255,255,0.6)',
						fontFamily: darkTheme.fontFamily,
						margin: 0,
						opacity: subOpacity,
					}}
				>
					早用上就省下两万块了
				</p>

				<p
					style={{
						fontSize: 64,
						fontWeight: 'bold',
						color: '#60a5fa',
						fontFamily: darkTheme.fontFamily,
						margin: 0,
						transform: `scale(${urlScale})`,
						opacity: urlProgress,
						letterSpacing: 1,
					}}
				>
					webfont.shenzilong.cn
				</p>

				<p
					style={{
						fontSize: 26,
						color: 'rgba(255,255,255,0.5)',
						fontFamily: darkTheme.fontFamily,
						margin: 0,
						opacity: subOpacity,
					}}
				>
					动态化字体子集，毫秒级裁剪，完全开源
				</p>
			</AbsoluteFill>
		</GradientBackground>
	);
};

// ========== 完整视频组合 ==========

/**
 * webfont 开源项目宣传视频
 *
 * 4 个段落，fade/slide 过渡
 */
export const VideoWebfont: React.FC = () => {
	loadNotoSansSC();
	const {fps} = useVideoConfig();

	return (
		<ThemeProvider theme={darkTheme}>
			<AbsoluteFill>
				<TransitionSeries>
					{/* Segment 1: 标题卡片 4秒 */}
					<TransitionSeries.Sequence durationInFrames={fps * 4}>
						<Segment1Title />
					</TransitionSeries.Sequence>

					{/* 过渡: fade */}
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: 15})}
						presentation={fade()}
					/>

					{/* Segment 2: 痛点展示 6秒 */}
					<TransitionSeries.Sequence durationInFrames={fps * 6}>
						<Segment2Pain />
					</TransitionSeries.Sequence>

					{/* 过渡: slide */}
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: 15})}
						presentation={slide()}
					/>

					{/* Segment 3: 方案介绍 6秒 */}
					<TransitionSeries.Sequence durationInFrames={fps * 6}>
						<Segment3Solution />
					</TransitionSeries.Sequence>

					{/* 过渡: fade */}
					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: 15})}
						presentation={fade()}
					/>

					{/* Segment 4: 行动号召 4秒 */}
					<TransitionSeries.Sequence durationInFrames={fps * 4}>
						<Segment4CTA />
					</TransitionSeries.Sequence>
				</TransitionSeries>
			</AbsoluteFill>
		</ThemeProvider>
	);
};

/** 总时长 = 4+6+6+4 = 20秒，减去 3×15帧过渡 = 20*24-45 = 435帧 */
export const VIDEO_WEBFONT_DURATION = 20 * 24 - 45;
