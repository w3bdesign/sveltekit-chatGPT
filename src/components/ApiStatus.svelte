<script lang="ts">
	import { SSE } from 'sse.js';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	let statusMessage = 'Connecting to API';

	const checkApiConnection = async () => {
		try {
			const eventSource = new SSE('/api/gpt', {
				headers: { 'Content-Type': 'application/json' },
				payload: JSON.stringify({
					messages: [{ role: 'user', content: 'hello' }],
					model: 'gpt-4'
				})
			});

			eventSource.addEventListener('error', (event: any) => {
				console.error('Error event:', event);
				statusMessage = 'Failed to connect to API';
				eventSource.close();
			});

			eventSource.addEventListener('message', (event: { data: any }) => {
				console.log('Message event data:', event.data);
				statusMessage = 'Connected to API';
				eventSource.close();
			});

			await eventSource.stream();
		} catch (error) {
			console.error('Exception:', error);
			statusMessage = 'Failed to connect to API';
		}
	};

	onMount(() => {
		checkApiConnection();
	});
</script>

<div
	class="alert w-full mt-4 mb-4
        {statusMessage === 'Connected to API'
		? 'variant-filled-primary'
		: statusMessage === 'Connecting to API'
		? 'variant-filled-warning'
		: 'variant-filled-error'}"
>
	<p class="text-center mx-auto">{statusMessage}</p>
</div>
