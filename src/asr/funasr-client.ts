/**
 * FunASR WebSocket 客户端
 *
 * 连接 FunASR 离线转写服务，发送音频数据，获取带时间戳的识别结果。
 * 协议参考：https://github.com/modelscope/FunASR/blob/main/runtime/python/websocket/funasr_wss_client.py
 *
 * 离线模式行为：发送全部音频 → 服务端处理 → 返回一条完整结果 → 连接关闭
 */
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import {config} from '../config';

/** 单个字符的时间戳信息 */
export interface WordTimestamp {
	/** 该字的起始时间（毫秒） */
	start: number;
	/** 该字的结束时间（毫秒） */
	end: number;
}

/** 句子级别的时间戳 */
export interface SentenceTimestamp {
	/** 句子起始时间（毫秒） */
	start: number;
	/** 句子结束时间（毫秒） */
	end: number;
	/** 句子文本 */
	text: string;
	/** 句尾标点 */
	punc: string;
	/** 每个字的时间戳 */
	tsList: WordTimestamp[];
}

/** FunASR 转写结果 */
export interface TranscriptionResult {
	/** 带标点的完整文本 */
	text: string;
	/** 字级别时间戳（从 timestamp 字段解析） */
	timestamps: WordTimestamp[];
	/** 句子级别时间戳（从 stamp_sents 解析，含分句、标点、每字时间戳） */
	sentences: SentenceTimestamp[];
}

/** FunASR 服务端返回的 stamp_sents 中单个句子的结构 */
interface RawStampSent {
	start: number;
	end: number;
	text_seg: string;
	punc: string;
	ts_list: number[][];
}

/** 服务端返回的原始消息 */
interface FunASRMessage {
	mode: string;
	text: string;
	/** 字级别时间戳 "[[start,end],...]" 字符串 */
	timestamp: string;
	/** 句子级别时间戳，已经是对象数组 */
	stamp_sents: RawStampSent[];
	is_final: boolean;
	wav_name: string;
}

/**
 * 将音频文件发送到 FunASR 进行离线转写
 *
 * 支持任意音频格式（wav/mp3/m4a 等），FunASR 服务端内置 ffmpeg 自动转码。
 * 离线模式：发送全部音频 → 等待服务端返回完整结果后连接自动关闭。
 */
export async function transcribeAudio(audioPath: string): Promise<TranscriptionResult> {
	const wsUrl = config.funasrWsUrl;
	const audioData = fs.readFileSync(audioPath);
	const wavName = path.basename(audioPath);

	/** 分片参数：与 FunASR Python 客户端对齐 */
	const sampleRate = 16000;
	/** chunk_size[1]=10, chunk_interval=10 → 60ms per chunk → 960 bytes (16kHz × 2bytes × 0.06s) */
	const stride = Math.floor((60 * 10 / 10 / 1000) * sampleRate * 2);
	const chunkCount = Math.ceil(audioData.length / stride);

	return new Promise<TranscriptionResult>((resolve, reject) => {
		let settled = false;

		/** 防止 Promise 被 resolve/reject 多次 */
		const done = (err: Error | null, value?: TranscriptionResult) => {
			if (settled) return;
			settled = true;
			if (err) reject(err);
			else resolve(value!);
		};

		const ws = new WebSocket(wsUrl);

		ws.on('error', (err) => {
			done(new Error(`FunASR WebSocket 连接失败: ${err.message}`));
		});

		ws.on('open', () => {
			/** 发送初始控制消息（offline 模式） */
			const controlMsg = JSON.stringify({
				mode: 'offline',
				chunk_size: [5, 10, 5],
				chunk_interval: 10,
				encoder_chunk_look_back: 4,
				decoder_chunk_look_back: 0,
				wav_name: wavName,
				wav_format: 'others',
				is_speaking: true,
				itn: true,
			});
			ws.send(controlMsg);

			/** 分片发送音频数据 */
			for (let i = 0; i < chunkCount; i++) {
				const start = i * stride;
				ws.send(audioData.subarray(start, start + stride));
			}

			/** 发送结束标记 */
			ws.send(JSON.stringify({is_speaking: false}));
		});

		ws.on('message', (data: WebSocket.Data) => {
			const raw = Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
			const msg: FunASRMessage = JSON.parse(raw);

			const result: TranscriptionResult = {
				text: msg.text || '',
				timestamps: [],
				sentences: [],
			};

			/** 解析字级别时间戳 "[[100,200],[200,500],...]" */
			if (msg.timestamp && msg.timestamp !== '') {
				const rawTimestamps: number[][] = JSON.parse(msg.timestamp);
				result.timestamps = rawTimestamps.map((pair) => ({
					start: pair[0],
					end: pair[1],
				}));
			}

			/** 解析句子级别时间戳（stamp_sents 已是对象数组） */
			if (msg.stamp_sents && Array.isArray(msg.stamp_sents)) {
				result.sentences = msg.stamp_sents.map((s) => ({
					start: s.start,
					end: s.end,
					text: s.text_seg.replace(/\s+/g, ''),
					punc: s.punc,
					tsList: s.ts_list.map((pair) => ({start: pair[0], end: pair[1]})),
				}));
			}

			/** offline 模式：收到结果即完成 */
			ws.close();
			done(null, result);
		});

		ws.on('close', () => {
			if (!settled) {
				done(new Error('FunASR 连接关闭但未收到识别结果'));
			}
		});
	});
}
