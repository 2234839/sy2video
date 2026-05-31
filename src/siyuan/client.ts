import {config} from '../config';
import {SiYuanBlockType} from './block-types';
import type {SiYuanBlockRow, SiYuanResponse} from './types';

/**
 * 思源笔记 API 客户端
 *
 * 通过代理服务器访问思源 API，代理自动注入 Authorization token
 */
class SiYuanClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	/**
	 * 执行 SQL 查询 blocks 表
	 *
	 * @returns 原始行数据数组
	 */
	async queryBlocks(sql: string): Promise<SiYuanBlockRow[]> {
		const res = await fetch(`${this.baseUrl}/api/query/sql`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({stmt: sql}),
		});
		if (!res.ok) {
			throw new Error(`SiYuan SQL API error: ${res.status} ${res.statusText}`);
		}
		const json: SiYuanResponse<SiYuanBlockRow[]> = await res.json();
		if (json.code !== 0) {
			throw new Error(`SiYuan SQL query failed: ${json.msg}`);
		}
		return json.data;
	}

	/**
	 * 获取文档下所有块，按 parent_id 关系构建树形结构
	 *
	 * @param docId 文档 ID（root_id）
	 * @returns 该文档下所有块的扁平列表
	 */
	async getDocBlocks(docId: string): Promise<SiYuanBlockRow[]> {
		return this.queryBlocks(
			`SELECT id, type, subtype, content, markdown, parent_id, root_id, box, hpath, created, updated ` +
				`FROM blocks WHERE root_id = '${docId}' ORDER BY id`,
		);
	}

	/**
	 * 获取文档下所有超级块及其子块 ID
	 *
	 * 超级块的子块通过 parent_id 关联
	 */
	async getSuperBlocks(docId: string): Promise<SiYuanBlockRow[]> {
		return this.queryBlocks(
			`SELECT id, type, subtype, content, markdown, parent_id, root_id ` +
				`FROM blocks WHERE root_id = '${docId}' AND type = '${SiYuanBlockType.SuperBlock}' ORDER BY id`,
		);
	}

	/**
	 * 获取指定父块的所有直接子块
	 */
	async getChildBlocks(parentId: string): Promise<SiYuanBlockRow[]> {
		return this.queryBlocks(
			`SELECT id, type, subtype, content, markdown, parent_id, root_id ` +
				`FROM blocks WHERE parent_id = '${parentId}' ORDER BY id`,
		);
	}

	/**
	 * 获取指定块的所有后代块（递归子块）
	 *
	 * 通过多次查询逐层获取，避免复杂的 SQL 递归
	 */
	async getDescendantBlocks(blockId: string): Promise<SiYuanBlockRow[]> {
		const result: SiYuanBlockRow[] = [];
		let currentIds = [blockId];

		while (currentIds.length > 0) {
			const ids = currentIds.map((id) => `'${id}'`).join(',');
			const children = await this.queryBlocks(
				`SELECT id, type, subtype, content, markdown, parent_id, root_id ` +
					`FROM blocks WHERE parent_id IN (${ids}) ORDER BY id`,
			);
			result.push(...children);
			currentIds = children.map((c) => c.id);
		}

		return result;
	}

	/**
	 * 构建资源文件的完整 URL
	 *
	 * @param assetPath 相对路径，如 "assets/xxx.m4a"
	 */
	assetUrl(assetPath: string): string {
		return `${this.baseUrl}/${assetPath}`;
	}
}

/** 全局 SiYuan 客户端实例 */
export const siyuanClient = new SiYuanClient(config.proxyBaseUrl);
