<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { CodeBlock } from '@skeletonlabs/skeleton';

	import { processTextAndCodeBlocks } from '$utils/functions/functions';

	export let data: any;
</script>

<div class="flex flex-col items-center justify-center" data-testid="ai-response-container">
	<div class="mt-2 mb-3" in:fly={{ y: 50, duration: 500 }} out:fade>
		<div class="border shadow-md rounded p-8 w-[20rem] md:w-[45rem] relative bg-slate-50">
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
