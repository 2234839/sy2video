import {Composition} from 'remotion';
import {calculateArticleMetadata} from './metadata/calculateArticleMetadata';
import {ArticleComposition} from './composition/ArticleComposition';
import {ArticleCompSchema} from './composition/schemas';
import {VideoOcrPlugin, VIDEO_OCR_PLUGIN_DURATION} from './generated/video-ocr-plugin';
import {VideoWebfont, VideoWebfontPortrait, VIDEO_WEBFONT_DURATION} from './generated/video-webfont';
import './style.css';

/** 横屏参数 */
const LANDSCAPE = {width: 1920, height: 1080};
/** 竖屏参数 */
const PORTRAIT = {width: 1080, height: 1920};

export const RemotionRoot: React.FC = () => {
	const fps = 24;
	return (
		<>
			<Composition
				id="Article"
				component={ArticleComposition}
				durationInFrames={0}
				fps={fps}
				width={LANDSCAPE.width}
				height={LANDSCAPE.height}
				schema={ArticleCompSchema}
				defaultProps={{
					articleId: '20240620185326-hl2ywbv',
				}}
				calculateMetadata={async ({props}) => {
					return calculateArticleMetadata(props, {fps});
				}}
			/>

			{/* AI 生成的视频 — 横屏 */}
			<Composition
				id="VideoOcrPlugin"
				component={VideoOcrPlugin}
				durationInFrames={VIDEO_OCR_PLUGIN_DURATION}
				fps={fps}
				width={LANDSCAPE.width}
				height={LANDSCAPE.height}
			/>

			<Composition
				id="VideoWebfont"
				component={VideoWebfont}
				durationInFrames={VIDEO_WEBFONT_DURATION}
				fps={fps}
				width={LANDSCAPE.width}
				height={LANDSCAPE.height}
			/>

			{/* 竖屏版本 */}
			<Composition
				id="VideoWebfont-Portrait"
				component={VideoWebfontPortrait}
				durationInFrames={VIDEO_WEBFONT_DURATION}
				fps={fps}
				width={PORTRAIT.width}
				height={PORTRAIT.height}
			/>

		</>
	);
};
