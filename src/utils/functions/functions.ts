interface CompletionChunk {
	choices: Choice[];
	created: number;
	id: string;
	model: string;
	object: string;
}

interface Choice {
	index: number;
	finish_reason?: string;
	delta: Delta;
}

interface Delta {
	role: string;
	content: string;
}

/**
 * Processes an array of ChatCompletionChunk objects to extract text and code blocks.
 *
 * @param {ChatCompletionChunk[]} deltas - An array of ChatCompletionChunk objects.
 * @return {Object[]} An array of objects representing text and code blocks. Each object contains a 'type' property
 * with a value of 'text' or 'code', an 'inline' property with a value of true or false depending on whether the code
 * block is inline, a 'language' property with a string value indicating the language of the code block, and a 'code'
 * property with a string value containing the code block itself. The array is cleaned to remove the string "undefined".
 */
export function processTextAndCodeBlocks(deltas: CompletionChunk[]) {
	const content = deltas.join('');

	const regex = /```(?:([\w-]+)\n)?([\s\S]*?)```|`([^`]+)`/g;
	const blocks = [];
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(content)) !== null) {
		// Add a text block before the code block
		if (lastIndex !== match.index) {
			blocks.push({
				type: 'text',
				content: ' ' + content.slice(lastIndex, match.index).trim().replace(/\n/g, '<br>') + ' '
			});
		}

		if (match[1]) {
			// Triple backticks
			blocks.push({ type: 'code', inline: false, language: match[1], code: match[2] });
		} else if (match[3]) {
			// Single backtick
			blocks.push({ type: 'code', inline: true, language: 'plaintext', code: match[3] });
		}

		lastIndex = regex.lastIndex;
	}

	// Add the remaining text block after the last code block
	if (lastIndex < content.length) {
		blocks.push({
			type: 'text',
			content: ' ' + content.slice(lastIndex).trim().replace(/\n/g, '<br>') + ' '
		});
	}

	// Remove the string "undefined" from blocks
	return blocks.map((block) => {
		if (block.content) {
			block.content = block.content.replace('undefined', '');
		}
		return block;
	});
}
