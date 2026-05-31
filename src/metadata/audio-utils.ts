import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {siyuanClient} from '../siyuan/client';

/**
 * 获取音频时长（带超时保护）
 *
 * @param assetPath 思源资源相对路径，如 "assets/xxx.m4a"
 * @param timeoutMs 超时时间（毫秒），默认 10 秒
 * @returns 音频时长（秒，向上取整）
 */
export async function getAudioDurationWithTimeout(
	assetPath: string,
	timeoutMs = 10_000,
): Promise<number> {
	const url = siyuanClient.assetUrl(assetPath);

	const result = await Promise.race([
		getAudioDurationInSeconds(url),
		new Promise<never>((_, reject) =>
			setTimeout(
				() => reject(new Error(`获取音频时长超时: ${assetPath}`)),
				timeoutMs,
			),
		),
	]);

	return Math.ceil(result);
}
