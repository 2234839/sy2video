/**
 * 主题模块统一导出
 */
export type {
	VideoTheme,
	TextStyle,
	HeadingTheme,
	ParagraphTheme,
	CodeTheme,
	QuoteTheme,
	ListTheme,
	FallbackTheme,
} from './types';

export {lightTheme, darkTheme, THEME_PRESETS} from './presets';
export {ThemeProvider, useTheme} from './context';
export {loadNotoSansSC, notoSansSCFamily} from './fonts';
