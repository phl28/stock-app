<script>
	import { PUBLIC_CORBADO_PROJECT_ID } from '$env/static/public';
	import Corbado from '@corbado/webcomponent';
	import '@corbado/webcomponent/pkg/auth_cui.css';
	import { onMount } from 'svelte';

	let user = null;
	// @ts-ignore
	const session = new Corbado.Session(PUBLIC_CORBADO_PROJECT_ID);
	const handleLogout = async () => {
		try {
			await session.logout();
			window.location.href = '/';
		} catch (err) {
			console.log(err);
		}
	};
	const redirectToLogin = () => {
		window.location.href = '/login';
	};

	onMount(() => {
		session.refresh((u) => {
			if (u == null) {
				redirectToLogin();
			} else {
				user = u;
			}
		});
	});
</script>

<svelte:head>
	<title>Trade history</title>
	<meta
		name="description"
		content="Allows users to see their past trades and be able to get insights out of it."
	/>
</svelte:head>

<section>
	{#if user}
		<h1>Profile Page</h1>
		<p>
			User-ID: {user.userID}
			<br />
			Email: {user.email}
		</p>
		<button on:click={handleLogout}>Logout</button>
	{:else}
		<p>You're not logged in.</p>
		<p>Please <strong><a href="/login" aria-label="login-route">log in</a></strong> to continue.</p>
	{/if}
</section>

<style>
	section {
		text-align: center;
	}
</style>
