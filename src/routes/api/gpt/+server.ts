import { SECRET_API_URL, SECRET_STATUS_URL } from '$env/static/private';
import type { ChatCompletionRequestMessage } from 'openai';

import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const POST = async ({ request }: any) => {
	try {
		const requestData = await request.json();

		const prompt = requestData.messages[0].content;

		if (!requestData) {
			throw new Error('No request data');
		}

		const reqMessages: ChatCompletionRequestMessage[] = requestData.messages;

		if (!reqMessages) {
			throw new Error('no messages provided');
		}

		// Prepare data for POST request
		const data = new URLSearchParams();
		data.append('rolePrompt', '');
		data.append('roleId', '1');
		data.append('model', 'gpt-4');
		data.append('temperature', '0.6');
		data.append('prompt', encodeURIComponent(prompt));

		const response = await fetch(SECRET_API_URL, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.100.0',
				Accept: 'application/json, text/javascript, */*; q=0.01',
				'Accept-Language': 'en-US,en;q=0.5',
				'Accept-Encoding': 'gzip, deflate, br',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'X-Requested-With': 'XMLHttpRequest',
				Origin: SECRET_STATUS_URL,
				Connection: 'keep-alive',
				Referer: `${SECRET_STATUS_URL}/`
			},
			method: 'POST',
			body: data.toString()
		});

		if (!response.ok) {
			const err = await response.json();
			throw new Error(err.error.message);
		}

		let responseData = await response.text();

		return new Response(responseData, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		});
	} catch (err) {
		console.error('Error: ', err);
		return { status: 500, body: { error: 'There was an error processing your request' } };
	}
};
