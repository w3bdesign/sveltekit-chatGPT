<script>
	export let value = '';
	export let placeholder = '';
	export let onInput = () => {};
</script>

<textarea
	class="w-[40rem] h-[20rem] border rounded p-2 bg-slate-100"
	bind:value
	{placeholder}
	on:input={onInput}
/>
