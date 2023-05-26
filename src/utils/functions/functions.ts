import js_beautify from 'js-beautify';

/**
 * Processes a given text by extracting and prettifying JavaScript code blocks,
 * and extracting links.
 *
 * @param {string} text - the input text to process
 * @return {Object} an object containing the prettified code block, an array of
 * links, and the text before and after the code block
 */
export function processText(text: string) {
	let codeRegex = /```javascript([\s\S]*?)```/;
	let codeMatch = text.match(codeRegex);
	let code = codeMatch ? codeMatch[1] : '';
	let prettifiedCode = js_beautify(code);

	let newText = text.replace(codeRegex, 'CODE_BLOCK');
	let linkRegex = /\[\d+\]:\s*(.+?)\s*"(.*?)"\s*/g;
	let links = [...newText.matchAll(linkRegex)].map((match) => ({
		url: match[1],
		text: match[2]
	}));
	newText = newText.replace(linkRegex, '');
	newText = newText.replace(
		/`([^`]+)`/g,
		'<code class="px-1 py-0.5 m-0 text-sm break-spaces bg-gray-200 rounded-md">$1</code>'
	);
	let [textBeforeCode, textAfterCode] = newText.split('CODE_BLOCK');

	return { prettifiedCode, links, textBeforeCode, textAfterCode };
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
