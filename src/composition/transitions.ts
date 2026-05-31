/**
 * 过渡效果辅助模块
 *
 * 在 ArticleComposition 中根据配置动态创建过渡
 */

/**
 * 分段过渡类型
 */
export type TransitionType = 'fade' | 'slide' | 'wipe' | 'none';

/** 默认过渡持续帧数 */
export const DEFAULT_TRANSITION_FRAMES = 15;
