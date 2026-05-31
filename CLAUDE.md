# sy2video — AI-Native 思源笔记转视频

## 项目概述

将思源笔记文档生成为视频。AI（Claude）读取笔记内容，设计视觉方案，直接写 Remotion React 组件代码，然后渲染导出视频。

## 技术栈

- **Remotion 4.x** — React 视频框架（Rspack 打包）
- **React 19** + **TypeScript 6** + **Zod 4**
- **Tailwind CSS**（通过 @remotion/tailwind）
- **Google Fonts** — Noto Sans SC 中文字体（@remotion/google-fonts）
- 思源笔记数据通过 **SQL API** 获取，数据格式是 **kramdown**（不是 HTML）

## 项目结构

```
src/
  siyuan/              思源笔记数据层
    client.ts          SiYuanClient — SQL 查询 + 资源 URL
    kramdown-parser.ts kramdown 解析（提取文本/图片/音频/配置）
    block-types.ts     SiYuanBlockType 枚举 + parseSuperBlockLayout
    types.ts           ParsedBlock, SegmentPlan, Sy2VideoConfig 等核心类型
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
  animations/          动画预设
    presets.ts         fadeIn / slideInLeft / slideInRight / slideInUp / scaleIn / none
  composition/         Remotion Composition 层
    ArticleComposition.tsx  文章级组合（TransitionSeries 串联分段）
    SegmentComposition.tsx  分段渲染（BlockRenderer 渲染子块）
    transitions.ts     过渡类型定义 (fade/slide/wipe/none)
    schemas.ts         Zod schema
  metadata/            元数据计算
    calculateArticleMetadata.ts  SQL 查询 → 构建 ParsedBlock 树 → 计算时长
    audio-utils.ts     音频时长计算（带超时）
  proxy/               思源 API 代理服务器
    server.ts          HTTP 代理（注入 Authorization token）
    cli.ts             启动入口
  templates/           ★ 可复用的特效/布局组件（AI 的"乐高积木"）
  generated/           ★ AI 生成的视频组件（每次生成一个 .tsx）
  config.ts            统一配置（.env 环境变量）
  Root.tsx             Remotion 入口（注册所有 Composition）
  webpack-override.ts  Rspack/Webpack 配置覆盖
```

## AI 可用组件工具箱

生成视频时，可以直接 import 这些组件和工具：

### 思源数据层

```typescript
import {siyuanClient} from './siyuan/client';
// siyuanClient.queryBlocks(sql)          — SQL 查询 blocks 表
// siyuanClient.getDocBlocks(docId)       — 获取文档所有块
// siyuanClient.assetUrl(path)            — 资源文件完整 URL

import {parseKramdownBlock, stripInlineMarkdown, parseHeading, extractAssets} from './siyuan/kramdown-parser';
import {SiYuanBlockType} from './siyuan/block-types';
```

### 图片读取（siyuan-notes skill）

```bash
# 1. 找出文档中所有含图片的子块
node -e "const s = require('/home/gs/.claude/skills/siyuan-notes/index.js'); (async () => {
  const blocks = await s.executeSiyuanQuery(\"SELECT id, markdown, type FROM blocks WHERE root_id='文档ID' ORDER BY id\");
  for (const b of blocks) {
    const md = b.markdown || '';
    if (md.includes('![')) {
      const assets = await s.extractAssetsFromBlock(b.id);
      console.log('Block:', b.id, 'Assets:', JSON.stringify(assets));
    }
  }
})();"

# 2. 通过代理下载图片（必须走代理，直连思源会超时）
curl -s -o /tmp/img1.webp "http://localhost:6899/assets/image-xxx.webp"

# 3. 用 Read 工具读取下载的图片文件，AI 会看到图片内容并分析
# Read /tmp/img1.webp
```

> **⚠️ 注意事项**：
> - `extractAssetsFromBlock` 只对子块有效，不对文档块（doc 类型）本身
> - 必须通过代理 `http://localhost:6899/assets/` 下载资源，直连思源会连接超时
> - 代理路径格式：`http://localhost:6899/assets/<文件名>`，不带 `/api/` 前缀

### 块渲染组件

```typescript
import {BlockRenderer} from './blocks/BlockRenderer';
// 根据块的 type 自动选择对应组件渲染，支持所有思源块类型

import {ParagraphBlock} from './blocks/ParagraphBlock';
import {HeadingBlock} from './blocks/HeadingBlock';
import {ImageBlock} from './blocks/ImageBlock';
// ... 等等，每个块组件接受 BlockProps {block, durationInFrames, animation?}
```

### 主题系统

```typescript
import {useTheme} from './theme/context';
// const theme = useTheme() → 获取当前主题的颜色/字号/间距配置

import {ThemeProvider} from './theme/context';
import {loadNotoSansSC} from './theme/fonts';
import {lightTheme, darkTheme} from './theme/presets';
```

### 动画预设

```typescript
import {useAnimationStyle} from './animations/presets';
// const style = useAnimationStyle('fadeIn') → 返回 {opacity: ...} CSS 对象
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

## AI 工作流程

### 1. 读笔记

使用 `siyuan-notes` skill 获取文档内容：
- `getBlockByID(docId)` 获取文档信息
- SQL 查询获取块结构
- 或使用 `siyuanClient.getDocBlocks(docId)` 获取所有块
- 用 `extractAssetsFromBlock(blockId)` 查看块中有哪些资源文件

### 2. 读图片（关键步骤！）

**必须读取笔记中的图片，才能做出合理的视觉方案。** 文字只告诉你"是什么"，图片告诉你"怎么呈现"。

对每个图片资源：
1. `getLocalAssetPath(blockId, assetPath)` 获取本地路径
2. 用 `Read` 工具读取图片（支持 PNG/JPG），直接看到图片内容
3. 分析图片特征：
   - **内容类型**：截图？照片？插画？UI 界面？
   - **主体位置**：居中？偏左？偏右？
   - **色彩基调**：亮色？暗色？主色调？
   - **信息密度**：简洁？细节丰富？
   - **宽高比**：横图？竖图？方图？

这些特征直接决定：
- 用 KenBurnsImage（照片/风景）还是直接展示（截图/UI）
- SplitLayout 的 ratio（主体在左 → 左大右小）
- 叠加文字的颜色和位置（暗图 → 白字叠加底部）
- 停留时长（信息密度高 → 停更久）

### 3. 设计视觉方案

根据笔记文字内容 **+ 图片分析结果**，设计视频方案：
- 文章的整体节奏和风格
- 每个段落用什么视觉效果（布局、动画、特效）
- 段落之间的过渡效果
- 使用 light 还是 dark 主题
- 图片如何呈现（全屏/分屏/叠加文字）

### 4. 写代码

将视频组件写入 `src/generated/video-<名称>.tsx`，参考以下模板：

```tsx
import {AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {ThemeProvider} from '../theme/context';
import {loadNotoSansSC} from '../theme/fonts';
import {darkTheme} from '../theme/presets';
import {siyuanClient} from '../siyuan/client';
// 按需导入模板组件
import {TitleCard} from '../templates/TitleCard';
import {KenBurnsImage} from '../templates/KenBurnsImage';
import {SplitLayout} from '../templates/SplitLayout';
import {GradientBackground} from '../templates/GradientBackground';
import {TextReveal} from '../templates/TextReveal';

/** 思源资源 URL 辅助 */
const asset = (path: string) => siyuanClient.assetUrl(path);

/** 总时长 = 各段秒数之和 × 24 - (过渡数 × 过渡帧数) */
export const VIDEO_DURATION = 29 * 24 - 45;

export const VideoName: React.FC = () => {
  loadNotoSansSC();
  const {fps} = useVideoConfig();

  return (
    <ThemeProvider theme={darkTheme}>
      <AbsoluteFill>
        <TransitionSeries>
          {/* 每段用 TransitionSeries.Sequence 包裹 */}
          <TransitionSeries.Sequence durationInFrames={fps * 5}>
            {/* 段内容 */}
          </TransitionSeries.Sequence>

          {/* 段间过渡 */}
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
import {VideoName, VIDEO_DURATION} from './generated/video-name';

// 在 RemotionRoot 的 return 中添加：
<Composition
  id="VideoName"
  component={VideoName}
  durationInFrames={VIDEO_DURATION}
  fps={24}
  width={1920}
  height={1080}
/>
```

### 5. 验证和渲染

```bash
# 1. 类型检查（必须先通过）
pnpm tsc --noEmit

# 2. 渲染单帧截图快速预览
npx remotion still <CompositionId> /tmp/test.png --frame=30

# 3. 完整视频渲染
npx remotion render <CompositionId> out/<名称>.mp4 --codec=h264
```

如需在 Remotion Studio 中实时预览：`pnpm start`

### ⚠️ 重要注意事项

- **必须读图片**：生成视频前必须先读取笔记中的每张图片，根据图片内容决定呈现方式（截图适合直接展示，照片适合 Ken Burns 等）
- **图片资源必须走代理**：通过 `http://localhost:6899/assets/xxx` 下载，`extractAssetsFromBlock` 只对子块有效不对文档块
- **markdown 字段可能为 null**：SQL 查询结果中某些块的 markdown 可能为 null，要用 `b.markdown || ''` 防护
- **字体加载**：使用 `loadNotoSansSC()` 只需在顶层组件调用一次，已优化为仅加载 400/700 字重 + 中文字集
- **音频文件**：使用 `<Audio src={asset('assets/xxx.m4a')} />`，资源路径来自思源笔记
- **视频嵌入**：使用原生 `<video>` 标签而非 Remotion `<Video>`（避免编解码问题），设置 `muted autoPlay`
- **动画时序**：`interpolate(frame - delay, [0, duration], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})` 是标准模式
- **过渡帧数**：每 15 帧过渡会重叠前后段落，总帧数 = 各段之和 - 过渡帧
- **主题颜色**：用 `useTheme()` 获取 fontFamily/colors，不要硬编码；直接写内联样式的场景可以用 darkTheme 的 fontFamily

## 可复用模板目录

<!-- TEMPLATE_CATALOG_START -->

### KenBurnsImage (`src/templates/KenBurnsImage.tsx`)
全屏图片 + Ken Burns 缓慢缩放动画。经典视频特效。
```tsx
<KenBurnsImage src={imageUrl} direction="zoom-in" />
```
Props: `src`(必填), `direction`("zoom-in"|"zoom-out"), `fromScale`, `toScale`, `objectFit`

### TextReveal (`src/templates/TextReveal.tsx`)
文字出现动画，支持 fade-in / typewriter / slide-up / word-by-word 四种模式。
```tsx
<TextReveal text="你好世界" mode="slide-up" fontSize={64} />
```
Props: `text`(必填), `fontSize`, `mode`, `color`, `textAlign`, `padding`

### GradientBackground (`src/templates/GradientBackground.tsx`)
多色渐变背景 + 可选动画。常作为其他组件的背景层。
```tsx
<GradientBackground colors={['#667eea', '#764ba2']} angle={135} animated>
  <TextReveal text="标题" />
</GradientBackground>
```
Props: `colors`(必填, 至少2色), `angle`, `animated`, `children`

### SplitLayout (`src/templates/SplitLayout.tsx`)
左右/上下分屏布局，内容各占一半或自定义比例。
```tsx
<SplitLayout ratio={0.6} left={<KenBurnsImage src={url} />} right={<TextReveal text="描述" />} />
```
Props: `direction`("row"|"column"), `ratio`(0-1), `gap`, `left`(必填), `right`(必填)

### TitleCard (`src/templates/TitleCard.tsx`)
居中大标题 + 可选副标题 + 渐变背景。适合章节封面、标题页。
```tsx
<TitleCard title="OCR 插件的神奇之处" subtitle="思源笔记工具介绍" backgroundColors={['#0f0c29', '#302b63']} />
```
Props: `title`(必填), `subtitle`, `backgroundColors`, `color`, `fontSize`

<!-- TEMPLATE_CATALOG_END -->

**创建新模板的流程**：
1. 在 `src/templates/` 下创建 `.tsx` 文件
2. 组件遵循 Remotion 规范，支持 props 参数化
3. 在本文件的"可复用模板目录"中添加描述
4. 下次 AI 生成视频时可以直接 import 复用

## 代码约定

- TypeScript 严格模式，**禁止 `as` 改变类型**
- 函数式组件 + `React.FC` 类型
- 注释用 `/** */` 格式放在变量/参数名上方
- 样式通过 `useTheme()` 获取，避免硬编码颜色值
- 动画通过 `useAnimationStyle(preset)` hook 获取
- 开发阶段 **let it crash**，不用 try-catch 包裹
- 迭代优于下标：用 `for of` 不用 `for i++`

## 持续改进

- **每次执行任务时遇到的坑，必须同步更新到本文件**：包括新的注意事项、修正的错误流程、新发现的最佳实践。确保下次不再犯同样的错误。
- **新增模板组件后，必须在本文件的"可复用模板目录"中添加描述**，否则等于不存在。

## 开发命令

```bash
pnpm start          # Remotion Studio 开发预览（端口 3001）
pnpm proxy          # 启动思源 API 代理（端口 6899，需先启动）
pnpm build          # 渲染 Article composition
pnpm test           # ESLint + tsc 类型检查
```

## 环境要求

- 代理服务器（`pnpm proxy`）必须先启动，Remotion 才能访问思源 API
- `.env` 文件配置：`siyuan_token`、`siyuan_base`、`proxy_base`、`proxy_port`
