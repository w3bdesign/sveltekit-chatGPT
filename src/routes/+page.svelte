<script lang="ts">
	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	import Button from '../components/Button.svelte';
	import ChatOutput from '../components/ChatOutput.svelte';
	import LoadingSpinner from '../components/LoadingSpinner.svelte';
	import TextArea from '../components/TextArea.svelte';
	import Header from '../components/Header.svelte';

	import textStore, { addQuestionAndAssociateOutput } from '../store/store';

	import { SSE } from 'sse.js';

	let isLoading = false;

	async function handleSubmit() {
		isLoading = true;
		try {
			const inputText = $textStore.inputText;

			// Initialize the SSE connection
			const eventSource = new SSE('/api/gpt', {
				headers: {
					'Content-Type': 'application/json'
				},
				payload: JSON.stringify({ messages: [{ role: 'user', content: inputText }] })
			});

			// Handle errors
			eventSource.addEventListener('error', () => {
				isLoading = false;
				const t: ToastSettings = {
					message: 'An error occurred while fetching data from GPT-4',
					background: 'variant-filled-error',
					timeout: 6000
				};
				toastStore.trigger(t);
			});

			// Handle messages from the server
			eventSource.addEventListener('message', (e: { data: string }) => {
				isLoading = false;
				try {
					const data = JSON.parse(e.data);
					textStore.update((text) => {
						return {
							...text,
							outputText: [...text.outputText, data],
							inputText: ''
						};
					});
				} catch (error) {
					const t: ToastSettings = {
						message: 'An error occurred while parsing data from GPT-4',
						background: 'variant-filled-error',
						timeout: 6000
					};
					toastStore.trigger(t);
				}
			});

			eventSource.addEventListener('readystatechange', (e: { readyState: number }) => {
				if (e.readyState === 2) {
					const questions = $textStore.questions;
					let questionId = questions.length + 1;
					addQuestionAndAssociateOutput(questionId, $textStore.outputText);
				}
			});

			// Start streaming data
			eventSource.stream();
		} catch (error) {
			isLoading = false;
			const t: ToastSettings = {
				message: 'An error occurred while connecting to GPT-4',
				background: 'variant-filled-error',
				timeout: 6000
			};
			toastStore.trigger(t);
		}
	}
</script>

<svelte:head>
	<title>Main - GPT4</title>
</svelte:head>

<div class="flex flex-col items-center justify-center mt-6">
	<div class="flex flex-col items-center">
		<Header text="GPT-4 Chat" />
		<TextArea
			placeholder="Type something here to start ..."
			bind:value={$textStore.inputText}
			{handleSubmit}
		/>
		<Button text="Submit" buttonAction={handleSubmit} />

		{#if isLoading}
			<LoadingSpinner {isLoading} />
		{/if}

		{#if $textStore.outputText.length}
			Streaming: <ChatOutput data={$textStore.outputText} />
		{/if}

		{#each $textStore.questions as question (question.id)}
			Non-streaming: <ChatOutput data={question.outputText} />
		{/each}
	</div>
</div>
