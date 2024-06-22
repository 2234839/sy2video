import {IFrame, continueRender, delayRender} from 'remotion';
import {z} from 'zod';
import {siyuanBlockIframe} from '../siyuan';
import React from 'react';
export const BlockCompositionSchema = z.object({
	/** 延迟多少毫秒才开始渲染 */
	delay: z.number().optional().default(4_000),
	blockId: z.string(),
});

/** 展示思源 block */
export const BlockComposition: React.FC<
	z.infer<typeof BlockCompositionSchema>
> = (props) => {
	const [handle] = React.useState(() => delayRender());
	setTimeout(() => {
		continueRender(handle);
	}, props.delay);

	return (
		<IFrame src={siyuanBlockIframe(props.blockId)} className="w-full h-full" />
	);
};
