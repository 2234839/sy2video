import type {VideoTheme} from './types';

/**
 * 浅色主题 — 精确复现当前所有硬编码值，保证向后兼容
 */
export const lightTheme: VideoTheme = {
	name: 'light',
	background: '#ffffff',
	fontFamily: 'Noto Sans SC, sans-serif',
	blockPadding: '60px 120px',
	heading: {
		sizes: {1: 72, 2: 60, 3: 52, 4: 44, 5: 38, 6: 34},
		style: {lineHeight: 1.4, color: '#111111', fontWeight: 'bold'},
	},
	paragraph: {
		style: {fontSize: 42, lineHeight: 1.8, color: '#1a1a1a'},
	},
	code: {
		containerBg: '#1e1e1e',
		containerBorderRadius: 12,
		headerBg: '#2d2d2d',
		headerColor: '#888888',
		headerFontSize: 16,
		codeStyle: {
			fontSize: 28,
			lineHeight: 1.6,
			color: '#d4d4d4',
			fontFamily: 'monospace',
		},
	},
	quote: {
		borderLeftColor: '#3b82f6',
		borderLeftWidth: '4px solid',
		backgroundColor: '#eff6ff',
		borderRadius: '0 8px 8px 0',
		style: {fontSize: 36, lineHeight: 1.8, color: '#1e40af'},
	},
	list: {
		itemStyle: {fontSize: 36, lineHeight: 2, color: '#1a1a1a'},
		bulletFontSize: 24,
		bulletMinWidth: 20,
		orderedMinWidth: 30,
		checkboxFontSize: 24,
	},
	fallback: {
		backgroundColor: '#fef3c7',
		labelStyle: {fontSize: 20, color: '#92400e'},
		contentStyle: {fontSize: 24, lineHeight: 1.5, color: '#1a1a1a'},
	},
};

/**
 * 深色主题
 */
export const darkTheme: VideoTheme = {
	name: 'dark',
	background: '#0f0f0f',
	fontFamily: 'Noto Sans SC, sans-serif',
	blockPadding: '60px 120px',
	heading: {
		sizes: {1: 72, 2: 60, 3: 52, 4: 44, 5: 38, 6: 34},
		style: {lineHeight: 1.4, color: '#f0f0f0', fontWeight: 'bold'},
	},
	paragraph: {
		style: {fontSize: 42, lineHeight: 1.8, color: '#e0e0e0'},
	},
	code: {
		containerBg: '#1a1a2e',
		containerBorderRadius: 12,
		headerBg: '#16213e',
		headerColor: '#888888',
		headerFontSize: 16,
		codeStyle: {
			fontSize: 28,
			lineHeight: 1.6,
			color: '#d4d4d4',
			fontFamily: 'monospace',
		},
	},
	quote: {
		borderLeftColor: '#60a5fa',
		borderLeftWidth: '4px solid',
		backgroundColor: '#1e293b',
		borderRadius: '0 8px 8px 0',
		style: {fontSize: 36, lineHeight: 1.8, color: '#93c5fd'},
	},
	list: {
		itemStyle: {fontSize: 36, lineHeight: 2, color: '#e0e0e0'},
		bulletFontSize: 24,
		bulletMinWidth: 20,
		orderedMinWidth: 30,
		checkboxFontSize: 24,
	},
	fallback: {
		backgroundColor: '#422006',
		labelStyle: {fontSize: 20, color: '#fbbf24'},
		contentStyle: {fontSize: 24, lineHeight: 1.5, color: '#e0e0e0'},
	},
};

/** 主题名称 → 预设映射 */
export const THEME_PRESETS: Record<string, VideoTheme> = {
	light: lightTheme,
	dark: darkTheme,
};
