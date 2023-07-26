<script lang="ts">
	/**
	 * Customizable button that allows the user to define its action, type, and width.
	 */

	export let buttonAction = () => {};
	export let buttonType = 'filled';
	export let buttonWidth = '8rem';
	export let isDisabled = false;
</script>

<button
	type="submit"
	class={`btn variant-${buttonType} py-2 w-[${buttonWidth}]`}
	disabled={isDisabled}
>
	<slot />
</button>
