<script>
	import { Toast } from '@skeletonlabs/skeleton';

	import '../app.css';

	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '@skeletonlabs/skeleton/styles/skeleton.css';

	import Footer from '../components/Footer.svelte';
</script>

<main class="flex-1">
	<slot />
</main>

<Toast />

<Footer />
