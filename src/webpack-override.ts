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

const server = http.createServer((req, res) => {
	// 目标服务器URL
	const target = 'http://localhost:6806';

	// 修改请求头
	req.headers['Authorization'] = `Token ${env.parsed?.siyuan_token}`;
	// 转发请求
	// proxyServer.
	// console.log('[req.url]', req.url);
	proxyServer.web(req, res, {target: target}, (error) => {

		res.writeHead(500, {
			'Content-Type': 'text/plain',
		});
		res.end(`Error: ${error.message}`);
	});
});

const PORT = 6805;
server.listen(PORT, () => {
	console.log(`siyuan Proxy server is running at http://localhost:${PORT}`);
});
