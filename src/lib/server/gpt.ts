import { SECRET_API_KEY, SECRET_API_URL } from '$env/static/private';

/**
 * Retrieves data from an API using the provided request and model.
 *
 * @param {string} request - The request to send to the API.
 * @param {string} model - The model to use for processing the request.
 * @return {Promise<Response>} A Promise that resolves to the API response.
 */
export async function getData(request: string, model: string) {
	const apiKey = SECRET_API_KEY;
	const url = SECRET_API_URL;
	let responseJson;
	let responseContent;

	const inputData = await request;

	const config = {
		Authorization: `Bearer ${apiKey}`,
		'Content-Type': 'application/json'
	};

	const data = {
		model,
		messages: [{ role: 'user', content: inputData }]
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: config
		});

		responseJson = await response.json();
		responseContent = responseJson.choices[0].message.content;
	} catch (error) {
		console.error('Error fetching chat response:', error);
	}

	return new Response(JSON.stringify(responseContent), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
