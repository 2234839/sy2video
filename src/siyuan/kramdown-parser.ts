import {SiYuanBlockType, parseSuperBlockLayout} from './block-types';
import type {ParsedBlock, ParsedAssets, Sy2VideoConfig} from './types';

/**
 * 解析思源笔记的 kramdown/markdown 字段为结构化块数据
 *
 * kramdown 格式示例：
 * - 超级块：{{{row ... }}} 或 {{{col ... }}}
 * - 属性块：{: id="xxx" updated="xxx"}
 * - 图片：![alt](src)
 * - 音频：<audio src="xxx" data-src="xxx"></audio>
 * - 视频：<video src="xxx" data-src="xxx"></video>
 * - 标题：### text
 * - 列表：1. / - / * [ ] / * [x]
 * - 代码：```lang\ncode\n```
 * - 引用：> text
 */
export function parseKramdownBlock(
	id: string,
	type: SiYuanBlockType,
	content: string,
	markdown: string,
	children: ParsedBlock[],
): ParsedBlock {
	const assets = extractAssets(markdown);
	const sy2videoConfig = parseSy2VideoConfig(markdown);

	const result: ParsedBlock = {
		id,
		type,
		content,
		markdown,
		children,
		assets,
		sy2videoConfig,
	};

	if (type === SiYuanBlockType.SuperBlock) {
		result.layout = parseSuperBlockLayout(markdown.trim());
	}

	return result;
}

/**
 * 从 markdown 文本中提取所有资源文件
 */
export function extractAssets(markdown: string): ParsedAssets {
	const assets: ParsedAssets = {
		images: [],
		audios: [],
		videos: [],
	};

	/** ![alt](src) 或 ![alt](src){: ...} */
	const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
	let match: RegExpExecArray | null;
	while ((match = imgRegex.exec(markdown)) !== null) {
		assets.images.push({src: match[2], alt: match[1]});
	}

	/** <audio ... data-src="xxx" 或 src="xxx" ...> */
	const audioRegex = /<audio[^>]*\b(?:data-)?src="([^"]+)"[^>]*>/g;
	while ((match = audioRegex.exec(markdown)) !== null) {
		assets.audios.push({src: match[1]});
	}

	/** <video ... data-src="xxx" 或 src="xxx" ...> */
	const videoRegex = /<video[^>]*\b(?:data-)?src="([^"]+)"[^>]*>/g;
	while ((match = videoRegex.exec(markdown)) !== null) {
		assets.videos.push({src: match[1]});
	}

	return assets;
}

/**
 * 解析 custom-sy2video 配置
 * 存储在属性块 {: custom-sy2video="..."} 中
 */
export function parseSy2VideoConfig(markdown: string): Sy2VideoConfig | undefined {
	/** 查找 {: ... custom-sy2video="..." ...} */
	const attrRegex = /\{:[^}]*custom-sy2video="([^"]*)"[^}]*\}/;
	const match = attrRegex.exec(markdown);
	if (!match) return undefined;

	try {
		return JSON.parse(match[1]) as Sy2VideoConfig;
	} catch {
		console.warn('[kramdown-parser] 无法解析 sy2video 配置:', match[1]);
		return undefined;
	}
}

/**
 * 从标题 markdown 中提取标题级别和文本
 * 例如 "### OCR 插件的神奇之处" → {level: 3, text: "OCR 插件的神奇之处"}
 */
export function parseHeading(markdown: string): {level: number; text: string} {
	const match = markdown.match(/^(#{1,6})\s+(.+)$/m);
	if (!match) return {level: 1, text: markdown};
	return {level: match[1].length, text: match[2]};
}

/**
 * 从列表 markdown 中提取列表项
 * 支持有序列表（1. 2. 3.）、无序列表（- / *）、任务列表（* [ ] / * [x]）
 */
export function parseListItems(markdown: string): Array<{
	text: string;
	checked?: boolean;
	ordered: boolean;
}> {
	const items: Array<{text: string; checked?: boolean; ordered: boolean}> = [];
	const lines = markdown.split('\n');
	let isOrdered = false;

	for (const line of lines) {
		/** 有序列表项：1. text 或 1. {: ...} */
		const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
		if (orderedMatch) {
			isOrdered = true;
			items.push({text: orderedMatch[1], ordered: true});
			continue;
		}

		/** 任务列表项：* [x] text 或 * [ ] text */
		const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
		if (taskMatch) {
			items.push({
				text: taskMatch[2],
				checked: taskMatch[1] !== ' ',
				ordered: false,
			});
			continue;
		}

		/** 无序列表项：- text 或 * text */
		const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
		if (unorderedMatch) {
			items.push({text: unorderedMatch[1], ordered: false});
		}
	}

	/** 如果所有项都是有序的，标记整个列表为有序 */
	if (isOrdered) {
		for (const item of items) {
			item.ordered = true;
		}
	}

	return items;
}

/**
 * 从代码块 markdown 中提取语言和代码内容
 * 例如 ```js\ncode\n``` → {lang: "js", code: "code"}
 */
export function parseCodeBlock(markdown: string): {lang: string; code: string} {
	const match = markdown.match(/```(\w*)\n([\s\S]*?)```/);
	if (!match) return {lang: '', code: markdown};
	return {lang: match[1], code: match[2]};
}

/**
 * 从引用 markdown 中提取引用文本
 * 例如 "> text" → "text"
 */
export function parseBlockquote(markdown: string): string {
	return markdown
		.split('\n')
		.map((line) => line.replace(/^>\s?/, ''))
		.join('\n');
}

/**
 * 将 markdown 内联标记（粗体、链接等）转换为纯文本
 * 用于显示和 LLM 分析
 */
export function stripInlineMarkdown(text: string): string {
	return text
		.replace(/\*\*(.+?)\*\*/g, '$1') /** 粗体 */
		.replace(/\*(.+?)\*/g, '$1') /** 斜体 */
		.replace(/`(.+?)`/g, '$1') /** 行内代码 */
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') /** 链接 */
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') /** 图片 */
		.trim();
}
