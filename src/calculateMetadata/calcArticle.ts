import {cancelRender} from 'remotion';
import {siyuanArticleInfo, siyuanAsset} from '../siyuan';
export async function calcArticle(
	props: {articleId: string},
	options: {fps: number},
) {
	const article = await siyuanArticleInfo(props.articleId);
	const articleDom = document.createElement('div');
	articleDom.innerHTML = article!.data.content;
	const segments = await Promise.all(
		[
			...articleDom.querySelectorAll<HTMLElement>(
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

      /** 在用户没有指定块播放时长的情况下尝试通过块内的内容进行计算一个合理的时长 */
			if (config.time === undefined && audios.length) {
				// 创建一个新的 Audio 对象
				time = await new Promise((r) => {
					const audio = new Audio(siyuanAsset(audios[0].dataset.src!));
					// 加载音频文件元数据（包括时长）
					audio.load();

					// 一旦音频元数据加载完成，就可以获取时长
					audio.addEventListener('loadedmetadata', () => {
						const duration = audio.duration;
						console.log('音频时长（秒）:', duration);
						r(Math.round(duration));
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
			segments.reduce((pre, el) => {
				return el.time + pre;
			}, 0) * options.fps,
	};
}
