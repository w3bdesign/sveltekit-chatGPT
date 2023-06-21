import { SECRET_API_KEY, SECRET_API_URL } from '$env/static/private';
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai';
import type { Request, RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const POST: RequestHandler = async ({ request }: Request) => {
	try {
		if (!SECRET_API_KEY) {
			throw new Error('OPENAI_KEY env variable not set');
		}

		const requestData = await request.json();

		if (!requestData) {
			throw new Error('No request data');
		}

		const reqMessages: ChatCompletionRequestMessage[] = requestData.messages;

		if (!reqMessages) {
			throw new Error('no messages provided');
		}

		const prompt = '';

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: prompt },
			...reqMessages
		];

		const chatRequestOpts: CreateChatCompletionRequest = {
			model: 'gpt-4',
			//model: 'gpt-3.5-turbo-16k-0613',
			//model: 'gpt-4-poe',
			messages,
			temperature: 0.1,
			stream: true
		};

		const chatResponse = await fetch(SECRET_API_URL, {
			headers: {
				Authorization: `Bearer ${SECRET_API_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		});

		if (!chatResponse.ok) {
			const err = await chatResponse.json();
			throw new Error(err.error.message);
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		});
	} catch (err) {
		console.error('Error: ', err);
		return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
};
