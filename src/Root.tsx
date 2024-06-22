import {Composition, Folder} from 'remotion';
import {MyComposition, myCompSchema} from './Composition';
import './style.css';
import {testComposition} from './testComposition';
import {BlockComposition, BlockCompositionSchema} from './composition/BlockCom';

export const RemotionRoot: React.FC = () => {
	const fps = 24;
	const width = 1920;
	const height = 1080;
	const defaultTime = fps * 6;
	return (
		<>
			<Folder name="Compositions">
				<Composition
					id="BlockComposition"
					component={BlockComposition}
					durationInFrames={defaultTime}
					fps={fps}
					width={width}
					height={height}
					schema={BlockCompositionSchema}
					defaultProps={{
						blockId: '20240622103850-90v98k8',
						delay: 1_000,
					}}
				/>
			</Folder>

			<Composition
				id="test"
				component={testComposition}
				durationInFrames={defaultTime}
				fps={fps}
				width={width}
				height={height}
				schema={myCompSchema}
				defaultProps={{
					titleText: 'Welcome to Remotion with Tailwind CSS',
					titleColor: '#000000',
					logoColor: '#00bfff',
				}}
			/>
			<Composition
				id="1080p"
				component={testComposition}
				durationInFrames={defaultTime}
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
