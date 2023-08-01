<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	/**
	 * Customizable button that allows the user to define its action, type, and width.
	 */

	export let buttonType = 'filled';
	export let buttonWidth = '8rem';
	export let isDisabled = false;
	export let buttonAction: MouseEventHandler<HTMLButtonElement> | undefined;
</script>

<button
	type="submit"
	class={`btn variant-${buttonType} py-2 w-[${buttonWidth}]`}
	disabled={isDisabled}
	on:click={buttonAction}
>
	<slot />
</button>
