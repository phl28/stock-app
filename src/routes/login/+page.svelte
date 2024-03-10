<h1>Log in</h1>

<div class="login-form">
	<form method="POST">
		<input type="email" placeholder="Email" />
		<input type="password" placeholder="Password" />
		<button>Log in</button>
	</form>
</div>

<style>
	.login-form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.login-form form {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 300px;
	}

	.login-form input {
		width: 100%;
		padding: 0.5rem;
		font-size: 1rem;
		margin-bottom: 1rem;
	}

	.login-form button {
		width: 50%;
	}
</style>
