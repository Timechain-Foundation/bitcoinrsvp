# bitcoinrsvp

## Deployment instructions

### Docker deployment

```
docker compose up app --build
```

After the deployment finishes, use the following commands from your host machine to bootstrap your first organization and group:

```
curl --cookie cookie.txt \
  --cookie-jar cookie.txt \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{"email":"user@btcrsvp.com"}' \
  http://localhost:8080/org

curl --cookie cookie.txt \
  --cookie-jar cookie.txt \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{"name": "Bitcoin Dinner Club Season One"}' \
  http://localhost:8080/group

curl --cookie cookie.txt \
  --cookie-jar cookie.txt \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "questions": ["What is your relation to Bitcoin?"]}' \
  http://localhost:8080/1/membership/question

```

### Local deployment

Before starting the application, you'll need to load up a config file containing values for the necessary environment variables (see `example.env` for reference):

`source .env`

#### Building the frontend

To build the react app:

```
cd ui
npm install
npm run build
```

#### Building the backend

To run the application, first copy the build folder to the backend folder:

```
mv ui/build backend/build
```

Then run:

```
cd backend
npm install
```

#### Starting the application

To start the application run:

```
npm run start
```

and navigate to localhost:8080

## Creating and running a database migration

To create a database migration, initialize a migration by running:

```
npx knex migrate:make migration_name
```

A file with the `migration_name` specified should now be in the `migrations` folder.

The basic structure of a migration should look like this (`<query>` added as a placeholder for a sql query string):

```
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.raw(<query>);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(<query>);
}
```

**Note:** Do **not** forget to await or return your knex.raw statement

Finally to run your migration use:

```
npx knex migrate:up <file_name>
```

Or, to ensure all migrations have been applied, run:

```
knex migrate:latest
```
