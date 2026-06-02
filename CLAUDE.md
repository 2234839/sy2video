# sy2video — AI-Native 思源笔记转视频

## 项目概述

将思源笔记文档生成为视频。AI（Claude）读取笔记内容，设计视觉方案，直接写 Remotion React 组件代码，然后渲染导出视频。

## 👤 创作者信息

- **昵称**：崮生
- **github**：[崮生](https://github.com/2234839)
- **头像**：通过 `staticFile('崮生/崮生帐号头像.png')` 引用
- **定位**：AI-native Toolmaker，专注用技术创造工具而非追逐热点
- **风格关键词**：务实、开源、工程美学

视频中的个人元素（如结尾签名、聊天头像）应使用以上信息，保持品牌一致性。

## 技术栈

- **Remotion 4.x** — React 视频框架（Rspack 打包）
- **React 19** + **TypeScript 6** + **Zod 4**
- **Tailwind CSS**（通过 @remotion/tailwind）
- **Google Fonts** — Noto Sans SC 中文字体（@remotion/google-fonts）
- 思源笔记数据通过 **SQL API** 获取，数据格式是 **kramdown**（不是 HTML）

---

## 🎨 视觉设计风格指南

### 核心风格：Dark Mode + Glassmorphism

所有视频默认使用**暗黑毛玻璃风**，这是技术类短视频最主流的视觉风格（参考 Fireship、Kurzgesagt）。

#### 配色方案

```typescript
/** 默认主题色 — 所有视频以此为基础 */
const theme = {
  /** 纯黑背景，不要用深灰 */
  background: '#0a0a0a',
  /** 毛玻璃卡片：半透明白 + 模糊 + 细边框 */
  cardBg: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  cardBlur: 'blur(10px)',
  /** 文字层级 */
  primaryText: '#ffffff',
  secondaryText: '#94a3b8',
  tertiaryText: '#64748b',
  /** 强调色 */
  accent: '#e94560',     // Crimson — 主强调（告别蓝紫）
  success: '#22c55e',    // Green — 正面数据
  warning: '#f59e0b',    // Amber — 金额/警示
};
```

#### 渐变色速查（背景用）

| 名称 | 色值 | 适用场景 |
|------|------|---------|
| Forest Night | `#0f2027` → `#203a43` → `#2c5364` | 深邃沉稳 |
| Ember Glow | `#1a1a2e` → `#16213e` → `#e94560` | 热情/警示 |
| Amber Dusk | `#1a1a2e` → `#3d2c08` → `#b8860b` | 温暖/金额 |
| Moss Garden | `#0f2027` → `#1b4332` → `#2d6a4f` | 自然/成长 |
| Wine Dark | `#1a1a2e` → `#4a0e2b` → `#7b2d52` | 奢华/高端 |
| Charcoal Steel | `#111111` → `#1a1a2e` → `#2d2d3f` | 通用暗色 |

更多渐变参考 [WebGradients](https://webgradients.com/)。

#### 动画规范

```typescript
/**
 * ★ 入场动画标准 — 所有元素入场都用 spring，不用线性动画
 *
 * damping: 200 — 标题/数字/卡片（干脆利落）
 * damping: 15  — 光标/模拟操作（自然拟人感）
 */
const scale = spring({
  frame: frame - delay,
  fps,
  config: { damping: 200 },
});

/**
 * ★ Stagger（交错入场）— 相关元素错开 8-12 帧依次入场
 */
items.map((item, i) => {
  const itemProgress = spring({
    frame: frame - (delay + i * 10),
    fps,
    config: { damping: 200 },
  });
  // ...
});
```

```typescript
/**
 * ★ 数字计数动画 — 统计/金额/百分比必须用计数动画
 */
const count = interpolate(frame, [0, duration], [0, targetValue], {
  extrapolateRight: 'clamp',
});
// 搭配 font-variant-numeric: tabular-nums 防止数字跳动
```

#### 安全区规范

- 上边距：150px
- 下边距：170px（给字幕留空间）
- 侧边距：60px
- 最小字号：28px

#### 布局模式速查

| 模式 | 适用场景 | 关键实现 |
|------|---------|---------|
| 全屏标题卡 | 章节封面/开场 | 渐变背景 + 居中大标题 + 关键词 pill 标签 |
| 左右分屏 | 截图 + 解说 | 截图用圆角+阴影模拟屏幕边框，文字侧逐条 slide-in |
| 聊天气泡流 | 聊天记录展示 | 圆角 16px，白/灰背景，逐条 slide-up+fade-in，间隔 15-20 帧 |
| 数据仪表盘 | 统计/对比/金额 | glassmorphism 卡片 + 大数字计数 + 条形图 |
| 居中大数字 | 核心数据强调 | 超大字号（120px+）+ 计数动画 + 描述文字 |

#### 聊天截图展示技巧

- 不要直接贴原始截图！用 **聊天气泡流** 重新演绎对话内容
- 气泡样式：圆角 16px，白色背景（发言者）/ 浅灰背景（其他人）
- 每条消息间隔 15-20 帧 slide-up 入场
- 右对齐 = 自己发言，左对齐 = 他人发言
- 头像用圆形占位（或彩色首字母圆）

#### 截图展示技巧

- 加圆角 12px + 阴影 `0 20px 60px rgba(0,0,0,0.5)` 模拟屏幕浮层
- 截图宽度 700-900px，不要占满画面
- 搭配深色渐变背景，截图自然凸显
- 用 slide-in 入场动画（从右滑入 200px → 居中）

---

## 项目结构

```
src/
  siyuan/              思源笔记数据层
    client.ts          SiYuanClient — SQL 查询 + 资源 URL
    kramdown-parser.ts kramdown 解析（提取文本/图片/音频/配置）
    block-types.ts     SiYuanBlockType 枚举 + parseSuperBlockLayout
    types.ts           ParsedBlock, SegmentPlan, Sy2VideoConfig 等核心类型
    probe.ts           ★ 统一资源探测 probeDocument() — 一次调用获取全文+图片+音频+视频
  blocks/              块渲染组件（按思源块类型分发）
    BlockRenderer.tsx  统一分发器（根据 block.type 选择组件）
    ParagraphBlock.tsx, HeadingBlock.tsx, ImageBlock.tsx, VideoBlock.tsx,
    AudioBlock.tsx, CodeBlock.tsx, QuoteBlock.tsx, ListBlock.tsx,
    SuperBlock.tsx, FallbackBlock.tsx
  theme/               主题系统
    types.ts           VideoTheme 完整类型定义
    presets.ts         lightTheme / darkTheme 预设
    context.tsx         ThemeProvider + useTheme() hook
    fonts.ts           loadNotoSansSC() 字体加载
  backgrounds/         ★ 背景风格体系
    types.ts           BackgroundPreset / BaseLayer / AtmosphereLayer 类型
    palettes.ts        12 种统一调色板（ember/ocean/cosmic/neon/...）
    utils.ts           seededRandom 共享工具
    presets.ts         8 种风格预设配置
    SceneBackground.tsx 组合组件（base + atmosphere + grain + children）
    AuroraMesh.tsx     极光流彩背景组件
    NoiseGrain.tsx     胶片颗粒叠层组件
    index.ts           统一导出
  animations/          动画预设
    presets.ts         fadeIn / slideInLeft / slideInRight / slideInUp / scaleIn / none
  composition/         Remotion Composition 层
    ArticleComposition.tsx  文章级组合（TransitionSeries 串联分段）
    SegmentComposition.tsx  分段渲染（BlockRenderer 渲染子块）
    transitions.ts     过渡类型定义 (fade/slide/wipe/none)
    schemas.ts         Zod schema
  asr/                ★ 语音旁白管道（FunASR 转写 + FFmpeg 清洗）
    funasr-client.ts   FunASR WebSocket 客户端（离线转写 + 时间戳）
    audio-utils.ts     音频工具（静音检测/口癖检测/裁剪拼接）
    index.ts           一站式 API：processNarration()
  metadata/            元数据计算
    calculateArticleMetadata.ts  SQL 查询 → 构建 ParsedBlock 树 → 计算时长
    audio-utils.ts     音频时长计算（带超时）
  proxy/               思源 API 代理服务器
    server.ts          HTTP 代理（注入 Authorization token）
    cli.ts             启动入口
  components/           ★ 通用组件（跨视频复用的基础组件）
    Subtitle.tsx        双语字幕叠加层（放在 TransitionSeries 外面，zIndex: 999）
  templates/           ★ 可复用的特效/布局组件（AI 的"乐高积木"）
  hooks/               ★ 横竖屏适配 Hooks
    useAspectRatio.ts   检测 landscape/portrait
    useSafeArea.ts      安全区 padding 自适应
    useResponsiveSize.ts 基于 1920px 按比例缩放
  generated/           ★ AI 生成的视频组件（每次生成一个 .tsx）
  config.ts            统一配置（.env 环境变量）
  Root.tsx             Remotion 入口（每个视频注册横屏+竖屏两套 Composition）
  webpack-override.ts  Rspack/Webpack 配置覆盖
```

---

## AI 工作流程

### 1. 读笔记（★ 优先用 probeDocument）

```typescript
/** ★ 第一步永远用 probeDocument，一次调用获取全部信息 */
import {probeDocument} from './siyuan/probe';

const probe = await probeDocument(docId);
probe.fullText    // 全文文本（可直接阅读）
probe.blocks      // 块树（含 assets/layout/config 完整信息）
probe.images[]    // 所有图片 {src, url, blockId}
probe.audios[]    // 所有音频 {src, url, blockId}
probe.videos[]    // 所有视频 {src, url, blockId}
```

如果需要更细粒度的控制，再使用 siyuan-notes skill：
- `getBlockByID(docId)` 获取文档信息
- SQL 查询获取块结构
- `extractAssetsFromBlock(blockId)` 查看块中有哪些资源文件

### 2. 读图片（关键步骤！）

**必须读取笔记中的图片，才能做出合理的视觉方案。** 文字只告诉你"是什么"，图片告诉你"怎么呈现"。

通过代理下载图片后用 Read 工具查看：
```bash
# 通过代理下载（必须走代理，直连思源会超时）
curl -s -o /tmp/img1.webp "http://localhost:6899/assets/image-xxx.webp"
# 然后用 Read 工具读取图片文件
```

分析图片特征，决定呈现方式：
- **聊天截图** → 用聊天气泡流重新演绎（不要直接贴截图）
- **代码/UI 截图** → 居中展示 + 圆角阴影 + slide-in
- **照片/风景** → KenBurnsImage 缓慢缩放
- **信息图/数据** → 提取数据用动画重新展示

### 3. 处理语音旁白（如果笔记有录音）

```
Step 1: analyzeAudio() → 转写 + 静音检测
Step 2: AI 审阅转写文本，判断口癖/废话，返回 CutRange[]
Step 3: applyCuts() → 裁剪生成 clean.wav

★ Step 4: 对裁剪后的音频重新 analyzeAudio()
  不能用原始转写结果做"数学减法"估算时间——裁剪边界不对齐句子边界，会导致字幕重叠错位

Step 5: AI 将中文句子翻译为英文（双语字幕）
  subtitles 数据结构: {text: 中文, en: 英文, start, end}

Step 6: cleanDuration → 驱动视频总帧数；subtitles → 驱动双语字幕显示
```

### 4. 设计视觉方案

根据笔记内容 + 图片分析 + 语音时间轴，设计视频方案：
- 参照**视觉设计风格指南**选择配色和布局
- 每个段落选择合适的布局模式（标题卡/分屏/气泡流/数据面板）
- 规划动画时序（stagger 入场、数字计数、场景过渡）

### 5. 写代码

将视频组件写入 `src/generated/video-<名称>.tsx`，参考以下模板：

```tsx
import {AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, staticFile, Img} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {ThemeProvider} from '../theme/context';
import {loadNotoSansSC} from '../theme/fonts';
import {darkTheme} from '../theme/presets';
import {siyuanClient} from '../siyuan/client';
// 按需导入模板组件
import {SceneShell} from '../templates/SceneShell';
import {AnimatedText} from '../templates/AnimatedText';
import {AnimatedCounter} from '../templates/AnimatedCounter';
import {CodeTyper} from '../templates/CodeTyper';
import {GlassCard} from '../templates/GlassCard';
import {GeometricShapes} from '../templates/GeometricShapes';
import {SceneBackground} from '../backgrounds/SceneBackground';
import {Signature} from '../templates/Signature';
import {TitleCard} from '../templates/TitleCard';
import {KenBurnsImage} from '../templates/KenBurnsImage';
import {SplitLayout} from '../templates/SplitLayout';

/** 思源资源 URL 辅助 */
const asset = (p: string) => siyuanClient.assetUrl(p);

/** 通过 staticFile 访问 data 目录中的缓存音频 */
const dataAudio = (name: string) => staticFile(`data/<docId>/<name>`);

const FPS = 24;

/** 双语字幕数据: ASR 转写 → AI 翻译英文 */
const SUBS = [
  {text: '中文句子', en: 'English translation', start: 0, end: 0},
  // ...
];

/** 总帧数 = 各段之和 - 过渡重叠帧 */
export const VIDEO_DURATION = (S1_SEC + S2_SEC + S3_SEC) * FPS - TRANSITION_FRAMES * 2;

/**
 * ★ 音频轨道定义 — 每段音频用 Sequence 放在 TransitionSeries 外面
 * 支持多段录音，每段指定全局时间区间 {src, startFrame, durationFrames}
 */
const AUDIO_TRACKS = [
  {src: narration, startFrame: 0, durationFrames: VIDEO_DURATION, volume: 0.9},
];

/**
 * ★ 字幕组件 — 必须放在 TransitionSeries 外面，且 zIndex: 999
 * 原因：TransitionSeries 内的场景用 AbsoluteFill 覆盖全屏，
 *        不加 zIndex 会被场景层压住导致字幕不可见
 */
const Subtitle: React.FC<{sentences: Array<{text: string; en: string; start: number; end: number}>}> = ({sentences}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const active = sentences.find((s) => ms >= s.start && ms <= s.end + 200);
  if (!active) return null;
  return (
    <div style={{position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 999, pointerEvents: 'none'}}>
      {/* 半透明气泡：中文 + 分隔线 + 英文 */}
    </div>
  );
};

export const VideoName: React.FC = () => {
  loadNotoSansSC();
  const {fps} = useVideoConfig();

  return (
    <ThemeProvider theme={darkTheme}>
      <AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
        {/* ★ 音频 — 放在 TransitionSeries 外面，用 Sequence 指定全局时间区间 */}
        {AUDIO_TRACKS.map((track, i) => (
          <Sequence key={i} from={track.startFrame} durationInFrames={track.durationFrames}>
            <Audio src={track.src} volume={track.volume} />
          </Sequence>
        ))}

        {/* ★ 字幕 — 放在 TransitionSeries 外面，zIndex: 999 确保在最上层 */}
        <Subtitle sentences={SUBS} />

        {/* 视觉场景（纯视觉，不含 Audio 和 Subtitle） */}
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={fps * S1_SEC}>
            <AbsoluteFill>
              {/* 背景 */}
              <AbsoluteFill style={{background: 'linear-gradient(135deg, #09203f 0%, #537895 100%)'}} />
              {/* 纯视觉内容 */}
            </AbsoluteFill>
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            timing={linearTiming({durationInFrames: 15})}
            presentation={fade()}
          />

          {/* 下一段... */}
        </TransitionSeries>
      </AbsoluteFill>
    </ThemeProvider>
  );
};
```

然后在 `src/Root.tsx` 注册 Composition：

```tsx
import {VideoName, VideoNamePortrait, VIDEO_DURATION} from './generated/video-name';

// 在 RemotionRoot 的 return 中添加：
// ★ 横屏和竖屏是独立的组件，各自针对观看设备优化布局
//   横屏：电脑/电视观看，字号适中，可用左右分栏
//   竖屏：手机观看，字号更大，上下布局为主，字幕边距更小
<Composition
  id="VideoName"
  component={VideoName}
  durationInFrames={VIDEO_DURATION}
  fps={24}
  width={1920}
  height={1080}
/>
<Composition
  id="VideoName-Portrait"
  component={VideoNamePortrait}
  durationInFrames={VIDEO_DURATION}
  fps={24}
  width={1080}
  height={1920}
/>
```

#### ★ 横竖屏适配：SizeTheme 模式

**核心思路**：定义 `SizeTheme` 接口 + 横屏/竖屏两套常量，场景组件接受 `s: SizeTheme` 参数，内部用 `s.xxx` 引用所有尺寸。**不再写两套重复的场景组件**。

```typescript
/** 尺寸主题：所有场景中用到的字号、间距、头像大小 */
interface SizeTheme {
  isPortrait: boolean;
  chat: { padding: string; maxWidth: string; avatarSize: number; textFontSize: number; senderFontSize: number; avatarFontSize: number };
  s1: { label: number; title: number; subtitle: number };
  s2: { gap: number };
  s3: { counter: number; description: number };
  s4: { codeFontSize: number; emoji: number; cardTitle: number; cardDesc: number; direction: 'row' | 'column' };
  s5: { label: number; title: number; compareNumber: number; compareLabel: number; arrow: number };
  s6: { title: number; url: number; slogan: number };
}

/** 横屏尺寸（1920×1080） */
const LANDSCAPE_SIZE: SizeTheme = {
  isPortrait: false,
  chat: { padding: '0 60px', maxWidth: '65%', avatarSize: 36, avatarFontSize: 14, senderFontSize: 13, textFontSize: 20 },
  s1: { label: 24, title: 56, subtitle: 28 },
  s2: { gap: 20 },
  s3: { counter: 120, description: 22 },
  s4: { codeFontSize: 20, emoji: 28, cardTitle: 20, cardDesc: 15, direction: 'row' },
  s5: { label: 22, title: 48, compareNumber: 52, compareLabel: 18, arrow: 40 },
  s6: { title: 56, url: 36, slogan: 20 },
};

/** 竖屏尺寸（1080×1920）— 手机观看 */
const PORTRAIT_SIZE: SizeTheme = {
  isPortrait: true,
  chat: { padding: '0 24px', maxWidth: '85%', avatarSize: 44, avatarFontSize: 18, senderFontSize: 18, textFontSize: 30 },
  s1: { label: 36, title: 52, subtitle: 38 },
  s2: { gap: 16 },
  s3: { counter: 120, description: 32 },
  s4: { codeFontSize: 26, emoji: 32, cardTitle: 22, cardDesc: 18, direction: 'column' },
  s5: { label: 30, title: 44, compareNumber: 56, compareLabel: 28, arrow: 44 },
  s6: { title: 52, url: 32, slogan: 28 },
};

// 场景组件签名：
const Scene1Hook: React.FC<{s: SizeTheme}> = ({s}) => (
  <AnimatedText fontSize={s.s1.title} ... />
);

// 导出：
export const VideoName: React.FC = () => <VideoShell s={LANDSCAPE_SIZE} />;
export const VideoNamePortrait: React.FC = () => <VideoShell s={PORTRAIT_SIZE} />;
```

**竖屏适配规则**：
- **上下布局**：横屏的左右分栏 → 竖屏改为上下排列（通过 `s.s4.direction`）
- **聊天气泡**：竖屏全宽 `maxWidth: 85%`，横屏限宽 `65%`
- **代码区**：竖屏单栏全宽，CodeTyper 传 `fontSize={s.s4.codeFontSize}`
- **安全区**：竖屏上 120px、下 200px（字幕更大）、左右 24px
- **核心原则：竖屏任何文字不得低于 18px**

**★ 竖屏字号规范（强制最低值）**：

| 元素类型 | 横屏 | 竖屏 | 说明 |
|---------|------|------|------|
| 主标题 | 56px | 52px | 竖屏宽度更窄，52px 已占满 |
| 副标题/描述 | 28px | 38px | 竖屏必须放大 |
| 标签/副标题标签 | 24px | 36px | 竖屏标签也要看清 |
| 大数字（计数器） | 120px | 120px | 保持醒目 |
| 聊天气泡正文 | 20px | 30px | 竖屏气泡文字必须大 |
| 聊天气泡发送者名 | 13px | 18px | |
| 卡片标题 | 20px | 22px | |
| 卡片说明文字 | 15px | 18px | **最低 18px** |
| 代码编辑器 | 20px | 26px | CodeTyper 传 `fontSize={26}` |
| 数据对比数字 | 52px | 56px | |
| 数据对比标签 | 18px | 28px | |
| URL 展示 | 36px | 32px | 竖屏宽度限制，32px 足够 |
| 底部描述/标语 | 20px | 28px | |
| 字幕中文 | 32px | 40px | Subtitle 组件已内置自适应 |
| 字幕英文 | 28px | 34px | Subtitle 组件已内置自适应 |
| emoji/图标 | 28px | 32px | |

共享数据（SUBS、时长、AUDIO_TRACKS、颜色 C）放在文件顶部，场景组件只写一份。

### 6. 验证和渲染

```bash
# 1. 类型检查（必须先通过）
pnpm tsc --noEmit

# 2. 渲染单帧截图快速预览
npx remotion still <CompositionId> /tmp/test.png --frame=30

# 3. 完整视频渲染
npx remotion render <CompositionId> out/<名称>.mp4 --codec=h264
```

如需在 Remotion Studio 中实时预览：`pnpm start`

---

## AI 可用组件工具箱

### 思源数据层

```typescript
/** ★ 优先使用 — 一次调用获取全部信息 */
import {probeDocument} from './siyuan/probe';

/** 底层工具（probe 不够用时再用） */
import {siyuanClient} from './siyuan/client';
// siyuanClient.queryBlocks(sql)          — SQL 查询 blocks 表
// siyuanClient.getDocBlocks(docId)       — 获取文档所有块
// siyuanClient.assetUrl(path)            — 资源文件完整 URL

import {parseKramdownBlock, stripInlineMarkdown, parseHeading, extractAssets} from './siyuan/kramdown-parser';
import {SiYuanBlockType} from './siyuan/block-types';
```

### 语音旁白管道（两步式：AI 参与清洗决策）

```typescript
import {analyzeAudio, applyCuts} from './asr';
import type {AudioAnalysis, CutRange} from './asr';

// Step 1: 转写 + 静音检测
const analysis = await analyzeAudio('/path/to/audio.m4a');
analysis.transcription.sentences     // 逐句：[{start, end, text, punc, tsList}, ...]
analysis.transcription.timestamps    // 字级别时间戳
analysis.silences                    // 静音段
analysis.duration                    // 总时长（秒）

// Step 2: AI 审阅 → 返回 CutRange[]

// Step 3: 执行裁剪
const result = await applyCuts('/path/to/audio.m4a', cutRanges, '/tmp/clean.wav');
```

### 通用组件

```typescript
import {Subtitle, SubtitleSentence} from './components/Subtitle';

// 双语/单语字幕 — 放在 TransitionSeries 外面
<Subtitle sentences={[
  {text: '中文', en: 'English', start: 0, end: 3000},
  {text: '只有中文', start: 3000, end: 6000},  // en 可选
]} />
```

### 场景组件（★ 新视频优先使用）

```typescript
import {SceneShell} from './templates/SceneShell';        // 场景容器 — 渐变背景 + 安全区
import {AnimatedText} from './templates/AnimatedText';     // 文字动画 — spring-in/typewriter/slide-up/split-in
import {AnimatedCounter} from './templates/AnimatedCounter'; // 数字计数 — 大数字 + spring 入场
import {CodeTyper} from './templates/CodeTyper';           // 代码打字 — 终端模拟 + 语法高亮
import {GlassCard} from './templates/GlassCard';           // 毛玻璃卡片 — backdrop-blur + spring 入场
import {GeometricShapes} from './templates/GeometricShapes'; // 几何色块背景 — 替代粒子/渐变
import {Signature} from './templates/Signature';           // 崮生签名 — 头像 + 品牌标语
```

### 横竖屏适配 Hooks

```typescript
import {useAspectRatio} from './hooks/useAspectRatio';     // 'landscape' | 'portrait'
import {useSafeArea} from './hooks/useSafeArea';           // 安全区 padding 字符串
import {useSafeAreaValues} from './hooks/useSafeArea';     // {top, right, bottom, left}
import {useResponsiveSize} from './hooks/useResponsiveSize'; // 基于 1920px 按比例缩放
```

注意：这些 hooks 用于组件内部微调。**场景布局由横屏/竖屏两个独立组件各自控制**，而不是完全依赖 hook 自动适配。

### 块渲染组件

```typescript
import {BlockRenderer} from './blocks/BlockRenderer';
// 根据 block.type 自动选择对应组件渲染
```

### 主题系统

```typescript
import {useTheme} from './theme/context';
import {ThemeProvider} from './theme/context';
import {loadNotoSansSC} from './theme/fonts';
import {lightTheme, darkTheme} from './theme/presets';
```

### 动画预设

```typescript
import {useAnimationStyle} from './animations/presets';
// 可选: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'scaleIn' | 'none'
```

### 过渡效果

```typescript
import {TransitionSeries} from '@remotion/transitions';
import {linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
```

### Remotion 核心 API

```typescript
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, Video, Audio, Sequence} from 'remotion';
```

---

## 可复用模板目录

<!-- TEMPLATE_CATALOG_START -->

### SceneShell (`src/templates/SceneShell.tsx`)
场景统一容器 — 渐变背景 + 安全区 padding。**每个场景都应该用 SceneShell 包裹**。
```tsx
<SceneShell gradientColors={['#0f2027', '#203a43', '#2c5364']}>
  <AnimatedText text="标题" />
</SceneShell>
```
Props: `gradientColors`(必填, string[]), `angle`(默认135), `children`(必填)

### AnimatedText (`src/templates/AnimatedText.tsx`)
增强版文字动画，4 种入场模式。替代直接写 interpolate 文字动画。
```tsx
<AnimatedText text="开源项目分享" mode="spring-in" fontSize={56} delay={12} />
```
Props: `text`(必填), `mode`("spring-in"|"typewriter"|"slide-up"|"split-in"), `fontSize`(48), `color`, `delay`(0), `textAlign`('center'), `fontWeight`(600)

### AnimatedCounter (`src/templates/AnimatedCounter.tsx`)
大数字计数动画 — spring 入场 + interpolate 从 0 计数到目标值。适合数据展示场景。
```tsx
<AnimatedCounter target={20000} prefix="¥" suffix="+" fontSize={120} color="#f59e0b" description="每月费用" />
```
Props: `target`(必填), `prefix`, `suffix`, `fontSize`(120), `color`('#f59e0b'), `description`, `descriptionColor`, `delay`(0), `duration`

### CodeTyper (`src/templates/CodeTyper.tsx`)
终端风格代码打字模拟 — 深色背景 + 语法高亮 + 逐字符出现 + 光标闪烁。消除 PPT 感的核心组件。
```tsx
<CodeTyper code={`npm install webfont\nimport { subset } from 'webfont'`} speed={18} language="TypeScript" />
```
Props: `code`(必填), `speed`(15 字符/秒), `language`, `showLineNumbers`(true), `delay`(0)

### GlassCard (`src/templates/GlassCard.tsx`)
毛玻璃卡片 — 半透明背景 + backdrop-blur + 细边框 + spring 入场滑入。适合特性/数据展示。
```tsx
<GlassCard delay={24}>
  <div>⚡ 毫秒级裁剪</div>
</GlassCard>
```
Props: `children`(必填), `delay`(0), `padding`('24px 32px'), `borderRadius`(16)

### GeometricShapes (`src/templates/GeometricShapes.tsx`)
几何色块背景 — 大面积、高饱和度的几何色块（圆、三角、矩形、圆环），替代粒子/渐变作为场景的视觉锚点。**★ 推荐作为所有场景的背景层**。
```tsx
<GeometricShapes palette="ember" count={6} seed={1} opacityMultiplier={1.2} />
```
Props: `palette`("ember"|"ocean"|"moss"|"neon"|"gold"|"rainbow"|string[]), `count`(8), `seed`(42), `opacityMultiplier`(1)
- 6 种调色板预设：ember(红橙暖色)、ocean(蓝绿冷色)、moss(绿色自然)、neon(紫粉霓虹)、gold(金橙财富)、rainbow(多彩混合)
- 色块尺寸 100-500px，透明度 0.08-0.3，缓慢漂浮旋转

### SceneBackground (`src/backgrounds/SceneBackground.tsx`)
场景背景组合层 — 通过 preset id 选择风格，自动组装 base + atmosphere + grain 三层。
**★ 所有视频场景推荐使用 SceneBackground 替代手动写渐变背景。**
```tsx
<SceneBackground preset="geometric-bold" seed={1}>
  <AnimatedText text="标题" />
</SceneBackground>
```
Props: `preset`(必填, string), `seed`(42), `children`

#### 可用预设风格

| 预设 ID | 名称 | 视觉特征 | 适用场景 |
|---------|------|---------|---------|
| `geometric-bold` | 几何色块 | 大色块几何漂浮，高饱和度 | 技术产品展示、功能介绍 |
| `aurora-mesh` | 极光流彩 | 柔和渐变色团叠加，macOS 壁纸感 | 产品介绍、教程、高端感 |
| `neon-grid` | 赛博网格 | 透视网格 + 霓虹色（预留） | AI/安全/前沿技术 |
| `bauhaus-clean` | 包豪斯极简 | 精准几何，红蓝黄原色（预留） | 教程系列、学术 |
| `vaporwave-sunset` | 蒸汽波日落 | 水平渐变 + 大太阳（预留） | 创意编程、轻松话题 |
| `blueprint-line` | 蓝图线条 | 深蓝底 + 白色网格（预留） | 系统架构、技术深潜 |
| `memphis-retro` | 孟菲斯复古 | 活泼粉彩形状（预留） | 入门教程、社区更新 |

用法：`<SceneBackground preset="geometric-bold">` — 当前只有 geometric-bold 和 aurora-mesh 有完整实现，其余为预留。

### Signature (`src/templates/Signature.tsx`)
崮生品牌签名 — 头像 + "崮生 · AI-native Toolmaker"，spring 入场。所有视频结尾复用。
```tsx
<Signature delay={72} />
```
Props: `delay`(0)

### KenBurnsImage (`src/templates/KenBurnsImage.tsx`)
全屏图片 + Ken Burns 缓慢缩放动画。适合照片/风景。
```tsx
<KenBurnsImage src={imageUrl} direction="zoom-in" />
```
Props: `src`(必填), `direction`("zoom-in"|"zoom-out"), `fromScale`, `toScale`, `objectFit`

### SplitLayout (`src/templates/SplitLayout.tsx`)
左右/上下分屏布局，内容各占一半或自定义比例。
```tsx
<SplitLayout ratio={0.6} left={<KenBurnsImage src={url} />} right={<AnimatedText text="描述" />} />
```
Props: `direction`("row"|"column"), `ratio`(0-1), `gap`, `left`(必填), `right`(必填)

### TitleCard (`src/templates/TitleCard.tsx`)
居中大标题 + 可选副标题 + 渐变背景。用 SceneShell 包裹。适合章节封面、标题页。
```tsx
<TitleCard title="OCR 插件的神奇之处" subtitle="思源笔记工具介绍" gradientColors={['#0f0c29', '#302b63']} />
```
Props: `title`(必填), `subtitle`, `gradientColors`, `color`, `fontSize`

### Hooks（`src/hooks/`）

- `useAspectRatio()` — 返回 `'landscape' | 'portrait'`，基于 Composition 宽高比
- `useSafeArea()` — 返回安全区 padding 字符串（横竖屏自适应）
- `useSafeAreaValues()` — 返回 `{top, right, bottom, left}` 对象
- `useResponsiveSize(baseSize)` — 基于 1920px 基准按比例缩放尺寸

<!-- TEMPLATE_CATALOG_END -->

**创建新模板的流程**：
1. 在 `src/templates/` 下创建 `.tsx` 文件
2. 组件遵循 Remotion 规范，支持 props 参数化
3. 在本文件的 `<!-- TEMPLATE_CATALOG_START -->` 和 `<!-- TEMPLATE_CATALOG_END -->` 之间添加描述
4. 下次 AI 生成视频时可以直接 import 复用

---

## 代码约定

- TypeScript 严格模式，**禁止 `as` 改变类型**
- 函数式组件 + `React.FC` 类型
- 注释用 `/** */` 格式放在变量/参数名上方
- 样式通过 `useTheme()` 获取，避免硬编码颜色值
- 动画通过 `useAnimationStyle(preset)` hook 获取
- 开发阶段 **let it crash**，不用 try-catch 包裹
- 迭代优于下标：用 `for of` 不用 `for i++`

---

## ⚠️ 重要注意事项

- **优先用 probeDocument()**：一次调用获取全文+图片+音频+视频，不要手动一个个查
- **必须读图片**：生成视频前必须先读取笔记中的每张图片，根据内容决定呈现方式
- **聊天截图不要直接贴**：用聊天气泡流重新演绎对话内容
- **图片资源必须走代理**：`http://localhost:6899/assets/xxx`，直连会超时
- **extractAssetsFromBlock 只对子块有效**：不对文档块（doc 类型）本身
- **markdown 字段可能为 null**：用 `b.markdown || ''` 防护
- **字体加载**：`loadNotoSansSC()` 只需在顶层组件调用一次
- **音频文件**：`<Audio src={asset('assets/xxx.m4a')} />` 或 `staticFile('data/...')` 访问缓存
- **视频嵌入**：用原生 `<video>` 标签而非 Remotion `<Video>`，设置 `muted autoPlay`
- **动画时序**：`interpolate(frame - delay, [0, duration], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})`
- **过渡帧数**：15 帧过渡会重叠前后段落，总帧数 = 各段之和 - 过渡帧
- **场景间过渡**：12 帧 fade（不要用太长的过渡）
- **★ 音频必须放在 TransitionSeries 外面**：用 `<Sequence from={startFrame} durationInFrames={duration}>` 指定全局时间区间，支持多段录音。不要放在场景组件内部（会重复播放）
- **★ 字幕必须放在 TransitionSeries 外面**：基于全局帧数计算显示。必须加 `zIndex: 999`，否则会被 TransitionSeries 内的 AbsoluteFill 场景层压住导致不可见
- **★ 场景组件必须纯视觉**：不含 `<Audio>` 和 `<Subtitle>`，音频和字幕都在 TransitionSeries 外层统一管理

---

## 🎙️ 语音旁白功能

### ASR 方案：FunASR（阿里达摩院）

Docker 部署的离线中文语音识别服务：
- 部署：`cd docker/funasr && docker compose up -d`
- 配置：`.env` 中 `funasr_ws_url=ws://localhost:10095`
- 热词：`docker/funasr/hotwords.txt`

### 语音驱动视频节奏

1. 下载思源录音通过代理 → `analyzeAudio()` 转写 → AI 审阅清洗 → `applyCuts()` 裁剪
2. `cleanDuration` 驱动视频总帧数，`sentences` 驱动字幕
3. Remotion `<Audio>` 播放清洗后的语音

### 关键依赖
- ASR：FunASR Docker 容器（Paraformer-large 模型）
- 音频处理：FFmpeg（`~/tools/ffmpeg/bin/ffmpeg`）

---

## 开发命令

```bash
pnpm start          # Remotion Studio 开发预览（端口 3001）
pnpm proxy          # 启动思源 API 代理（端口 6899，需先启动）
pnpm build          # 渲染 Article composition
pnpm render <CompositionId>  # 同时渲染横屏+竖屏两个版本（例: pnpm render VideoWebfont）
pnpm test           # ESLint + tsc 类型检查
```

## 环境要求

- 代理服务器（`pnpm proxy`）必须先启动，Remotion 才能访问思源 API
- `.env` 文件配置：`siyuan_token`、`siyuan_base`、`proxy_base`、`proxy_port`

---

## 持续改进

- **每次遇到的坑，必须同步更新到本文件**
- **新增模板组件后，必须在 TEMPLATE_CATALOG 区域添加描述**
