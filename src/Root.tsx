import {Composition, Folder} from 'remotion';
import {calcArticle} from './calculateMetadata/article';
import {BlockComposition, BlockCompositionSchema} from './composition/BlockCom';
import {ArticleComposition, ArticleCompSchema} from './composition/articleCom';
import './style.css';

export const RemotionRoot: React.FC = () => {
	const fps = 24;
	const width = 1920;
	const height = 1080;
	const defaultTime = fps * 5;
	return (
		<>
			<Folder name="siyuanCompositions">
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
						return calcArticle(props, {fps});
					}}
				/>
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
			</Folder>
		</>
	);
};
