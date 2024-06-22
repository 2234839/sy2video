/**
 * 获取思源资源，处理了鉴权问题
 * @param asset assets/id_name.m4a  */
export function siyuanAsset(asset: string) {
	return `http://localhost:3001/${asset}`;
}

/** 返回只显示对应块的 iframe */
export function siyuanBlockIframe(blockId: string){
	return `http://127.0.0.1:6809/stage/build/desktop/?block_show=1&block_id=${blockId}`;
}