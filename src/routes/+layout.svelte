<script>
	import { Toast, initializeStores } from '@skeletonlabs/skeleton';

	import Footer from '$components/Footer.svelte';

	import '../app.postcss'; // KEEP THIS!

	initializeStores();
</script>

<main class="flex-1">
	<slot />
</main>

<Toast />

<Footer />
