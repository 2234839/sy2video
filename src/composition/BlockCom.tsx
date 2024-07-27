import {IFrame, continueRender, delayRender} from 'remotion';
import {z} from 'zod';
import {siyuanBlockIframe} from '../siyuan';
import React, {useEffect, useMemo} from 'react';
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
	const src = useMemo(() => siyuanBlockIframe(props.blockId), [props.blockId]);
	useEffect(() => {
		setTimeout(() => {
			continueRender(handle);
			// debugger
		}, 10_000);
	});

	return <IFrame src={src} className="w-full h-full" />;
};
