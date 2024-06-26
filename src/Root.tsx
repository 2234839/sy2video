import {cancelRender, Composition, Folder} from 'remotion';
import {myCompSchema} from './Composition';
import './style.css';
import {testComposition} from './testComposition';
import {BlockComposition, BlockCompositionSchema} from './composition/BlockCom';
import {ArticleCompSchema, ArticleComposition} from './composition/articleCom';
import {siyuanArticleInfo, siyuanAsset} from './siyuan';
import {getVideoMetadata} from '@remotion/media-utils';

export const RemotionRoot: React.FC = () => {
	const fps = 24;
	const width = 1920;
	const height = 1080;
	const defaultTime = fps * 5;
	return (
		<>
			<Folder name="siyuanCompositions">
				<Composition
					id="Block"
					component={BlockComposition}
					durationInFrames={defaultTime}
					fps={fps}
					width={width}
					height={height}
					schema={BlockCompositionSchema}
					defaultProps={{
						blockId: '20240622103850-90v98k8',
						delay: 2_000,
					}}
				/>
				<Composition
					id="Article"
					component={ArticleComposition}
					durationInFrames={0}
					fps={fps}
					width={width}
					height={height}
					schema={ArticleCompSchema}
					defaultProps={{
						articleId: '20240620185326-hl2ywbv',
					}}
					calculateMetadata={async ({props, abortSignal}) => {
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
								let time = 4;
								if (audios.length) {
									// 创建一个新的 Audio 对象
									time = await new Promise((r) => {
										const audio = new Audio(
											siyuanAsset(audios[0].dataset.src!),
										);
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
								}, 0) * fps,
						};
					}}
				/>
			</Folder>

			<Composition
				id="1080p"
				component={testComposition}
				durationInFrames={fps * 3}
				fps={fps}
				width={1920}
				height={1080}
				schema={myCompSchema}
				defaultProps={{
					titleText: 'Welcome to Remotion with Tailwind CSS',
					titleColor: '#000000',
					logoColor: '#00bfff',
				}}
			/>
		</>
	);
};
