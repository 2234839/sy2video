/**
 * 思源笔记块类型枚举
 *
 * 对应 blocks 表中的 type 字段
 * d=文档 h=标题 p=段落 l=列表 i=列表项 c=代码 t=表格 b=引用 s=超级块
 */
export enum SiYuanBlockType {
	/** 文档 */
	Document = 'd',
	/** 标题 */
	Heading = 'h',
	/** 段落 */
	Paragraph = 'p',
	/** 列表 */
	List = 'l',
	/** 列表项 */
	ListItem = 'i',
	/** 代码块 */
	Code = 'c',
	/** 表格 */
	Table = 't',
	/** 引用块 */
	Blockquote = 'b',
	/** 超级块 */
	SuperBlock = 's',
	/** 音频 */
	Audio = 'audio',
	/** 视频 */
	Video = 'video',
}

/** 超级块布局方向 */
export type SuperBlockLayout = 'row' | 'col';

/** 从 markdown 中的 {{{row / {{{col 提取布局方向 */
export function parseSuperBlockLayout(markdown: string): SuperBlockLayout {
	if (markdown.startsWith('{{{row')) return 'row';
	if (markdown.startsWith('{{{col')) return 'col';
	return 'row';
}
