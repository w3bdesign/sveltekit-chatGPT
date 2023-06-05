<script lang="ts">
	interface ProcessedText {
		prettifiedCode: string;
		links: { url: string; text: string }[];
		language: string;
		textBeforeCode: string;
		textAfterCode: string;
	}

	interface ProcessedCode {
		language: string;
		code: string;
	}

	import { onMount } from 'svelte';
	import hljs from 'highlight.js';
	import { fade, fly } from 'svelte/transition';
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';

	import textStore from '../store/store';

	import { processText, parseTextAndCodeBlocks } from '../utils/functions/functions';

	import 'highlight.js/styles/github-dark.css';

	let processedTexts: ProcessedText[] = [];

	let processedCode: any = [];

	storeHighlightJs.set(hljs);

	onMount(() => {
		hljs.highlightAll();
	});

	$: {
		processedTexts = $textStore.outputText.map(processText);
	}

	$: {
		processedCode = $textStore.outputText.map(parseTextAndCodeBlocks).flat();
	}

	

	

	
</script>

<div class="mt-4">


	
	<div class="border shadow-md rounded p-8 w-[20rem] md:w-[45rem] relative bg-slate-50">
		
	{#each processedCode as block}
	
	
	
	{#if block.type === 'code'}
	  {#if block.inline}
	  
	  <code class="px-1 py-0.5 m-0 text-sm break-spaces bg-gray-200 rounded-md">{block.code}</code>
	  {:else}
	  <div class="py-6 px-2">
		<CodeBlock language={block.language} code={`${block.code}`} />
	</div>
	  {/if}
	{:else}
	  {@html block.content} <!-- Use {@html ...} to render HTML content -->
	{/if}



  {/each}
</div>










	{#each processedTexts as text (text.textBeforeCode)}
		<div class="mt-2 mb-3" in:fly={{ y: 50, duration: 500 }} out:fade>
			<div class="mt-2 border shadow-md rounded p-4 w-[20rem] md:w-[45rem] relative bg-slate-50">
				<div class="p-2">
					{@html text.textBeforeCode}

					{#if text.prettifiedCode}
						<div class="py-4">
							<CodeBlock language={text.language} code={`${text.prettifiedCode}`} />
						</div>
					{/if}

					{#if text.textAfterCode} {@html text.textAfterCode} {/if}
					{#if text.links.length}
						<div class="mt-6"><hr class="h-px bg-gray-300 border-0 dark:bg-gray-700" /></div>
						<div class="py-2">
							<h2 class="text-xl py-4 font-bold text-center">Sources</h2>
							{#each text.links as link (link.text)}
								{#if link.text}
									<div class="py-1 px-2">
										<a class="chip variant-filled w-full text-sm" href={link.url} target="_blank"
											>{link.text}</a
										>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/each}
</div>
