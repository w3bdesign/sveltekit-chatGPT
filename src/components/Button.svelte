<script lang="ts">
	export let buttonAction = () => {};
	export let buttonType = 'filled';
	export let buttonWidth = '8rem';
</script>

<button
	type="button"
	class={`btn variant-${buttonType} py-2 mb-6 w-[${buttonWidth}]`}
	on:click={buttonAction}
>
	<slot />
</button>
