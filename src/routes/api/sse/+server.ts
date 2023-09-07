import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';

import { SECRET_API_URL } from '$env/static/private';

export const config: Config = {
	runtime: 'edge'
};

/**
 * Handles a GET request and returns a Response object with a ReadableStream of streaming data.
 *
 * @param {Object} request - The request object containing the URL.
 * @param {URL} request.url - The URL object with search parameters.
 * @return {Response} The Response object with a ReadableStream of streaming data.
 */
export const GET: RequestHandler = async ({ url }) => {
	const prompt = url.searchParams.get(`prompt`) || `Hello`;
	const conversation_id = url.searchParams.get(`conversation_id`) || `bxdxxysdsdl`;

	try {
		let first = false;
		let user_id = ``;
		let model_version = `gpt-4-32k`;
		let web_search = false;
		let summarize = false;

		let url = `${SECRET_API_URL}/chat?prompt=${encodeURIComponent(
			prompt
		)}&conversation_id=${conversation_id}&first=${first}&user_id=${user_id}&model_version=${model_version}&web_search=${web_search}&summarize=${summarize}`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Network response was not ok`);
		}

		// Create a ReadableStream to handle the streaming data
		const readable = new ReadableStream({
			start(controller) {
				const reader = response.body?.getReader();

				function push() {
					reader?.read().then(({ done, value }) => {
						if (done) {
							controller.close();
							return;
						}

						controller.enqueue(value);
						push();
					});
				}

				push();
			}
		});

		return new Response(readable, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		});
	} catch (err) {
		console.error(`Error: `, err);
		return json({ error: `There was an error processing your request` }, { status: 500 });
	}
};
