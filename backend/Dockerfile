FROM node:20-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma

# Development & Builder Base
FROM base AS builder
RUN yarn install --frozen-lockfile && npx prisma generate
COPY . .

# Development Target
FROM builder AS development
EXPOSE 8080
# Sync schema and then start dev server
CMD ["sh", "-c", "yarn prisma:push && exec yarn dev"]

# Build Target
FROM builder AS build-compiled
RUN yarn build

# Production Target
FROM base AS production
RUN yarn install --production --frozen-lockfile && npx prisma generate
COPY --from=build-compiled /app/dist ./dist
COPY --from=build-compiled /app/docs ./docs
COPY --from=build-compiled /app/tsconfig.json ./tsconfig.json
EXPOSE 8080
# Apply migrations and then start production server
CMD ["sh", "-c", "yarn prisma:deploy && exec yarn start"]
