<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<footer aria-label="Innholdet for bunnteksten med copyright">
	<div class="mt-10 bg-gray-800 shadow">
		<div class="flex justify-center w-full p-6 text-white font-semibold">
			Copyright Daniel Fjeldstad
			<span class="p-2"><Icon icon="ic:baseline-copyright" /></span>
			{new Date().getFullYear()}
		</div>
	</div>
</footer>
