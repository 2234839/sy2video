import {useVideoConfig} from 'remotion';

/** 横屏基准宽度 */
const LANDSCAPE_BASE_WIDTH = 1920;

/**
 * 根据视频宽度等比缩放尺寸
 *
 * 以 1920px 横屏为基准，竖屏(1080px)自动缩小为约 56%。
 * 下限 0.45，避免在极端尺寸下字号过小不可读。
 *
 * @param baseSize 基准尺寸（基于 1920 宽度设计）
 * @returns 缩放后的尺寸
 */
export function useResponsiveSize(baseSize: number): number {
	const {width} = useVideoConfig();
	const scale = Math.max(width / LANDSCAPE_BASE_WIDTH, 0.45);
	return Math.round(baseSize * scale);
}
