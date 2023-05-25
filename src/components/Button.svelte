<script>
	export let text = '';
	export let buttonAction = () => {};
</script>

<button type="button" class="btn variant-filled py-2 px-4 mt-4" on:click={buttonAction}>
	{text}
</button>
