import {useCurrentFrame, useVideoConfig} from 'remotion';

/** JavaScript/TypeScript 关键字列表 */
const JS_KEYWORDS = new Set([
	'const', 'let', 'var', 'function', 'return', 'import', 'from', 'export',
	'default', 'if', 'else', 'for', 'while', 'class', 'extends', 'new',
	'type', 'interface', 'async', 'await', 'try', 'catch', 'throw',
	'true', 'false', 'null', 'undefined', 'typeof', 'instanceof',
	'switch', 'case', 'break', 'continue', 'of', 'in', 'as',
]);

/** 语法高亮颜色映射 */
const SYNTAX_COLORS = {
	/** 关键字 — 强调色 */
	keyword: '#e94560',
	/** 字符串 — 绿色 */
	string: '#22c55e',
	/** 注释 — 灰色 */
	comment: '#64748b',
	/** 数字 — 橙色 */
	number: '#f59e0b',
	/** 普通文本 */
	plain: '#d4d4d4',
};

/**
 * 判断 token 类型并着色
 */
function getTokenColor(token: string): string {
	if (JS_KEYWORDS.has(token)) return SYNTAX_COLORS.keyword;
	if (/^['"`].*['"`]$/.test(token)) return SYNTAX_COLORS.string;
	if (/^\/\/|\/\*|\*/.test(token)) return SYNTAX_COLORS.comment;
	if (/^\d+(\.\d+)?$/.test(token)) return SYNTAX_COLORS.number;
	return SYNTAX_COLORS.plain;
}

/**
 * 简单 tokenizer — 拆分为 token 序列，保留空格和缩进
 *
 * 逐字符扫描，遇到空格/制表符就收集为空白 token（保持原样），
 * 遇到非空白字符则用正则匹配出完整的语义 token。
 */
function tokenize(code: string): {text: string; color: string}[] {
	const tokens: {text: string; color: string}[] = [];
	/** 匹配：字符串、注释、单词、数字、其他非空白字符 */
	const tokenRegex = /(['"`])(?:\\\1|(?!\1)[\s\S])*?\1|\/\/[^\n]*|\/\*[\s\S]*?\*\/|\w+|\d+(?:\.\d+)?|[^\w\s]/y;

	let pos = 0;
	while (pos < code.length) {
		/** 收集空白字符（空格、制表符） */
		if (code[pos] === ' ' || code[pos] === '\t') {
			let space = '';
			while (pos < code.length && (code[pos] === ' ' || code[pos] === '\t')) {
				space += code[pos];
				pos++;
			}
			tokens.push({text: space, color: SYNTAX_COLORS.plain});
			continue;
		}

		/** 尝试匹配语义 token */
		tokenRegex.lastIndex = pos;
		const match = tokenRegex.exec(code);
		if (match) {
			const text = match[0];
			tokens.push({text, color: getTokenColor(text)});
			pos += text.length;
		} else {
			/** 兜底：单字符 */
			tokens.push({text: code[pos], color: getTokenColor(code[pos])});
			pos++;
		}
	}
	return tokens;
}

/**
 * 代码打字模拟 — 终端/编辑器风格
 *
 * 深色背景、等宽字体、简单语法着色、光标闪烁。
 * 这是消除 PPT 感的核心组件：用代码打字代替静态截图。
 *
 * 用法：
 * ```tsx
 * <CodeTyper code="const result = await loadFont('Noto Sans SC')" speed={15} />
 * ```
 */
export const CodeTyper: React.FC<{
	/** 代码文本 */
	code: string;
	/** 每秒打字速度（字符数） */
	speed?: number;
	/** 语言标签（显示在右上角） */
	language?: string;
	/** 是否显示行号 */
	showLineNumbers?: boolean;
	/** 入场延迟（帧） */
	delay?: number;
	/** 代码字号（竖屏建议 26-28） */
	fontSize?: number;
}> = ({
	code,
	speed = 15,
	language,
	showLineNumbers = true,
	delay = 0,
	fontSize = 20,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const f = Math.max(0, frame - delay);
	const visibleChars = Math.min(code.length, Math.floor(f / fps * speed));

	/** 已显示的代码文本 */
	const visibleCode = code.slice(0, visibleChars);
	const lines = visibleCode.split('\n');

	return (
		<div
			style={{
				backgroundColor: '#1a1a2e',
				borderRadius: 12,
				overflow: 'hidden',
				width: '100%',
				maxWidth: 900,
			}}
		>
			{/* 标题栏 */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '12px 20px',
					backgroundColor: '#16213e',
					borderBottom: '1px solid rgba(255,255,255,0.06)',
				}}
			>
				{/* 红黄绿圆点 */}
				<div style={{display: 'flex', gap: 8}}>
					{['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
						<div
							key={c}
							style={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								backgroundColor: c,
							}}
						/>
					))}
				</div>
				{language && (
					<span
						style={{
							fontSize: 14,
							color: '#64748b',
							fontFamily: 'Menlo, Consolas, "Courier New", monospace',
						}}
					>
						{language}
					</span>
				)}
			</div>

			{/* 代码区 */}
			<div
				style={{
					padding: '20px 24px',
					fontFamily: 'Menlo, Consolas, "Courier New", monospace',
					fontSize,
					lineHeight: 1.7,
					overflow: 'hidden',
				}}
			>
				{lines.map((line, i) => {
					const tokens = tokenize(line);
					return (
						<div key={i} style={{display: 'flex', gap: 16}}>
							{showLineNumbers && (
								<span
									style={{
										color: '#475569',
										userSelect: 'none',
										minWidth: 32,
										textAlign: 'right',
										flexShrink: 0,
									}}
								>
									{i + 1}
								</span>
							)}
							<span>
								{tokens.map((token, j) => (
									<span key={j} style={{color: token.color}}>
										{token.text}
									</span>
								))}
							</span>
							{/* 最后一行显示光标 */}
							{i === lines.length - 1 && visibleChars < code.length && (
								<span
									style={{
										color: '#e94560',
										opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
									}}
								>
									▌
								</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};
