<script lang="ts">
	import Button from '../components/Button.svelte';
	import ChatOutput from '../components/ChatOutput.svelte';
	import LoadingSpinner from '../components/LoadingSpinner.svelte';
	import TextArea from '../components/TextArea.svelte';
	import Header from '../components/Header.svelte';

	let inputText = '';
	/**
	 * @type {string[]}
	 */
	let outputText: string[] = [];
	let isLoading = false;
	const proxyURL = 'https://cors-proxy.fringe.zone/';
	const apiURL = 'http://144.91.83.35:5500/';

	async function getData() {
		isLoading = true;
		const response = await fetch(`${proxyURL}${apiURL}?text=${encodeURIComponent(inputText)}`);
		const data = await response.text();
		outputText = [...outputText, data];
		inputText = '';
		isLoading = false;
	}
</script>

<div class="flex flex-col items-center justify-center mt-6">
	<div class="flex flex-col items-center">
		<Header text="Sveltekit - GPT4" />
		<TextArea bind:value={inputText} />
		<Button text="Submit" buttonAction={getData} />
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
