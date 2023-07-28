<script lang="ts">
	/**
	 * Provide a visual feedback to the user about the state of the connection using a status alert.
	 */

	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';

	const API_STATUS_URL = '/api/status';
	const CHAT_COMPLETIONS_ENDPOINT = '/api/v1/chat/completions';

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
		if ($statusMessage.startsWith('Connected to')) {
			return 'variant-filled-primary';
		}

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
				const response = await fetch(API_STATUS_URL);

				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				const result = await response.json();

				// Check if CHAT_COMPLETIONS_ENDPOINT is working
				if (
					result.endpoints &&
					result.endpoints[CHAT_COMPLETIONS_ENDPOINT] &&
					result.endpoints[CHAT_COMPLETIONS_ENDPOINT].works
				) {
					isConnected = true;
					wasEverConnected = true;

					// Extract the model name from the status string
					const modelNameMatch =
						result.endpoints[CHAT_COMPLETIONS_ENDPOINT].status.match(/\[(.*?)\]/);

					if (modelNameMatch) {
						const modelName = modelNameMatch[1];
						statusMessage.set(`Connected to ${modelName.toUpperCase()}`);
					} else {
						statusMessage.set('Connected to API');
					}

					break;
				} else {
					statusMessage.set(`The ${CHAT_COMPLETIONS_ENDPOINT} endpoint is not working`);
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

				// Wait for 2 seconds before retrying
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
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
