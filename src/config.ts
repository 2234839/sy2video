import {config as dotenvConfig} from 'dotenv';


const env = dotenvConfig();
export const config = {
	token: env.parsed?.siyuan_token,
	baseUrl: env.parsed?.siyuan_base || 'http://localhost:6806',
	/** 代理服务器地址，用于去除 思源的 token 验证 */
	// 需要修改 src/siyuan/index.ts 文件中的地址
	proxyBaseUrl: env.parsed?.proxy_base || 'http://localhost:6899',
	proxyBasePort: env.parsed?.proxy_port || 6899,
};
