<script lang="ts">
	/**
	 * Provide a visual feedback to the user about the state of the connection using a status alert.
	 */
	import { SSE } from 'sse.js';
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';

	import { isValidJSON } from '$utils/functions/functions';

	let statusMessage = writable('Connecting to API');
	let showAlert = writable(true);

	let isConnected = false;
	let wasEverConnected = false;

	const statusToClass = new Map([
		['Connected to API', 'variant-filled-primary'],
		['Connecting to API', 'variant-filled-surface'],
		['Connection failed', 'variant-filled-warning'],
		['default', 'variant-filled-error']
	]);

	let alertClass = derived(statusMessage, ($statusMessage) => {
		for (let [key, value] of statusToClass.entries()) {
			if ($statusMessage.startsWith(key)) {
				return value;
			}
		}

		return statusToClass.get('default');
	});

	const checkApiConnection = async (retries = 10) => {
		for (let i = 0; i < retries; i++) {
			try {
				const eventSource = new SSE('/api/gpt', {
					headers: { 'Content-Type': 'application/json' },
					payload: JSON.stringify({
						messages: [{ role: 'user', content: 'Hello' }],
						model: 'gpt-4'
					})
				});

				eventSource.addEventListener('message', (event: MessageEvent) => {
					try {
						// Check if event.data exists, is not an empty string and is valid JSON
						if (event.data && event.data.trim() !== '' && isValidJSON(event.data)) {
							// Parse the event data as JSON
							const data = JSON.parse(event.data);

							// Check if 'finish_reason' is 'stop', indicating end of data from server
							if (data.choices && data.choices[0].finish_reason === 'stop') {
								isConnected = true;
								wasEverConnected = true;
								statusMessage.set('Connected to API');
								eventSource.close();
							}
						}
					} catch (error) {
						console.error('Error parsing JSON:', error);
					}
				});

				eventSource.addEventListener('error', async () => {
					eventSource.close();
					if (!isConnected) {
						if (i === retries - 1) {
							statusMessage.set(
								wasEverConnected
									? 'Lost connection to API. Please try refreshing the page.'
									: 'Failed to connect to API. Please try refreshing the page.'
							);
						} else {
							statusMessage.set(`Connection failed. Retrying (${i + 1}/${retries})...`);
						}
					}
				});

				await eventSource.stream();
				if (isConnected) {
					break;
				}
			} catch (error) {
				if (i === retries - 1) {
					statusMessage.set(
						wasEverConnected
							? 'Lost connection to API. Please try refreshing the page.'
							: 'Failed to connect to API. Please try refreshing the page.'
					);
				} else {
					statusMessage.set(`Connection failed. Retrying (${i + 2}/${retries})...`);
				}
			}
			// Wait for 2 seconds before retrying
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	};

	onMount(() => {
		checkApiConnection();
	});
</script>

<div
	class="alert w-full md:w-[45rem] mt-1 mb-5 transition-opacity duration-200 {$alertClass} {$showAlert
		? 'opacity-100'
		: 'opacity-0'}"
>
	<p class="text-center mx-auto">{$statusMessage}</p>
</div>
