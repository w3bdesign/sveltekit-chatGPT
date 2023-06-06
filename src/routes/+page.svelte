<script lang="ts">
	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	import Button from '../components/Button.svelte';
	import ChatOutput from '../components/ChatOutput.svelte';
	import LoadingSpinner from '../components/LoadingSpinner.svelte';
	import TextArea from '../components/TextArea.svelte';
	import Header from '../components/Header.svelte';

	import textStore from '../store/store';

	let isLoading = false;

	async function handleSubmit() {
    isLoading = true;
    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
        try {
            const dataToSend = JSON.stringify($textStore.inputText);
            const response = await fetch('/api/gpt', {
                method: 'POST',
                body: JSON.stringify(dataToSend),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            textStore.update((text) => {
                return {
                    ...text,
                    outputText: [...text.outputText, data],
                    inputText: ''
                };
            });
            success = true;
        } catch (error) {
            retries--;
            if (retries === 0) {
                const t: ToastSettings = {
                    message: 'An error occurred while fetching data from GPT-4',
                    background: 'variant-filled-error',
                    timeout: 6000
                };
                toastStore.trigger(t);
            }
        }
    }

    isLoading = false;
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
			<ChatOutput />
		{/if}
	</div>
</div>
