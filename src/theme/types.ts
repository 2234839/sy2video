/**
 * 视频主题类型定义
 *
 * 覆盖所有块组件中硬编码的样式值，
 * 每个块类型的样式集中在一个子对象中
 */

/** 文本样式基元 */
export interface TextStyle {
	/** 字号 */
	readonly fontSize: number;
	/** 行高 */
	readonly lineHeight: number;
	/** 文字颜色 */
	readonly color: string;
	/** 字重 */
	readonly fontWeight?: string;
	/** 字体族（覆盖全局 fontFamily） */
	readonly fontFamily?: string;
}

/** 标题块主题 */
export interface HeadingTheme {
	/** 各级别字号映射（1-6） */
	readonly sizes: Readonly<Record<number, number>>;
	/** 标题文本样式 */
	readonly style: Omit<TextStyle, 'fontSize'>;
}

/** 段落块主题 */
export interface ParagraphTheme {
	readonly style: TextStyle;
}

/** 代码块主题 */
export interface CodeTheme {
	/** 容器背景色 */
	readonly containerBg: string;
	/** 容器圆角 */
	readonly containerBorderRadius: number;
	/** 语言标签背景色 */
	readonly headerBg: string;
	/** 语言标签文字颜色 */
	readonly headerColor: string;
	/** 语言标签字号 */
	readonly headerFontSize: number;
	/** 代码文本样式 */
	readonly codeStyle: TextStyle;
}

/** 引用块主题 */
export interface QuoteTheme {
	/** 左边框颜色 */
	readonly borderLeftColor: string;
	/** 左边框宽度（含样式，如 "4px solid"） */
	readonly borderLeftWidth: string;
	/** 背景色 */
	readonly backgroundColor: string;
	/** 容器圆角 */
	readonly borderRadius: string;
	/** 引用文本样式 */
	readonly style: TextStyle;
}

/** 列表块主题 */
export interface ListTheme {
	/** 列表项文本样式 */
	readonly itemStyle: TextStyle;
	/** 项目符号字号 */
	readonly bulletFontSize: number;
	/** 无序列表符号最小宽度 */
	readonly bulletMinWidth: number;
	/** 有序列表序号最小宽度 */
	readonly orderedMinWidth: number;
	/** 复选框字号 */
	readonly checkboxFontSize: number;
}

/** 降级块主题（未支持的块类型） */
export interface FallbackTheme {
	/** 背景色 */
	readonly backgroundColor: string;
	/** 标签文字样式 */
	readonly labelStyle: Omit<TextStyle, 'lineHeight'>;
	/** 内容文字样式 */
	readonly contentStyle: TextStyle;
}

/** 完整视频主题 */
export interface VideoTheme {
	/** 主题名称 */
	readonly name: string;
	/** 文章级背景色 */
	readonly background: string;
	/** 全局字体族 */
	readonly fontFamily: string;
	/** 统一块内边距 */
	readonly blockPadding: string;
	/** 标题样式 */
	readonly heading: HeadingTheme;
	/** 段落样式 */
	readonly paragraph: ParagraphTheme;
	/** 代码块样式 */
	readonly code: CodeTheme;
	/** 引用块样式 */
	readonly quote: QuoteTheme;
	/** 列表样式 */
	readonly list: ListTheme;
	/** 降级块样式 */
	readonly fallback: FallbackTheme;
}
