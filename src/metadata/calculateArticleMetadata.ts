import {cancelRender} from 'remotion';
import {siyuanClient} from '../siyuan/client';
import {SiYuanBlockType, parseSuperBlockLayout} from '../siyuan/block-types';
import {parseKramdownBlock} from '../siyuan/kramdown-parser';
import type {SiYuanBlockRow, ParsedBlock, SegmentPlan, Sy2VideoConfig} from '../siyuan/types';
import {getAudioDurationWithTimeout} from './audio-utils';
import {THEME_PRESETS, lightTheme} from '../theme/presets';
import type {VideoTheme} from '../theme/types';
import type {TransitionType} from '../composition/transitions';

/** calculateMetadata 的输入 props 扩展 */
interface MetadataProps {
	articleId: string;
	/** 主题预设名称 */
	theme?: string;
	/** 分段过渡类型 */
	transition?: TransitionType;
	/** 过渡持续帧数 */
	transitionDurationFrames?: number;
}

/**
 * 计算文章的元数据（时长、分段信息）
 *
 * 核心流程：
 * 1. 用 SQL 查询文档下所有块
 * 2. 找到超级块作为视频分段
 * 3. 获取每个超级块的子块并构建 ParsedBlock 树
 * 4. 计算每段时长（配置 > 音频时长 > 默认 4 秒）
 * 5. 解析主题和过渡配置
 * 6. 汇总总帧数（减去过渡重叠）
 */
export async function calculateArticleMetadata(
	props: MetadataProps,
	options: {fps: number},
) {
	/** 1. 获取文档下所有块 */
	const allBlocks = await siyuanClient.getDocBlocks(props.articleId);
	if (!allBlocks.length) {
		cancelRender(new Error(`文档 ${props.articleId} 没有任何块`));
	}

	/** 2. 构建 parent_id → children 映射 */
	const childrenMap = new Map<string, SiYuanBlockRow[]>();
	for (const block of allBlocks) {
		const siblings = childrenMap.get(block.parent_id) ?? [];
		siblings.push(block);
		childrenMap.set(block.parent_id, siblings);
	}

	/** 3. 找到所有超级块（作为视频分段） */
	const superBlocks = allBlocks.filter(
		(b) => b.type === SiYuanBlockType.SuperBlock,
	);

	if (!superBlocks.length) {
		cancelRender(new Error(`文档 ${props.articleId} 没有超级块`));
	}

	/** 4. 为每个超级块构建子块树并计算时长 */
	const segments: SegmentPlan[] = await Promise.all(
		superBlocks.map(async (sb) => {
			const childRows = childrenMap.get(sb.id) ?? [];
			const children = childRows.map((child) =>
				buildParsedBlockTree(child, childrenMap),
			);
			const config = extractSy2VideoConfig(sb.markdown) ?? {};
			const layout = parseSuperBlockLayout(sb.markdown.trim());

			/** 时长优先级：配置 > 音频时长 > 默认 4 秒 */
			let durationSeconds = config.time ?? 4;

			if (config.time === undefined) {
				const audioAssets = collectAudioAssets(children);
				if (audioAssets.length > 0) {
					durationSeconds = await getAudioDurationWithTimeout(audioAssets[0]);
				}
			}

			return {
				id: sb.id,
				durationSeconds,
				config,
				children,
				layout,
			};
		}),
	);

	/** 5. 解析主题 */
	const resolvedTheme: VideoTheme = props.theme
		? THEME_PRESETS[props.theme] ?? lightTheme
		: lightTheme;

	/** 6. 计算总帧数（减去过渡重叠） */
	const transitionType = props.transition ?? 'none';
	const transitionDuration = props.transitionDurationFrames ?? 15;
	const segmentFrames =
		segments.reduce((sum, s) => sum + s.durationSeconds, 0) * options.fps;
	const hasTransition = transitionType !== 'none';
	const transitionOverlap = hasTransition
		? transitionDuration * Math.max(0, segments.length - 1)
		: 0;
	const totalFrames = Math.max(1, Math.round(segmentFrames - transitionOverlap));

	return {
		props: {
			...props,
			segments,
			resolvedTheme,
		},
		durationInFrames: totalFrames,
	};
}

/**
 * 递归构建 ParsedBlock 树
 */
function buildParsedBlockTree(
	block: SiYuanBlockRow,
	childrenMap: Map<string, SiYuanBlockRow[]>,
): ParsedBlock {
	const childRows = childrenMap.get(block.id) ?? [];
	const children = childRows.map((child) =>
		buildParsedBlockTree(child, childrenMap),
	);

	return parseKramdownBlock(
		block.id,
		block.type as SiYuanBlockType,
		block.content,
		block.markdown,
		children,
	);
}

/**
 * 从超级块的 markdown 中提取 custom-sy2video 配置
 */
function extractSy2VideoConfig(markdown: string): Sy2VideoConfig | undefined {
	const attrRegex = /\{:[^}]*custom-sy2video="([^"]*)"[^}]*\}/;
	const match = attrRegex.exec(markdown);
	if (!match) return undefined;

	try {
		return JSON.parse(match[1]) as Sy2VideoConfig;
	} catch {
		console.warn('[metadata] 无法解析 sy2video 配置:', match[1]);
		return undefined;
	}
}

/**
 * 递归收集所有音频资源路径
 */
function collectAudioAssets(blocks: ParsedBlock[]): string[] {
	const assets: string[] = [];
	for (const block of blocks) {
		if (block.assets.audios.length > 0) {
			assets.push(...block.assets.audios.map((a) => a.src));
		}
		assets.push(...collectAudioAssets(block.children));
	}
	return assets;
}
