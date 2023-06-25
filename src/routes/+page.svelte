<script lang="ts">
	import { SSE } from 'sse.js';
	import { toastStore } from '@skeletonlabs/skeleton';

	import type { ToastSettings } from '@skeletonlabs/skeleton';

	import Button from '$components/Button.svelte';
	import ChatOutput from '$components/ChatOutput.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import TextArea from '$components/TextArea.svelte';
	import Header from '$components/Header.svelte';

	import textStore from '$store/store';
	import { addQuestionAndAssociateOutput } from '$store/storeHelpers';

	let isLoading = false;

	/**
	 * Initialize a Server-Sent Events (SSE) connection to an API endpoint and listens for events from the server.
	 * When a message is received, the update the text output, add a new question, and sets the loading flag to false:
	 * It also triggers a toast message if any errors occur during the process.
	 */
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
				const toast: ToastSettings = {
					message: 'An error occurred while fetching data from GPT-4',
					background: 'variant-filled-error',
					timeout: 6000
				};
				toastStore.trigger(toast);
			});

			// Handle messages from the server
			eventSource.addEventListener('message', (e: { data: any }) => {
				const data = JSON.parse(e.data);

				// Add a new question and clears input text if the first choice of some parsed data has a finish reason of "stop".
				if (data.choices[0].finish_reason === 'stop') {
					const questions = $textStore.questions;
					let questionId = questions.length + 1;
					addQuestionAndAssociateOutput(questionId, $textStore.outputText);

					// Clear input text
					textStore.update((text) => {
						return {
							...text,
							inputText: ''
						};
					});

					isLoading = false;
				}

				try {
					const data = JSON.parse(e.data);
					textStore.update((text) => {
						return {
							...text,
							outputText: [...text.outputText, data]
						};
					});
				} catch (error) {
					const toast: ToastSettings = {
						message: 'An error occurred while parsing data from GPT-4',
						background: 'variant-filled-error',
						timeout: 6000
					};
					toastStore.trigger(toast);
				}
			});

			// Start streaming data
			eventSource.stream();
		} catch (error) {
			isLoading = false;
			const toast: ToastSettings = {
				message: 'An error occurred while connecting to GPT-4',
				background: 'variant-filled-error',
				timeout: 6000
			};
			toastStore.trigger(toast);
		}
	}
</script>

<svelte:head>
	<title>Main - GPT-4 Chat</title>
</svelte:head>

<div class="flex flex-col items-center justify-center mt-6">
	<div class="flex flex-col items-center">
		<Header text="GPT-4 Chat" />
		<TextArea
			placeholder="Type something here to start ..."
			{isLoading}
			bind:value={$textStore.inputText}
			{handleSubmit}
		/>
		<div class="py-4"><Button buttonAction={handleSubmit} buttonType="filled">Submit</Button></div>
		{#if isLoading}
			<LoadingSpinner {isLoading} />
		{/if}
		{#each $textStore.questions as question (question.id)}
			<ChatOutput data={question.outputText} />
		{/each}
	</div>
</div>
