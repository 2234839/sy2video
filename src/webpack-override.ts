import {enableTailwind} from '@remotion/tailwind';
import {WebpackOverrideFn} from '@remotion/bundler';

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
	return enableTailwind(currentConfiguration);
};
import http from 'http';
import proxy from 'http-proxy';
import { config } from './config';

const proxyServer = proxy.createProxyServer({});

if (!config.token) {
	console.log('请在项目根目录下创建 env 文件，配置 siyuan_token 变量');
}
const server = http.createServer((req, res) => {
	req.headers['Authorization'] = `Token ${config.token}`;
	proxyServer.web(req, res, {target: config.baseUrl}, (error) => {
		res.writeHead(500, {
			'Content-Type': 'text/plain',
		});
		res.end(`Error: ${error.message}`);
	});
});

// 监听 WebSocket 升级事件
server.on('upgrade', (req, socket, head) => {
	req.headers['Authorization'] = `Token ${config.token}`;
	proxyServer.ws(req, socket, head, {target: config.baseUrl}, (error) => {
		console.error('WebSocket proxy error:', error);
		socket.destroy();
	});
});

server.listen(config.proxyBasePort, () => {
	console.log(`siyuan Proxy server is running at http://localhost:${config.proxyBasePort}`);
});