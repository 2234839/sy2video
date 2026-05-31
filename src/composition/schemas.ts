import {z} from 'zod';
import type {VideoTheme} from '../theme/types';
import type {SegmentPlan} from '../siyuan/types';

/**
 * Article Composition 的 props schema
 *
 * articleId 由用户传入，segments/theme/transition 由 calculateMetadata 动态注入
 */
export const ArticleCompSchema = z.object({
	articleId: z.string(),
	/** 主题预设名称（light/dark） */
	theme: z.string().optional(),
	/** 分段过渡类型 */
	transition: z.enum(['fade', 'slide', 'wipe', 'none']).optional(),
	/** 过渡持续帧数 */
	transitionDurationFrames: z.number().optional(),
});

/**
 * Article Composition 的完整 props 类型（包含 calculateMetadata 注入的数据）
 */
export type ArticleCompProps = z.infer<typeof ArticleCompSchema> & {
	segments?: SegmentPlan[];
	/** calculateMetadata 解析后的主题对象 */
	resolvedTheme?: VideoTheme;
};
