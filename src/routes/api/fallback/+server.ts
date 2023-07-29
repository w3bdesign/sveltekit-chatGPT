import axios from 'axios';
import FormData from 'form-data';
import { json } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';

import type { RequestHandler } from './$types';

import {
	SECRET_FALLBACK_URL,
	SECRET_FALLBACK_AJAX_URL,
	SECRET_FALLBACK_DOMAIN
} from '$env/static/private';

export const config: Config = {
	runtime: 'edge'
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const requestData = await request.json();
		if (!requestData) {
			throw new Error('No request data');
		}

		const reqMessages = requestData.messages;
		if (!reqMessages) {
			throw new Error('No messages provided');
		}

		// Create chat completion
		const chatCompletion = await createCompletion(reqMessages);
		return json(chatCompletion);
	} catch (err) {
		console.error('Error: ', err);
		return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
};

async function createCompletion(messages: any[]) {
	const chat =
		messages
			.map((message: { role: any; content: any }) => `${message.role}: ${message.content}`)
			.join('\n') + 'assistant: ';

	const response = await axios.get(SECRET_FALLBACK_URL);

	const regex =
		/data-nonce="(.*)"\n     data-post-id="(.*)"\n     data-url="(.*)"\n     data-bot-id="(.*)"\n     data-width/i;
	const [, nonce, post_id, , bot_id] = response.data.match(regex);

	const headers = {
		authority: SECRET_FALLBACK_DOMAIN,
		accept: '*/*',
		'accept-language': 'en,fr-FR;q=0.9,fr;q=0.8,es-ES;q=0.7,es;q=0.6,en-US;q=0.5,am;q=0.4,de;q=0.3',
		'cache-control': 'no-cache',
		origin: SECRET_FALLBACK_URL,
		pragma: 'no-cache',
		referer: `${SECRET_FALLBACK_AJAX_URL}/gpt-4/`,
		'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Windows"',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'same-origin',
		'user-agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
	};

	const data = new FormData();
	data.append('_wpnonce', nonce);
	data.append('post_id', post_id);
	data.append('url', SECRET_FALLBACK_URL);
	data.append('action', 'wpaicg_chat_shortcode_message');
	data.append('message', chat);
	data.append('bot_id', bot_id);

	headers['Content-Type'] = `multipart/form-data; boundary=${data._boundary}`;

	const postResponse = await axios.post(SECRET_FALLBACK_AJAX_URL, data, { headers });

	return postResponse.data.data;
}
