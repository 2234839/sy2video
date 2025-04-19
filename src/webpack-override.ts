import {enableTailwind} from '@remotion/tailwind';
import {WebpackOverrideFn} from '@remotion/bundler';

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
	return enableTailwind(currentConfiguration);
};
import http from 'http';
import proxy from 'http-proxy';
import {config} from 'dotenv';

const env = config();
const proxyServer = proxy.createProxyServer({});

if (!env.parsed?.siyuan_token) {
	console.log('请在项目根目录下创建 env 文件，配置 siyuan_token 变量');
}
const token = env.parsed?.siyuan_token;
const baseUrl = env.parsed?.siyuan_base || 'http://localhost:6806';
const server = http.createServer((req, res) => {
	req.headers['Authorization'] = `Token ${token}`;
	proxyServer.web(req, res, {target: baseUrl}, (error) => {
		res.writeHead(500, {
			'Content-Type': 'text/plain',
		});
		res.end(`Error: ${error.message}`);
	});
});

// 监听 WebSocket 升级事件
server.on('upgrade', (req, socket, head) => {
	req.headers['Authorization'] = `Token ${token}`;
	proxyServer.ws(req, socket, head, {target: baseUrl}, (error) => {
		console.error('WebSocket proxy error:', error);
		socket.destroy();
	});
});

const PORT = 6899;
server.listen(PORT, () => {
	console.log(`siyuan Proxy server is running at http://localhost:${PORT}`);
});