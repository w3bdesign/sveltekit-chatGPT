<script lang="ts">
	import { onMount } from 'svelte';
	import { CHATMODELS } from '../constants/CHATMODELS';

	export let selectedModel = 'gpt-4';

	type Model = {
		id: string;
		name: string;
	};

	let models: Model[] = [...CHATMODELS];

	onMount(async () => {
		try {
			const fetchedModels = await fetchAvailableModels();

			selectedModel = models[0].id;

			if (fetchedModels.length > 0) {
				models = fetchedModels;
				selectedModel = models[0].id;
			}
		} catch (error) {
			// Use CHATMODELS as fallback
			models = [...CHATMODELS];
			selectedModel = models[0].id;
		}
	});

	async function fetchAvailableModels(): Promise<Model[]> {
		try {
			const response = await fetch('/api/models');
			const data = await response.json();

			return data;
		} catch (error) {
			console.error('Error fetching models');
			throw 'Error fetching models';
		}
	}
</script>

<div class="w-full flex justify-end">
	<span class="text-lg py-2 px-4">Model: </span>
	<select
		bind:value={selectedModel}
		class="bg-white text-black border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
	>
		{#each models as model}
			<option value={model.id}>{model.name}</option>
		{/each}
	</select>
</div>
