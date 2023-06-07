//import js_beautify from 'js-beautify';

interface ChatCompletionChunk {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: Choice[];
}

interface Choice {
	delta: Delta;
	index: number;
	finish_reason?: string;
}

interface Delta {
	content: string;
}

export function processTextAndCodeBlocks(deltas: ChatCompletionChunk[]) {
	let content = ''; // initialize an empty string
	for (let delta of deltas) {
		// loop over the array of objects
		content += delta.choices[0].delta.content; // access the content property of each delta object inside the choices array
	}
	const regex = /```(?:([\w-]+)\n)?([\s\S]*?)```|`([^`]+)`/g;
	const blocks = [];
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(content)) !== null) {
		// Add a text block before the code block
		if (lastIndex !== match.index) {
			blocks.push({
				type: 'text',
				content: content.slice(lastIndex, match.index)
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
			content: content.slice(lastIndex)
		});
	}

	// Remove the string "undefined" from blocks
	const cleanedBlocks = blocks.map((block) => {
		if (block.content) {
			block.content = block.content.replace('undefined', '');
		}
		return block;
	});

	return cleanedBlocks;
}
