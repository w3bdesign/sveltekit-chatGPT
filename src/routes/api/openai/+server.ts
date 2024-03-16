import { SECRET_OPENAI_KEY } from '$env/static/private';
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai';
import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const GET: RequestHandler = async ({ url }) => {
	const promptMessage = url.searchParams.get(`prompt`) || `Hello`;
	try {
		if (!SECRET_OPENAI_KEY) {
			throw new Error('OPENAI_KEY env variable not set');
		}

		const reqMessages = [{ role: 'user', content: promptMessage }];

		if (!reqMessages) {
			throw new Error('no messages provided');
		}

		const prompt = 'You are a helpful assistant. Your name is GPT-4';

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: prompt },
			...reqMessages
		];

		const chatRequestOpts: CreateChatCompletionRequest = {
			//model: 'gpt-4-0314',
			model: 'gpt-4-1106-preview',

			messages,
			temperature: 0,
			stream: true
		};

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${SECRET_OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		});

		if (!chatResponse.ok) {
			const err = await chatResponse.json();
			throw new Error(err.error);
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		});
	} catch (err) {
		console.error(err);
		return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
};
