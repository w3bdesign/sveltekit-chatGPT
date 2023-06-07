<script lang="ts">
	import Header from '$components/Header.svelte';
</script>

<svelte:head>
	<title>Not found - GPT4</title>
</svelte:head>

<div class="flex flex-col items-center justify-center mt-6">
	<div class="flex flex-col items-center">
		<Header text="Page not found - 404" />
		<div class="w-[20rem] md:w-[45rem] rounded shadow-md p-1 bg-white h-[25rem] md:h-[45rem]">
			<img src="/notfound.svg" alt="404" />
		</div>
	</div>
</div>
