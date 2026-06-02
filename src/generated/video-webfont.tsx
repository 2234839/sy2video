/**
 * 视频：群友没有早日知道我的开源项目，白花两万多流量费用
 *
 * 来源文档: 20260527150214-1aagcdc
 *
 * 风格：Dark Mode + Glassmorphism
 * - 聊天内容用气泡流重新演绎（不直接贴截图）
 * - 大数字计数动画强调核心数据
 * - Glassmorphism 特性卡片展示产品卖点
 * - 语音旁白驱动节奏，双语字幕
 * - 使用崮生真实头像，个人品牌一致性
 *
 * ★ 音频和字幕放在 TransitionSeries 外面：
 * - 音频用 <Sequence> 指定全局时间区间（支持多段音频）
 * - 字幕基于全局帧数计算，也放在外面
 */
import {
	AbsoluteFill,
	Audio,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	staticFile,
	Sequence,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {ThemeProvider} from '../theme/context';
import {loadNotoSansSC} from '../theme/fonts';
import {darkTheme} from '../theme/presets';
import {Subtitle} from '../components/Subtitle';

/** 清洗后旁白音频 */
const narration = staticFile('data/20260527150214-1aagcdc/narration.wav');

/** 崮生真实头像 */
const avatar = staticFile('崮生/崮生帐号头像.png');

const FPS = 24;
const TRANSITION_FRAMES = 12;

/** 场景时长（秒） */
const S1_SEC = 5;
const S2_SEC = 11;
const S3_SEC = 8;
const S4_SEC = 10;
const S5_SEC = 9;
const S6_SEC = 9;

/** 过渡 5 次 × 12 帧 */
const TRANSITION_COUNT = 5;

/** 总帧数 = 各段之和 - 过渡重叠 */
export const VIDEO_WEBFONT_DURATION =
	(S1_SEC + S2_SEC + S3_SEC + S4_SEC + S5_SEC + S6_SEC) * FPS -
	TRANSITION_FRAMES * TRANSITION_COUNT;

/**
 * ★ 音频时间区间定义
 *
 * 每份音频用 {src, startFrame, durationFrames} 描述它在全局时间轴上的位置。
 * 当前只有一段旁白，从第 0 帧开始，贯穿全片。
 * 如果有多段录音，就在这里加多条。
 */
const AUDIO_TRACKS = [
	{
		src: narration,
		/** 从第 0 帧开始 */
		startFrame: 0,
		/** 播放整个视频时长 */
		durationFrames: VIDEO_WEBFONT_DURATION,
		volume: 0.9,
	},
];

/** 颜色常量 — 告别蓝紫，使用 Crimson 暖色系 */
const C = {
	background: '#0a0a0a',
	primary: '#ffffff',
	secondary: '#94a3b8',
	tertiary: '#64748b',
	/** Crimson — 主强调 */
	accent: '#e94560',
	success: '#22c55e',
	warning: '#f59e0b',
	cardBg: 'rgba(255, 255, 255, 0.05)',
	cardBorder: 'rgba(255, 255, 255, 0.1)',
	/** Forest Night — 标题卡背景 */
	grad1: ['#0f2027', '#203a43', '#2c5364'],
	/** Charcoal Steel — 聊天/数据场景 */
	grad2: ['#111111', '#1a1a2e', '#2d2d3f'],
	/** Ember Glow — 信用背书场景 */
	grad3: ['#1a1a2e', '#16213e', '#e94560'],
	/** Moss Garden — 结尾 CTA */
	grad4: ['#0f2027', '#1b4332', '#2d6a4f'],
	/** Amber Dusk — 金额强调场景 */
	grad5: ['#1a1a2e', '#3d2c08', '#b8860b'],
	font: darkTheme.fontFamily,
};

/**
 * 双语字幕句子 — 对裁剪后音频重新 ASR 转写 → AI 翻译英文
 * 时间轴（毫秒）来自裁剪后音频的真实转写结果
 */
const SUBS = [
	{text: '今天和大家分享一个近期的事情', en: 'Today I want to share something recent', start: 720, end: 3980},
	{text: '就是我在一个技术群里面看到群友说他们之前做一个网站里面有用到那个中文字体嘛', en: 'I saw someone in a tech group say they were using Chinese fonts on their website', start: 3980, end: 11839},
	{text: '然后一个月的流量费用用了两万多块钱', en: 'And their monthly traffic cost was over 20,000 yuan', start: 11839, end: 15320},
	{text: '我这个时候就很惊讶', en: 'I was really surprised', start: 15320, end: 16660},
	{text: '这个他居然不知道我的字体裁剪项目', en: 'They didn\'t even know about my font subsetting project', start: 16660, end: 22310},
	{text: '这个项目是可以做到增量加载字体的', en: 'This project enables incremental font loading', start: 22470, end: 25490},
	{text: '两万块钱如果用我这个项目', en: 'With 20,000 yuan, using my project', start: 25490, end: 29110},
	{text: '应该能支持非常大的体量了', en: 'It could support a very large scale', start: 29110, end: 32044},
	{text: '咱们前端这块基础上还是流量费用', en: 'Frontend traffic costs are actually quite high', start: 32880, end: 37460},
	{text: '其实是一个很高的费用', en: 'It\'s really a significant expense', start: 37460, end: 39085},
	{text: '咱们还是要想办法去优化一下', en: 'We really need to find ways to optimize', start: 40150, end: 42690},
	{text: '如果你也有使用中文字体的需求', en: 'If you also need Chinese fonts', start: 42690, end: 45530},
	{text: '可以尝试一下我这个项目', en: 'Give my project a try', start: 45530, end: 47070},
	{text: '绝对是国内啊，不能说国内吧', en: 'Definitely the best in China, well, not just China', start: 47070, end: 50430},
	{text: '绝对是开源界最好的一个方案了', en: 'Definitely the best solution in the open source world', start: 50430, end: 54005},
	{text: '这是一个开源的最好方案', en: 'This is the best open source solution', start: 54710, end: 55615},
];

// ========== 通用组件 ==========

/** 聊天气泡 */
const ChatBubble: React.FC<{
	/** 消息文本 */
	text: string;
	/** 是否自己发的（右对齐） */
	isSelf: boolean;
	/** 延迟帧 */
	delay: number;
	/** 发送者名称 */
	sender?: string;
}> = ({text, isSelf, delay, sender}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {damping: 200},
	});

	const translateY = interpolate(progress, [0, 1], [40, 0]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: isSelf ? 'row-reverse' : 'row',
				alignItems: 'flex-start',
				gap: 12,
				opacity: progress,
				transform: `translateY(${translateY}px)`,
				padding: '0 60px',
			}}
		>
			{/* 头像 — 崮生用真实头像，其他人用首字母圆 */}
			{isSelf ? (
				<img
					src={avatar}
					style={{
						width: 40,
						height: 40,
						borderRadius: '50%',
						flexShrink: 0,
						border: '2px solid rgba(233, 69, 96, 0.5)',
					}}
				/>
			) : (
				<div
					style={{
						width: 40,
						height: 40,
						borderRadius: '50%',
						backgroundColor: '#475569',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 16,
						color: 'white',
						fontFamily: C.font,
						flexShrink: 0,
					}}
				>
					{sender?.[0] ?? '友'}
				</div>
			)}

			{/* 气泡 */}
			<div
				style={{
					backgroundColor: isSelf
						? 'rgba(233, 69, 96, 0.12)'
						: 'rgba(255, 255, 255, 0.06)',
					border: `1px solid ${isSelf ? 'rgba(233, 69, 96, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
					borderRadius: 16,
					padding: '12px 20px',
					maxWidth: '60%',
					backdropFilter: 'blur(10px)',
				}}
			>
				{sender && !isSelf && (
					<div
						style={{
							fontSize: 14,
							color: C.secondary,
							marginBottom: 4,
							fontFamily: C.font,
						}}
					>
						{sender}
					</div>
				)}
				<span
					style={{
						fontSize: 22,
						color: C.primary,
						lineHeight: 1.5,
						fontFamily: C.font,
					}}
				>
					{text}
				</span>
			</div>
		</div>
	);
};

/** 大数字计数 */
const StatCounter: React.FC<{
	/** 目标数字 */
	target: number;
	/** 前缀 */
	prefix?: string;
	/** 后缀 */
	suffix?: string;
	/** 描述 */
	description: string;
	/** 延迟帧 */
	delay: number;
}> = ({target, prefix = '', suffix = '', description, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {damping: 200},
	});

	const countValue = interpolate(progress, [0, 1], [0, target], {
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				opacity: progress,
				transform: `scale(${progress})`,
			}}
		>
			<span
				style={{
					fontSize: 120,
					fontWeight: 800,
					color: C.warning,
					fontFamily: C.font,
					fontVariantNumeric: 'tabular-nums',
					letterSpacing: -2,
				}}
			>
				{prefix}
				{Math.round(countValue).toLocaleString()}
				{suffix}
			</span>
			<span
				style={{
					fontSize: 36,
					color: C.secondary,
					marginTop: 16,
					fontFamily: C.font,
				}}
			>
				{description}
			</span>
		</div>
	);
};

/** 关键词标签 */
const PillBadge: React.FC<{
	/** 标签文字 */
	text: string;
	/** 延迟帧 */
	delay: number;
	/** 颜色 */
	color?: string;
}> = ({text, delay, color}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = color ?? C.accent;

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {damping: 200},
	});

	return (
		<span
			style={{
				display: 'inline-block',
				fontSize: 24,
				color: c,
				backgroundColor: `${c}18`,
				border: `1px solid ${c}40`,
				borderRadius: 999,
				padding: '8px 24px',
				fontFamily: C.font,
				opacity: progress,
				transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
			}}
		>
			{text}
		</span>
	);
};

/** Glassmorphism 特性卡片 */
const FeatureCard: React.FC<{
	/** 图标 emoji */
	icon: string;
	/** 标题 */
	title: string;
	/** 描述 */
	desc: string;
	/** 延迟帧 */
	delay: number;
}> = ({icon, title, desc, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {damping: 200},
	});

	const translateY = interpolate(progress, [0, 1], [30, 0]);

	return (
		<div
			style={{
				backgroundColor: C.cardBg,
				border: `1px solid ${C.cardBorder}`,
				borderRadius: 16,
				padding: '28px 32px',
				opacity: progress,
				transform: `translateY(${translateY}px)`,
				backdropFilter: 'blur(10px)',
			}}
		>
			<div style={{fontSize: 36, marginBottom: 12}}>{icon}</div>
			<div
				style={{
					fontSize: 24,
					fontWeight: 600,
					color: C.primary,
					marginBottom: 8,
					fontFamily: C.font,
				}}
			>
				{title}
			</div>
			<div
				style={{
					fontSize: 18,
					color: C.secondary,
					lineHeight: 1.5,
					fontFamily: C.font,
				}}
			>
				{desc}
			</div>
		</div>
	);
};

/** URL 展示 */
const UrlDisplay: React.FC<{url: string; delay: number}> = ({url, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {damping: 200},
	});

	return (
		<div
			style={{
				backgroundColor: 'rgba(255, 255, 255, 0.08)',
				border: '1px solid rgba(255, 255, 255, 0.15)',
				borderRadius: 16,
				padding: '20px 48px',
				opacity: progress,
				transform: `scale(${interpolate(progress, [0, 1], [0.9, 1])})`,
				backdropFilter: 'blur(10px)',
			}}
		>
			<span
				style={{
					fontSize: 40,
					color: C.accent,
					fontFamily: C.font,
					letterSpacing: 1,
				}}
			>
				{url}
			</span>
		</div>
	);
};

/** 标题文字（spring 入场） */
const TitleText: React.FC<{
	/** 主标题 */
	text: string;
	/** 副标题 */
	subtitle?: string;
	/** 延迟帧 */
	delay: number;
}> = ({text, subtitle, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {damping: 200},
	});

	const translateY = interpolate(progress, [0, 1], [40, 0]);

	const subtitleProgress = spring({
		frame: frame - delay - fps * 0.3,
		fps,
		config: {damping: 200},
	});

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 16,
			}}
		>
			<h1
				style={{
					fontSize: 64,
					fontWeight: 800,
					color: C.primary,
					fontFamily: C.font,
					textAlign: 'center',
					margin: 0,
					opacity: progress,
					transform: `translateY(${translateY}px)`,
				}}
			>
				{text}
			</h1>
			{subtitle && (
				<p
					style={{
						fontSize: 32,
						color: C.secondary,
						fontFamily: C.font,
						margin: 0,
						opacity: subtitleProgress,
						textAlign: 'center',
					}}
				>
					{subtitle}
				</p>
			)}
		</div>
	);
};

/** 渐变背景组件（支持三色渐变） */
const GradientBg: React.FC<{
	/** 渐变色数组（2-3色） */
	colors: string[];
	/** 角度 */
	angle?: number;
}> = ({colors, angle = 135}) => (
	<AbsoluteFill
		style={{
			background: `linear-gradient(${angle}deg, ${colors.join(', ')})`,
		}}
	/>
);

// ========== 场景组件（纯视觉，不含 Audio 和 Subtitle） ==========

/** 场景1: 标题卡 — Forest Night */
const Scene1Title: React.FC = () => (
	<AbsoluteFill>
		<GradientBg colors={C.grad1} />
		<AbsoluteFill
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '150px 120px 170px',
				boxSizing: 'border-box',
			}}
		>
			<PillBadge text="开源项目分享" delay={FPS * 0.3} />
			<div style={{height: 32}} />
			<TitleText
				text="群友不知道我的开源项目"
				subtitle="白花两万多流量费用"
				delay={FPS * 0.6}
			/>
		</AbsoluteFill>
	</AbsoluteFill>
);

/** 场景2: 聊天气泡流 — Charcoal Steel */
const Scene2Pain: React.FC = () => (
	<AbsoluteFill>
		<GradientBg colors={C.grad2} />
		<AbsoluteFill
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: 24,
				padding: '150px 0 170px',
			}}
		>
			<ChatBubble
				text="我们之前字体一个月流量搞了两万多块钱 😱"
				isSelf={false}
				sender="群友"
				delay={FPS * 0.3}
			/>
			<ChatBubble
				text="？！你们全量加载中文字体了？"
				isSelf={true}
				delay={FPS * 1.5}
			/>
			<ChatBubble
				text="对，一个中文字体几十兆，多则数百兆"
				isSelf={false}
				sender="群友"
				delay={FPS * 2.5}
			/>
			<ChatBubble
				text="1GB 流量将近五六毛钱，用户量一多账单就炸了"
				isSelf={false}
				sender="群友"
				delay={FPS * 4}
			/>
			<ChatBubble
				text="为什么不裁剪字体呢？"
				isSelf={true}
				delay={FPS * 5.5}
			/>
		</AbsoluteFill>
	</AbsoluteFill>
);

/** 场景3: 大数字 ¥20,000+ — Amber Dusk */
const Scene3Stat: React.FC = () => (
	<AbsoluteFill>
		<GradientBg colors={C.grad5} />
		<AbsoluteFill
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '150px 120px 170px',
				boxSizing: 'border-box',
			}}
		>
			<StatCounter
				target={20000}
				prefix="¥"
				suffix="+"
				description="每月字体流量费用"
				delay={FPS * 0.3}
			/>
			<div style={{height: 48}} />
			<PillBadge
				text="中文字体 = 几十 MB × 用户数"
				delay={FPS * 1.5}
				color={C.secondary}
			/>
		</AbsoluteFill>
	</AbsoluteFill>
);

/** 场景4: 推荐 webfont — Charcoal Steel */
const Scene4Solution: React.FC = () => (
	<AbsoluteFill>
		<GradientBg colors={C.grad2} />
		<AbsoluteFill
			style={{
				display: 'flex',
				flexDirection: 'row',
				padding: '150px 60px 170px',
				boxSizing: 'border-box',
				gap: 48,
			}}
		>
			{/* 左侧：聊天气泡 */}
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: 20,
				}}
			>
				<ChatBubble
					text="动态化字体子集，毫秒级裁剪速度"
					isSelf={true}
					delay={FPS * 0.3}
				/>
				<ChatBubble
					text="这个相当奈斯！"
					isSelf={false}
					sender="群友"
					delay={FPS * 2}
				/>
				<ChatBubble
					text="早用上就省钱了，好看的字体也能用上"
					isSelf={true}
					delay={FPS * 3.5}
				/>
			</div>

			{/* 右侧：特性卡片 */}
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: 16,
				}}
			>
				<FeatureCard
					icon="⚡"
					title="毫秒级裁剪速度"
					desc="Node.js 运行时字体子集化"
					delay={FPS * 1}
				/>
				<FeatureCard
					icon="📦"
					title="增量加载字体"
					desc="只加载用到的字符，大幅减少流量"
					delay={FPS * 2}
				/>
				<FeatureCard
					icon="🔧"
					title="TTF & WOFF2"
					desc="支持主流字体格式"
					delay={FPS * 3}
				/>
			</div>
		</AbsoluteFill>
	</AbsoluteFill>
);

/** 场景5: 阮一峰期刊 + 裁剪效果对比 — Ember Glow */
const Scene5Credibility: React.FC = () => (
	<AbsoluteFill>
		<GradientBg colors={C.grad3} />
		<AbsoluteFill
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '150px 120px 170px',
				boxSizing: 'border-box',
			}}
		>
			<PillBadge
				text="2020 年登上阮一峰周刊第 100 期"
				delay={FPS * 0.3}
				color={C.success}
			/>
			<div style={{height: 40}} />
			<TitleText
				text="开源界最好的字体裁剪方案"
				subtitle="不只是国内最好，是整个开源界"
				delay={FPS * 1}
			/>
			<div style={{height: 48}} />
			{/* 裁剪效果数字对比 */}
			<div style={{display: 'flex', gap: 48, alignItems: 'center'}}>
				<div style={{textAlign: 'center'}}>
					<div
						style={{
							fontSize: 56,
							fontWeight: 800,
							color: C.warning,
							fontFamily: C.font,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						~50MB
					</div>
					<div
						style={{
							fontSize: 20,
							color: C.secondary,
							fontFamily: C.font,
						}}
					>
						原始中文字体
					</div>
				</div>
				<div style={{fontSize: 48, color: C.accent}}>→</div>
				<div style={{textAlign: 'center'}}>
					<div
						style={{
							fontSize: 56,
							fontWeight: 800,
							color: C.success,
							fontFamily: C.font,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						~KB 级
					</div>
					<div
						style={{
							fontSize: 20,
							color: C.secondary,
							fontFamily: C.font,
						}}
					>
						裁剪后（仅需要的字）
					</div>
				</div>
			</div>
		</AbsoluteFill>
	</AbsoluteFill>
);

/** 场景6: 结尾 — URL + 崮生签名 — Moss Garden */
const Scene6CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const sigProgress = spring({
		frame: frame - FPS * 3,
		fps,
		config: {damping: 200},
	});

	return (
		<AbsoluteFill>
			<GradientBg colors={C.grad4} />
			<AbsoluteFill
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '150px 120px 170px',
					boxSizing: 'border-box',
					gap: 40,
				}}
			>
				<TitleText text="试试看？" delay={FPS * 0.3} />
				<UrlDisplay url="webfont.shenzilong.cn" delay={FPS * 1} />
				<PillBadge
					text="✨ 开源免费 · 毫秒级速度 · TTF & WOFF2"
					delay={FPS * 2}
					color={C.success}
				/>
				{/* ★ 崮生签名 — 真实头像 + 昵称 */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						marginTop: 16,
						opacity: sigProgress,
						transform: `translateY(${interpolate(sigProgress, [0, 1], [20, 0])}px)`,
					}}
				>
					<img
						src={avatar}
						style={{
							width: 32,
							height: 32,
							borderRadius: '50%',
							border: '1.5px solid rgba(255,255,255,0.3)',
						}}
					/>
					<span
						style={{
							fontSize: 20,
							color: C.tertiary,
							fontFamily: C.font,
						}}
					>
						崮生 · AI-native Toolmaker
					</span>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ========== 主组件 ==========

export const VideoWebfont: React.FC = () => {
	loadNotoSansSC();
	const {fps} = useVideoConfig();

	return (
		<ThemeProvider theme={darkTheme}>
			<AbsoluteFill style={{backgroundColor: C.background}}>
				{/* ★ 音频轨道 — 放在 TransitionSeries 外面，用 Sequence 指定全局时间区间 */}
				{AUDIO_TRACKS.map((track, i) => (
					<Sequence
						key={i}
						from={track.startFrame}
						durationInFrames={track.durationFrames}
					>
						<Audio src={track.src} volume={track.volume} />
					</Sequence>
				))}

				{/* ★ 字幕 — 也在外面，基于全局帧数 */}
				<Subtitle sentences={SUBS} />

				{/* 视觉场景 */}
				<TransitionSeries>
					<TransitionSeries.Sequence durationInFrames={fps * S1_SEC}>
						<Scene1Title />
					</TransitionSeries.Sequence>

					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
						presentation={fade()}
					/>

					<TransitionSeries.Sequence durationInFrames={fps * S2_SEC}>
						<Scene2Pain />
					</TransitionSeries.Sequence>

					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
						presentation={fade()}
					/>

					<TransitionSeries.Sequence durationInFrames={fps * S3_SEC}>
						<Scene3Stat />
					</TransitionSeries.Sequence>

					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
						presentation={fade()}
					/>

					<TransitionSeries.Sequence durationInFrames={fps * S4_SEC}>
						<Scene4Solution />
					</TransitionSeries.Sequence>

					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
						presentation={fade()}
					/>

					<TransitionSeries.Sequence durationInFrames={fps * S5_SEC}>
						<Scene5Credibility />
					</TransitionSeries.Sequence>

					<TransitionSeries.Transition
						timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
						presentation={fade()}
					/>

					<TransitionSeries.Sequence durationInFrames={fps * S6_SEC}>
						<Scene6CTA />
					</TransitionSeries.Sequence>
				</TransitionSeries>
			</AbsoluteFill>
		</ThemeProvider>
	);
};
