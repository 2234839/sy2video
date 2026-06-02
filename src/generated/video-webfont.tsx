/**
 * 视频：群友没有早日知道我的开源项目，白花两万多流量费用
 *
 * 来源文档: 20260527150214-1aagcdc
 *
 * 风格：Dark Mode + 干净专业（Fireship 风格）
 * - 聊天内容用气泡流重新演绎
 * - CodeTyper 模拟安装命令
 * - AnimatedCounter 大数字计数
 * - GlassCard 特性展示
 * - 语音旁白驱动节奏，双语字幕
 *
 * ★ 音频和字幕放在 TransitionSeries 外面
 * ★ 横屏/竖屏共享场景组件，通过 SizeTheme 区分尺寸
 */
import {
	AbsoluteFill,
	Audio,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	Sequence,
	staticFile,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {ThemeProvider} from '../theme/context';
import {loadNotoSansSC} from '../theme/fonts';
import {darkTheme} from '../theme/presets';
import {Subtitle} from '../components/Subtitle';
import {SceneShell} from '../templates/SceneShell';
import {GlassCard} from '../templates/GlassCard';
import {AnimatedText} from '../templates/AnimatedText';
import {AnimatedCounter} from '../templates/AnimatedCounter';
import {CodeTyper} from '../templates/CodeTyper';
import {Signature} from '../templates/Signature';

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

/** 音频轨道 */
const AUDIO_TRACKS = [
	{
		src: narration,
		startFrame: 0,
		durationFrames: VIDEO_WEBFONT_DURATION,
		volume: 0.9,
	},
];

/** 颜色常量 */
const C = {
	background: '#0a0a0a',
	primary: '#ffffff',
	secondary: '#94a3b8',
	tertiary: '#64748b',
	/** Crimson — 主强调 */
	accent: '#e94560',
	success: '#22c55e',
	warning: '#f59e0b',
	font: darkTheme.fontFamily,
	/** Forest Night */
	grad1: ['#0f2027', '#203a43', '#2c5364'],
	/** Charcoal Steel */
	grad2: ['#111111', '#1a1a2e', '#2d2d3f'],
	/** Ember Glow */
	grad3: ['#1a1a2e', '#16213e', '#e94560'],
	/** Moss Garden */
	grad4: ['#0f2027', '#1b4332', '#2d6a4f'],
	/** Amber Dusk */
	grad5: ['#1a1a2e', '#3d2c08', '#b8860b'],
};

// ========== 尺寸主题 — 横屏/竖屏的字号和间距 ==========

/** 尺寸主题：所有场景中用到的字号、间距、头像大小 */
interface SizeTheme {
	/** 是否竖屏 */
	isPortrait: boolean;
	/** 聊天气泡区域 */
	chat: {
		/** 气泡外层 padding */
		padding: string;
		/** 气泡最大宽度 */
		maxWidth: string;
		/** 头像大小 */
		avatarSize: number;
		/** 头像内文字（非自己头像的首字母） */
		avatarFontSize: number;
		/** 发送者名字号 */
		senderFontSize: number;
		/** 气泡正文字号 */
		textFontSize: number;
	};
	/** 场景1 标题 */
	s1: {
		/** 标签 "开源项目分享" */
		label: number;
		/** 主标题 */
		title: number;
		/** 副标题 */
		subtitle: number;
	};
	/** 场景2 间距 */
	s2: {
		/** 气泡间隔 */
		gap: number;
	};
	/** 场景3 大数字 */
	s3: {
		/** 计数器字号 */
		counter: number;
		/** 描述文字 */
		description: number;
	};
	/** 场景4 方案 */
	s4: {
		/** CodeTyper 字号 */
		codeFontSize: number;
		/** emoji 大小 */
		emoji: number;
		/** 卡片标题 */
		cardTitle: number;
		/** 卡片说明 */
		cardDesc: number;
		/** 布局方向 */
		direction: 'row' | 'column';
	};
	/** 场景5 对比 */
	s5: {
		/** 副标题标签 */
		label: number;
		/** 主标题 */
		title: number;
		/** 对比数字 */
		compareNumber: number;
		/** 对比标签 */
		compareLabel: number;
		/** 箭头 */
		arrow: number;
	};
	/** 场景6 CTA */
	s6: {
		/** 主标题 */
		title: number;
		/** URL 字号 */
		url: number;
		/** 底部标语 */
		slogan: number;
	};
}

/** 横屏尺寸（1920×1080） */
const LANDSCAPE_SIZE: SizeTheme = {
	isPortrait: false,
	chat: {padding: '0 60px', maxWidth: '65%', avatarSize: 36, avatarFontSize: 14, senderFontSize: 13, textFontSize: 20},
	s1: {label: 24, title: 56, subtitle: 28},
	s2: {gap: 20},
	s3: {counter: 120, description: 22},
	s4: {codeFontSize: 20, emoji: 28, cardTitle: 20, cardDesc: 15, direction: 'row'},
	s5: {label: 22, title: 48, compareNumber: 52, compareLabel: 18, arrow: 40},
	s6: {title: 56, url: 36, slogan: 20},
};

/** 竖屏尺寸（1080×1920）— 手机观看，字号更大、间距更紧凑 */
const PORTRAIT_SIZE: SizeTheme = {
	isPortrait: true,
	chat: {padding: '0 24px', maxWidth: '85%', avatarSize: 44, avatarFontSize: 18, senderFontSize: 18, textFontSize: 30},
	s1: {label: 36, title: 52, subtitle: 38},
	s2: {gap: 16},
	s3: {counter: 120, description: 32},
	s4: {codeFontSize: 26, emoji: 32, cardTitle: 22, cardDesc: 18, direction: 'column'},
	s5: {label: 30, title: 44, compareNumber: 56, compareLabel: 28, arrow: 44},
	s6: {title: 52, url: 32, slogan: 28},
};

/** 双语字幕 */
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

// ========== 场景组件（纯视觉，通过 SizeTheme 适配横竖屏） ==========

/** 特性卡片数据 */
const FEATURES = [
	{emoji: '⚡', title: '毫秒级裁剪', desc: 'Node.js 运行时子集化'},
	{emoji: '📦', title: '增量加载', desc: '只加载用到的字符'},
	{emoji: '🔧', title: 'TTF & WOFF2', desc: '支持主流字体格式'},
] as const;

/** CodeTyper 演示代码 */
const DEMO_CODE = `npm install @aspect-build/webfont\n\nimport { subset } from 'webfont'\n\nconst font = await subset({\n  font: 'NotoSansSC.ttf',\n  text: '你好世界'\n})`;

/** 聊天气泡 */
const ChatBubble: React.FC<{
	text: string;
	isSelf: boolean;
	delay: number;
	sender?: string;
	/** 尺寸主题 */
	s: SizeTheme;
}> = ({text, isSelf, delay, sender, s}) => {
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
				display: 'flex',
				flexDirection: isSelf ? 'row-reverse' : 'row',
				alignItems: 'flex-start',
				gap: 12,
				opacity: progress,
				transform: `translateY(${translateY}px)`,
				padding: s.chat.padding,
				width: '100%',
				boxSizing: 'border-box',
			}}
		>
			{/* 头像 */}
			{isSelf ? (
				<img
					src={avatar}
					style={{
						width: s.chat.avatarSize,
						height: s.chat.avatarSize,
						borderRadius: '50%',
						flexShrink: 0,
						border: '1.5px solid rgba(233, 69, 96, 0.4)',
					}}
				/>
			) : (
				<div
					style={{
						width: s.chat.avatarSize,
						height: s.chat.avatarSize,
						borderRadius: '50%',
						backgroundColor: '#334155',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: s.chat.avatarFontSize,
						color: '#94a3b8',
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
						? 'rgba(233, 69, 96, 0.1)'
						: 'rgba(255, 255, 255, 0.05)',
					border: `1px solid ${isSelf ? 'rgba(233, 69, 96, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
					borderRadius: 14,
					padding: '10px 18px',
					maxWidth: s.chat.maxWidth,
				}}
			>
				{sender && !isSelf && (
					<div
						style={{
							fontSize: s.chat.senderFontSize,
							color: C.tertiary,
							marginBottom: 4,
							fontFamily: C.font,
						}}
					>
						{sender}
					</div>
				)}
				<span
					style={{
						fontSize: s.chat.textFontSize,
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

/** 场景1: Hook — 砸问题 */
const Scene1Hook: React.FC<{s: SizeTheme}> = ({s}) => (
	<SceneShell gradientColors={C.grad1}>
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
			<AnimatedText
				text="开源项目分享"
				mode="spring-in"
				fontSize={s.s1.label}
				color={C.accent}
				fontWeight={500}
				delay={FPS * 0.2}
			/>
			<AnimatedText
				text="群友不知道我的开源项目"
				mode="spring-in"
				fontSize={s.s1.title}
				delay={FPS * 0.5}
			/>
			<AnimatedText
				text="白花两万多流量费用"
				mode="slide-up"
				fontSize={s.s1.subtitle}
				color={C.secondary}
				delay={FPS * 1}
			/>
		</div>
	</SceneShell>
);

/** 场景2: 聊天气泡流 — 痛点 */
const Scene2Pain: React.FC<{s: SizeTheme}> = ({s}) => (
	<SceneShell gradientColors={C.grad2}>
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			gap: s.s2.gap,
			width: '100%',
		}}>
			<ChatBubble s={s} text="我们之前字体一个月流量搞了两万多块钱 😱" isSelf={false} sender="群友" delay={FPS * 0.3} />
			<ChatBubble s={s} text="？！你们全量加载中文字体了？" isSelf={true} delay={FPS * 1.5} />
			<ChatBubble s={s} text="对，一个中文字体几十兆，多则数百兆" isSelf={false} sender="群友" delay={FPS * 2.8} />
			<ChatBubble s={s} text="为什么不裁剪字体呢？" isSelf={true} delay={FPS * 4.5} />
		</div>
	</SceneShell>
);

/** 场景3: 大数字 ¥20,000+ */
const Scene3Stat: React.FC<{s: SizeTheme}> = ({s}) => (
	<SceneShell gradientColors={C.grad5}>
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
			<AnimatedCounter
				target={20000}
				prefix="¥"
				suffix="+"
				fontSize={s.s3.counter}
				color={C.warning}
				description="每月字体流量费用"
				delay={FPS * 0.3}
			/>
			<AnimatedText
				text="中文字体 = 几十 MB × 用户数"
				mode="slide-up"
				fontSize={s.s3.description}
				color={C.secondary}
				delay={FPS * 1.5}
			/>
		</div>
	</SceneShell>
);

/** 场景4: 方案介绍 — 横屏左右分栏 / 竖屏上下布局 */
const Scene4Solution: React.FC<{s: SizeTheme}> = ({s}) => (
	<SceneShell gradientColors={C.grad2}>
		{s.s4.direction === 'row' ? (
			/* 横屏：左右分栏 */
			<div style={{display: 'flex', gap: 48, width: '100%', alignItems: 'center'}}>
				<div style={{flex: 1}}>
					<CodeTyper code={DEMO_CODE} speed={18} language="TypeScript" delay={FPS * 0.3} fontSize={s.s4.codeFontSize} />
				</div>
				<div style={{flex: 0.7, display: 'flex', flexDirection: 'column', gap: 12}}>
					{FEATURES.map((f, i) => (
						<GlassCard key={f.emoji} delay={FPS * (1 + i)}>
							<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
								<span style={{fontSize: s.s4.emoji}}>{f.emoji}</span>
								<div>
									<div style={{fontSize: s.s4.cardTitle, fontWeight: 600, color: C.primary}}>{f.title}</div>
									<div style={{fontSize: s.s4.cardDesc, color: C.secondary}}>{f.desc}</div>
								</div>
							</div>
						</GlassCard>
					))}
				</div>
			</div>
		) : (
			/* 竖屏：上下布局 */
			<div style={{display: 'flex', flexDirection: 'column', gap: 20, width: '100%'}}>
				<CodeTyper code={DEMO_CODE} speed={18} language="TypeScript" delay={FPS * 0.3} fontSize={s.s4.codeFontSize} />
				<div style={{display: 'flex', gap: 12, width: '100%'}}>
					{FEATURES.map((f, i) => (
						<GlassCard key={f.emoji} delay={FPS * (1 + i)} padding="16px 20px">
							<div style={{textAlign: 'center'}}>
								<span style={{fontSize: s.s4.emoji}}>{f.emoji}</span>
								<div style={{fontSize: s.s4.cardTitle, fontWeight: 600, color: C.primary}}>{f.title}</div>
								<div style={{fontSize: s.s4.cardDesc, color: C.secondary}}>{f.desc}</div>
							</div>
						</GlassCard>
					))}
				</div>
			</div>
		)}
	</SceneShell>
);

/** 场景5: 信用背书 + 效果对比 */
const Scene5Credibility: React.FC<{s: SizeTheme}> = ({s}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const beforeProgress = spring({frame: frame - FPS * 1, fps, config: {damping: 200}});
	const arrowProgress = spring({frame: frame - FPS * 1.8, fps, config: {damping: 200}});
	const afterProgress = spring({frame: frame - FPS * 2.2, fps, config: {damping: 200}});

	return (
		<SceneShell gradientColors={C.grad3}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32}}>
				<AnimatedText
					text="2020 年登上阮一峰周刊第 100 期"
					mode="spring-in"
					fontSize={s.s5.label}
					color={C.success}
					fontWeight={500}
					delay={FPS * 0.3}
				/>
				<AnimatedText
					text="开源界最好的字体裁剪方案"
					mode="spring-in"
					fontSize={s.s5.title}
					delay={FPS * 0.6}
				/>

				{/* 效果对比 */}
				<div style={{display: 'flex', gap: 48, alignItems: 'center', marginTop: 24}}>
					<div style={{textAlign: 'center', opacity: beforeProgress}}>
						<div style={{
							fontSize: s.s5.compareNumber, fontWeight: 800, color: C.warning,
							fontFamily: C.font, fontVariantNumeric: 'tabular-nums',
						}}>
							~50MB
						</div>
						<div style={{fontSize: s.s5.compareLabel, color: C.secondary, fontFamily: C.font}}>
							原始中文字体
						</div>
					</div>

					<div style={{fontSize: s.s5.arrow, color: C.accent, opacity: arrowProgress}}>
						→
					</div>

					<div style={{textAlign: 'center', opacity: afterProgress}}>
						<div style={{
							fontSize: s.s5.compareNumber, fontWeight: 800, color: C.success,
							fontFamily: C.font, fontVariantNumeric: 'tabular-nums',
						}}>
							~KB 级
						</div>
						<div style={{fontSize: s.s5.compareLabel, color: C.secondary, fontFamily: C.font}}>
							裁剪后（仅需要的字）
						</div>
					</div>
				</div>
			</div>
		</SceneShell>
	);
};

/** 场景6: CTA — URL + 签名 */
const Scene6CTA: React.FC<{s: SizeTheme}> = ({s}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const urlProgress = spring({frame: frame - FPS * 1, fps, config: {damping: 200}});

	return (
		<SceneShell gradientColors={C.grad4}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32}}>
				<AnimatedText
					text="试试看？"
					mode="spring-in"
					fontSize={s.s6.title}
					delay={FPS * 0.3}
				/>

				{/* URL 展示 */}
				<div
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.06)',
						border: '1px solid rgba(255, 255, 255, 0.12)',
						borderRadius: 14,
						padding: s.isPortrait ? '16px 32px' : '16px 48px',
						opacity: urlProgress,
						transform: `scale(${urlProgress})`,
					}}
				>
					<span style={{
						fontSize: s.s6.url,
						color: C.accent,
						fontFamily: C.font,
						letterSpacing: 0.5,
					}}>
						webfont.shenzilong.cn
					</span>
				</div>

				<AnimatedText
					text="✨ 开源免费 · 毫秒级速度 · TTF & WOFF2"
					mode="slide-up"
					fontSize={s.s6.slogan}
					color={C.success}
					delay={FPS * 2}
				/>

				<div style={{height: 24}} />

				<Signature delay={FPS * 3} />
			</div>
		</SceneShell>
	);
};

// ========== 场景序列 — 横屏/竖屏通用 ==========

/** 场景序列（纯视觉） */
const SceneSequence: React.FC<{s: SizeTheme}> = ({s}) => {
	const {fps} = useVideoConfig();

	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={fps * S1_SEC}>
				<Scene1Hook s={s} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
				presentation={fade()}
			/>

			<TransitionSeries.Sequence durationInFrames={fps * S2_SEC}>
				<Scene2Pain s={s} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
				presentation={fade()}
			/>

			<TransitionSeries.Sequence durationInFrames={fps * S3_SEC}>
				<Scene3Stat s={s} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
				presentation={fade()}
			/>

			<TransitionSeries.Sequence durationInFrames={fps * S4_SEC}>
				<Scene4Solution s={s} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
				presentation={fade()}
			/>

			<TransitionSeries.Sequence durationInFrames={fps * S5_SEC}>
				<Scene5Credibility s={s} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
				presentation={fade()}
			/>

			<TransitionSeries.Sequence durationInFrames={fps * S6_SEC}>
				<Scene6CTA s={s} />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

// ========== 主组件 ==========

/** 视频外壳 — 音频 + 字幕 + 场景序列，横竖屏通用 */
const VideoShell: React.FC<{s: SizeTheme}> = ({s}) => {
	loadNotoSansSC();

	return (
		<ThemeProvider theme={darkTheme}>
			<AbsoluteFill style={{backgroundColor: C.background}}>
				{/* ★ 音频 — TransitionSeries 外面 */}
				{AUDIO_TRACKS.map((track, i) => (
					<Sequence
						key={i}
						from={track.startFrame}
						durationInFrames={track.durationFrames}
					>
						<Audio src={track.src} volume={track.volume} />
					</Sequence>
				))}

				{/* ★ 字幕 — TransitionSeries 外面 */}
				<Subtitle sentences={SUBS} />

				{/* 场景 */}
				<SceneSequence s={s} />
			</AbsoluteFill>
		</ThemeProvider>
	);
};

/** 横屏版本（1920×1080） */
export const VideoWebfont: React.FC = () => <VideoShell s={LANDSCAPE_SIZE} />;

/** 竖屏版本（1080×1920）— 手机观看 */
export const VideoWebfontPortrait: React.FC = () => <VideoShell s={PORTRAIT_SIZE} />;
