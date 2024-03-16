<script lang="ts">
	export let id = '';
	export let value = '';
	let characterCount = 0; // Initialize character count
	export let placeholder = '';
	export let isLoading = false;
	export let onInput = () => {};
	export let handleSubmit = () => {};

	// Update character count whenever the value changes
	$: characterCount = value.length;

	function handleKeyPress(event: { key: string }) {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	}
</script>

<div class="textarea-container">
	<textarea
		{id}
		maxlength="19000"
		class="w-[22rem] md:w-[45rem] h-[18rem] md:h-[25rem] border rounded p-4 bg-white shadow-md mb-4"
		disabled={isLoading}
		bind:value
		{placeholder}
		on:input={onInput}
		on:keypress={handleKeyPress}
	/>

	<span class="character-counter">
		{characterCount} / 19000
	</span>
</div>

<style>
	/* Additional styles to place the character counter in the bottom right corner */
	.character-counter {
		position: absolute;
		bottom: 1.5rem;
		right: 1rem;
		font-size: 0.875rem;
		color: #2e2e2e7e;
	}

	.textarea-container {
		position: relative;
	}
</style>
