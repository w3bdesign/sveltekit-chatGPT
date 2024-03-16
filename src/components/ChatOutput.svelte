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

	import { Marked } from 'marked';

	import { onMount } from 'svelte';

	import { markedHighlight } from 'marked-highlight';

	import { writable } from 'svelte/store';
	import { fly, fade } from 'svelte/transition';
	import { CodeBlock, storeHighlightJs } from '@skeletonlabs/skeleton';

	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	import { processTextAndCodeBlocks } from '$utils/functions/functions';

	import hljs from 'highlight.js/lib/core';

	// Import each language module you require
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import json from 'highlight.js/lib/languages/json';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import shell from 'highlight.js/lib/languages/shell';
	import php from 'highlight.js/lib/languages/php';
	import bash from 'highlight.js/lib/languages/bash';

	// Register each imported language module
	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('shell', shell);
	hljs.registerLanguage('php', php);
	hljs.registerLanguage('bash', bash);

	import 'highlight.js/styles/github-dark.css';

	import Button from './Button.svelte';

	export let data: CompletionsArray = [];
	export let routeName: string;

	const content = writable<CompletionsArray>();

	const toastStore = getToastStore();

	let parsedData: string | Promise<string>;

	storeHighlightJs.set(hljs);

	$: {
		content.set(data);
	}

	onMount(() => {
		const marked = new Marked(
			markedHighlight({
				langPrefix: 'hljs language-',
				highlight(code, lang) {
					const language = hljs.getLanguage(lang) ? lang : 'plaintext';

					const highlightedCode = hljs.highlight(code, { language }).value;

					// Add inline styles to the pre and code elements
					return `<div style="margin-top: 10px; margin-bottom: 10px; padding: 15px; border-radius: 5px; color: #fff; background-color: #282c34; font-size: 14px">${highlightedCode}</div>`;
				}
			})
		);

		parsedData = marked.parse(data.toString());
	});

	async function copyToClipboard() {
		try {
			const concatenatedContent = $content.map((item) => item).join('');

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

<div class="w-full sm:w-auto" data-testid="ai-response-container">
	<div class="mt-2 mb-3" in:fly={{ y: 50, duration: 500 }} out:fade>
		<div class="border shadow-md rounded p-2 w-full md:w-[45rem] relative bg-white">
			<div class="w-full flex justify-between mt-2">
				<div class="text-base p-2 bg-gray-200 ml-4">
					Route: <span class="font-bold">{routeName}</span>
				</div>
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
			<div class="p-2 mb-4 ml-4 mt-4">
				{#if routeName === '/api/wizardcoder'}
					{@html parsedData}
				{:else}
					{#each processTextAndCodeBlocks(data) as block}
						{#if block.type === 'code'}
							{#if block.inline}
								<code class="px-1 py-0.5 m-0 text-sm break-spaces bg-gray-200 rounded-md"
									>Code: {block.code}</code
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
				{/if}
			</div>
		</div>
	</div>
</div>
