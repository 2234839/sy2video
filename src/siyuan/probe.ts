/**
 * 文档资源探测器
 *
 * 拿到一个笔记 ID，一次调用返回所有信息：
 * - 全文文本（可直接阅读）
 * - 块树（含 assets、layout、config 等完整信息）
 * - 图片/音频/视频资源列表（路径 + URL + 来源块）
 * - 音频/视频自动转写（FunASR），结果附在 analysis 字段
 *
 * 中间产物存放在项目 data/{创建时间-标题}/ 目录下，跨调用可复用。
 */
import {SiYuanBlockType} from './block-types';
import type {SiYuanBlockRow, ParsedBlock} from './types';
import {siyuanClient} from './client';
import {parseKramdownBlock} from './kramdown-parser';
import {analyzeAudio, extractAudioTrack} from '../asr';
import type {AudioAnalysis} from '../asr';
import path from 'path';
import fs from 'fs';

/** 资源文件信息 */
export interface AssetInfo {
	/** 资源相对路径（如 assets/image-xxx.webp） */
	src: string;
	/** 通过代理访问的完整 URL */
	url: string;
	/** 来自哪个块 */
	blockId: string;
}

/** 带转写结果的音频/视频资源信息 */
export interface AudioAssetInfo extends AssetInfo {
	/** 转写分析结果（仅当音频/视频被成功转写时存在） */
	analysis?: AudioAnalysis;
}

/** 文档资源探测结果 */
export interface DocumentProbe {
	/** 文档 ID */
	docId: string;
	/** 文档标题 */
	title: string;
	/** 文档人类可读路径 */
	hpath: string;
	/** 数据目录路径（存放下载的资源、转写结果等中间产物） */
	dataDir: string;

	/**
	 * 文档全文文本（按层级拼接的纯文本）
	 * AI 可直接阅读此字段理解文档内容，无需遍历块树
	 */
	fullText: string;

	/**
	 * 解析后的块树（含 assets、layout、config 等完整信息）
	 * 用于渲染组件时按块分发
	 */
	blocks: ParsedBlock[];

	/** 所有图片资源（跨块去重） */
	images: AssetInfo[];
	/** 所有音频资源（跨块去重，含转写结果） */
	audios: AudioAssetInfo[];
	/** 所有视频资源（跨块去重，含转写结果） */
	videos: AudioAssetInfo[];
}

/** 项目 data 目录 */
const DATA_ROOT = path.join(process.cwd(), 'data');

/**
 * 探测文档：获取文本内容 + 所有资源文件
 *
 * 音频/视频资源会自动下载并转写（FunASR），结果附在 analysis 字段。
 * 中间产物存放在 data/{创建时间-标题}/ 下，已有结果会跳过（缓存复用）。
 *
 * @param docId 思源笔记文档 ID
 * @returns 文档探测结果
 */
export async function probeDocument(docId: string): Promise<DocumentProbe> {
	const rows = await siyuanClient.getDocBlocks(docId);

	/** 找到文档块，提取 title 和 hpath */
	const docBlock = rows.find((r) => r.id === docId);
	const title = docBlock?.content || '';
	const hpath = docBlock?.hpath || '';

	/** 创建数据目录：data/{docId} */
	const dataDir = path.join(DATA_ROOT, docId);
	fs.mkdirSync(dataDir, {recursive: true});

	/** 构建块树 */
	const blocks = buildBlockTree(rows, docId);

	/** 生成全文文本 */
	const fullText = blocksToFullText(blocks);

	/** 聚合所有资源 */
	const {images, audios, videos} = collectAssets(blocks);

	/** 对音频和视频资源自动转写（支持缓存复用） */
	const transcribedAudios = await transcribeAssets(audios, dataDir);
	const transcribedVideos = await transcribeAssets(videos, dataDir);

	return {docId, title, hpath, dataDir, fullText, blocks, images, audios: transcribedAudios, videos: transcribedVideos};
}

/**
 * 下载音频/视频资源并转写
 *
 * 中间产物保存在 dataDir 下：
 * - 原始文件：{filename}
 * - 转写结果：{filename}.analysis.json
 *
 * 如果 analysis.json 已存在，直接读取（缓存复用）。
 */
async function transcribeAssets(assets: AssetInfo[], dataDir: string): Promise<AudioAssetInfo[]> {
	const results: AudioAssetInfo[] = [];

	for (const asset of assets) {
		const info: AudioAssetInfo = {...asset};

		/** 资源文件名 */
		const assetName = path.basename(asset.src);
		const localPath = path.join(dataDir, assetName);
		const analysisCachePath = localPath + '.analysis.json';

		/** 缓存命中：已有转写结果，直接复用 */
		if (fs.existsSync(analysisCachePath)) {
			const cached = JSON.parse(fs.readFileSync(analysisCachePath, 'utf8')) as AudioAnalysis;
			info.analysis = cached;
			results.push(info);
			continue;
		}

		/** 下载资源文件（如果本地不存在） */
		if (!fs.existsSync(localPath)) {
			const res = await fetch(asset.url);
			if (!res.ok) {
				results.push(info);
				continue;
			}
			const buffer = Buffer.from(await res.arrayBuffer());
			fs.writeFileSync(localPath, buffer);
		}

		/** 视频需要先提取音频轨道 */
		const isVideo = /\.(mp4|mkv|avi|mov|webm|flv)$/i.test(assetName);
		const audioPath = isVideo
			? await extractAudioTrack(localPath, localPath + '.wav')
			: localPath;

		/** FunASR 转写 */
		info.analysis = await analyzeAudio(audioPath);

		/** 缓存转写结果 */
		fs.writeFileSync(analysisCachePath, JSON.stringify(info.analysis, null, 2));

		results.push(info);
	}

	return results;
}

/**
 * 从扁平的块列表构建块树
 *
 * @param rows 所有块行数据
 * @param parentId 父块 ID（文档 ID 或其他容器块 ID）
 * @returns 解析后的子块列表
 */
function buildBlockTree(rows: SiYuanBlockRow[], parentId: string): ParsedBlock[] {
	/** 找到直接子块 */
	const children = rows.filter((r) => r.parent_id === parentId);

	return children.map((row) => {
		/** 递归构建子块 */
		const nestedChildren = buildBlockTree(rows, row.id);

		return parseKramdownBlock(
			row.id,
			row.type as SiYuanBlockType,
			row.content || '',
			row.markdown || '',
			nestedChildren,
		);
	});
}

/**
 * 将块树转换为可读的全文文本
 *
 * 按块类型添加 Markdown 格式标记，AI 可直接阅读。
 */
function blocksToFullText(blocks: ParsedBlock[], depth: number = 0): string {
	const parts: string[] = [];

	for (const block of blocks) {
		const prefix = '  '.repeat(depth);

		switch (block.type) {
			case SiYuanBlockType.Heading: {
				const hashes = '#'.repeat(Math.min(depth + 1, 6));
				parts.push(`${prefix}${hashes} ${block.content}`);
				break;
			}
			case SiYuanBlockType.Paragraph: {
				if (block.content) {
					parts.push(`${prefix}${block.content}`);
				}
				break;
			}
			case SiYuanBlockType.List: {
				parts.push(`${prefix}${block.content}`);
				break;
			}
			case SiYuanBlockType.ListItem: {
				parts.push(`${prefix}- ${block.content}`);
				break;
			}
			case SiYuanBlockType.Code: {
				parts.push(`${prefix}\`\`\`\n${block.content}\n\`\`\``);
				break;
			}
			case SiYuanBlockType.Blockquote: {
				parts.push(`${prefix}> ${block.content}`);
				break;
			}
			case SiYuanBlockType.Table: {
				parts.push(`${prefix}${block.content}`);
				break;
			}
			case SiYuanBlockType.Audio: {
				const src = block.assets.audios[0]?.src || '';
				parts.push(`${prefix}[音频: ${src}]`);
				break;
			}
			case SiYuanBlockType.Video: {
				const src = block.assets.videos[0]?.src || '';
				parts.push(`${prefix}[视频: ${src}]`);
				break;
			}
			default: {
				if (block.content) {
					parts.push(`${prefix}${block.content}`);
				}
				break;
			}
		}

		/** 递归处理子块 */
		if (block.children.length > 0) {
			parts.push(blocksToFullText(block.children, depth + 1));
		}
	}

	return parts.join('\n');
}

/**
 * 遍历块树，收集所有资源文件（去重）
 */
function collectAssets(blocks: ParsedBlock[]): {
	images: AssetInfo[];
	audios: AudioAssetInfo[];
	videos: AudioAssetInfo[];
} {
	const imageSet = new Map<string, AssetInfo>();
	const audioSet = new Map<string, AudioAssetInfo>();
	const videoSet = new Map<string, AudioAssetInfo>();

	/** 递归遍历块树 */
	function walk(block: ParsedBlock) {
		for (const img of block.assets.images) {
			if (!imageSet.has(img.src)) {
				imageSet.set(img.src, {
					src: img.src,
					url: siyuanClient.assetUrl(img.src),
					blockId: block.id,
				});
			}
		}
		for (const audio of block.assets.audios) {
			if (!audioSet.has(audio.src)) {
				audioSet.set(audio.src, {
					src: audio.src,
					url: siyuanClient.assetUrl(audio.src),
					blockId: block.id,
				});
			}
		}
		for (const video of block.assets.videos) {
			if (!videoSet.has(video.src)) {
				videoSet.set(video.src, {
					src: video.src,
					url: siyuanClient.assetUrl(video.src),
					blockId: block.id,
				});
			}
		}

		for (const child of block.children) {
			walk(child);
		}
	}

	for (const block of blocks) {
		walk(block);
	}

	return {
		images: [...imageSet.values()],
		audios: [...audioSet.values()],
		videos: [...videoSet.values()],
	};
}
