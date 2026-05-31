import {createContext, useContext} from 'react';
import type {VideoTheme} from './types';
import {lightTheme} from './presets';

const ThemeContext = createContext<VideoTheme>(lightTheme);

/**
 * 主题 Provider — 包裹在 ArticleComposition 内部
 */
export const ThemeProvider: React.FC<{
	theme: VideoTheme;
	children: React.ReactNode;
}> = ({theme, children}) => (
	<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

/**
 * 获取当前视频主题
 */
export function useTheme(): VideoTheme {
	return useContext(ThemeContext);
}
