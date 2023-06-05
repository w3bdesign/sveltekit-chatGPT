import js_beautify from 'js-beautify';

// utils.js
export function parseTextAndCodeBlocks(text: string) {
	const regex = /```(?:([\w-]+)\n)?([\s\S]*?)```|`([^`]+)`/g;
	const blocks = [];
	let lastIndex = 0;
	let match;
  
	while ((match = regex.exec(text)) !== null) {
	  // Add a text block before the code block
	  if (lastIndex !== match.index) {
		blocks.push({
		  type: 'text',
		  content: text.slice(lastIndex, match.index),
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
	if (lastIndex < text.length) {
	  blocks.push({
		type: 'text',
		content: text.slice(lastIndex),
	  });
	}
  
	return blocks;
  }

/**
 * Processes a given text by extracting and prettifying JavaScript code blocks,
 * and extracting links.
 *
 * @param {string} text - the input text to process
 * @return {Object} an object containing the prettified code block, an array of
 * links, and the text before and after the code block
 */
export function processText(text: string) {
	const codeRegex = /```([\s\S]*?)\n([\s\S]*?)```/;
	const codeMatch = text.match(codeRegex);
	const language = codeMatch ? codeMatch[1] : '';
	const code = codeMatch ? codeMatch[2] : '';
	const prettifiedCode = language === 'javascript' ? js_beautify(code) : code;

	let newText = text.replace(codeRegex, 'CODE_BLOCK');
	const linkRegex = /\[\d+\]:\s*(.+?)\s*"(.*?)"\s*/g;
	const links = [...newText.matchAll(linkRegex)].map((match) => ({
		url: match[1],
		text: match[2]
	}));
	newText = newText.replace(linkRegex, '');

	/*newText = newText.replace(
		/`([^`]+)`/g,
		'<code class="px-1 py-0.5 m-0 text-sm break-spaces bg-gray-200 rounded-md">$1</code>'
	);*/

	const [textBeforeCode, textAfterCode] = newText.split('CODE_BLOCK');

	return { language, prettifiedCode, links, textBeforeCode, textAfterCode };
}

/**
 * Retrieves data from an API using input text and proxy and API URLs.
 *
 * @param {string} inputText - The input text to send to the API.
 * @param {string} proxyURL - The URL of the proxy server to use.
 * @param {string} apiURL - The URL of the API server to query.
 * @return {Promise<string>} The data retrieved from the API.
 */
export async function getData(inputText: string, proxyURL: string, apiURL: string) {
	const response = await fetch(`${proxyURL}${apiURL}?text=${encodeURIComponent(inputText)}`);
	const data = await response.text();
	return data;
}
