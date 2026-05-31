import {loadFont, fontFamily} from '@remotion/google-fonts/NotoSansSC';

/** Noto Sans SC 字体族名 */
export const notoSansSCFamily = fontFamily;

/**
 * 加载 Noto Sans SC 中文字体（仅加载常用字重 + 中文字集）
 *
 * 默认加载全部 9 个字重 × 5 个子集 = 909 次网络请求，
 * 指定子集后仅加载所需字重，大幅减少请求量
 */
export const loadNotoSansSC = () =>
	loadFont('normal', {
		weights: ['400', '700'],
		subsets: ['chinese-simplified', 'latin'],
		ignoreTooManyRequestsWarning: true,
	});
