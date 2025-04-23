

# Build frontend
FROM node:hydrogen AS ui-build
WORKDIR /app
COPY ui/package*.json ./
RUN npm install
COPY ui/ ./
RUN npm run build

# Build backend
FROM node:hydrogen
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npx knex migrate:latest
COPY --from=ui-build /app/build ./build

# Start the backend app
CMD ["npm", "run", "start"]
