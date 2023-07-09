import { SECRET_API_MODELS } from '$env/static/private';

import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const GET: RequestHandler = async () => {
	try {
		if (!SECRET_API_MODELS) {
			throw new Error('SECRET_API_MODELS env variable not set');
		}

		const response = await fetch(SECRET_API_MODELS);
		const data = await response.json();
		const chatModels = data.data
			.filter((model: { type: string }) => model.type === 'chat')
			.map((model: { id: string }) => ({ id: model.id, name: model.id }));

		return json(chatModels);
	} catch (err) {
		console.error('Error: ', err);
		return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
};
