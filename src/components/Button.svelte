<script lang="ts">
	export let text = '';
	export let buttonAction = () => {};
</script>

<button type="button" class="btn variant-filled py-2 px-4 mt-4 w-[10rem]" on:click={buttonAction}>
	{text}
</button>
