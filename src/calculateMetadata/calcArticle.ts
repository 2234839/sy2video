import {cancelRender} from 'remotion';
import {siyuanArticleInfo, siyuanAsset} from '../siyuan';

/** 计算文章元数据并返回渲染信息 */
export async function calcArticle(
	props: {articleId: string},
	options: {fps: number},
) {
	const article = await siyuanArticleInfo(props.articleId);
	// 使用 DOMParser 安全解析 HTML，避免执行脚本
	const parser = new DOMParser();
	const articleDoc = parser.parseFromString(article!.data.content, 'text/html');
	const segments = await Promise.all(
		[
			...articleDoc.querySelectorAll<HTMLElement>(
				`[data-type="NodeSuperBlock"]`,
			),
		].map(async (el, index) => {
			const audios = el.querySelectorAll<HTMLAudioElement>(
				`[data-type="NodeAudio"] audio`,
			);
			const sy2videoConfig =
				el.attributes.getNamedItem('custom-sy2video')?.value;
			const config: {
				/** 总播放时长 */
				time?: number;
			} = JSON.parse(sy2videoConfig || '{}');
			console.log('[sy2videoConfig]', config);
			let time = config.time ?? 4;

			if (config.time === undefined && audios.length) {
				time = await new Promise((r) => {
					const audio = new Audio(siyuanAsset(audios[0].dataset.src!));
					audio.load();
					audio.addEventListener('loadedmetadata', () => {
						r(Math.round(audio.duration));
					});
				});
			}
			if (!el) {
				cancelRender(new Error(`没有用于展示的块 ${index}`));
			}
			return {
				blockId: el.dataset.nodeId!,
				time,
			};
		}),
	);
	return {
		props: {
			...props,
			article,
			segments,
		},
		durationInFrames:
			segments.reduce((pre, el) => el.time + pre, 0) * options.fps,
	};
}
