import type {ParsedBlock} from '../siyuan/types';
import type {AnimationPreset} from '../animations/presets';

/**
 * 所有块渲染组件的统一 props 接口
 */
export interface BlockProps {
	/** 解析后的块数据 */
	block: ParsedBlock;
	/** 该块的持续帧数 */
	durationInFrames: number;
	/** 动画预设 */
	animation?: AnimationPreset;
}
