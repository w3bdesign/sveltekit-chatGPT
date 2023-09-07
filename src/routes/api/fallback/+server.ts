import OpenAI from 'openai';

import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';

import { SECRET_FALLBACK_API_KEY, SECRET_FALLBACK_API_URL } from '$env/static/private';

export const config: Config = {
	runtime: 'edge'
};

const openai = new OpenAI({
	apiKey: SECRET_FALLBACK_API_KEY,
	baseURL: SECRET_FALLBACK_API_URL
});

export const GET: RequestHandler = async ({ url }) => {
	let reply: string;
	const prompt = url.searchParams.get(`prompt`) || `Hello`;

	const completion = await openai.chat.completions.create({
		messages: [
			{ role: 'system', content: 'You are a helpful assistant.' },
			{ role: 'user', content: prompt }
		],
		model: 'gpt-4-32k-0314',
		stream: true,
		temperature: 0
	});

	const readableStream = new ReadableStream({
		async start(controller) {
			for await (const part of completion) {
				const content = part.choices[0]?.delta?.content || '';
				reply += content;
			}
			controller.enqueue(`data: ${reply}\n\n`);
			controller.enqueue('event: end\ndata: \n\n');
			controller.close();
		}
	});

	return new Response(readableStream, {
		headers: {
			'Content-Type': 'text/event-stream'
		}
	});
};
