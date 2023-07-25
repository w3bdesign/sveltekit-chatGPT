<script lang="ts">
	import { SSE } from 'sse.js';
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';

	let statusMessage = writable('Connecting to API');
	let showAlert = writable(true);

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

	const checkApiConnection = async (retries = 3) => {
		for (let i = 0; i < retries; i++) {
			let isResponseReceived = false;
			try {
				const eventSource = new SSE('/api/gpt', {
					headers: { 'Content-Type': 'application/json' },
					payload: JSON.stringify({
						messages: [{ role: 'user', content: 'Hello' }],
						model: 'gpt-4'
					})
				});

				eventSource.addEventListener('error', async (event: any) => {
					isResponseReceived = true;
					eventSource.close();
					if (i === retries - 1) {
						statusMessage.set('Failed to connect to API');
					} else {
						statusMessage.set(`Connection failed. Retrying (${i + 1}/${retries})...`);
					}
				});

				eventSource.addEventListener('message', async () => {
					statusMessage.set('Connected to API');
					isResponseReceived = true;
					eventSource.close();
				});

				await eventSource.stream();
				if (isResponseReceived) {
					break;
				}
			} catch (error) {
				if (i === retries - 1) {
					statusMessage.set('Failed to connect to API');
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
	class="alert w-full mt-1 mb-5 transition-opacity duration-200 {$alertClass} {$showAlert
		? 'opacity-100'
		: 'opacity-0'}"
>
	<p class="text-center mx-auto">{$statusMessage}</p>
</div>
