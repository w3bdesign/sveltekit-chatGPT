<script lang="ts">
	export let text = '';
	export let buttonAction = () => {};
</script>

<button
	type="button"
	class="btn variant-filled py-2 mb-6  w-[8rem]"
	on:click={buttonAction}
>
	{text}
</button>
