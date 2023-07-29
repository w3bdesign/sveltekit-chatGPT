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
	import ModelSelect from '$components/ModelSelect.svelte';
	import ApiStatus from '$components/ApiStatus.svelte';

	const MAX_RETRY_COUNT = 5;

	let isLoading = false;
	let selectedModel = '';
	let retryCount = 0;

	$: isDisabled = $textStore.inputText.length === 0;

	async function handleSubmit() {
		isLoading = true;
		try {
			const inputText = $textStore.inputText;

			// Initialize the SSE connection
			const eventSource = new SSE('/api/gpt', {
				headers: {
					'Content-Type': 'application/json'
				},
				payload: JSON.stringify({
					messages: [{ role: 'user', content: inputText }],
					model: selectedModel
				})
			});

			// Handle errors and retries
			eventSource.addEventListener('error', async () => {
				if (retryCount < MAX_RETRY_COUNT) {
					retryCount++;
					const retryToast: ToastSettings = {
						message: `Error occurred. Retrying... (${retryCount}/${MAX_RETRY_COUNT})`,
						background: 'variant-filled-warning',
						timeout: 2000
					};
					toastStore.trigger(retryToast);
					await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
					setTimeout(handleSubmit, 2000); // Add delay before calling handleSubmit again
				} else {
					await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before showing the error toast
					isLoading = false;
					const toast: ToastSettings = {
						message: 'An error occurred while fetching data from the API',
						background: 'variant-filled-error',
						timeout: 6000
					};
					toastStore.trigger(toast);
				}
			});

			// Handle messages from the server
			eventSource.addEventListener('message', (e: { data: any }) => {
				retryCount = 0; // Reset retry count on successful message
				const data = JSON.parse(e.data);

				if (data.choices[0].finish_reason === 'stop') {
					const questions = $textStore.questions;
					let questionId = questions.length + 1;
					addQuestionAndAssociateOutput(questionId, $textStore.outputText);

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

<div class="flex flex-col items-center justify-center mt-6 p-4">
	<Header text="GPT-4 Chat" />
	<ApiStatus />
	<form data-testid="gptform" id="gptform" on:submit|preventDefault={handleSubmit}>
		<label for="gptChatBox" class="text-sm mb-2">Input:</label>
		<TextArea
			id="gptChatBox"
			placeholder="Type something here to start ..."
			{isLoading}
			bind:value={$textStore.inputText}
			{handleSubmit}
		/>
		<div class="flex mt-4 mb-8">
			<Button buttonType="filled" {isDisabled}>Submit</Button>
			<ModelSelect bind:selectedModel />
		</div>
	</form>
	{#if isLoading}
		<LoadingSpinner {isLoading} />
	{/if}
	{#each $textStore.questions as question (question.id)}
		<ChatOutput data={question.outputText} />
	{/each}
</div>
