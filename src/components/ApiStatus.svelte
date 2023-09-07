<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';

	type RouteStatus = {
		status: number;
		time: number;
	};

	type Result = {
		status: 'fulfilled' | 'rejected';
		value?: RouteStatus;
		reason?: unknown;
	};

	const routes = ['/api/sse', '/api/fallback'];

	let statusMessage = writable('Connecting to API');

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

	async function fetchRouteStatus(route: string): Promise<RouteStatus> {
		const startTime = Date.now();
		const response = await fetch(`${route}?prompt=Hello`);
		const time = Date.now() - startTime;

		if (response.status !== 200) {
			throw new Error('Network response was not ok');
		}

		return { status: 200, time: Math.round(time) };
	}

	function processResults(results: Result[]): string[] {
		return results.map((result, index: number) => {
			if (result.status === 'fulfilled') {
				return `<br>Route ${index + 1}: ${result.value?.status === 200 ? 'OK' : 'Failed'} (${
					result.value?.time
				}ms)`;
			} else {
				return `Route ${index + 1}: Failed`;
			}
		});
	}

	async function checkApiConnection(retries = 3): Promise<void> {
		let responseTimes: string[] | undefined;

		for (let i = 0; i < retries; i++) {
			try {
				const results = await Promise.allSettled(routes.map(fetchRouteStatus));
				responseTimes = processResults(results);

				const allConnected = results.every(
					(result) => result.status === 'fulfilled' && result.value.status === 200
				);

				if (allConnected) {
					isConnected = true;
					wasEverConnected = true;
					break;
				}
			} catch (error) {
				// Wait for 2 seconds before retrying
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}

		if (isConnected) {
			statusMessage.set(`Connected to API<br>${responseTimes?.join('')}`);
		} else {
			statusMessage.set(
				wasEverConnected
					? 'Lost connection to API. Please try refreshing the page.'
					: 'Failed to connect to API. Please try refreshing the page.'
			);
		}
	}

	function accordion(node: HTMLElement, isOpen: boolean) {
		const content = node.querySelector('p');
		const closedHeight = node.offsetHeight;
		const openHeight = closedHeight + (content?.offsetHeight || 0) + 20; // Add 20px (10px top + 10px bottom)

		node.style.height = isOpen ? `${openHeight}px` : `${closedHeight}px`;
		node.style.overflow = 'hidden';

		return {
			update(isOpen: boolean) {
				const animation = node.animate(
					[
						{
							height: `${openHeight}px`,
							overflow: 'hidden'
						},
						{
							height: `${closedHeight}px`,
							overflow: 'hidden'
						}
					],
					{ duration: 200, fill: 'both' }
				);
				animation.pause();

				if (!isOpen) {
					animation.play();
				} else {
					animation.reverse();
				}
			}
		};
	}

	onMount(() => {
		checkApiConnection();
	});
</script>

<div
	class="shadow-md rounded min-h-[60px] w-full md:w-[45rem] mt-1 mb-5 {$alertClass}"
	use:accordion={isConnected}
>
	<p class="text-center mx-auto p-4">{@html $statusMessage}</p>
</div>
