<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	import Button from '$components/Button.svelte';
	import ChatOutput from '$components/ChatOutput.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import TextArea from '$components/TextArea.svelte';
	import Header from '$components/Header.svelte';
	import ApiStatus from '$components/ApiStatus.svelte';

	import textStore from '$store/store';
	import { addQuestionAndAssociateOutput } from '$store/storeHelpers';

	const MAX_RETRY_COUNT = 2;
	let isLoading = false;
	let retryCount = 0;

	$: isDisabled = $textStore.inputText.length === 0;

	const routes = ['/api/sse', '/api/fallback'];

	const toastStore = getToastStore();

	async function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault(); // Prevent the default form submission behavior
		handleSubmit(); // Call the handleSubmit function without passing any parameters
	}

	async function handleSubmit(routeIndex = 0) {
		isLoading = true;

		const inputText = $textStore.inputText;

		// Encode your parameters
		const params = new URLSearchParams({
			prompt: inputText,
			conversation_id: $textStore.conversationId
		});

		const eventSource = new EventSource(`${routes[routeIndex]}?${params.toString()}`);

		eventSource.addEventListener('end', () => {
			isLoading = false;

			console.log('Connection end');

			eventSource.close();
			const questions = $textStore.questions;
			let questionId = questions.length + 1;

			addQuestionAndAssociateOutput(questionId, $textStore.outputText, routes[routeIndex]);

			textStore.update((text) => {
				return {
					...text,
					inputText: ''
				};
			});
		});

		eventSource.addEventListener('message', (event) => {
			console.log('Received message: ' + event.data);

			textStore.update((text) => {
				return {
					...text,
					outputText: [...text.outputText, event.data]
				};
			});
		});

		// Handle errors and retries
		eventSource.addEventListener('error', async () => {
			console.log('Error');

			if (retryCount < MAX_RETRY_COUNT) {
				retryCount++;
				const retryToast: ToastSettings = {
					message: `Error occurred. Retrying... (${retryCount}/${MAX_RETRY_COUNT})`,
					background: 'variant-filled-warning',
					timeout: 2000
				};
				toastStore.trigger(retryToast);
				await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
				setTimeout(() => handleSubmit(routeIndex), 2000); // Add delay before calling handleSubmit again
			} else if (routeIndex < routes.length - 1) {
				// If there's another fallback route, try it
				handleSubmit(routeIndex + 1);
			} else {
				// If there are no more fallback routes, show error toast
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
	}
</script>

<svelte:head>
	<title>Main - Chat</title>
</svelte:head>

<div class="flex flex-col items-center justify-center mt-6 p-4">
	<Header text="Chat" />
	<ApiStatus />
	<form data-testid="gptform" id="gptform" on:submit|preventDefault={handleFormSubmit}>
		<label for="gptChatBox" class="text-sm mb-2">Input:</label>
		<TextArea
			id="gptChatBox"
			placeholder="Type something here to start ..."
			{isLoading}
			bind:value={$textStore.inputText}
			{handleSubmit}
		/>
		<div class="flex mb-6 justify-center">
			<Button buttonType="filled" buttonWidth="10rem" {isDisabled}>Submit</Button>
		</div>
	</form>
	{#if isLoading}
		<LoadingSpinner {isLoading} />
	{/if}

	{#each $textStore.questions as question (question.id)}
		<ChatOutput data={question.outputText} routeName={question.routeName} />
	{/each}
</div>
