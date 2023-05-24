<script>
	let inputText = '';
	let outputText = '';
	let isLoading = false;
	const proxyURL = 'https://cors-proxy.fringe.zone/';

	async function getData() {
		isLoading = true;
		const response = await fetch(
			`${proxyURL}http://144.91.83.35:5500/?text=${encodeURIComponent(inputText)}`
		);
		const data = await response.text();
		outputText = data;
		isLoading = false;
	}
</script>

<div class="flex flex-col items-center justify-center mt-12">
	<div class="flex flex-col items-center">
		<textarea class="w-[35rem] h-[20rem] border rounded p-2 bg-slate-100" bind:value={inputText} />
		<button class="bg-blue-500 text-white rounded py-2 px-4 mt-4 w-24" on:click={getData}
			>Submit</button
		>
		{#if isLoading}
			<!-- Loading spinner -->
			<div class="mt-6">
				<svg
					class="animate-spin h-10 w-10 text-blue-500"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			</div>
		{:else if outputText}
			<div class="mt-4 border rounded p-4 max-w-lg">{outputText}</div>
		{/if}
	</div>
</div>
