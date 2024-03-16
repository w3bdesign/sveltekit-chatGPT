<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let ROUTES: string[] = [];
	export let selectedRouteIndex = 0;

	const dispatch = createEventDispatcher();

	function handleChange(event: any) {
		selectedRouteIndex = parseInt(event.target.value);
		dispatch('change', selectedRouteIndex);
	}
</script>

<div class="flex items-center">
	<label for="routeSelect" class="text-sm mr-4">Route:</label>
	<select
		class="bg-white p-2 rounded"
		id="routeSelect"
		bind:value={selectedRouteIndex}
		on:change={handleChange}
	>
		{#each ROUTES as route, index}
			<option value={index}>{route}</option>
		{/each}
	</select>
</div>
