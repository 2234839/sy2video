import {useVideoConfig} from 'remotion';

/** 视频方向类型 */
export type AspectRatio = 'landscape' | 'portrait';

/**
 * 获取当前视频方向（横屏 / 竖屏）
 *
 * 基于 useVideoConfig 的 width/height 判断，
 * 组件根据方向自适应布局。
 */
export function useAspectRatio(): AspectRatio {
	const {width, height} = useVideoConfig();
	return width >= height ? 'landscape' : 'portrait';
}
