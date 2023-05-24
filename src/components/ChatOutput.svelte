<script>
	/**
	 * @type {any[]}
	 */
	export let outputText = [];
</script>

<div class="mt-4">
{#each outputText as text}
	<div class="mt-2 border rounded p-4 w-[22rem] md:w-[40rem]">
		{text}
	</div>
{/each}
</div>
