<script>
	export let value = '';
	export let placeholder = '';
	export let onInput = () => {};
</script>

<textarea
	maxlength="4000"
	class="w-[20rem] md:w-[40rem] h-[15rem] md:h-[20rem] border rounded p-2 bg-slate-50"
	bind:value
	{placeholder}
	on:input={onInput}
/>
