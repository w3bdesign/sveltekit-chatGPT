<script>
	export let text = '';
	export let buttonAction = () => {};
</script>

<button class="bg-blue-500 text-white rounded py-2 px-4 mt-4 w-24" on:click={buttonAction}>
	{text}
</button>
