<script lang="ts">
	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	import Button from '../components/Button.svelte';
	import ChatOutput from '../components/ChatOutput.svelte';
	import LoadingSpinner from '../components/LoadingSpinner.svelte';
	import TextArea from '../components/TextArea.svelte';
	import Header from '../components/Header.svelte';

	import { getData } from '../utils/functions/functions';

	let inputText = '';
	let outputText: string[] = [];
	let isLoading = false;
	const proxyURL = 'https://cors-proxy.fringe.zone/';
	const apiURL = 'http://144.91.83.35:5500/';

	async function handleSubmit() {
		isLoading = true;
		try {
			const data = await getData(inputText, proxyURL, apiURL);
			outputText = [...outputText, data];
			inputText = '';
		} catch (error) {
			const t: ToastSettings = {
				message: 'An error occurred while fetching data from GPT-4',
				background: 'variant-filled-error',
				timeout: 6000
			};
			toastStore.trigger(t);
		}
		isLoading = false;
	}
</script>

<div class="flex flex-col items-center justify-center mt-6">
	<div class="flex flex-col items-center">
		<Header text="Sveltekit - GPT4" />
		<TextArea
			placeholder="Type something here to start ..."
			bind:value={inputText}
			{handleSubmit}
		/>
		<Button text="Submit" buttonAction={handleSubmit} />
		{#if isLoading}
			<LoadingSpinner {isLoading} />
		{/if}
		{#if outputText.length}
			<div class="mt-4">
				<ChatOutput {outputText} />
			</div>
		{/if}
	</div>
</div>
