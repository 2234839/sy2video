/**
 * 统一配置
 *
 * 在 Node.js 端（proxy、calculateMetadata）通过 .env 文件加载
 * 在浏览器端（Remotion 组件）通过默认值访问代理地址
 *
 * 注意：.env 中的 key 与 process.env 的 key 保持一致
 */
export const config = {
	/** 思源笔记 API token */
	token: process.env.siyuan_token,
	/** 思源笔记原始地址 */
	baseUrl: process.env.siyuan_base || 'http://localhost:6806',
	/** 代理服务器地址（浏览器端通过此地址访问思源） */
	proxyBaseUrl: process.env.proxy_base || 'http://localhost:6899',
	/** 代理服务器端口 */
	proxyBasePort: parseInt(process.env.proxy_port || '6899', 10),
};
