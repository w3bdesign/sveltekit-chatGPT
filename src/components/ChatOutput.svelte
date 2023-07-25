<script lang="ts">
	/**
	 * This Svelte component is designed to display and interact with completion data from a model.
	 * It includes features like copying the completion data to the clipboard and highlighting code blocks within the data.
	 *
	 */

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
		<div class="border shadow-md rounded p-2 w-[20rem] md:w-[45rem] relative bg-slate-50">
			<div class="w-full flex justify-end">
				<Button buttonAction={copyToClipboard} buttonType="filled-secondary" buttonWidth="4rem">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						height="24"
						width="24"
					>
						<path
							xmlns="http://www.w3.org/2000/svg"
							d="M2 4C2 2.89543 2.89543 2 4 2H14C15.1046 2 16 2.89543 16 4V8H20C21.1046 8 22 8.89543 22 10V20C22 21.1046 21.1046 22 20 22H10C8.89543 22 8 21.1046 8 20V16H4C2.89543 16 2 15.1046 2 14V4ZM10 16V20H20V10H16V14C16 15.1046 15.1046 16 14 16H10ZM14 14V4L4 4V14H14Z"
							fill="#fff"
						/>
					</svg>
				</Button>
			</div>
			<div class="p-2 mb-4 ml-4">
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
</div>
