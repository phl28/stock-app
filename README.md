# Trade Up Stock App

## TODO
- [x] Make it deploy (vercel)
- [x] Scaffold basic UI with mock data
- [ ] Build Python backend for historic data fetching (from Futu and IBKR)
- [x] Actually set up the database
- [x] Attach datbase to the UI
- [x] Add authentication
- [ ] Allow mass importing trades from csv
- [ ] Improve UX
- [x] Make Position Calculations
- [ ] Dashboard for analytics

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:
If you want to see the Postgres database, run `npm run db:studio` and it will be set up the Drizzle Studio which you can access and see the database. 
If you have made changes to the schema or the database, run `npm run db:push` to push those updates.
Run `pipenv shell` to create the virtual environment and get all the dependencies in the pipfile. 
Run `exit` to exit the virtual environment.

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Running the server
Run `uvicorn src.server.api.main:app --reload` to run the server. This command should be used in development but not in production.

