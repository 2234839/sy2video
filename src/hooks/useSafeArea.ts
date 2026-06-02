import {useAspectRatio} from './useAspectRatio';

/** 安全区 padding 配置 */
interface SafeAreaPadding {
	/** 上边距 */
	top: number;
	/** 右边距 */
	right: number;
	/** 下边距 */
	bottom: number;
	/** 左边距 */
	left: number;
}

/** 横屏安全区：上 150px（标题/状态栏）、下 170px（字幕区）、侧 60px */
const LANDSCAPE_SAFE_AREA: SafeAreaPadding = {
	top: 150,
	right: 60,
	bottom: 170,
	left: 60,
};

/** 竖屏安全区：上 150px、下 170px、侧 40px（屏幕窄，留更多内容空间） */
const PORTRAIT_SAFE_AREA: SafeAreaPadding = {
	top: 150,
	right: 40,
	bottom: 170,
	left: 40,
};

/**
 * 获取当前方向的安全区 padding
 *
 * 返回 CSS padding 字符串，用于 SceneShell 等容器组件。
 */
export function useSafeArea(): string {
	const ratio = useAspectRatio();
	const area = ratio === 'landscape' ? LANDSCAPE_SAFE_AREA : PORTRAIT_SAFE_AREA;
	return `${area.top}px ${area.right}px ${area.bottom}px ${area.left}px`;
}

/**
 * 获取当前方向的安全区配置对象
 *
 * 需要分别访问各方向数值时使用。
 */
export function useSafeAreaValues(): SafeAreaPadding {
	const ratio = useAspectRatio();
	return ratio === 'landscape' ? LANDSCAPE_SAFE_AREA : PORTRAIT_SAFE_AREA;
}
