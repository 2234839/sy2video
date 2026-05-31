import {Composition} from 'remotion';
import {calculateArticleMetadata} from './metadata/calculateArticleMetadata';
import {ArticleComposition} from './composition/ArticleComposition';
import {ArticleCompSchema} from './composition/schemas';
import {VideoOcrPlugin, VIDEO_OCR_PLUGIN_DURATION} from './generated/video-ocr-plugin';
import {VideoWebfont, VIDEO_WEBFONT_DURATION} from './generated/video-webfont';
import './style.css';

export const RemotionRoot: React.FC = () => {
	const fps = 24;
	const width = 1920;
	const height = 1080;
	return (
		<>
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
				calculateMetadata={async ({props}) => {
					return calculateArticleMetadata(props, {fps});
				}}
			/>

			{/* AI 生成的视频 */}
			<Composition
				id="VideoOcrPlugin"
				component={VideoOcrPlugin}
				durationInFrames={VIDEO_OCR_PLUGIN_DURATION}
				fps={fps}
				width={width}
				height={height}
			/>

			<Composition
				id="VideoWebfont"
				component={VideoWebfont}
				durationInFrames={VIDEO_WEBFONT_DURATION}
				fps={fps}
				width={width}
				height={height}
			/>
		</>
	);
};
