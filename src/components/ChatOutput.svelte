<!-- ChatOutput.svelte -->
<script lang="ts">
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import textStore from '../store/store';

	function processTextAndCodeBlocks(deltas: Array<Object>) {
		let content = ''; // initialize an empty string
		for (let delta of deltas) {
			// loop over the array of objects
			content += delta.choices[0].delta.content; // access the content property of each delta object inside the choices array
		}
		const regex = /```(?:([\w-]+)\n)?([\s\S]*?)```|`([^`]+)`/g;
		const blocks = [];
		let lastIndex = 0;
		let match;

		while ((match = regex.exec(content)) !== null) {
			// Add a text block before the code block
			if (lastIndex !== match.index) {
				blocks.push({
					type: 'text',
					content: content.slice(lastIndex, match.index)
				});
			}

			if (match[1]) {
				// Triple backticks
				blocks.push({ type: 'code', inline: false, language: match[1], code: match[2] });
			} else if (match[3]) {
				// Single backtick
				blocks.push({ type: 'code', inline: true, language: 'plaintext', code: match[3] });
			}

			lastIndex = regex.lastIndex;
		}

		// Add the remaining text block after the last code block
		if (lastIndex < content.length) {
			blocks.push({
				type: 'text',
				content: content.slice(lastIndex)
			});
		}

		return blocks;
	}
</script>

<div class="flex flex-col items-center justify-center mt-6">
	<div class="border shadow-md rounded p-8 w-[20rem] md:w-[45rem] relative bg-slate-50">
		{#each processTextAndCodeBlocks($textStore.outputText) as block}
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
