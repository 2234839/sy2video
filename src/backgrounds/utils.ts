/**
 * 背景风格体系 — 共享工具函数
 */

/** 基于种子的伪随机（确定性，确保帧间一致性） */
const seededRandom = (seed: number): number => {
	const x = Math.sin(seed) * 43758.5453123;
	return x - Math.floor(x);
};

export {seededRandom};
