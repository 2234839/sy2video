/**
 * 音频处理工具
 *
 * 使用 FFmpeg/FFprobe 进行音频分析和裁剪拼接。
 * 不做清洗决策——只提供数据（时长、静音段）和执行工具（裁剪拼接）。
 * 清洗决策由 AI 基于转写文本 + 时间戳来判断。
 */
import {execFile} from 'child_process';
import path from 'path';
import fs from 'fs';
import {promisify} from 'util';

const execFileAsync = promisify(execFile);

/** FFmpeg 可执行文件路径 */
const FFMPEG = path.join(process.env.HOME || '/root', 'tools', 'ffmpeg', 'bin', 'ffmpeg');

/** FFprobe 可执行文件路径 */
const FFPROBE = path.join(process.env.HOME || '/root', 'tools', 'ffmpeg', 'bin', 'ffprobe');

/** 静音段信息 */
export interface SilenceSegment {
	/** 静音起始时间（秒） */
	start: number;
	/** 静音结束时间（秒） */
	end: number;
	/** 静音持续时长（秒） */
	duration: number;
}

/** AI 指定的裁剪区间（要删掉的部分） */
export interface CutRange {
	/** 起始时间（秒） */
	start: number;
	/** 结束时间（秒） */
	end: number;
}

/**
 * 获取音频文件时长（秒）
 */
export async function getAudioDuration(audioPath: string): Promise<number> {
	const {stdout} = await execFileAsync(FFPROBE, [
		'-i', audioPath,
		'-show_entries', 'format=duration',
		'-v', 'quiet',
		'-of', 'csv=p=0',
	], {timeout: 30000});
	return parseFloat(stdout.trim());
}

/**
 * 检测音频中的静音段
 *
 * @param audioPath 音频文件路径
 * @param noiseDb 噪声阈值（dB，负数，如 -40）
 * @param minDuration 最短静音时长（秒，如 0.5）
 * @returns 静音段列表
 */
export async function detectSilence(
	audioPath: string,
	noiseDb: number = -40,
	minDuration: number = 0.5,
): Promise<SilenceSegment[]> {
	const {stderr} = await execFileAsync(FFMPEG, [
		'-i', audioPath,
		'-af', `silencedetect=noise=${noiseDb}dB:d=${minDuration}`,
		'-f', 'null', '-',
	], {timeout: 60000});

	/** 解析 silencedetect 输出 */
	const segments: SilenceSegment[] = [];
	const startRegex = /silence_start:\s*([\d.]+)/g;
	const endRegex = /silence_end:\s*([\d.]+)/g;

	const starts: number[] = [];
	const ends: number[] = [];

	let match: RegExpExecArray | null;
	while ((match = startRegex.exec(stderr)) !== null) {
		starts.push(parseFloat(match[1]));
	}
	while ((match = endRegex.exec(stderr)) !== null) {
		ends.push(parseFloat(match[1]));
	}

	/** 配对 start/end（末尾可能只有 start 没有 end，表示到文件结束都是静音） */
	for (let i = 0; i < starts.length; i++) {
		const start = starts[i];
		const end = i < ends.length ? ends[i] : start + minDuration;
		segments.push({start, end, duration: end - start});
	}

	return segments;
}

/**
 * 裁剪边界微调量（秒）— 往静音区缩进一点，避免在语音毛刺处截断
 *
 * 太小（如 0.01）可能还在语音尾音上，太大（如 0.1）会吃掉明显的内容。
 * 0.03 ≈ 在静音区深处截断，同时不损失有意义的语音。
 */
const CUT_MARGIN_SEC = 0.03;

/**
 * 淡入淡出时长（秒）— 在每个保留段的头尾做短淡入淡出消除爆音
 *
 * 0.005s = 5ms，人耳听不出断续感但足以平滑波形跳变。
 */
const FADE_DURATION = 0.005;

/**
 * 将裁剪区间（要删的部分）反转为保留区间，逐段裁剪后拼接
 *
 * ★ 不使用 concat copy 模式（不对齐帧边界会产生咔嗒声），
 * 而是逐段重编码并在头尾加 afade 消除裁剪点爆音。
 * 同时用 FFmpeg 的 apad + aresample 保持原始采样率不变。
 *
 * @param inputPath 原始音频路径
 * @param cuts 要删掉的区间列表（秒）
 * @param outputPath 输出音频路径
 * @returns 清洗后音频时长（秒）
 */
export async function applyAudioCuts(
	inputPath: string,
	cuts: CutRange[],
	outputPath: string,
): Promise<number> {
	const duration = await getAudioDuration(inputPath);

	/** 读取输入文件采样率，保持输出音质不变 */
	const inputRate = await getAudioSampleRate(inputPath);

	/** 将 cuts 反转为保留区间 */
	const keepRanges: {start: number; end: number}[] = [];
	let cursor = 0;

	/** cuts 按起始时间排序 */
	const sortedCuts = [...cuts].sort((a, b) => a.start - b.start);

	for (const cut of sortedCuts) {
		if (cut.start > cursor) {
			keepRanges.push({start: cursor, end: cut.start});
		}
		cursor = Math.max(cursor, cut.end);
	}
	/** 最后一段 */
	if (cursor < duration) {
		keepRanges.push({start: cursor, end: duration});
	}

	/** 无裁剪时直接拷贝 */
	if (keepRanges.length === 1 && keepRanges[0].start === 0 && keepRanges[0].end >= duration) {
		fs.copyFileSync(inputPath, outputPath);
		return duration;
	}

	/** 逐段裁剪为临时文件，每段头尾加 fade 消除爆音 */
	const segmentPaths: string[] = [];

	for (const [i, seg] of keepRanges.entries()) {
		/** 往静音区缩进一点，避免在语音尾音毛刺处截断 */
		const segStart = seg.start + CUT_MARGIN_SEC;
		const segDur = seg.end - seg.start - CUT_MARGIN_SEC * 2;

		/** 如果缩进后时长为负或极小，跳过此段 */
		if (segDur <= FADE_DURATION * 2) continue;

		const tmpPath = outputPath + `.seg${i}.wav`;

		/**
		 * afade=t=in:st=0:d=FADE — 段头淡入
		 * afade=t=out:st=(segDur-FADE):d=FADE — 段尾淡出
		 * 不指定 -ar，保持原始采样率
		 */
		/** -ss 放在 -i 前面：输入侧 seek（精确跳转，不解码前面所有帧） */
		await execFileAsync(FFMPEG, [
			'-ss', String(segStart),
			'-i', inputPath,
			'-t', String(segDur),
			'-af', `afade=t=in:st=0:d=${FADE_DURATION},afade=t=out:st=${segDur - FADE_DURATION}:d=${FADE_DURATION}`,
			'-ar', String(inputRate),
			'-ac', '1',
			'-y',
			tmpPath,
		], {timeout: 120000});

		segmentPaths.push(tmpPath);
	}

	/** 生成 concat 文件拼接所有段 */
	const concatContent = segmentPaths
		.map((p) => `file '${p}'`)
		.join('\n');

	const concatFilePath = outputPath + '.concat.txt';
	fs.writeFileSync(concatFilePath, concatContent);

	/**
	 * 拼接 + 去噪
	 *
	 * adeclick(threshold=1): 消除原始录音中的 click/pop 爆音
	 *   - threshold=1 最保守，只处理最极端的脉冲噪声，不影响正常语音
	 *   - window=55 + overlap=75% + arorder=2 是 FFmpeg 默认值，效果好
	 * highpass(f=80): 滤除 80Hz 以下低频噪声（电流声/风声）
	 */
	const rawPath = outputPath + '.raw.wav';
	await execFileAsync(FFMPEG, [
		'-f', 'concat', '-safe', '0',
		'-i', concatFilePath,
		'-af', 'adeclick=window=55:overlap=75:arorder=2:threshold=1:burst=2,highpass=f=80',
		'-ar', String(inputRate),
		'-ac', '1',
		'-y',
		rawPath,
	], {timeout: 300000});

	fs.renameSync(rawPath, outputPath);

	/** 清理临时文件 */
	for (const p of segmentPaths) {
		fs.unlinkSync(p);
	}
	fs.unlinkSync(concatFilePath);

	return getAudioDuration(outputPath);
}

/**
 * 获取音频采样率
 */
async function getAudioSampleRate(audioPath: string): Promise<number> {
	const {stdout} = await execFileAsync(FFPROBE, [
		'-i', audioPath,
		'-show_entries', 'stream=sample_rate',
		'-v', 'quiet',
		'-of', 'csv=p=0',
	], {timeout: 30000});
	return parseInt(stdout.trim(), 10);
}

/**
 * 从视频/音频文件中提取音频轨道为 WAV
 *
 * FunASR 需要 WAV 格式输入，此函数统一转为 16kHz mono PCM。
 *
 * @param inputPath 视频/音频文件路径
 * @param outputPath 输出 WAV 路径
 * @returns 输出文件路径
 */
export async function extractAudioTrack(inputPath: string, outputPath: string): Promise<string> {
	await execFileAsync(FFMPEG, [
		'-i', inputPath,
		'-vn',              /** 忽略视频轨道 */
		'-ar', '16000',     /** 16kHz 采样率 */
		'-ac', '1',         /** 单声道 */
		'-f', 'wav',
		'-y',
		outputPath,
	], {timeout: 120000});
	return outputPath;
}
