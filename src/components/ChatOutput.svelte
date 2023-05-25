<script lang="ts">
	interface ProcessedText {
		prettifiedCode: string;
		links: { url: string; text: string }[];
		textBeforeCode: string;
		textAfterCode: string;
	}

	import hljs from 'highlight.js';
	import js_beautify from 'js-beautify';

	import { CodeBlock } from '@skeletonlabs/skeleton';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';

	import 'highlight.js/styles/github-dark.css';

	export let outputText: string[] = [];

	let processedTexts: ProcessedText[] = [];

	function processText(text: string) {
		let codeRegex = /```javascript([\s\S]*?)```/;
		let codeMatch = text.match(codeRegex);
		let code = codeMatch ? codeMatch[1] : '';
		let prettifiedCode = js_beautify(code);

		let newText = text.replace(codeRegex, 'CODE_BLOCK');
		let linkRegex = /\[\d+\]:\s*(.+?)\s*"(.*?)"\s*/g;
		let links = [...newText.matchAll(linkRegex)].map((match) => ({
			url: match[1],
			text: match[2]
		}));
		newText = newText.replace(linkRegex, '');
		let [textBeforeCode, textAfterCode] = newText.split('CODE_BLOCK');

		return { prettifiedCode, links, textBeforeCode, textAfterCode };
	}

	$: {
		processedTexts = outputText.map(processText);
	}

	storeHighlightJs.set(hljs);
</script>

<svelte:body on:load={() => hljs.highlightAll()} />

{#each processedTexts as text}
	<div class="mt-2 mb-2">
		<div class="border shadow rounded p-4 w-[20rem] md:w-[40rem] relative bg-slate-50">
			<div class="p-2">
				{@html text.textBeforeCode}
				{#if text.prettifiedCode}
					<div class="py-6">
						<CodeBlock language="javascript" code={`${text.prettifiedCode}`} />
					</div>
				{/if}
				{#if text.textAfterCode} {@html text.textAfterCode} {/if}
				{#if text.links.length}
					<div class="py-2">
						<h2 class="text-xl py-4 font-bold text-center">Sources</h2>
						{#each text.links as link}
							<div class="py-1 px-2">
								<a class="chip variant-filled w-full text-sm" href={link.url} target="_blank"
									>{link.text}</a
								>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/each}
