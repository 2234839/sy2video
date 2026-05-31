import http from 'http';
import proxy from 'http-proxy';
import {config} from '../config';

/**
 * 启动思源笔记鉴权代理服务器
 *
 * 所有请求自动注入 Authorization: Token xxx 头，解决跨域鉴权问题
 * 支持 HTTP 和 WebSocket 代理
 */
export function startProxyServer(): void {
	const token = config.token;

	if (!token) {
		console.error('[proxy] 未配置 siyuan_token，请在 .env 中设置');
		process.exit(1);
	}

	const proxyServer = proxy.createProxyServer({});

	const server = http.createServer((req, res) => {
		/** 健康检查端点 */
		if (req.url === '/health') {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify({status: 'ok'}));
			return;
		}

		req.headers['Authorization'] = `Token ${token}`;
		proxyServer.web(req, res, {target: config.baseUrl}, (error) => {
			console.error('[proxy] request error:', error.message);
			if (!res.headersSent) {
				res.writeHead(502, {'Content-Type': 'application/json'});
			}
			res.end(JSON.stringify({error: error.message}));
		});
	});

	/** WebSocket 代理 */
	server.on('upgrade', (req, socket, head) => {
		req.headers['Authorization'] = `Token ${token}`;
		proxyServer.ws(req, socket, head, {target: config.baseUrl}, (error) => {
			console.error('[proxy] WebSocket error:', error.message);
			socket.destroy();
		});
	});

	const port = config.proxyBasePort;
	server.listen(port, () => {
		console.log(`[proxy] 思源笔记代理服务器已启动 → http://localhost:${port}`);
	});
}
