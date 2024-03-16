<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';

	import Button from '$components/Button.svelte';
	import ChatOutput from '$components/ChatOutput.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import TextArea from '$components/TextArea.svelte';
	import Header from '$components/Header.svelte';
	import ApiStatus from '$components/ApiStatus.svelte';
	import RouteSelect from '$components/RouteSelect.svelte';

	import textStore from '$store/store';
	import { addQuestionAndAssociateOutput } from '$store/storeHelpers';

	import { ROUTES } from '../constants/ROUTES';

	let selectedRouteIndex = 0;

	let isLoading = false;

	$: isDisabled = $textStore.inputText.length === 0;

	async function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault(); // Prevent the default form submission behavior
		handleSubmit(selectedRouteIndex); // Pass the selectedRouteIndex to the handleSubmit function
	}

	async function handlePrimaryRoute(routeIndex = 0) {
		const inputText = $textStore.inputText;

		// Encode your parameters
		const params = new URLSearchParams({
			prompt: inputText,
			conversation_id: $textStore.conversationId
		});

		const eventSource = new EventSource(`${ROUTES[routeIndex]}?${params.toString()}`);

		eventSource.addEventListener('end', () => {
			isLoading = false;

			eventSource.close();
			const questions = $textStore.questions;
			let questionId = questions.length + 1;

			addQuestionAndAssociateOutput(questionId, $textStore.outputText, ROUTES[routeIndex]);

			textStore.update((text) => {
				return {
					...text,
					inputText: ''
				};
			});
		});

		eventSource.addEventListener('message', (event) => {
			let completionResponse;
			let delta: { content: string };

			try {
				completionResponse = JSON.parse(event.data);
				delta = completionResponse.choices[0].delta;
			} catch {
				console.error('Not valid json');
			}

			if (event.data === '[DONE]') {
				isLoading = false;

				eventSource.close();
				const questions = $textStore.questions;
				let questionId = questions.length + 1;

				addQuestionAndAssociateOutput(questionId, $textStore.outputText, ROUTES[routeIndex]);

				textStore.update((text) => {
					return {
						...text,
						inputText: ''
					};
				});
			}

			textStore.update((text) => {
				return {
					...text,
					outputText: [...text.outputText, delta.content]
				};
			});
		});
	}

	async function handleNonPrimaryRoute(routeIndex: number) {
		const inputText = $textStore.inputText;

		// Encode your parameters
		const params = new URLSearchParams({
			prompt: inputText,
			conversation_id: $textStore.conversationId
		});

		const response = await fetch(`${ROUTES[routeIndex]}?${params.toString()}`);

		// Convert the ReadableStream to JSON
		const data = await response.json();

		textStore.update((text) => {
			return {
				...text,
				outputText: data,
				inputText: ''
			};
		});

		const questions = $textStore.questions;
		let questionId = questions.length + 1;

		addQuestionAndAssociateOutput(questionId, data, ROUTES[routeIndex]);

		textStore.update((text) => {
			return {
				...text,
				inputText: ''
			};
		});

		isLoading = false;
	}

	async function handleSubmit(routeIndex = 0) {
		isLoading = true;

		if (routeIndex === 0) {
			await handlePrimaryRoute(routeIndex);
		} else {
			await handleNonPrimaryRoute(routeIndex);
		}
	}
</script>

<svelte:head>
	<title>Main - Chat</title>
</svelte:head>

<div class="flex flex-col mt-6 p-4 items-center justify-center">
	<Header text="Turbo Chat" />
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

		<div class="flex justify-between w-full">
			<div class="mb-6">
				<Button buttonType="filled" buttonWidth="10rem" {isDisabled}>Submit</Button>
			</div>
			<div class="mb-6">
				<RouteSelect
					{ROUTES}
					bind:selectedRouteIndex
					on:change={() => (selectedRouteIndex = selectedRouteIndex)}
				/>
			</div>
		</div>
	</form>
	{#if isLoading}
		<LoadingSpinner {isLoading} />
	{/if}

	{#each $textStore.questions as question (question.id)}
		<ChatOutput data={question.outputText} routeName={question.routeName} />
	{/each}
</div>
