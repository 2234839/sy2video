import type {SiYuanBlockType, SuperBlockLayout} from './block-types';
import type {AnimationPreset} from '../animations/presets';

/**
 * 思源 API 通用响应格式
 */
export interface SiYuanResponse<T> {
	code: number;
	msg: string;
	data: T;
}

/**
 * blocks 表中的原始行数据（SQL 查询结果）
 */
export interface SiYuanBlockRow {
	id: string;
	type: SiYuanBlockType;
	subtype?: string;
	content: string;
	markdown: string;
	parent_id: string;
	root_id: string;
	box: string;
	hpath: string;
	created: string;
	updated: string;
}

/**
 * 解析后的结构化块数据，用于渲染
 */
export interface ParsedBlock {
	/** 块 ID */
	id: string;
	/** 块类型 */
	type: SiYuanBlockType;
	/** 纯文本内容（无格式标记） */
	content: string;
	/** kramdown 源码（含格式标记） */
	markdown: string;
	/** 子块（用于超级块、列表等容器类型） */
	children: ParsedBlock[];
	/** 超级块布局方向 */
	layout?: SuperBlockLayout;
	/** 提取的资源 */
	assets: ParsedAssets;
	/** custom-sy2video 配置 */
	sy2videoConfig?: Sy2VideoConfig;
}

/**
 * 从块中提取的资源文件
 */
export interface ParsedAssets {
	images: Array<{src: string; alt?: string}>;
	audios: Array<{src: string}>;
	videos: Array<{src: string}>;
}

/**
 * custom-sy2video 属性的配置
 */
export interface Sy2VideoConfig {
	/** 总播放时长（秒） */
	time?: number;
	/** 音视频开始播放的时间点（秒） */
	startTime?: number;
	/** 音视频结束播放的时间点（秒） */
	endTime?: number;
	/** 该块的动画预设 */
	animation?: AnimationPreset;
}

/**
 * 视频分段计划（由 calculateMetadata 生成）
 */
export interface SegmentPlan {
	/** 超级块 ID */
	id: string;
	/** 该段的播放时长（秒） */
	durationSeconds: number;
	/** 超级块配置 */
	config: Sy2VideoConfig;
	/** 超级块解析后的子块 */
	children: ParsedBlock[];
	/** 超级块布局方向 */
	layout: SuperBlockLayout;
}
