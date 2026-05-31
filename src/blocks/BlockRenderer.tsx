import {SiYuanBlockType} from '../siyuan/block-types';
import type {BlockProps} from './types';
import {ParagraphBlock} from './ParagraphBlock';
import {HeadingBlock} from './HeadingBlock';
import {ListBlock} from './ListBlock';
import {QuoteBlock} from './QuoteBlock';
import {CodeBlock} from './CodeBlock';
import {ImageBlock} from './ImageBlock';
import {VideoBlock} from './VideoBlock';
import {AudioBlock} from './AudioBlock';
import {SuperBlock} from './SuperBlock';
import {FallbackBlock} from './FallbackBlock';

/**
 * 块类型 → 渲染组件映射
 */
const BLOCK_COMPONENT_MAP: Record<string, React.ComponentType<BlockProps>> = {
	[SiYuanBlockType.Paragraph]: ParagraphBlock,
	[SiYuanBlockType.Heading]: HeadingBlock,
	[SiYuanBlockType.List]: ListBlock,
	[SiYuanBlockType.Blockquote]: QuoteBlock,
	[SiYuanBlockType.Code]: CodeBlock,
	[SiYuanBlockType.Video]: VideoBlock,
	[SiYuanBlockType.Audio]: AudioBlock,
	[SiYuanBlockType.SuperBlock]: SuperBlock,
};

/**
 * 统一块渲染分发器
 *
 * 根据块的 type 字段自动选择对应的 React 组件进行渲染
 *
 * 特殊处理：
 * - 段落中有图片且 markdown 以 ![ 开头（图片为主） → ImageBlock
 * - 空段落 → 不渲染
 * - 未知类型 → FallbackBlock
 */
export const BlockRenderer: React.FC<BlockProps> = (props) => {
	const {block} = props;

	/** 段落中以图片为主（markdown 以 ![ 开头）→ 渲染为图片块 */
	if (
		block.type === SiYuanBlockType.Paragraph &&
		block.assets.images.length > 0 &&
		block.markdown.trim().startsWith('![')
	) {
		return <ImageBlock {...props} />;
	}

	/** 空段落不渲染 */
	if (
		block.type === SiYuanBlockType.Paragraph &&
		!block.content.trim() &&
		block.assets.images.length === 0
	) {
		return null;
	}

	const Component = BLOCK_COMPONENT_MAP[block.type];

	if (!Component) {
		return <FallbackBlock {...props} />;
	}

	return <Component {...props} />;
};
