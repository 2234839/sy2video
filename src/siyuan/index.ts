/** 鉴权代理 */
let siyuanApi ='http://192.168.1.12:6899';

type siyuanRes<T> = {
	code: number;
	msg: string;
	data: T;
};
/**
 * 获取思源资源
 * @param asset assets/id_name.m4a  */
export function siyuanAsset(asset: string) {
	return `${siyuanApi}/${asset}`;
}

/** 返回只显示对应块的 iframe */
export function siyuanBlockIframe(blockId: string) {
	return `${siyuanApi}/stage/build/desktop/?block_show=1&block_id=${blockId}`;
}
export type siyuanArticleInfoRes = siyuanRes<{
	blockCount: 33;
	box: '20210816161940-zo21go1';
	content: string;
	eof: false;
	id: '20240620185326-hl2ywbv';
	isBacklinkExpand: false;
	isSyncing: false;
	mode: 0;
	parent2ID: '20240620185326-hl2ywbv';
	parentID: '20240620185326-hl2ywbv';
	path: '/20210816161946-c0z6moi/20240620185326-hl2ywbv.sy';
	rootID: '20240620185326-hl2ywbv';
	scroll: true;
	type: 'NodeDocument';
}>;
/** 返回只显示对应块的 iframe */
export function siyuanArticleInfo(docID: string) {
	return fetch(`${siyuanApi}/api/filetree/getDoc`, {
		body: JSON.stringify({id: docID, size: 128}),
		method: 'POST',
	})
		.then((res) => res.json())
		.then((res: siyuanArticleInfoRes) => {
			console.log('[res]', res);
			return res;
		});
}
