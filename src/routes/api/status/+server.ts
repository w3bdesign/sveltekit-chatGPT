import { json } from '@sveltejs/kit';

import { SECRET_STATUS_URL } from '$env/static/private';

import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const GET: RequestHandler = async () => {
	try {
		if (!SECRET_STATUS_URL) {
			throw new Error('SECRET_STATUS_URL env variable not set');
		}

		const response = await fetch(SECRET_STATUS_URL);
		const data = await response.json();

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		// Forward the response to the client
		return json(data);
	} catch (err) {
		console.error('Error: ', err);
		return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
};
