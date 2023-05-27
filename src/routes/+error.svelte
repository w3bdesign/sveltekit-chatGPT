<script lang="ts">
	import { onMount } from 'svelte';

	import Header from '../components/Header.svelte';

	let LottiePlayer: ConstructorOfATypedSvelteComponent;

	onMount(async () => {
		const module = await import('@lottiefiles/svelte-lottie-player');
		LottiePlayer = module.LottiePlayer;
	});
</script>

<div class="flex flex-col items-center justify-center mt-6">
	<div class="flex flex-col items-center">
		<Header text="Page not found - 404" />
		<div class="w-[20rem] md:w-[45rem] rounded shadow-md p-2 bg-white">
			{#if LottiePlayer}
				<LottiePlayer
					src="https://assets4.lottiefiles.com/packages/lf20_zyu0ctqb.json"
					autoplay={true}
					loop={true}
					controls={false}
					renderer="svg"
					background="transparent"
					height={700}
				/>
			{/if}
		</div>
	</div>
</div>
