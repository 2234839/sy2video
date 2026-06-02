/**
 * 视频：群友没有早日知道我的开源项目，白花两万多流量费用
 *
 * 来源文档: 20260527150214-1aagcdc
 *
 * 风格：几何色块背景 + 故障风文字
 * - 开场 GlitchText 冲击 ¥20,000+
 * - 聊天气泡流 + 几何色块
 * - BarChart 数据可视化对比
 * - CodeTyper 终端演示
 * - GeometricShapes 大胆色块背景（替代粒子/渐变）
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
import {GlassCard} from '../templates/GlassCard';
import {AnimatedText} from '../templates/AnimatedText';
import {AnimatedCounter} from '../templates/AnimatedCounter';
import {CodeTyper} from '../templates/CodeTyper';
import {Signature} from '../templates/Signature';
import {GlitchText} from '../templates/GlitchText';
import {GeometricShapes} from '../templates/GeometricShapes';
import {BarChart} from '../templates/BarChart';
import type {BarData} from '../templates/BarChart';


/** 清洗后旁白音频 */
const narration = staticFile('data/20260527150214-1aagcdc/narration.wav');

/** 崮生真实头像 */
const avatar = staticFile('崮生/崮生帐号头像.png');

const FPS = 24;

/** 过渡帧数 — 硬切风格，更短 */
const TRANSITION_FRAMES = 8;

/** 场景时长（秒） — 更快的节奏 */
const S1_SEC = 5;
const S2_SEC = 11;
const S3_SEC = 8;
const S4_SEC = 10;
const S5_SEC = 9;
const S6_SEC = 9;

/** 过渡 5 次 */
const TRANSITION_COUNT = 5;

/** 总帧数 */
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
	background: '#080808',
	primary: '#ffffff',
	secondary: '#94a3b8',
	tertiary: '#64748b',
	/** Crimson — 主强调 */
	accent: '#e94560',
	success: '#22c55e',
	warning: '#f59e0b',
	font: darkTheme.fontFamily,

};

// ========== 尺寸主题 — 横屏/竖屏的字号和间距 ==========

/** 尺寸主题 */
interface SizeTheme {
	/** 是否竖屏 */
	isPortrait: boolean;
	/** 聊天气泡区域 */
	chat: {
		padding: string;
		maxWidth: string;
		avatarSize: number;
		avatarFontSize: number;
		senderFontSize: number;
		textFontSize: number;
	};
	/** 场景1 标题 */
	s1: {
		label: number;
		title: number;
		subtitle: number;
		counter: number;
	};
	/** 场景2 间距 */
	s2: {
		gap: number;
	};
	/** 场景3 数据 */
	s3: {
		counter: number;
		description: number;
	};
	/** 场景4 方案 */
	s4: {
		codeFontSize: number;
		emoji: number;
		cardTitle: number;
		cardDesc: number;
		direction: 'row' | 'column';
	};
	/** 场景5 对比 */
	s5: {
		label: number;
		title: number;
		barMaxLength: number;
		barThickness: number;
	};
	/** 场景6 CTA */
	s6: {
		title: number;
		url: number;
		slogan: number;
	};
}

/** 横屏尺寸（1920×1080） */
const LANDSCAPE_SIZE: SizeTheme = {
	isPortrait: false,
	chat: {padding: '0 60px', maxWidth: '65%', avatarSize: 36, avatarFontSize: 14, senderFontSize: 13, textFontSize: 20},
	s1: {label: 22, title: 48, subtitle: 28, counter: 96},
	s2: {gap: 20},
	s3: {counter: 120, description: 22},
	s4: {codeFontSize: 20, emoji: 28, cardTitle: 20, cardDesc: 15, direction: 'row'},
	s5: {label: 20, title: 42, barMaxLength: 500, barThickness: 44},
	s6: {title: 56, url: 36, slogan: 20},
};

/** 竖屏尺寸（1080×1920） */
const PORTRAIT_SIZE: SizeTheme = {
	isPortrait: true,
	chat: {padding: '0 24px', maxWidth: '85%', avatarSize: 44, avatarFontSize: 18, senderFontSize: 18, textFontSize: 30},
	s1: {label: 30, title: 44, subtitle: 38, counter: 80},
	s2: {gap: 16},
	s3: {counter: 120, description: 32},
	s4: {codeFontSize: 26, emoji: 32, cardTitle: 22, cardDesc: 18, direction: 'column'},
	s5: {label: 26, title: 38, barMaxLength: 400, barThickness: 48},
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

// ========== 场景组件 ==========

/** CodeTyper 演示代码 */
const DEMO_CODE = `npm install @aspect-build/webfont\n\nimport { subset } from 'webfont'\n\nconst font = await subset({\n  font: 'NotoSansSC.ttf',\n  text: '你好世界'\n})`;

/** 特性卡片数据 */
const FEATURES = [
	{emoji: '⚡', title: '毫秒级裁剪', desc: 'Node.js 运行时子集化'},
	{emoji: '📦', title: '增量加载', desc: '只加载用到的字符'},
	{emoji: '🔧', title: 'TTF & WOFF2', desc: '支持主流字体格式'},
] as const;

/** BarChart 数据 — 字体大小对比 */
const FONT_COMPARISON: BarData[] = [
	{label: '思源黑体 完整', value: 50, color: C.warning, displayValue: '~50 MB'},
	{label: '常用 6763 字', value: 8, color: C.accent, displayValue: '~8 MB'},
	{label: '仅用到的字', value: 0.5, color: C.success, displayValue: '~KB 级'},
];

/** 聊天气泡 */
const ChatBubble: React.FC<{
	text: string;
	isSelf: boolean;
	delay: number;
	sender?: string;
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
					<div style={{
						fontSize: s.chat.senderFontSize,
						color: C.tertiary,
						marginBottom: 4,
						fontFamily: C.font,
					}}>
						{sender}
					</div>
				)}
				<span style={{
					fontSize: s.chat.textFontSize,
					color: C.primary,
					lineHeight: 1.5,
					fontFamily: C.font,
				}}>
					{text}
				</span>
			</div>
		</div>
	);
};

// ========== 场景定义 ==========

/**
 * 场景1: Hook — 冲击开场
 * GlitchText "¥20,000+" 冲击 + 副标题
 * 背景：ParticleField + 深色底
 */
const Scene1Hook: React.FC<{s: SizeTheme}> = ({s}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	/** 副标题入场 */
	const subtitleProgress = spring({
		frame: frame - FPS * 1.5,
		fps,
		config: {damping: 200},
	});

	/** 标签入场 */
	const labelProgress = spring({
		frame: frame - FPS * 2.5,
		fps,
		config: {damping: 200},
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
			<GeometricShapes palette="ember" count={6} seed={1} opacityMultiplier={1.2} />

			{/* 主内容 */}
			<div style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 24,
				padding: '150px 60px 170px',
				boxSizing: 'border-box',
			}}>
				{/* Glitch 大数字 — 视觉冲击 */}
				<div style={{width: '100%', height: 200, position: 'relative'}}>
					<GlitchText
						text="¥20,000+"
						fontSize={s.s1.counter}
						color={C.warning}
						delay={FPS * 0.2}
						glitchDuration={25}
						fontWeight={900}
						fontFamily={C.font}
					/>
				</div>

				{/* 副标题 — spring 入场 */}
				<div style={{
					opacity: subtitleProgress,
					transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
				}}>
					<span style={{
						fontSize: s.s1.subtitle,
						color: C.secondary,
						fontFamily: C.font,
						textAlign: 'center',
					}}>
						群友白花的字体流量费用
					</span>
				</div>

				{/* 标签 */}
				<div style={{
					opacity: labelProgress,
					transform: `scale(${interpolate(labelProgress, [0, 1], [0.8, 1])})`,
					backgroundColor: 'rgba(233, 69, 96, 0.15)',
					border: '1px solid rgba(233, 69, 96, 0.3)',
					borderRadius: 100,
					padding: '6px 20px',
				}}>
					<span style={{
						fontSize: s.s1.label,
						color: C.accent,
						fontFamily: C.font,
						fontWeight: 500,
					}}>
						开源项目分享
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/**
 * 场景2: 聊天气泡流 — 痛点
 * ParticleField 背景 + ScanLines + 气泡
 */
const Scene2Pain: React.FC<{s: SizeTheme}> = ({s}) => (
	<AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
		<GeometricShapes palette="ocean" count={5} seed={2} opacityMultiplier={1.0} />

		<div style={{
			position: 'absolute',
			inset: 0,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			gap: s.s2.gap,
			width: '100%',
			padding: '150px 0 170px',
			boxSizing: 'border-box',
		}}>
			<ChatBubble s={s} text="我们之前字体一个月流量搞了两万多块钱 😱" isSelf={false} sender="群友" delay={FPS * 0.3} />
			<ChatBubble s={s} text="？！你们全量加载中文字体了？" isSelf={true} delay={FPS * 1.5} />
			<ChatBubble s={s} text="对，一个中文字体几十兆，多则数百兆" isSelf={false} sender="群友" delay={FPS * 2.8} />
			<ChatBubble s={s} text="为什么不裁剪字体呢？" isSelf={true} delay={FPS * 4.5} />
		</div>
	</AbsoluteFill>
);

/**
 * 场景3: 大数字冲击 + 描述
 * AnimatedCounter + ParticleField
 */
const Scene3Stat: React.FC<{s: SizeTheme}> = ({s}) => (
	<AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
		<GeometricShapes palette="gold" count={7} seed={3} opacityMultiplier={1.3} />

		<div style={{
			position: 'absolute',
			inset: 0,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 24,
			padding: '150px 60px 170px',
			boxSizing: 'border-box',
		}}>
			<AnimatedCounter
				target={20000}
				prefix="¥"
				suffix="+"
				fontSize={s.s3.counter}
				color={C.warning}
				description="每月字体流量费用"
				descriptionColor={C.secondary}
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
	</AbsoluteFill>
);

/**
 * 场景4: 方案介绍 — 横屏左右分栏 / 竖屏上下布局
 */
const Scene4Solution: React.FC<{s: SizeTheme}> = ({s}) => (
	<AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
		<GeometricShapes palette="moss" count={5} seed={4} opacityMultiplier={1.0} />

		<div style={{
			position: 'absolute',
			inset: 0,
			display: 'flex',
			justifyContent: 'center',
			padding: '150px 60px 170px',
			boxSizing: 'border-box',
		}}>
			{s.s4.direction === 'row' ? (
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
										<div style={{fontSize: s.s4.cardTitle, fontWeight: 600, color: C.primary, fontFamily: C.font}}>{f.title}</div>
										<div style={{fontSize: s.s4.cardDesc, color: C.secondary, fontFamily: C.font}}>{f.desc}</div>
									</div>
								</div>
							</GlassCard>
						))}
					</div>
				</div>
			) : (
				<div style={{display: 'flex', flexDirection: 'column', gap: 20, width: '100%'}}>
					<CodeTyper code={DEMO_CODE} speed={18} language="TypeScript" delay={FPS * 0.3} fontSize={s.s4.codeFontSize} />
					<div style={{display: 'flex', gap: 12, width: '100%'}}>
						{FEATURES.map((f, i) => (
							<GlassCard key={f.emoji} delay={FPS * (1 + i)} padding="16px 20px">
								<div style={{textAlign: 'center'}}>
									<span style={{fontSize: s.s4.emoji}}>{f.emoji}</span>
									<div style={{fontSize: s.s4.cardTitle, fontWeight: 600, color: C.primary, fontFamily: C.font}}>{f.title}</div>
									<div style={{fontSize: s.s4.cardDesc, color: C.secondary, fontFamily: C.font}}>{f.desc}</div>
								</div>
							</GlassCard>
						))}
					</div>
				</div>
			)}
		</div>
	</AbsoluteFill>
);

/**
 * 场景5: 信用背书 + BarChart 对比
 * 用 BarChart 替代纯数字对比 — 更有"形体感"
 */
const Scene5Credibility: React.FC<{s: SizeTheme}> = ({s}) => (
	<AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
		<GeometricShapes palette="neon" count={6} seed={5} opacityMultiplier={1.1} />

		<div style={{
			position: 'absolute',
			inset: 0,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 32,
			padding: '150px 60px 170px',
			boxSizing: 'border-box',
		}}>
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

			{/* BarChart — 字体大小对比 */}
			<div style={{marginTop: 24, width: '100%'}}>
				<BarChart
					bars={FONT_COMPARISON}
					direction="horizontal"
					barThickness={s.s5.barThickness}
					maxLength={s.s5.barMaxLength}
					maxValue={55}
					delay={FPS * 1.2}
					stagger={10}
					labelFontSize={s.s5.label}
					valueFontSize={s.s5.label + 4}
					fontFamily={C.font}
				/>
			</div>
		</div>
	</AbsoluteFill>
);

/**
 * 场景6: CTA — URL + 签名
 * 红色 ParticleField + GlitchText URL
 */
const Scene6CTA: React.FC<{s: SizeTheme}> = ({s}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const sloganProgress = spring({frame: frame - FPS * 2, fps, config: {damping: 200}});

	return (
		<AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
			<GeometricShapes palette="ember" count={6} seed={6} opacityMultiplier={1.0} />

			<div style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 32,
				padding: '150px 60px 170px',
				boxSizing: 'border-box',
			}}>
				<AnimatedText
					text="试试看？"
					mode="spring-in"
					fontSize={s.s6.title}
					delay={FPS * 0.3}
				/>

				{/* URL — 脉冲发光卡片 */}
				<div
					style={{
						backgroundColor: 'rgba(233, 69, 96, 0.08)',
						border: '1px solid rgba(233, 69, 96, 0.25)',
						borderRadius: 14,
						padding: s.isPortrait ? '16px 32px' : '16px 48px',
						boxShadow: `0 0 40px rgba(233, 69, 96, ${interpolate(
							Math.sin(frame * 0.08), [-1, 1], [0.05, 0.15]
						)})`,
					}}
				>
					<span style={{
						fontSize: s.s6.url,
						color: C.accent,
						fontFamily: 'monospace',
						letterSpacing: 0.5,
						textShadow: `0 0 20px rgba(233, 69, 96, 0.4)`,
					}}>
						webfont.shenzilong.cn
					</span>
				</div>

				{/* 标语 */}
				<div style={{
					opacity: sloganProgress,
					transform: `translateY(${interpolate(sloganProgress, [0, 1], [15, 0])}px)`,
				}}>
					<span style={{
						fontSize: s.s6.slogan,
						color: C.success,
						fontFamily: C.font,
					}}>
						✨ 开源免费 · 毫秒级速度 · TTF & WOFF2
					</span>
				</div>

				<div style={{height: 24}} />

				<Signature delay={FPS * 3} />
			</div>
		</AbsoluteFill>
	);
};

// ========== 场景序列 ==========

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

/** 视频外壳 — 音频 + 字幕 + 场景序列 */
const VideoShell: React.FC<{s: SizeTheme}> = ({s}) => {
	loadNotoSansSC();

	return (
		<ThemeProvider theme={darkTheme}>
			<AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
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

/** 竖屏版本（1080×1920） */
export const VideoWebfontPortrait: React.FC = () => <VideoShell s={PORTRAIT_SIZE} />;
