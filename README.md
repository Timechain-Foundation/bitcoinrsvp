# bitcoinrsvp

## Deployment instructions

### Docker deployment

```
docker compose up btcrsvp --build
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
npm run dev
```
