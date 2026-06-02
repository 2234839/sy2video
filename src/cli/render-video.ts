/**
 * 双格式视频渲染脚本
 *
 * 同时渲染横屏(16:9)和竖屏(9:16)两个版本。
 *
 * 用法：pnpm render <CompositionId>
 * 示例：pnpm render VideoWebfont
 *
 * 输出：
 *   out/<CompositionId>.mp4       横屏 1920×1080
 *   out/<CompositionId>-竖屏.mp4  竖屏 1080×1920
 */
import {execSync} from 'child_process';

const compositionId = process.argv[2];

if (!compositionId) {
	console.error('❌ 请指定 Composition ID');
	console.error('用法: pnpm render <CompositionId>');
	console.error('示例: pnpm render VideoWebfont');
	process.exit(1);
}

/** Remotion 渲染命令前缀 */
const RENDER_BASE = 'npx remotion render';

/** 输出目录 */
const OUT_DIR = 'out';

/** 横屏 Composition ID 就是原名 */
const landscapeId = compositionId;
/** 竖屏 Composition ID = 原名 + -Portrait */
const portraitId = `${compositionId}-Portrait`;

/** 输出文件名 */
const landscapeOut = `${OUT_DIR}/${compositionId}.mp4`;
const portraitOut = `${OUT_DIR}/${compositionId}-竖屏.mp4`;

console.log(`🎬 开始渲染: ${compositionId}`);
console.log(`   横屏: ${landscapeId} → ${landscapeOut}`);
console.log(`   竖屏: ${portraitId} → ${portraitOut}`);
console.log();

/** 渲染横屏 */
console.log(`▶ [1/2] 渲染横屏 (1920×1080)...`);
execSync(`${RENDER_BASE} ${landscapeId} ${landscapeOut} --codec=h264`, {
	stdio: 'inherit',
});

/** 渲染竖屏 */
console.log();
console.log(`▶ [2/2] 渲染竖屏 (1080×1920)...`);
execSync(`${RENDER_BASE} ${portraitId} ${portraitOut} --codec=h264`, {
	stdio: 'inherit',
});

console.log();
console.log(`✅ 渲染完成!`);
console.log(`   横屏: ${landscapeOut}`);
console.log(`   竖屏: ${portraitOut}`);
