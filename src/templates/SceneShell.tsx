import {AbsoluteFill} from 'remotion';
import {useSafeArea} from '../hooks/useSafeArea';

/**
 * 场景外壳 — 统一的干净容器
 *
 * 提供渐变背景 + 安全区 padding，不含任何装饰效果。
 * 所有场景用它包裹，避免重复写 AbsoluteFill + padding。
 *
 * 用法：
 * ```tsx
 * <SceneShell gradientColors={['#0a0a0a', '#1a1a2e']}>
 *   <AnimatedText text="标题" />
 * </SceneShell>
 * ```
 */
export const SceneShell: React.FC<{
	/** 渐变颜色数组（2-3色） */
	gradientColors: string[];
	/** 渐变角度 */
	angle?: number;
	/** 场景内容 */
	children: React.ReactNode;
}> = ({gradientColors, angle = 135, children}) => {
	const safePadding = useSafeArea();

	return (
		<AbsoluteFill>
			{/* 渐变背景 */}
			<AbsoluteFill
				style={{
					background: `linear-gradient(${angle}deg, ${gradientColors.join(', ')})`,
				}}
			/>
			{/* 内容区 — 安全区 padding */}
			<AbsoluteFill
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: safePadding,
					boxSizing: 'border-box',
				}}
			>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
