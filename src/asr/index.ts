/**
 * 语音旁白处理管道
 *
 * 两步式设计：
 * 1. analyzeAudio() — 转写 + 静音检测，返回结构化数据给 AI 审阅
 * 2. applyCuts() — AI 决定要删什么后，执行 FFmpeg 裁剪拼接
 *
 * 清洗决策由 AI 完成，程序只提供数据和执行工具。
 */
import path from 'path';
import fs from 'fs';
import type {TranscriptionResult} from './funasr-client';
import {transcribeAudio} from './funasr-client';
import {
	getAudioDuration,
	detectSilence,
	applyAudioCuts,
} from './audio-utils';
import type {SilenceSegment, CutRange} from './audio-utils';

export type {TranscriptionResult} from './funasr-client';
export type {SilenceSegment, CutRange} from './audio-utils';
export {extractAudioTrack} from './audio-utils';

/** 音频分析结果（给 AI 审阅的结构化数据） */
export interface AudioAnalysis {
	/** FunASR 转写结果（逐句文本 + 字级别时间戳） */
	transcription: TranscriptionResult;
	/** FFmpeg 检测到的静音段 */
	silences: SilenceSegment[];
	/** 原始音频总时长（秒） */
	duration: number;
}

/** 裁剪执行结果 */
export interface CutResult {
	/** 清洗后音频文件路径 */
	cleanAudioPath: string;
	/** 清洗后音频时长（秒） */
	cleanDuration: number;
}

/**
 * Step 1: 分析音频 — 转写 + 静音检测
 *
 * 返回结构化数据供 AI 审阅，不做任何清洗决策。
 *
 * @param audioPath 原始录音文件路径
 * @returns 转写文本 + 逐句时间戳 + 静音段 + 总时长
 */
export async function analyzeAudio(audioPath: string): Promise<AudioAnalysis> {
	const [transcription, silences, duration] = await Promise.all([
		transcribeAudio(audioPath),
		detectSilence(audioPath),
		getAudioDuration(audioPath),
	]);

	return {transcription, silences, duration};
}

/**
 * Step 2: 执行 AI 指定的裁剪
 *
 * AI 审阅 AudioAnalysis 后，指定要删掉的时间区间，此函数执行裁剪拼接。
 *
 * @param audioPath 原始音频路径
 * @param cuts AI 指定的要删掉的区间 [{start, end}]（秒）
 * @param outputPath 输出音频路径
 * @returns 裁剪结果
 */
export async function applyCuts(
	audioPath: string,
	cuts: CutRange[],
	outputPath: string,
): Promise<CutResult> {
	fs.mkdirSync(path.dirname(outputPath), {recursive: true});
	const cleanDuration = await applyAudioCuts(audioPath, cuts, outputPath);
	return {cleanAudioPath: outputPath, cleanDuration};
}
