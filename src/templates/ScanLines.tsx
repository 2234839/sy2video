/**
 * ScanLines — CRT 扫描线叠层效果
 *
 * 视觉特征：
 * - 水平扫描线纹理
 * - 可选的扫描亮线（从上到下移动）
 * - 半透明叠加层，不影响下层内容可读性
 *
 * 适用场景：给任何场景叠加科技感/CRT 复古感
 */
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

const ScanLines: React.FC<{
	/** 扫描线间距（px） */
	lineSpacing?: number;
	/** 扫描线透明度 */
	opacity?: number;
	/** 是否显示移动的扫描亮线 */
	showScanBeam?: boolean;
	/** 扫描亮线速度（帧/周期） */
	scanSpeed?: number;
	/** 扫描亮线颜色 */
	scanBeamColor?: string;
}> = ({
	lineSpacing = 3,
	opacity = 0.08,
	showScanBeam = true,
	scanSpeed = 90,
	scanBeamColor = 'rgba(255, 255, 255, 0.12)',
}) => {
	const frame = useCurrentFrame();

	/** 扫描亮线的 Y 位置：循环从 0% 到 100% */
	const scanBeamY = (frame % scanSpeed) / scanSpeed * 100;

	/** 扫描亮线的透明度脉冲 */
	const scanBeamOpacity = interpolate(
		Math.sin(frame * 0.1),
		[-1, 1],
		[0.5, 1],
	);

	return (
		<AbsoluteFill style={{pointerEvents: 'none', zIndex: 10}}>
			{/* 扫描线纹理 */}
			<div style={{
				position: 'absolute',
				inset: 0,
				background: `repeating-linear-gradient(
					0deg,
					transparent 0px,
					transparent ${lineSpacing - 1}px,
					rgba(0, 0, 0, ${opacity}) ${lineSpacing - 1}px,
					rgba(0, 0, 0, ${opacity}) ${lineSpacing}px
				)`,
			}} />

			{/* 移动的扫描亮线 */}
			{showScanBeam && (
				<div style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: `${scanBeamY}%`,
					height: 100,
					background: `linear-gradient(
						180deg,
						transparent 0%,
						${scanBeamColor} 40%,
						${scanBeamColor} 60%,
						transparent 100%
					)`,
					opacity: scanBeamOpacity,
				}} />
			)}
		</AbsoluteFill>
	);
};

export {ScanLines};
