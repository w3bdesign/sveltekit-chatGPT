<script lang="ts">
	interface Delta {
		role: string;
		content: string;
	}

	interface Choice {
		index: number;
		finish_reason?: string;
		delta: Delta;
	}

	interface Completion {
		choices: Choice[];
		created: number;
		id: string;
		model: string;
		object: string;
	}

	type CompletionsArray = Completion[];

	import { writable } from 'svelte/store';
	import { fly, fade } from 'svelte/transition';
	import { CodeBlock, storeHighlightJs, toastStore } from '@skeletonlabs/skeleton';

	import type { ToastSettings } from '@skeletonlabs/skeleton';

	import { processTextAndCodeBlocks } from '$utils/functions/functions';

	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';

	import Button from './Button.svelte';

	export let data: CompletionsArray = [];

	const content = writable<CompletionsArray>();

	storeHighlightJs.set(hljs);

	$: {
		content.set(data);
	}

	async function copyToClipboard() {
		try {
			const concatenatedContent = $content.map((item) => item.choices[0].delta.content).join('');

			await navigator.clipboard.writeText(concatenatedContent);

			const toast: ToastSettings = {
				message: 'Content copied to clipboard',
				background: 'variant-filled-primary',
				timeout: 6000
			};
			toastStore.trigger(toast);
		} catch (err) {
			const toast: ToastSettings = {
				message: 'Error copying data to clipboard',
				background: 'variant-filled-error',
				timeout: 6000
			};
			toastStore.trigger(toast);
		}
	}
</script>

<div class="flex flex-col items-center justify-center" data-testid="ai-response-container">
	<div class="mt-2 mb-3" in:fly={{ y: 50, duration: 500 }} out:fade>
		<div class="border shadow-md rounded p-8 w-[20rem] md:w-[45rem] relative bg-slate-50">
			<div class="w-full flex justify-end">
				<Button buttonAction={copyToClipboard} text="Copy" />
			</div>
			{#each processTextAndCodeBlocks(data) as block}
				{#if block.type === 'code'}
					{#if block.inline}
						<code class="px-1 py-0.5 m-0 text-sm break-spaces bg-gray-200 rounded-md"
							>{block.code}</code
						>
					{:else}
						<div class="py-6 px-2">
							<CodeBlock language={block.language} code={`${block.code}`} />
						</div>
					{/if}
				{:else}
					{@html block.content}
				{/if}
			{/each}
		</div>
	</div>
</div>
