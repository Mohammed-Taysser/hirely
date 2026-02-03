# --- Stage 1: Base ---
FROM node:20-alpine AS base
WORKDIR /app

# Ensure we use yarn
COPY package.json yarn.lock ./
COPY prisma ./prisma

# --- Stage 2: Development ---
FROM base AS development
# Bring in built artifacts so we can link them
COPY --from=packages /packages /packages

# Run install to create the symlinks locally
RUN yarn install --frozen-lockfile && npx prisma generate

COPY . .

EXPOSE 8080
# We add 'yarn install' here ONLY to ensure the Named Volume is in sync with the image
CMD ["sh", "-c", "yarn install && yarn prisma:push && exec yarn dev"]

# --- Stage 3: Production ---
FROM base AS production
COPY --from=packages /packages /packages
RUN yarn install --production --frozen-lockfile && npx prisma generate
COPY . .
RUN yarn build
EXPOSE 8080
CMD ["sh", "-c", "yarn prisma:deploy && node dist/server.js"]
