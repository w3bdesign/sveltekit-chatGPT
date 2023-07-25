<script lang="ts">
	import { SSE } from 'sse.js';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let statusMessage = writable('Connecting to API');
	let showAlert = writable(true);

	const checkApiConnection = async () => {
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
				console.error('Error event:', event);
				statusMessage.set('Failed to connect to API');
				isResponseReceived = true;
				eventSource.close();
			});

			eventSource.addEventListener('message', async (event: { data: any }) => {
				console.log('Message event data:', event.data);
				statusMessage.set('Connected to API');
				isResponseReceived = true;
				eventSource.close();
			});

			await eventSource.stream();
		} catch (error) {
			console.error('Exception:', error);
			statusMessage.set('Failed to connect to API');
			await updateAlert();
		}
	};

	onMount(() => {
		checkApiConnection();
	});

	const updateAlert = async () => {
		// Hide the alert
		showAlert.set(false);
		// Wait for the hide transition to complete
		await new Promise((resolve) => setTimeout(resolve, 1000));
		// Show the alert again
		showAlert.set(true);
	};
</script>

<div
	class="alert w-full mt-1 mb-5 transition-opacity duration-200
        {$statusMessage === 'Connected to API'
		? 'variant-filled-primary'
		: $statusMessage === 'Connecting to API'
		? 'variant-filled-warning'
		: 'variant-filled-error'}
        {$showAlert ? 'opacity-100' : 'opacity-0'}"
>
	<p class="text-center mx-auto">{$statusMessage}</p>
</div>
