<script lang="ts">
	interface ProcessedText {
		content: string;
	}

	interface ProcessedCode {
		inline?: boolean;
		type: string;
		language?: string;
		code?: string;
		content?: string;
	}

	import { onMount } from 'svelte';
	import hljs from 'highlight.js';
	import { fade, fly } from 'svelte/transition';
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';

	import textStore from '../store/store';

	import { processText, parseTextAndCodeBlocks } from '../utils/functions/functions';

	import 'highlight.js/styles/github-dark.css';

	let processedItems: { text: ProcessedText; code: ProcessedCode[] }[] = [];

	storeHighlightJs.set(hljs);

	onMount(() => {
		hljs.highlightAll();
	});

	$: {
		processedItems = $textStore.outputText.map((text) => {
			const processedText = processText(text);
			const processedCode = parseTextAndCodeBlocks(text);
			return { text: processedText, code: processedCode };
		});
	}
</script>

<div class="mt-6">
	{#each processedItems as item}
		<div class="mt-2 mb-3" in:fly={{ y: 50, duration: 500 }} out:fade>
			<div class="border shadow-md rounded p-8 w-[20rem] md:w-[45rem] relative bg-slate-50">
				{#each item.code as block}
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
	{/each}
</div>
