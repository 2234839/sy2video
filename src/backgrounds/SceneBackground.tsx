/**
 * SceneBackground — 场景背景组合组件
 *
 * 统一入口：通过 preset id 选择风格，自动组装 base + atmosphere + grain 三层
 * 子组件放在最上层。
 *
 * 用法：
 * ```tsx
 * <SceneBackground preset="geometric-bold" seed={1}>
 *   <AnimatedText text="标题" />
 * </SceneBackground>
 * ```
 */
import {AbsoluteFill} from 'remotion';
import type {BackgroundPreset} from './types';
import {BACKGROUND_PRESETS} from './presets';
import {GeometricShapes} from '../templates/GeometricShapes';
import {AuroraMesh} from './AuroraMesh';
import {NoiseGrain} from './NoiseGrain';

/** 渲染 atmosphere 层 — 根据 component 名分发到对应组件 */
const AtmosphereRenderer: React.FC<{
	config: BackgroundPreset['atmosphere'];
	seed: number;
}> = ({config, seed}) => {
	if (!config || config.component === 'none') return null;

	const props = {...config.props, seed};

	switch (config.component) {
		case 'GeometricShapes':
			return <GeometricShapes {...props as React.ComponentProps<typeof GeometricShapes>} />;
		case 'AuroraMesh':
			return <AuroraMesh {...props as React.ComponentProps<typeof AuroraMesh>} />;
		/** 其他风格组件后续添加 */
		default:
			return null;
	}
};

const SceneBackground: React.FC<{
	/** 风格预设 id（对应 BACKGROUND_PRESETS 的 key） */
	preset: string;
	/** 随机种子（覆盖预设中的 seed） */
	seed?: number;
	/** 子内容 */
	children?: React.ReactNode;
}> = ({
	preset,
	seed = 42,
	children,
}) => {
	const config = BACKGROUND_PRESETS[preset];
	if (!config) throw new Error(`Unknown background preset: "${preset}". Available: ${Object.keys(BACKGROUND_PRESETS).join(', ')}`);

	return (
		<AbsoluteFill>
			{/* 1. Base 层 — 纯色或渐变 */}
			{config.base.type === 'solid' ? (
				<AbsoluteFill style={{backgroundColor: config.base.color}} />
			) : (
				<AbsoluteFill style={{
					background: `linear-gradient(${config.base.angle ?? 135}deg, ${(config.base.colors ?? ['#000']).join(', ')})`,
				}} />
			)}

			{/* 2. Atmosphere 层 — 装饰性叠加 */}
			{config.atmosphere && (
				<AtmosphereRenderer config={config.atmosphere} seed={seed} />
			)}

			{/* 3. 子内容 */}
			{children && <AbsoluteFill>{children}</AbsoluteFill>}

			{/* 4. Grain 层 — 胶片颗粒（最上层） */}
			{config.grain && <NoiseGrain intensity={config.grain.intensity} />}
		</AbsoluteFill>
	);
};

export {SceneBackground};
