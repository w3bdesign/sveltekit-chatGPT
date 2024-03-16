<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';

	import { ROUTES } from '../constants/ROUTES';

	type ROUTEStatus = {
		status: number;
		time: number;
	};

	type Result = {
		status: 'fulfilled' | 'rejected';
		value?: ROUTEStatus;
		reason?: unknown;
	};

	let statusMessage = writable('Connecting to API');

	let failedROUTESCount = writable(0);

	let isConnected = false;
	let wasEverConnected = false;

	let results: Result[] = [];

	let alertClass = derived(
		[statusMessage, failedROUTESCount],
		([$statusMessage, $failedROUTESCount]) => {
			if ($statusMessage.startsWith('Connected to')) {
				return 'variant-filled-primary';
			}

			if ($statusMessage.startsWith('Connecting to')) {
				return 'variant-filled-surface';
			}

			if ($failedROUTESCount === 1) {
				return 'variant-filled-warning';
			} else if ($failedROUTESCount > 1) {
				return 'variant-filled-error';
			}

			return 'variant-filled-error'; // Default to error class
		}
	);

	async function fetchROUTEStatus(route: string): Promise<ROUTEStatus> {
		const startTime = Date.now();
		const response = await fetch(`${route}?prompt=Hello`);
		const time = Date.now() - startTime;

		if (response.status !== 200) {
			throw new Error('Network response was not ok');
		}

		return { status: 200, time: Math.round(time) };
	}

	function processResults(results: Result[]): any[] {
		return results.map((result, index) => {
			if (result.status === 'fulfilled') {
				return {
					route: ROUTES[index],
					status: result.value?.status === 200 ? 'OK' : 'Failed',
					time: result.value?.time
				};
			} else {
				return { route: ROUTES[index], status: 'Failed', time: 0 };
			}
		});
	}

	async function checkApiConnection(retries = 3): Promise<void> {
		let responseTimes: string[] | undefined;

		for (let i = 0; i < retries; i++) {
			try {
				results = await Promise.allSettled(ROUTES.map(fetchROUTEStatus));
				responseTimes = processResults(results);

				const allConnected = results.every(
					(result) => result.status === 'fulfilled' && result?.value?.status === 200
				);

				if (allConnected) {
					isConnected = true;
					wasEverConnected = true;
					break;
				} else {
					const failedCount = results.filter((result) => result.status === 'rejected').length;
					failedROUTESCount.set(failedCount);
				}
			} catch (error) {
				// Wait for 2 seconds before retrying
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}

		if (isConnected) {
			statusMessage.set(`Connected to API`);
		} else {
			statusMessage.set(
				wasEverConnected
					? 'Lost connection to API. Please try refreshing the page.'
					: 'Failed to connect to API.'
			);

			if ($failedROUTESCount === 1) {
				statusMessage.set('Failed to connect to a route. One or more routes is working.');
			}

			if ($failedROUTESCount > 1) {
				statusMessage.set('Failed to connect to API.');
			}
		}
	}

	function accordion(node: HTMLElement, isOpen: boolean) {
		const content = node.querySelector('p');
		const closedHeight = node.offsetHeight;
		const openHeight = closedHeight + (content?.offsetHeight || 0) + 150; // Add 30px (10px top + 10px bottom)

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
	<p class="text-center mx-auto p-4">
		<span class="font-bold">{@html $statusMessage}</span>
		{#if isConnected}
			<table class="w-4/6 border-collapse mt-4 shadow-md mx-auto">
				<thead>
					<tr>
						<th class="border-r-2 border-gray-600 px-2 py-2 bg-gray-700 text-white font-bold"
							>Route name</th
						>
						<th class="border-r-2 border-gray-600 px-2 py-2 bg-gray-700 text-white font-bold"
							>Status</th
						>
						<th class="border-r-2 border-gray-600 px-2 py-2 bg-gray-700 text-white font-bold"
							>Time (ms)</th
						>
						<th class="px-2 py-2 bg-gray-700 text-white font-bold">Note</th>
					</tr>
				</thead>
				<tbody>
					{#each processResults(results) as { route, status, time }, index}
						<tr class:bg-gray-100={index % 2 === 0} class:bg-white={index % 2 !== 0}>
							<td class="border-r-2 border-l-2 px-2 py-2">{route}</td>
							<td class="border-r-2 border-l-2 px-2 py-2">{status}</td>
							<td class="border-r-2 border-l-2 px-2 py-2">{time}</td>
							<td class="border-r-2 border-l-2 px-2 py-2">No context</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</p>
</div>
