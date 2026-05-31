import {enableTailwind} from '@remotion/tailwind';
import type {WebpackOverrideFn} from '@remotion/bundler';

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
	const config = enableTailwind(currentConfiguration);

	/** dotenv 17 使用了 Node.js 核心模块，Remotion 的 webpack 环境需要 fallback */
	config.resolve = config.resolve ?? {};
	config.resolve.fallback = {
		...config.resolve.fallback,
		path: false,
		os: false,
		crypto: false,
	};

	return config;
};
