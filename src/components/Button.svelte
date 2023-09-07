<script lang="ts">
	/**
	 * Customizable button that allows the user to define its action, type, and width.
	 */
	import type { MouseEventHandler } from 'svelte/elements';

	export let buttonType = 'filled';
	export let isDisabled = false;
	export let buttonWidth = '10rem';
	export let buttonAction: MouseEventHandler<HTMLButtonElement> | undefined = undefined;
</script>

<button
	type="submit"
	class={`btn variant-${buttonType} py-2 w-[${buttonWidth}] text-white`}
	disabled={isDisabled}
	on:click={buttonAction ? buttonAction : () => {}}
>
	<slot />
</button>
