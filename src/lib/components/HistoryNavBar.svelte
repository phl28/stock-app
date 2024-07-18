<script>
	import { sql } from '@vercel/postgres';
	import { drizzle } from 'drizzle-orm/vercel-postgres';
	const db = drizzle(sql);
</script>

<div class="m-4 flex justify-end">
	<button class="btn btn-neutral">Add new trade</button>
</div>
